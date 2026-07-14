// SPDX-License-Identifier: MIT

/**
 * Calendar behavior — a month grid the React side gets from react-day-picker,
 * built here from scratch for the framework-agnostic path.
 *
 * Contract (authored markup):
 *   root    <div data-slot="calendar" data-year data-month(0-11) [data-selected]
 *             [data-today] [data-min] [data-max]>
 *   caption <span data-slot="calendar-caption" aria-live="polite">
 *   prev    <button data-slot="calendar-prev">
 *   next    <button data-slot="calendar-next">
 *   days    <div data-slot="calendar-days" role="grid">   (filled by JS)
 *
 * Renders a 6-week grid of day buttons (data-outside / data-today / data-selected
 * / disabled), navigates months, selects on click, and supports arrow / Home /
 * End / PageUp-Down keyboard movement. Emits `cui:calendar-select` with the
 * chosen ISO date.
 */

import { claim } from './dom.ts'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const iso = (y: number, m: number, d: number): string =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

export function enhanceCalendar(root: ParentNode): void {
  for (const cal of claim(root, '[data-slot="calendar"]', 'calendar')) {
    const caption = cal.querySelector<HTMLElement>('[data-slot="calendar-caption"]')
    const daysEl = cal.querySelector<HTMLElement>('[data-slot="calendar-days"]')
    const prev = cal.querySelector<HTMLElement>('[data-slot="calendar-prev"]')
    const next = cal.querySelector<HTMLElement>('[data-slot="calendar-next"]')
    if (!daysEl) continue

    const now = new Date()
    let year = Number(cal.getAttribute('data-year')) || now.getFullYear()
    let month = cal.hasAttribute('data-month') ? Number(cal.getAttribute('data-month')) : now.getMonth()
    let selected = cal.getAttribute('data-selected') ?? ''
    const today = cal.getAttribute('data-today') ?? iso(now.getFullYear(), now.getMonth(), now.getDate())
    const min = cal.getAttribute('data-min') ?? ''
    const max = cal.getAttribute('data-max') ?? ''

    const render = (focusDate?: string): void => {
      if (caption) caption.textContent = `${MONTHS[month]} ${year}`
      const firstWeekday = new Date(year, month, 1).getDay()
      const start = new Date(year, month, 1 - firstWeekday)
      daysEl.replaceChildren()

      for (let i = 0; i < 42; i++) {
        const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
        const date = iso(d.getFullYear(), d.getMonth(), d.getDate())
        const outside = d.getMonth() !== month
        const disabled = (min !== '' && date < min) || (max !== '' && date > max)
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = 'cui-calendar-day'
        btn.dataset.slot = 'calendar-day'
        btn.dataset.date = date
        btn.textContent = String(d.getDate())
        btn.setAttribute('role', 'gridcell')
        if (outside) btn.dataset.outside = ''
        if (date === today) btn.dataset.today = ''
        if (date === selected) {
          btn.dataset.selected = ''
          btn.setAttribute('aria-selected', 'true')
        }
        if (disabled) btn.disabled = true
        btn.tabIndex = date === (focusDate ?? (selected || today)) ? 0 : -1
        daysEl.append(btn)
      }
      if (focusDate) daysEl.querySelector<HTMLElement>(`[data-date="${focusDate}"]`)?.focus()
    }

    const shiftMonth = (delta: number): void => {
      month += delta
      if (month < 0) {
        month = 11
        year--
      } else if (month > 11) {
        month = 0
        year++
      }
      render()
    }

    const select = (date: string): void => {
      selected = date
      render()
      cal.dispatchEvent(new CustomEvent('cui:calendar-select', { bubbles: true, detail: { date } }))
    }

    prev?.addEventListener('click', () => shiftMonth(-1))
    next?.addEventListener('click', () => shiftMonth(1))
    daysEl.addEventListener('click', (event) => {
      const btn = (event.target as HTMLElement).closest<HTMLElement>('[data-slot="calendar-day"]')
      if (btn && !(btn as HTMLButtonElement).disabled && btn.dataset.date) select(btn.dataset.date)
    })
    daysEl.addEventListener('keydown', (event) => {
      const active = document.activeElement as HTMLElement
      if (!active?.dataset.date) return
      const cur = new Date(`${active.dataset.date}T00:00:00`)
      const move = (days: number): void => {
        const d = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + days)
        const date = iso(d.getFullYear(), d.getMonth(), d.getDate())
        if (d.getFullYear() !== year || d.getMonth() !== month) {
          year = d.getFullYear()
          month = d.getMonth()
        }
        render(date)
      }
      const keys: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
      if (event.key in keys) {
        event.preventDefault()
        move(keys[event.key]!)
      } else if (event.key === 'PageUp') {
        event.preventDefault()
        shiftMonth(-1)
      } else if (event.key === 'PageDown') {
        event.preventDefault()
        shiftMonth(1)
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        select(active.dataset.date)
      }
    })

    render()
  }
}
export { WEEKDAYS as calendarWeekdays }
