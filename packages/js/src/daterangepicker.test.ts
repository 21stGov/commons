// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from 'vitest'

import { enhanceCalendar } from './calendar.ts'
import { enhanceDateRangePicker } from './daterangepicker.ts'

function rangePickerMarkup(): void {
  document.body.innerHTML = `
    <div data-slot="date-range-picker">
      <button data-slot="date-range-picker-trigger" aria-expanded="false">
        <span data-slot="date-range-picker-value">Pick a range</span>
      </button>
      <div data-slot="date-range-picker-positioner" hidden>
        <div data-slot="calendar" data-mode="range" data-year="2026" data-month="0" data-today="2026-01-15">
          <button data-slot="calendar-prev">Prev</button>
          <span data-slot="calendar-caption"></span>
          <button data-slot="calendar-next">Next</button>
          <div data-slot="calendar-days" role="grid"></div>
        </div>
      </div>
    </div>`
}
const trigger = () => document.querySelector<HTMLElement>('[data-slot="date-range-picker-trigger"]')!
const positioner = () => document.querySelector<HTMLElement>('[data-slot="date-range-picker-positioner"]')!
const value = () => document.querySelector<HTMLElement>('[data-slot="date-range-picker-value"]')!
const day = (date: string) => document.querySelector<HTMLButtonElement>(`[data-slot="calendar-day"][data-date="${date}"]`)!

function enhance(): void {
  enhanceCalendar(document)
  enhanceDateRangePicker(document)
}

describe('enhanceDateRangePicker', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('opens the range calendar on the trigger', () => {
    rangePickerMarkup()
    enhance()
    trigger().click()
    expect(positioner().hidden).toBe(false)
    expect(trigger().getAttribute('aria-expanded')).toBe('true')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  })

  it('choosing both ends fills the trigger with the formatted range and closes', () => {
    rangePickerMarkup()
    enhance()
    trigger().click()
    day('2026-01-10').click()
    day('2026-01-14').click()
    expect(value().textContent).toBe('Jan 10, 2026 – Jan 14, 2026')
    expect(trigger().getAttribute('data-range-start')).toBe('2026-01-10')
    expect(trigger().getAttribute('data-range-end')).toBe('2026-01-14')
    expect(positioner().hidden).toBe(true)
  })
})
