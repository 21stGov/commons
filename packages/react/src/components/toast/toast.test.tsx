// SPDX-License-Identifier: MIT

import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ToastProvider, toast, useToast, type ToastOptions } from '@/components/toast'
import { axeCheck } from '../../../test/setup.js'

const VARIANTS = ['info', 'success', 'warning', 'error'] as const satisfies readonly NonNullable<
  ToastOptions['variant']
>[]

afterEach(() => {
  // Clear any toasts left standing so state never leaks between tests.
  toast.dismiss()
  vi.restoreAllMocks()
})

/** A button that raises a toast via the module-level helper. */
function Raise({
  label = 'raise',
  options,
  method = 'add',
}: {
  label?: string
  options: ToastOptions
  method?: 'add' | 'success' | 'error' | 'info' | 'warning'
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={() => {
        if (method === 'add') {
          toast(options)
        } else {
          toast[method](options)
        }
      }}
    >
      {label}
    </button>
  )
}

describe('ToastProvider live region', () => {
  it('renders a polite notifications live region with an accessible name', () => {
    render(<ToastProvider>content</ToastProvider>)

    const region = screen.getByRole('region', { name: 'Notifications' })
    expect(region).toHaveAttribute('aria-live', 'polite')
  })

  it('accepts a translated live-region label', () => {
    render(<ToastProvider label="Notificaciones">content</ToastProvider>)
    expect(screen.getByRole('region', { name: 'Notificaciones' })).toBeInTheDocument()
  })

  it('is axe-clean when empty', async () => {
    render(
      <main>
        <ToastProvider />
      </main>,
    )
    expect(await axeCheck(document.body)).toHaveNoViolations()
  })
})

describe('toast() imperative API', () => {
  it('adds a toast that appears inside the live region with dialog semantics', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <Raise options={{ title: 'Saved', description: 'Your changes were saved.' }} />
      </ToastProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'raise' }))

    const region = screen.getByRole('region', { name: 'Notifications' })
    // Base UI renders each toast as a dialog (alertdialog when high priority).
    const dialog = await within(region).findByRole('dialog')
    expect(within(dialog).getByText('Saved')).toBeInTheDocument()
    expect(within(dialog).getByText('Your changes were saved.')).toBeInTheDocument()
  })

  it('returns the toast id as a handle', async () => {
    let handle = ''
    function Grab(): React.JSX.Element {
      return (
        <button
          type="button"
          onClick={() => {
            handle = toast.success({ title: 'Done' })
          }}
        >
          go
        </button>
      )
    }
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <Grab />
      </ToastProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'go' }))
    expect(handle).toMatch(/\S/)
  })

  it('promotes a description-only toast to the title so it is never nameless', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <Raise options={{ description: 'Copied to clipboard' }} />
      </ToastProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'raise' }))
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveAccessibleName('Copied to clipboard')
  })
})

describe('Toast variants and non-color redundancy', () => {
  for (const variant of VARIANTS) {
    it(`variant "${variant}" renders with a decorative icon and records the variant`, async () => {
      const user = userEvent.setup()
      render(
        <ToastProvider>
          <Raise method={variant} options={{ title: 'Status', duration: 0 }} />
        </ToastProvider>,
      )
      await user.click(screen.getByRole('button', { name: 'raise' }))

      const surface = await waitFor(() => {
        const node = document.querySelector('[data-slot="toast"]')
        expect(node).not.toBeNull()
        return node as HTMLElement
      })
      expect(surface).toHaveAttribute('data-variant', variant)

      const icon = surface.querySelector('[data-slot="toast-icon"]')
      expect(icon).not.toBeNull()
      expect(icon).toHaveAttribute('aria-hidden', 'true')
      const svg = icon?.querySelector('svg')
      expect(svg).toHaveAttribute('aria-hidden', 'true')
      expect(svg).toHaveAttribute('stroke', 'currentColor')
    })
  }

  it('uses a uniform border on every side (no inline-start accent)', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <Raise options={{ title: 'Note', duration: 0 }} />
      </ToastProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'raise' }))
    const surface = await waitFor(() => {
      const node = document.querySelector('[data-slot="toast"]')
      expect(node).not.toBeNull()
      return node as HTMLElement
    })
    // A single uniform `border`, never a thick inline-start accent or a
    // physical side utility.
    expect(surface.className).toContain('border')
    expect(surface.className).not.toContain('border-s-4')
    expect(surface.className).not.toMatch(/border-[lr]-4/)
  })
})

