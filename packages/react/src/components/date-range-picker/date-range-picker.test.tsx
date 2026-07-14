// SPDX-License-Identifier: MIT

import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { DateRangePicker } from '@/components/date-range-picker'
import { Field } from '@/components/ui/field'
import { axeCheck } from '../../../test/setup.js'

const JAN_2024 = new Date(2024, 0, 1)
const JAN_10 = new Date(2024, 0, 10)
const JAN_20 = new Date(2024, 0, 20)

describe('DateRangePicker accessibility (axe)', () => {
  it('is axe-clean while closed (trigger only)', async () => {
    const { container } = render(<DateRangePicker defaultValue={{ from: JAN_10, to: JAN_20 }} />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean while open', async () => {
    const user = userEvent.setup()
    render(
      <DateRangePicker
        defaultValue={{ from: JAN_10, to: JAN_20 }}
        calendarProps={{ defaultMonth: JAN_2024 }}
      />
    )
    await user.click(screen.getByRole('button', { name: /choose date range/i }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(await axeCheck(document.body)).toHaveNoViolations()
  })

  it('is axe-clean inside a Field, in an error state', async () => {
    const { container } = render(
      <Field label="Stay dates" error="Pick a full range.">
        <DateRangePicker />
      </Field>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean when disabled', async () => {
    const { container } = render(
      <DateRangePicker disabledControl defaultValue={{ from: JAN_10, to: JAN_20 }} />
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('DateRangePicker name, role, and value', () => {
  it('exposes the dialog popup relationship and expanded state on the trigger', async () => {
    const user = userEvent.setup()
    render(<DateRangePicker calendarProps={{ defaultMonth: JAN_2024 }} />)
    const trigger = screen.getByRole('button', { name: /choose date range/i })
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)
    await screen.findByRole('dialog')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('shows the placeholder when empty and the formatted range when set', () => {
    const { rerender } = render(<DateRangePicker placeholder="Pick a span" />)
    expect(screen.getByRole('button', { name: /pick a span/i })).toBeInTheDocument()

    rerender(<DateRangePicker placeholder="Pick a span" value={{ from: JAN_10, to: JAN_20 }} />)
    // Default format collapses shared parts via formatRange → "Jan 10 – 20, 2024" (en).
    expect(screen.getByRole('button', { name: /jan 10\s*.\s*20, 2024/i })).toBeInTheDocument()
  })

  it('formats a partial range (start only) as the single start day', () => {
    render(<DateRangePicker value={{ from: JAN_10 }} />)
    expect(screen.getByRole('button', { name: /jan 10, 2024/i })).toBeInTheDocument()
  })

  it('names the trigger from the Field label plus the current value', () => {
    render(
      <Field label="Stay dates">
        <DateRangePicker value={{ from: JAN_10, to: JAN_20 }} />
      </Field>
    )
    expect(
      screen.getByRole('button', { name: /stay dates.*jan 10\s*.\s*20, 2024/i })
    ).toBeInTheDocument()
  })

  it('inherits describedby, invalid, and disabled from a surrounding Field', () => {
    render(
      <Field label="Stay dates" hint="Weekdays only" error="Pick a full range." disabled>
        <DateRangePicker />
      </Field>
    )
    const trigger = screen.getByRole('button', { name: /stay dates/i })
    expect(trigger).toBeDisabled()
    expect(trigger).toHaveAttribute('aria-invalid', 'true')
    const describedby = trigger.getAttribute('aria-describedby') ?? ''
    expect(describedby.length).toBeGreaterThan(0)
    for (const partId of describedby.split(' ')) {
      expect(document.getElementById(partId)).not.toBeNull()
    }
  })
})

describe('DateRangePicker keyboard and selection', () => {
  it('opens with the keyboard and moves focus into the calendar', async () => {
    const user = userEvent.setup()
    render(
      <DateRangePicker
        defaultValue={{ from: JAN_10, to: JAN_20 }}
        calendarProps={{ defaultMonth: JAN_2024 }}
      />
    )
    const trigger = screen.getByRole('button', { name: /choose date range/i })
    trigger.focus()
    await user.keyboard('{Enter}')

    const dialog = await screen.findByRole('dialog')
    await waitFor(() => {
      expect(dialog.contains(document.activeElement)).toBe(true)
    })
  })

  it('selects a start then an end, updating the value and completing the range', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DateRangePicker
        onValueChange={onValueChange}
        calendarProps={{ defaultMonth: JAN_2024, showOutsideDays: false }}
      />
    )
    const trigger = screen.getByRole('button', { name: /choose date range/i })
    await user.click(trigger)

    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /january 10(th)?,? 2024/i }))

    // Start picked: react-day-picker seeds a single-day range (from === to) and
    // the popover stays open so the user can extend to the end day.
    const afterStart = onValueChange.mock.calls.at(-1)?.[0] as { from?: Date; to?: Date }
    expect(afterStart.from?.getDate()).toBe(10)
    expect(afterStart.to?.getDate()).toBe(10)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: /january 20(th)?,? 2024/i }))

    // End picked: range is complete.
    const afterEnd = onValueChange.mock.calls.at(-1)?.[0] as { from?: Date; to?: Date }
    expect(afterEnd.from?.getDate()).toBe(10)
    expect(afterEnd.to?.getDate()).toBe(20)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    await waitFor(() => {
      expect(trigger).toHaveFocus()
    })
    expect(trigger).toHaveAccessibleName(/jan 10\s*.\s*20, 2024/i)
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup()
    render(
      <DateRangePicker
        defaultValue={{ from: JAN_10, to: JAN_20 }}
        calendarProps={{ defaultMonth: JAN_2024 }}
      />
    )
    const trigger = screen.getByRole('button', { name: /choose date range/i })
    await user.click(trigger)
    await screen.findByRole('dialog')

    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    await waitFor(() => {
      expect(trigger).toHaveFocus()
    })
  })

  it('keeps the popover open on a completed range when closeOnSelect is false', async () => {
    const user = userEvent.setup()
    render(
      <DateRangePicker
        closeOnSelect={false}
        calendarProps={{ defaultMonth: JAN_2024, showOutsideDays: false }}
      />
    )
    await user.click(screen.getByRole('button', { name: /choose date range/i }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /january 10(th)?,? 2024/i }))
    await user.click(within(dialog).getByRole('button', { name: /january 20(th)?,? 2024/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

describe('DateRangePicker RTL smoke', () => {
  it('renders and stays axe-clean in a dir=rtl container', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <div dir="rtl">
        <DateRangePicker
          defaultValue={{ from: JAN_10, to: JAN_20 }}
          dir="rtl"
          triggerLabel="اختر نطاق التاريخ"
          calendarProps={{ defaultMonth: JAN_2024 }}
        />
      </div>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
    await user.click(screen.getByRole('button', { name: /اختر نطاق التاريخ/ }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(await axeCheck(document.body)).toHaveNoViolations()
  })
})
