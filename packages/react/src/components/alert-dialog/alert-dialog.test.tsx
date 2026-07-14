// SPDX-License-Identifier: MIT

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/alert-dialog'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

/** A complete destructive confirm assembled from the primitives. */
function ConfirmPrimitives(props: {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  dismissOnEscape?: boolean
  onConfirm?: () => void
  onCancel?: () => void
}): React.JSX.Element {
  const { onConfirm, onCancel, ...rootProps } = props
  return (
    <AlertDialogRoot {...rootProps}>
      <AlertDialogTrigger>Delete application</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Delete permit application?</AlertDialogTitle>
        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="danger" onClick={onConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogRoot>
  )
}

describe('AlertDialog accessibility (axe)', () => {
  it('is axe-clean while closed (trigger only)', async () => {
    const { container } = render(<ConfirmPrimitives />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean while open (primitives)', async () => {
    render(<ConfirmPrimitives defaultOpen />)
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
    expect(await axeCheck(document.body)).toHaveNoViolations()
  })

  it('is axe-clean while open (convenience, destructive)', async () => {
    render(
      <AlertDialog
        defaultOpen
        trigger="Delete application"
        title="Delete permit application?"
        description="This permanently removes the application and its attachments."
        confirmLabel="Delete"
        destructive
      />
    )
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
    expect(await axeCheck(document.body)).toHaveNoViolations()
  })
})

describe('AlertDialog name, role, and description', () => {
  it('renders role=alertdialog named by its title via aria-labelledby', async () => {
    render(<ConfirmPrimitives defaultOpen />)

    const dialog = await screen.findByRole('alertdialog', { name: 'Delete permit application?' })
    const title = screen.getByText('Delete permit application?')
    expect(title.id).not.toBe('')
    expect(dialog).toHaveAttribute('aria-labelledby', title.id)
  })

  it('is modal (aria-modal=true)', async () => {
    render(<ConfirmPrimitives defaultOpen />)
    expect(await screen.findByRole('alertdialog')).toHaveAttribute('aria-modal', 'true')
  })

  it('wires the description to aria-describedby', async () => {
    render(<ConfirmPrimitives defaultOpen />)

    const dialog = await screen.findByRole('alertdialog')
    const description = screen.getByText('This action cannot be undone.')
    expect(description.id).not.toBe('')
    expect(dialog).toHaveAttribute('aria-describedby', description.id)
  })

  it('renders the title as an h2 by default and honors headingLevel', async () => {
    render(
      <AlertDialogRoot defaultOpen>
        <AlertDialogContent>
          <AlertDialogTitle headingLevel="h3">Revoke access?</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialogRoot>
    )
    await screen.findByRole('alertdialog')
    expect(screen.getByRole('heading', { level: 3, name: 'Revoke access?' })).toBeVisible()
  })

  it('does not render an icon close button (dismissal is via the actions only)', async () => {
    render(<ConfirmPrimitives defaultOpen />)
    await screen.findByRole('alertdialog')
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
  })

  it('trigger exposes the dialog relationship (aria-haspopup / aria-expanded)', async () => {
    const user = userEvent.setup()
    render(<ConfirmPrimitives />)

    const trigger = screen.getByRole('button', { name: 'Delete application' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })
})

describe('AlertDialog open and close (controlled + uncontrolled)', () => {
  it('opens from the trigger, confirms, runs onConfirm, and closes', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()
    render(<ConfirmPrimitives onConfirm={onConfirm} onOpenChange={onOpenChange} />)

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete application' }))
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
    expect(onOpenChange).toHaveBeenLastCalledWith(true, expect.anything())

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })
    expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.anything())
  })

  it('cancels from the Cancel button, runs onCancel, and closes without confirming', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(<ConfirmPrimitives defaultOpen onConfirm={onConfirm} onCancel={onCancel} />)

    await screen.findByRole('alertdialog')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })
  })

  it('supports fully controlled usage', async () => {
    const user = userEvent.setup()

    function Controlled(): React.JSX.Element {
      const [open, setOpen] = React.useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            External open
          </button>
          <AlertDialog
            open={open}
            onOpenChange={setOpen}
            title="Discard changes?"
            description="Your edits will be lost."
            confirmLabel="Discard"
          />
        </>
      )
    }

    render(<Controlled />)
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'External open' }))
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Discard' }))
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })
  })
})