describe('Toast dismissal', () => {
  it('close button has an accessible name, a native button, and a 44px target', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <Raise options={{ title: 'Dismiss me', duration: 0 }} />
      </ToastProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'raise' }))
    await screen.findByText('Dismiss me')

    // Base UI keeps each collapsed toast's controls out of the accessibility
    // tree (aria-hidden) until the viewport is focused. F6 is the documented
    // entry point; it expands the stack and reveals the controls.
    await user.keyboard('{F6}')
    const close = await screen.findByRole('button', { name: 'Dismiss' })
    expect(close.tagName).toBe('BUTTON')
    expect(close).toHaveAttribute('type', 'button')
    // Snug 2rem visible chip; the 44px hit target is restored by a ::before
    // that extends the clickable area (2rem + 0.375rem each side = 2.75rem).
    expect(close.className).toContain('size-4')
    expect(close.className).toContain('before:-inset-[0.375rem]')
  })

  it('accepts a translated close label', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider closeLabel="Descartar">
        <Raise options={{ title: 'Hola', duration: 0 }} />
      </ToastProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'raise' }))
    await screen.findByText('Hola')
    await user.keyboard('{F6}')
    expect(await screen.findByRole('button', { name: 'Descartar' })).toBeInTheDocument()
  })

  it('activating close dismisses the toast (Enter on the focused button)', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <Raise options={{ title: 'Bye', duration: 0 }} />
      </ToastProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'raise' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Bye')).toBeInTheDocument()

    await user.keyboard('{F6}')
    const close = await screen.findByRole('button', { name: 'Dismiss' })
    close.focus()
    await user.keyboard('{Enter}')
    await waitFor(() => {
      expect(screen.queryByText('Bye')).not.toBeInTheDocument()
    })
  })

  it('Esc dismisses the focused toast', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <Raise options={{ title: 'EscMe', duration: 0 }} />
      </ToastProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'raise' }))
    await screen.findByText('EscMe')

    // F6 moves focus into the viewport; Tab advances to the toast itself,
    // which is what Esc dismisses (Base UI's keyboard contract).
    await user.keyboard('{F6}')
    await user.keyboard('{Tab}')
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByText('EscMe')).not.toBeInTheDocument()
    })
  })
})

// jsdom does not run CSS transitions and fake timers deadlock Testing
// Library's async helpers, so these timer tests use real timers with short
// durations. They verify observable behavior (a toast auto-dismisses; a
// hovered toast does not); exact millisecond timing is covered in-browser.
describe('Toast auto-dismiss timer', () => {
  it('auto-dismisses after the duration elapses', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <Raise options={{ title: 'Fleeting', duration: 120 }} />
      </ToastProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'raise' }))
    expect(screen.getByText('Fleeting')).toBeInTheDocument()

    await waitFor(
      () => {
        expect(screen.queryByText('Fleeting')).not.toBeInTheDocument()
      },
      { timeout: 3000 },
    )
  })

  it('does not auto-dismiss while the pointer hovers the toast (WCAG 2.2.1)', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <Raise options={{ title: 'Sticky', duration: 150 }} />
      </ToastProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'raise' }))
    const dialog = await screen.findByRole('dialog')

    // Hovering the viewport pauses every timer; well past the duration the
    // toast is still present.
    await user.hover(screen.getByRole('region', { name: 'Notifications' }))
    await new Promise((resolve) => setTimeout(resolve, 700))
    expect(within(dialog).getByText('Sticky')).toBeInTheDocument()
  })

  it('the error helper defaults to no auto-dismiss', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <Raise method="error" options={{ title: 'Failed' }} />
      </ToastProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'raise' }))
    // High-priority error text appears twice: the visible alertdialog and the
    // visually hidden role=alert mirror. Assert at least one remains.
    expect(screen.getAllByText('Failed').length).toBeGreaterThan(0)

    // Well past the default timeout: error() sets duration 0.
    await new Promise((resolve) => setTimeout(resolve, 700))
    expect(screen.getAllByText('Failed').length).toBeGreaterThan(0)
  })

  it('the error helper announces at high priority (assertive alert region)', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <Raise method="error" options={{ title: 'Session expired' }} />
      </ToastProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'raise' }))
    // Base UI mirrors high-priority toasts into a visually hidden role=alert
    // region for immediate announcement.
    const alert = await screen.findByRole('alert')
    expect(within(alert).getByText('Session expired')).toBeInTheDocument()
  })
})

