// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from 'vitest'

import { enhanceCalendar } from './calendar.ts'
import { enhanceDatePicker, formatISO } from './datepicker.ts'

describe('formatISO', () => {
  it('formats an ISO date as a short human date', () => {
    expect(formatISO('2026-07-20')).toBe('Jul 20, 2026')
  })
  it('passes a non-ISO string through unchanged', () => {
    expect(formatISO('not-a-date')).toBe('not-a-date')
  })
})

function datePickerMarkup(): void {
  document.body.innerHTML = `
    <div data-slot="date-picker">
      <button data-slot="date-picker-trigger" aria-haspopup="dialog" aria-expanded="false">
        <span data-slot="date-picker-value">Pick a date</span>
      </button>
      <div data-slot="date-picker-positioner" hidden>
        <div data-slot="calendar" data-year="2026" data-month="0" data-today="2026-01-15">
          <button data-slot="calendar-prev">Prev</button>
          <span data-slot="calendar-caption"></span>
          <button data-slot="calendar-next">Next</button>
          <div data-slot="calendar-days" role="grid"></div>
        </div>
      </div>
    </div>`
}
const trigger = () => document.querySelector<HTMLElement>('[data-slot="date-picker-trigger"]')!
const positioner = () => document.querySelector<HTMLElement>('[data-slot="date-picker-positioner"]')!
const value = () => document.querySelector<HTMLElement>('[data-slot="date-picker-value"]')!
const day = (date: string) => document.querySelector<HTMLButtonElement>(`[data-slot="calendar-day"][data-date="${date}"]`)!

function enhance(): void {
  enhanceCalendar(document)
  enhanceDatePicker(document)
}

describe('enhanceDatePicker', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('opens the calendar popover on the trigger', () => {
    datePickerMarkup()
    enhance()
    trigger().click()
    expect(positioner().hidden).toBe(false)
    expect(trigger().getAttribute('aria-expanded')).toBe('true')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  })

  it('picking a day fills the trigger value + data-value and closes', () => {
    datePickerMarkup()
    enhance()
    trigger().click()
    day('2026-01-10').click()
    expect(value().textContent).toBe('Jan 10, 2026')
    expect(trigger().getAttribute('data-value')).toBe('2026-01-10')
    expect(positioner().hidden).toBe(true)
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
  })

  it('Escape closes the popover', () => {
    datePickerMarkup()
    enhance()
    trigger().click()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(positioner().hidden).toBe(true)
  })
})
