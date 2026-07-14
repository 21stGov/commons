// SPDX-License-Identifier: MIT

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  type DrawerSide,
} from '@/components/drawer'
import { Button } from '@/components/button'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

/** A filters drawer used across tests. */
function FiltersDrawer(props: {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disablePointerDismissal?: boolean
  dismissible?: boolean
  dismissLabel?: string
  side?: DrawerSide
}): React.JSX.Element {
  const { dismissible, dismissLabel, side, ...rootProps } = props
  return (
    <Drawer {...rootProps}>
      <DrawerTrigger>Filters</DrawerTrigger>
      <DrawerContent side={side} dismissible={dismissible} dismissLabel={dismissLabel}>
        <DrawerHeader>
          <DrawerTitle>Filter results</DrawerTitle>
          <DrawerDescription>Narrow the list of public records.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose>Cancel</DrawerClose>
          <Button>Apply</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

describe('Drawer accessibility (axe)', () => {
  it('is axe-clean while closed (trigger only)', async () => {
    const { container } = render(<FiltersDrawer />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean while open', async () => {
    render(<FiltersDrawer defaultOpen />)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(await axeCheck(document.body)).toHaveNoViolations()
  })

  it('is axe-clean while open without the icon Close button', async () => {
    render(<FiltersDrawer defaultOpen dismissible={false} />)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(await axeCheck(document.body)).toHaveNoViolations()
  })
})

describe('Drawer name, role, and value', () => {
  it('renders role=dialog named by its DrawerTitle via aria-labelledby', async () => {
    render(<FiltersDrawer defaultOpen />)

    const dialog = await screen.findByRole('dialog', { name: 'Filter results' })
    const title = screen.getByText('Filter results')
    expect(title.id).not.toBe('')
    expect(dialog).toHaveAttribute('aria-labelledby', title.id)
  })

  it('is modal by default (aria-modal=true)', async () => {
    render(<FiltersDrawer defaultOpen />)
    expect(await screen.findByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })

  it('wires DrawerDescription to aria-describedby', async () => {
    render(<FiltersDrawer defaultOpen />)

    const dialog = await screen.findByRole('dialog')
    const description = screen.getByText('Narrow the list of public records.')
    expect(description.id).not.toBe('')
    expect(dialog).toHaveAttribute('aria-describedby', description.id)
  })

  it('renders the title as an h2 by default and respects headingLevel', async () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent>
          <DrawerTitle headingLevel="h1">Main menu</DrawerTitle>
        </DrawerContent>
      </Drawer>
    )
    await screen.findByRole('dialog')
    expect(screen.getByRole('heading', { level: 1, name: 'Main menu' })).toBeVisible()
  })

  it('renders a 44px-target icon Close button with the default label', async () => {
    render(<FiltersDrawer defaultOpen />)
    await screen.findByRole('dialog')

    const close = screen.getByRole('button', { name: 'Close' })
    expect(close).toHaveClass('min-h-11', 'min-w-11')
  })

  it('accepts a translated dismissLabel', async () => {
    render(<FiltersDrawer defaultOpen dismissLabel="Cerrar" />)
    await screen.findByRole('dialog')
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument()
  })

  it('omits the icon Close button when dismissible is false', async () => {
    render(<FiltersDrawer defaultOpen dismissible={false} />)
    await screen.findByRole('dialog')
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
  })

  it('trigger exposes the dialog relationship (aria-haspopup / aria-expanded)', async () => {
    const user = userEvent.setup()
    render(<FiltersDrawer />)

    const trigger = screen.getByRole('button', { name: 'Filters' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })
})

describe('Drawer side variants', () => {
  it('defaults to the inline-end edge', async () => {
    render(<FiltersDrawer defaultOpen />)
    const panel = await screen.findByRole('dialog')
    expect(panel).toHaveAttribute('data-side', 'end')
    expect(panel).toHaveClass('end-0', '[inset-block:0]')
  })

  it('anchors to the inline-start edge with side="start"', async () => {
    render(<FiltersDrawer defaultOpen side="start" />)
    const panel = await screen.findByRole('dialog')
    expect(panel).toHaveAttribute('data-side', 'start')
    expect(panel).toHaveClass('start-0', '[inset-block:0]', 'border-e')
  })

  it('anchors to the block-start edge with side="top"', async () => {
    render(<FiltersDrawer defaultOpen side="top" />)
    const panel = await screen.findByRole('dialog')
    expect(panel).toHaveAttribute('data-side', 'top')
    expect(panel).toHaveClass('[inset-inline:0]', '[inset-block-start:0]', 'border-b')
  })

  it('anchors to the block-end edge with side="bottom"', async () => {
    render(<FiltersDrawer defaultOpen side="bottom" />)
    const panel = await screen.findByRole('dialog')
    expect(panel).toHaveAttribute('data-side', 'bottom')
    expect(panel).toHaveClass('[inset-inline:0]', '[inset-block-end:0]', 'border-t')
  })

  it('carries RTL-flip transform classes on the inline sides so start/end mirror in RTL', async () => {
    const { rerender } = render(<FiltersDrawer defaultOpen side="start" />)
    let panel = await screen.findByRole('dialog')
    // start slides from the left in LTR and from the right in RTL.
    expect(panel).toHaveClass(
      'motion-safe:data-starting-style:-translate-x-full',
      'rtl:motion-safe:data-starting-style:translate-x-full'
    )

    rerender(<FiltersDrawer defaultOpen side="end" />)
    panel = screen.getByRole('dialog')
    // end mirrors: from the right in LTR and from the left in RTL.
    expect(panel).toHaveClass(
      'motion-safe:data-starting-style:translate-x-full',
      'rtl:motion-safe:data-starting-style:-translate-x-full'
    )
  })
})

describe('Drawer open and close (controlled + uncontrolled)', () => {
  it('opens uncontrolled from the trigger and closes from DrawerClose', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<FiltersDrawer onOpenChange={onOpenChange} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Filters' }))
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
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger>Open menu</DrawerTrigger>
          <DrawerContent side="start">
            <DrawerTitle>Main menu</DrawerTitle>
            <DrawerClose>Done</DrawerClose>
          </DrawerContent>
        </Drawer>
      )
    }

    render(<Controlled />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Done' }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})

describe('Drawer keyboard and focus', () => {
  it('closes on Escape and reports it through onOpenChange', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<FiltersDrawer defaultOpen onOpenChange={onOpenChange} />)

    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.anything())
  })

  it('traps focus: Tab cycles through the drawer controls only', async () => {
    const user = userEvent.setup()
    render(
      <>
        <button type="button">Outside before</button>
        <FiltersDrawer defaultOpen />
        <button type="button">Outside after</button>
      </>
    )

    const dialog = await screen.findByRole('dialog')
    const cancel = screen.getByRole('button', { name: 'Cancel' })
    const apply = screen.getByRole('button', { name: 'Apply' })
    const close = screen.getByRole('button', { name: 'Close' })

    cancel.focus()
    expect(cancel).toHaveFocus()

    await user.tab()
    expect(apply).toHaveFocus()

    await user.tab()
    expect(close).toHaveFocus()

    // Wrap: next Tab must land back inside the drawer, never on the page.
    await user.tab()
    expect(dialog.contains(document.activeElement)).toBe(true)
    expect(cancel).toHaveFocus()

    // And backwards from the first control wraps to the last.
    await user.tab({ shift: true })
    expect(dialog.contains(document.activeElement)).toBe(true)
    expect(close).toHaveFocus()
  })

  it('moves focus into the drawer on open and returns it to the trigger on close', async () => {
    const user = userEvent.setup()
    render(<FiltersDrawer />)

    const trigger = screen.getByRole('button', { name: 'Filters' })
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

describe('Drawer backdrop', () => {
  it('renders the backdrop and closes on a backdrop press', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<FiltersDrawer defaultOpen onOpenChange={onOpenChange} />)

    await screen.findByRole('dialog')
    const backdrop = document.querySelector('[data-slot="drawer-backdrop"]')
    expect(backdrop).not.toBeNull()

    await user.click(backdrop as Element)
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.anything())
  })

  it('keeps the drawer open on backdrop press when pointer dismissal is disabled', async () => {
    const user = userEvent.setup()
    render(<FiltersDrawer defaultOpen disablePointerDismissal />)

    await screen.findByRole('dialog')
    const backdrop = document.querySelector('[data-slot="drawer-backdrop"]')

    await user.click(backdrop as Element)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Escape still works — pointer dismissal is the only thing disabled.
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})

describe('Drawer accessible-name guard (dev warning)', () => {
  it('warns when DrawerContent has neither a DrawerTitle nor an aria-label', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <Drawer defaultOpen>
        <DrawerContent>
          <p>Untitled content</p>
        </DrawerContent>
      </Drawer>
    )

    await screen.findByRole('dialog')
    await waitFor(() => {
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('accessible name'))
    })
  })

  it('does not warn when a DrawerTitle is present', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<FiltersDrawer defaultOpen />)

    await screen.findByRole('dialog')
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('Drawer RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document, keeping logical edge classes', async () => {
    document.documentElement.setAttribute('dir', 'rtl')
    try {
      render(
        <div dir="rtl">
          <Drawer defaultOpen>
            <DrawerTrigger>عوامل التصفية</DrawerTrigger>
            <DrawerContent side="start" dismissLabel="إغلاق">
              <DrawerHeader>
                <DrawerTitle>تصفية النتائج</DrawerTitle>
                <DrawerDescription>تضييق قائمة السجلات العامة.</DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <DrawerClose>إلغاء</DrawerClose>
                <Button>تطبيق</Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      )

      const dialog = await screen.findByRole('dialog', { name: 'تصفية النتائج' })
      // Logical start-0 stays the class; the browser flips it to the visual
      // right edge in RTL — no physical override needed.
      expect(dialog).toHaveClass('start-0')
      expect(await axeCheck(document.body)).toHaveNoViolations()
    } finally {
      document.documentElement.removeAttribute('dir')
    }
  })
})