describe('AlertDialog dismissal contract (no light dismiss)', () => {
  it('does NOT close on an outside/backdrop press', async () => {
    const user = userEvent.setup()
    render(<ConfirmPrimitives defaultOpen />)

    await screen.findByRole('alertdialog')
    const backdrop = document.querySelector('[data-slot="alert-dialog-backdrop"]')
    expect(backdrop).not.toBeNull()

    await user.click(backdrop as Element)
    // The interruption stands — an outside press is ignored.
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })

  it('does NOT close on Escape by default', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<ConfirmPrimitives defaultOpen onOpenChange={onOpenChange} />)

    await screen.findByRole('alertdialog')
    await user.keyboard('{Escape}')

    // Still open, and the cancelled Escape is not reported as a close.
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalledWith(false, expect.anything())
  })

  it('closes on Escape when dismissOnEscape is set', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<ConfirmPrimitives defaultOpen dismissOnEscape onOpenChange={onOpenChange} />)

    await screen.findByRole('alertdialog')
    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })
    expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.anything())
  })
})

describe('AlertDialog keyboard and focus contract', () => {
  it('traps focus: Tab cycles through the dialog controls only', async () => {
    const user = userEvent.setup()
    render(
      <>
        <button type="button">Outside before</button>
        <ConfirmPrimitives defaultOpen />
        <button type="button">Outside after</button>
      </>
    )

    const dialog = await screen.findByRole('alertdialog')
    const cancel = screen.getByRole('button', { name: 'Cancel' })
    const del = screen.getByRole('button', { name: 'Delete' })

    cancel.focus()
    expect(cancel).toHaveFocus()

    await user.tab()
    expect(del).toHaveFocus()

    // Wrap forward: next Tab lands back inside the dialog, never on the page.
    await user.tab()
    expect(dialog.contains(document.activeElement)).toBe(true)
    expect(cancel).toHaveFocus()

    // Wrap backward from the first control to the last.
    await user.tab({ shift: true })
    expect(dialog.contains(document.activeElement)).toBe(true)
    expect(del).toHaveFocus()
  })

  it('moves focus to the SAFE Cancel button when destructive', async () => {
    render(
      <AlertDialog
        defaultOpen
        title="Delete permit application?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Keep"
        destructive
      />
    )

    await screen.findByRole('alertdialog')
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Keep' })).toHaveFocus()
    })
  })

  it('moves focus to the confirming action when not destructive', async () => {
    render(
      <AlertDialog
        defaultOpen
        title="Submit application?"
        description="You can still edit it before the deadline."
        confirmLabel="Submit"
      />
    )

    await screen.findByRole('alertdialog')
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Submit' })).toHaveFocus()
    })
  })

  it('returns focus to the trigger on close', async () => {
    const user = userEvent.setup()
    render(<ConfirmPrimitives />)

    const trigger = screen.getByRole('button', { name: 'Delete application' })
    await user.click(trigger)

    const dialog = await screen.findByRole('alertdialog')
    await waitFor(() => {
      expect(dialog.contains(document.activeElement)).toBe(true)
    })

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })
    await waitFor(() => {
      expect(trigger).toHaveFocus()
    })
  })
})

describe('AlertDialog convenience styling', () => {
  it('styles the confirming action as danger when destructive', async () => {
    render(
      <AlertDialog
        defaultOpen
        title="Delete permit application?"
        confirmLabel="Delete"
        destructive
      />
    )
    await screen.findByRole('alertdialog')
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass('bg-danger')
  })

  it('uses the primary confirming action when not destructive', async () => {
    render(<AlertDialog defaultOpen title="Publish notice?" confirmLabel="Publish" />)
    await screen.findByRole('alertdialog')
    expect(screen.getByRole('button', { name: 'Publish' })).toHaveClass('bg-primary')
  })
})

describe('AlertDialog accessible-name guard (dev warning)', () => {
  it('warns when content has neither a title nor an aria-label', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <AlertDialogRoot defaultOpen>
        <AlertDialogContent>
          <p>Untitled content</p>
        </AlertDialogContent>
      </AlertDialogRoot>
    )

    await screen.findByRole('alertdialog')
    await waitFor(() => {
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('accessible name'))
    })
  })

  it('does not warn when a title is present', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<ConfirmPrimitives defaultOpen />)

    await screen.findByRole('alertdialog')
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('AlertDialog RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    document.documentElement.setAttribute('dir', 'rtl')
    try {
      render(
        <div dir="rtl">
          <AlertDialog
            defaultOpen
            title="هل تريد حذف طلب التصريح؟"
            description="لا يمكن التراجع عن هذا الإجراء."
            confirmLabel="حذف"
            cancelLabel="إلغاء"
            destructive
          />
        </div>
      )

      expect(
        await screen.findByRole('alertdialog', { name: 'هل تريد حذف طلب التصريح؟' })
      ).toBeInTheDocument()
      expect(await axeCheck(document.body)).toHaveNoViolations()
    } finally {
      document.documentElement.removeAttribute('dir')
    }
  })
})
