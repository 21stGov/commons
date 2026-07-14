// SPDX-License-Identifier: MIT

import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { DatePicker } from '@/components/date-picker'
import { Field } from '@/components/ui/field'
import { axeCheck } from '../../../test/setup.js'

const JAN_2024 = new Date(2024, 0, 1)
const JAN_15 = new Date(2024, 0, 15)

describe('DatePicker accessibility (axe)', () => {
  it('is axe-clean while closed (trigger only)', async () => {
    const { container } = render(<DatePicker defaultValue={JAN_15} />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean while open', async () => {
    const user = userEvent.setup()
    render(<DatePicker defaultValue={JAN_15} calendarProps={{ defaultMonth: JAN_2024 }} />)
    await user.click(screen.getByRole('button', { name: /choose date/i }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(await axeCheck(document.body)).toHaveNoViolations()
  })

  it('is axe-clean inside a Field, in an error state', async () => {
    const { container } = render(
      <Field label="Appointment date" error="Choose a weekday.">
        <DatePicker />
      </Field>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean when disabled', async () => {
    const { container } = render(<DatePicker disabledControl defaultValue={JAN_15} />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('DatePicker name, role, and value', () => {
  it('exposes the dialog popup relationship and expanded state on the trigger', async () => {
    const user = userEvent.setup()
    render(<DatePicker calendarProps={{ defaultMonth: JAN_2024 }} />)
    const trigger = screen.getByRole('button', { name: /choose date/i })
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)
    await screen.findByRole('dialog')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('shows the placeholder when empty and the formatted value when set', () => {
    const { rerender } = render(<DatePicker placeholder="Pick a day" />)
    expect(screen.getByRole('button', { name: /pick a day/i })).toBeInTheDocument()

    rerender(<DatePicker placeholder="Pick a day" value={JAN_15} />)
    // Default format is { dateStyle: "long" } → "January 15, 2024" (en).
    expect(screen.getByRole('button', { name: /january 15, 2024/i })).toBeInTheDocument()
  })

  it('names the trigger from the Field label plus the current value', () => {
    render(
      <Field label="Appointment date">
        <DatePicker value={JAN_15} />
      </Field>
    )
    expect(
      screen.getByRole('button', { name: /appointment date.*january 15, 2024/i })
    ).toBeInTheDocument()
  })

  it('inherits describedby, invalid, and disabled from a surrounding Field', () => {
    render(
      <Field label="Appointment date" hint="Weekdays only" error="Choose a weekday." disabled>
        <DatePicker />
      </Field>
    )
    const trigger = screen.getByRole('button', { name: /appointment date/i })
    expect(trigger).toBeDisabled()
    expect(trigger).toHaveAttribute('aria-invalid', 'true')
    const describedby = trigger.getAttribute('aria-describedby') ?? ''
    expect(describedby.length).toBeGreaterThan(0)
    // Points at the rendered hint and error text.
    for (const partId of describedby.split(' ')) {
      expect(document.getElementById(partId)).not.toBeNull()
    }
  })
})

describe('DatePicker keyboard and selection', () => {
  it('opens with the keyboard and moves focus into the calendar', async () => {
    const user = userEvent.setup()
    render(<DatePicker defaultValue={JAN_15} calendarProps={{ defaultMonth: JAN_2024 }} />)
    const trigger = screen.getByRole('button', { name: /choose date/i })
    trigger.focus()
    await user.keyboard('{Enter}')

    const dialog = await screen.findByRole('dialog')
    await waitFor(() => {
      expect(dialog.contains(document.activeElement)).toBe(true)
    })
  })

  it('selects a day, updates the value, closes, and returns focus to the trigger', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DatePicker
        defaultValue={JAN_15}
        onValueChange={onValueChange}
        calendarProps={{ defaultMonth: JAN_2024, showOutsideDays: false }}
      />
    )
    const trigger = screen.getByRole('button', { name: /choose date/i })
    await user.click(trigger)

    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /january 20(th)?,? 2024/i }))

    expect(onValueChange).toHaveBeenCalled()
    const [next] = onValueChange.mock.calls.at(-1) as [Date]
    expect(next.getDate()).toBe(20)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    await waitFor(() => {
      expect(trigger).toHaveFocus()
    })
    expect(trigger).toHaveAccessibleName(/january 20, 2024/i)
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup()
    render(<DatePicker defaultValue={JAN_15} calendarProps={{ defaultMonth: JAN_2024 }} />)
    const trigger = screen.getByRole('button', { name: /choose date/i })
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

  it('keeps the popover open on select when closeOnSelect is false', async () => {
    const user = userEvent.setup()
    render(
      <DatePicker
        defaultValue={JAN_15}
        closeOnSelect={false}
        calendarProps={{ defaultMonth: JAN_2024, showOutsideDays: false }}
      />
    )
    await user.click(screen.getByRole('button', { name: /choose date/i }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /january 20(th)?,? 2024/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

describe('DatePicker RTL smoke', () => {
  it('renders and stays axe-clean in a dir=rtl container', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <div dir="rtl">
        <DatePicker
          defaultValue={JAN_15}
          dir="rtl"
          triggerLabel="اختر التاريخ"
          calendarProps={{ defaultMonth: JAN_2024 }}
        />
      </div>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
    await user.click(screen.getByRole('button', { name: /اختر التاريخ/ }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(await axeCheck(document.body)).toHaveNoViolations()
  })
})