describe('Toast action button', () => {
  it('renders the action and fires onAction when activated', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    function RaiseAction(): React.JSX.Element {
      return (
        <button
          type="button"
          onClick={() =>
            toast({ title: 'Deleted', actionLabel: 'Undo', onAction, duration: 0 })
          }
        >
          raise
        </button>
      )
    }
    render(
      <ToastProvider>
        <RaiseAction />
      </ToastProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'raise' }))
    await screen.findByText('Deleted')

    await user.keyboard('{F6}')
    const action = await screen.findByRole('button', { name: 'Undo' })
    await user.click(action)
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('renders no action button when actionLabel is omitted', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <Raise options={{ title: 'No action', duration: 0 }} />
      </ToastProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'raise' }))
    await screen.findByText('No action')
    expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument()
  })
})

describe('useToast hook', () => {
  it('exposes the imperative API and the reactive toast list', async () => {
    const user = userEvent.setup()
    function HookConsumer(): React.JSX.Element {
      const { toast: raise, toasts } = useToast()
      return (
        <div>
          <button type="button" onClick={() => raise.success({ title: 'Hooked', duration: 0 })}>
            raise
          </button>
          <span data-testid="count">{toasts.length}</span>
        </div>
      )
    }
    render(
      <ToastProvider>
        <HookConsumer />
      </ToastProvider>,
    )
    expect(screen.getByTestId('count')).toHaveTextContent('0')
    await user.click(screen.getByRole('button', { name: 'raise' }))
    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('1')
    })
  })
})

describe('Toast accessibility (axe)', () => {
  for (const variant of VARIANTS) {
    it(`variant "${variant}" is axe-clean while visible`, async () => {
      const user = userEvent.setup()
      render(
        <ToastProvider>
          <Raise
            method={variant}
            options={{ title: 'Status update', description: 'Something happened.', duration: 0 }}
          />
        </ToastProvider>,
      )
      await user.click(screen.getByRole('button', { name: 'raise' }))
      // Error toasts render as alertdialog, others as dialog; wait on the copy.
      await screen.findAllByText('Status update')
      expect(await axeCheck(document.body)).toHaveNoViolations()
    })
  }

  it('a toast with an action button is axe-clean', async () => {
    const user = userEvent.setup()
    function RaiseAction(): React.JSX.Element {
      return (
        <button
          type="button"
          onClick={() => toast({ title: 'Deleted', actionLabel: 'Undo', duration: 0 })}
        >
          raise
        </button>
      )
    }
    render(
      <ToastProvider>
        <RaiseAction />
      </ToastProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'raise' }))
    await screen.findByRole('button', { name: 'Undo' })
    expect(await axeCheck(document.body)).toHaveNoViolations()
  })
})

describe('Toast RTL', () => {
  it('renders and stays axe-clean inside dir="rtl"', async () => {
    const user = userEvent.setup()
    render(
      <div dir="rtl">
        <ToastProvider>
          <Raise method="warning" options={{ title: 'تنبيه', description: 'يرجى المراجعة.', duration: 0 }} />
        </ToastProvider>
      </div>,
    )
    await user.click(screen.getByRole('button', { name: 'raise' }))
    const surface = await waitFor(() => {
      const node = document.querySelector('[data-slot="toast"]')
      expect(node).not.toBeNull()
      return node as HTMLElement
    })
    expect(surface.className).toContain('border')
    expect(surface.className).not.toContain('border-s-4')
    expect(surface.className).not.toMatch(/border-[lr]-4/)
    expect(await axeCheck(document.body)).toHaveNoViolations()
  })
})
