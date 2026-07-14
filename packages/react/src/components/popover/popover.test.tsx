// SPDX-License-Identifier: MIT

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/popover'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

/** A popover carrying interactive content (a form control + actions). */
function FilterPopover(props: {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}): React.JSX.Element {
  return (
    <Popover {...props}>
      <PopoverTrigger>Filters</PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Filter results</PopoverTitle>
        <PopoverDescription>Narrow the list to matching records.</PopoverDescription>
        <label>
          Keyword
          <input type="text" name="keyword" />
        </label>
        <PopoverClose>Apply</PopoverClose>
      </PopoverContent>
    </Popover>
  )
}

describe('Popover accessibility (axe)', () => {
  it('is axe-clean while closed (trigger only)', async () => {
    const { container } = render(<FilterPopover />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean while open', async () => {
    render(<FilterPopover defaultOpen />)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(await axeCheck(document.body)).toHaveNoViolations()
  })
})

describe('Popover name, role, and value', () => {
  it('names the popup from its PopoverTitle via aria-labelledby', async () => {
    render(<FilterPopover defaultOpen />)
    const popup = await screen.findByRole('dialog', { name: 'Filter results' })
    const title = screen.getByText('Filter results')
    expect(title.id).not.toBe('')
    expect(popup).toHaveAttribute('aria-labelledby', title.id)
  })

  it('wires PopoverDescription to aria-describedby', async () => {
    render(<FilterPopover defaultOpen />)
    const popup = await screen.findByRole('dialog')
    const description = screen.getByText('Narrow the list to matching records.')
    expect(description.id).not.toBe('')
    expect(popup).toHaveAttribute('aria-describedby', description.id)
  })

  it('exposes the popover relationship on the trigger (aria-haspopup / aria-expanded)', async () => {
    const user = userEvent.setup()
    render(<FilterPopover />)

    const trigger = screen.getByRole('button', { name: 'Filters' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)
    await screen.findByRole('dialog')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })
})

describe('Popover open and close (controlled + uncontrolled)', () => {
  it('opens uncontrolled from the trigger and closes from PopoverClose', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<FilterPopover onOpenChange={onOpenChange} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Filters' }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(onOpenChange).toHaveBeenLastCalledWith(true)

    await user.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('supports fully controlled usage', async () => {
    const user = userEvent.setup()

    function Controlled(): React.JSX.Element {
      const [open, setOpen] = React.useState(false)
      return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger>Options</PopoverTrigger>
          <PopoverContent>
            <PopoverTitle>Options</PopoverTitle>
            <PopoverClose>Done</PopoverClose>
          </PopoverContent>
        </Popover>
      )
    }

    render(<Controlled />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Options' }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Done' }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})

describe('Popover keyboard contract', () => {
  it('moves focus into the popup on open and returns it to the trigger on Escape', async () => {
    const user = userEvent.setup()
    render(<FilterPopover />)

    const trigger = screen.getByRole('button', { name: 'Filters' })
    await user.click(trigger)

    const popup = await screen.findByRole('dialog')
    await waitFor(() => {
      expect(popup.contains(document.activeElement)).toBe(true)
    })

    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    await waitFor(() => {
      expect(trigger).toHaveFocus()
    })
  })

  it('lets keyboard users reach interactive content inside the popup', async () => {
    render(<FilterPopover defaultOpen />)
    await screen.findByRole('dialog')

    const field = screen.getByRole('textbox', { name: 'Keyword' })
    field.focus()
    expect(field).toHaveFocus()

    await userEvent.setup().keyboard('parcel')
    expect(field).toHaveValue('parcel')
  })
})

describe('Popover RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    document.documentElement.setAttribute('dir', 'rtl')
    try {
      render(
        <div dir="rtl">
          <Popover defaultOpen>
            <PopoverTrigger>عوامل التصفية</PopoverTrigger>
            <PopoverContent side="bottom">
              <PopoverTitle>تصفية النتائج</PopoverTitle>
              <PopoverClose>تطبيق</PopoverClose>
            </PopoverContent>
          </Popover>
        </div>
      )

      expect(await screen.findByRole('dialog', { name: 'تصفية النتائج' })).toBeInTheDocument()
      expect(await axeCheck(document.body)).toHaveNoViolations()
    } finally {
      document.documentElement.removeAttribute('dir')
    }
  })
})
