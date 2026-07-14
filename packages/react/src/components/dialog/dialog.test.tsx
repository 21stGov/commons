// SPDX-License-Identifier: MIT

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/dialog'
import { Button } from '@/components/button'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

/** A complete confirm-pattern dialog used across tests. */
function ConfirmDialog(props: {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disablePointerDismissal?: boolean
  dismissible?: boolean
  dismissLabel?: string
}): React.JSX.Element {
  const { dismissible, dismissLabel, ...rootProps } = props
  return (
    <Dialog {...rootProps}>
      <DialogTrigger>Delete record</DialogTrigger>
      <DialogContent dismissible={dismissible} dismissLabel={dismissLabel}>
        <DialogTitle>Delete this record?</DialogTitle>
        <DialogDescription>This action cannot be undone.</DialogDescription>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
          <Button variant="danger">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

describe('Dialog accessibility (axe)', () => {
  it('is axe-clean while closed (trigger only)', async () => {
    const { container } = render(<ConfirmDialog />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean while open', async () => {
    render(<ConfirmDialog defaultOpen />)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(await axeCheck(document.body)).toHaveNoViolations()
  })

  it('is axe-clean while open without the icon Close button', async () => {
    render(<ConfirmDialog defaultOpen dismissible={false} />)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(await axeCheck(document.body)).toHaveNoViolations()
  })
})

describe('Dialog name, role, and value', () => {
  it('renders role=dialog named by its DialogTitle via aria-labelledby', async () => {
    render(<ConfirmDialog defaultOpen />)

    const dialog = await screen.findByRole('dialog', { name: 'Delete this record?' })
    const title = screen.getByText('Delete this record?')
    expect(title.id).not.toBe('')
    expect(dialog).toHaveAttribute('aria-labelledby', title.id)
  })

  it('is modal by default (aria-modal=true)', async () => {
    render(<ConfirmDialog defaultOpen />)
    expect(await screen.findByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })

  it('wires DialogDescription to aria-describedby', async () => {
    render(<ConfirmDialog defaultOpen />)

    const dialog = await screen.findByRole('dialog')
    const description = screen.getByText('This action cannot be undone.')
    expect(description.id).not.toBe('')
    expect(dialog).toHaveAttribute('aria-describedby', description.id)
  })

  it('renders the title as an h2 by default', async () => {
    render(<ConfirmDialog defaultOpen />)
    await screen.findByRole('dialog')
    expect(screen.getByRole('heading', { level: 2, name: 'Delete this record?' })).toBeVisible()
  })

  it('respects headingLevel on DialogTitle', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle headingLevel="h3">Session expiring</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    await screen.findByRole('dialog')
    expect(screen.getByRole('heading', { level: 3, name: 'Session expiring' })).toBeVisible()
  })

  it('renders a 44px-target icon Close button with the default label', async () => {
    render(<ConfirmDialog defaultOpen />)
    await screen.findByRole('dialog')

    const close = screen.getByRole('button', { name: 'Close' })
    expect(close).toHaveClass('min-h-11', 'min-w-11')
  })

  it('accepts a translated dismissLabel', async () => {
    render(<ConfirmDialog defaultOpen dismissLabel="Cerrar" />)
    await screen.findByRole('dialog')
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument()
  })

  it('omits the icon Close button when dismissible is false', async () => {
    render(<ConfirmDialog defaultOpen dismissible={false} />)
    await screen.findByRole('dialog')
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
  })

  it('trigger exposes the dialog relationship (aria-haspopup / aria-expanded)', async () => {
    const user = userEvent.setup()
    render(<ConfirmDialog />)

    const trigger = screen.getByRole('button', { name: 'Delete record' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })
})

describe('Dialog open and close (controlled + uncontrolled)', () => {
  it('opens uncontrolled from the trigger and closes from DialogClose', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<ConfirmDialog onOpenChange={onOpenChange} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete record' }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(onOpenChange).toHaveBeenLastCalledWith(true, expect.anything())

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.anything())
  })

  it('supports fully controlled usage', async () => {
    const user = userEvent.setup()

    function Controlled(): React.JSX.Element {
      const [open, setOpen] = React.useState(false)
      return (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>Open settings</DialogTrigger>
          <DialogContent>
            <DialogTitle>Settings</DialogTitle>
            <DialogClose>Done</DialogClose>
          </DialogContent>
        </Dialog>
      )
    }

    render(<Controlled />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Open settings' }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Done' }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('stays open in controlled mode until the owner updates the open prop', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<ConfirmDialog open onOpenChange={onOpenChange} />)

    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')

    expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.anything())
    // The owner never set open={false}, so the dialog must still be there.
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

describe('Dialog keyboard contract', () => {
  it('closes on Escape and reports it through onOpenChange', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<ConfirmDialog defaultOpen onOpenChange={onOpenChange} />)

    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.anything())
  })

  it('traps focus: Tab cycles through the dialog controls only', async () => {
    const user = userEvent.setup()
    render(
      <>
        <button type="button">Outside before</button>
        <ConfirmDialog defaultOpen />
        <button type="button">Outside after</button>
      </>
    )

    const dialog = await screen.findByRole('dialog')
    const cancel = screen.getByRole('button', { name: 'Cancel' })
    const del = screen.getByRole('button', { name: 'Delete' })
    const close = screen.getByRole('button', { name: 'Close' })

    cancel.focus()
    expect(cancel).toHaveFocus()

    await user.tab()
    expect(del).toHaveFocus()

    await user.tab()
    expect(close).toHaveFocus()

    // Wrap: next Tab must land back inside the dialog, never on the page.
    await user.tab()
    expect(dialog.contains(document.activeElement)).toBe(true)
    expect(cancel).toHaveFocus()

    // And backwards from the first control wraps to the last.
    await user.tab({ shift: true })
    expect(dialog.contains(document.activeElement)).toBe(true)
    expect(close).toHaveFocus()
  })

  it('moves focus into the dialog on open and returns it to the trigger on close', async () => {
    const user = userEvent.setup()
    render(<ConfirmDialog />)

    const trigger = screen.getByRole('button', { name: 'Delete record' })
    await user.click(trigger)

    const dialog = await screen.findByRole('dialog')
    await waitFor(() => {
      expect(dialog.contains(document.activeElement)).toBe(true)
    })

    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    await waitFor(() => {
      expect(trigger).toHaveFocus()
    })
  })
})

describe('Dialog backdrop', () => {
  it('uses a viewport layer that centers the popup without physical offsets', async () => {
    render(<ConfirmDialog defaultOpen />)

    const dialog = await screen.findByRole('dialog')
    const viewport = document.querySelector('[data-slot="dialog-viewport"]')
    expect(viewport).not.toBeNull()
    expect(viewport).toHaveClass('fixed', 'inset-0', 'grid', 'place-items-center', 'p-2')
    expect(dialog).toHaveClass('relative', 'h-fit', 'w-full')
    expect(dialog).not.toHaveClass('fixed', 'm-auto')
  })

  it('renders the backdrop and closes on a backdrop press', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<ConfirmDialog defaultOpen onOpenChange={onOpenChange} />)

    await screen.findByRole('dialog')
    const backdrop = document.querySelector('[data-slot="dialog-backdrop"]')
    expect(backdrop).not.toBeNull()

    await user.click(backdrop as Element)
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.anything())
  })

  it('keeps the dialog open on backdrop press when pointer dismissal is disabled', async () => {
    const user = userEvent.setup()
    render(<ConfirmDialog defaultOpen disablePointerDismissal />)

    await screen.findByRole('dialog')
    const backdrop = document.querySelector('[data-slot="dialog-backdrop"]')

    await user.click(backdrop as Element)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Escape still works — pointer dismissal is the only thing disabled.
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})

describe('Dialog accessible-name guard (dev warning)', () => {
  it('warns when DialogContent has neither a DialogTitle nor an aria-label', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <p>Untitled content</p>
        </DialogContent>
      </Dialog>
    )

    await screen.findByRole('dialog')
    await waitFor(() => {
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('accessible name'))
    })
  })

  it('does not warn when a DialogTitle is present', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<ConfirmDialog defaultOpen />)

    await screen.findByRole('dialog')
    // Give the deferred guard a tick to run before asserting silence.
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(warn).not.toHaveBeenCalled()
  })

  it('does not warn when DialogContent has an explicit aria-label', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <Dialog defaultOpen>
        <DialogContent aria-label="Progress">
          <p>Loading your submission…</p>
        </DialogContent>
      </Dialog>
    )

    await screen.findByRole('dialog', { name: 'Progress' })
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('Dialog RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    document.documentElement.setAttribute('dir', 'rtl')
    try {
      render(
        <div dir="rtl">
          <Dialog defaultOpen>
            <DialogTrigger>حذف السجل</DialogTrigger>
            <DialogContent dismissLabel="إغلاق">
              <DialogTitle>هل تريد حذف هذا السجل؟</DialogTitle>
              <DialogDescription>لا يمكن التراجع عن هذا الإجراء.</DialogDescription>
              <DialogFooter>
                <DialogClose>إلغاء</DialogClose>
                <Button variant="danger">حذف</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )

      expect(
        await screen.findByRole('dialog', { name: 'هل تريد حذف هذا السجل؟' })
      ).toBeInTheDocument()
      expect(await axeCheck(document.body)).toHaveNoViolations()
    } finally {
      document.documentElement.removeAttribute('dir')
    }
  })
})
