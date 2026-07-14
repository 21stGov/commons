// SPDX-License-Identifier: MIT

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Calendar } from '@/components/calendar'
import { axeCheck } from '../../../test/setup.js'

// A fixed month keeps the rendered grid deterministic across machines and
// clocks (the ambient "today" is irrelevant to these assertions).
const JAN_2024 = new Date(2024, 0, 1)
const JAN_15 = new Date(2024, 0, 15)

function focusableDay(container: HTMLElement): HTMLButtonElement {
  const el = container.querySelector<HTMLButtonElement>('button[tabindex="0"]')
  if (!el) {
    throw new Error('no roving-focus day button found')
  }
  return el
}

describe('Calendar accessibility (axe)', () => {
  it('is axe-clean in single mode', async () => {
    const { container } = render(
      <Calendar mode="single" selected={JAN_15} defaultMonth={JAN_2024} />
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean in range mode', async () => {
    const { container } = render(
      <Calendar
        mode="range"
        selected={{ from: new Date(2024, 0, 10), to: new Date(2024, 0, 18) }}
        defaultMonth={JAN_2024}
      />
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean in multiple mode', async () => {
    const { container } = render(
      <Calendar
        mode="multiple"
        selected={[JAN_15, new Date(2024, 0, 20)]}
        defaultMonth={JAN_2024}
      />
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean with min/max bounds and disabled days', async () => {
    const { container } = render(
      <Calendar
        mode="single"
        defaultMonth={JAN_2024}
        min={new Date(2024, 0, 5)}
        max={new Date(2024, 0, 25)}
        disabled={[new Date(2024, 0, 12)]}
      />
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Calendar name, role, and value', () => {
  it('renders a labelled grid of gridcells', () => {
    render(<Calendar mode="single" defaultMonth={JAN_2024} />)
    const grid = screen.getByRole('grid', { name: /january 2024/i })
    expect(grid).toBeInTheDocument()
    expect(within(grid).getAllByRole('gridcell').length).toBeGreaterThan(27)
  })

  it('marks the selected day with aria-selected', () => {
    render(<Calendar mode="single" selected={JAN_15} defaultMonth={JAN_2024} />)
    const selected = screen.getByRole('gridcell', { selected: true })
    expect(selected).toHaveTextContent('15')
    expect(selected).toHaveAttribute('data-selected', 'true')
  })

  it('gives each day button a localized accessible name', () => {
    render(<Calendar mode="single" defaultMonth={JAN_2024} showOutsideDays={false} />)
    // labelDayButton formats the full date; the exact wording is locale
    // driven, so match on the month + day.
    expect(screen.getByRole('button', { name: /january 15(th)?,? 2024/i })).toBeInTheDocument()
  })

  it('exposes named previous/next month navigation buttons', () => {
    render(<Calendar mode="single" defaultMonth={JAN_2024} />)
    expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next month/i })).toBeInTheDocument()
  })

  it('exposes exactly one roving tab stop among the day buttons', () => {
    const { container } = render(
      <Calendar mode="single" selected={JAN_15} defaultMonth={JAN_2024} />
    )
    const zeroTab = container.querySelectorAll('button[tabindex="0"]')
    // The single focusable day (the previous/next nav buttons are not
    // tabindex=0 unless disabled changes them).
    expect(zeroTab.length).toBe(1)
    expect(zeroTab[0]).toHaveTextContent('15')
  })
})

describe('Calendar keyboard navigation', () => {
  it('moves focus by day with Left/Right and by week with Up/Down', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Calendar mode="single" selected={JAN_15} defaultMonth={JAN_2024} showOutsideDays={false} />
    )
    focusableDay(container).focus()
    expect(document.activeElement).toHaveTextContent('15')

    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toHaveTextContent('16')

    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toHaveTextContent('23')

    await user.keyboard('{ArrowUp}')
    expect(document.activeElement).toHaveTextContent('16')

    await user.keyboard('{Home}')
    // Home moves to the start of the focused week (Sunday Jan 14).
    expect(document.activeElement).toHaveTextContent('14')
  })

  it('selects the focused day with Enter', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { container } = render(
      <Calendar
        mode="single"
        selected={JAN_15}
        defaultMonth={JAN_2024}
        showOutsideDays={false}
        onSelect={onSelect}
      />
    )
    focusableDay(container).focus()
    await user.keyboard('{ArrowRight}{Enter}')
    expect(onSelect).toHaveBeenCalled()
    const [selected] = onSelect.mock.calls.at(-1) as [Date]
    expect(selected.getDate()).toBe(16)
  })

  it('flips Left/Right arrow direction under dir="rtl"', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Calendar
        mode="single"
        selected={JAN_15}
        defaultMonth={JAN_2024}
        showOutsideDays={false}
        dir="rtl"
      />
    )
    focusableDay(container).focus()
    await user.keyboard('{ArrowRight}')
    // In RTL, ArrowRight moves to the previous day.
    expect(document.activeElement).toHaveTextContent('14')
  })
})

describe('Calendar RTL smoke', () => {
  it('renders and stays axe-clean in a dir=rtl container', async () => {
    const { container } = render(
      <div dir="rtl">
        <Calendar mode="single" selected={JAN_15} defaultMonth={JAN_2024} dir="rtl" />
      </div>
    )
    expect(screen.getByRole('grid')).toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})
