// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { enhanceCalendar } from './calendar.ts'

// Fixed month so the grid is deterministic regardless of the current date.
function calendarMarkup(extra = ''): void {
  document.body.innerHTML = `
    <div data-slot="calendar" data-year="2026" data-month="0" data-today="2026-01-15" ${extra}>
      <button data-slot="calendar-prev">Prev</button>
      <span data-slot="calendar-caption" aria-live="polite"></span>
      <button data-slot="calendar-next">Next</button>
      <div data-slot="calendar-days" role="grid"></div>
    </div>`
}
const cal = () => document.querySelector<HTMLElement>('[data-slot="calendar"]')!
const caption = () => document.querySelector<HTMLElement>('[data-slot="calendar-caption"]')!
const days = () => document.querySelector<HTMLElement>('[data-slot="calendar-days"]')!
const day = (date: string) => days().querySelector<HTMLButtonElement>(`[data-date="${date}"]`)!

describe('enhanceCalendar', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('renders a 6-week grid with the month caption and outside days', () => {
    calendarMarkup()
    enhanceCalendar(document)
    expect(caption().textContent).toBe('January 2026')
    expect(days().querySelectorAll('[data-slot="calendar-day"]')).toHaveLength(42)
    expect(days().querySelectorAll('[data-outside]').length).toBeGreaterThan(0)
    expect(day('2026-01-15').dataset.today).toBe('')
  })

  it('selecting a day marks it and emits cui:calendar-select with the ISO date', () => {
    calendarMarkup()
    enhanceCalendar(document)
    const onSelect = vi.fn()
    cal().addEventListener('cui:calendar-select', (e) => onSelect((e as CustomEvent).detail))
    day('2026-01-10').click()
    expect(day('2026-01-10').dataset.selected).toBe('')
    expect(day('2026-01-10').getAttribute('aria-selected')).toBe('true')
    expect(onSelect).toHaveBeenCalledWith({ date: '2026-01-10' })
  })

  it('Prev / Next navigate months', () => {
    calendarMarkup()
    enhanceCalendar(document)
    document.querySelector<HTMLElement>('[data-slot="calendar-next"]')!.click()
    expect(caption().textContent).toBe('February 2026')
    const prev = document.querySelector<HTMLElement>('[data-slot="calendar-prev"]')!
    prev.click()
    prev.click()
    expect(caption().textContent).toBe('December 2025')
  })

  it('ArrowRight moves the focused day by one, ArrowDown by a week', () => {
    calendarMarkup()
    enhanceCalendar(document)
    day('2026-01-15').focus()
    days().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    expect((document.activeElement as HTMLElement).dataset.date).toBe('2026-01-16')
    days().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    expect((document.activeElement as HTMLElement).dataset.date).toBe('2026-01-23')
  })

  it('disables days outside the min/max range', () => {
    calendarMarkup('data-min="2026-01-10" data-max="2026-01-20"')
    enhanceCalendar(document)
    expect(day('2026-01-05').disabled).toBe(true)
    expect(day('2026-01-25').disabled).toBe(true)
    expect(day('2026-01-15').disabled).toBe(false)
  })

  it('range mode: two clicks set the range, mark the middle, and emit cui:calendar-range', () => {
    calendarMarkup('data-mode="range"')
    enhanceCalendar(document)
    const onRange = vi.fn()
    cal().addEventListener('cui:calendar-range', (e) => onRange((e as CustomEvent).detail))
    day('2026-01-10').click()
    day('2026-01-14').click()
    expect(day('2026-01-10').dataset.selected).toBe('')
    expect(day('2026-01-14').dataset.selected).toBe('')
    expect(day('2026-01-12').dataset.rangeMiddle).toBe('')
    expect(onRange).toHaveBeenCalledWith({ start: '2026-01-10', end: '2026-01-14' })
  })
})
