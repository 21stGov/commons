// SPDX-License-Identifier: MIT

/**
 * Date Picker behavior — a trigger that opens the Calendar in a popover.
 *
 * Contract (authored markup):
 *   root       <div data-slot="date-picker">
 *   trigger    <button data-slot="date-picker-trigger" aria-haspopup="dialog" aria-expanded>
 *                value <span data-slot="date-picker-value">
 *   positioner <div data-slot="date-picker-positioner" hidden>
 *                calendar <div data-slot="calendar" …>   (enhanced by enhanceCalendar)
 *
 * Opens/positions the popover (outside/Escape dismiss); when the calendar emits
 * `cui:calendar-select`, fills the trigger value, sets data-value (ISO), and
 * closes. The Calendar behavior itself is wired separately.
 */

import { positionAnchored } from './anchor.ts'
import { claim } from './dom.ts'
import { activateOverlay } from './overlay.ts'

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "2026-07-20" -> "Jul 20, 2026". */
function formatISO(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  if (!y || !m || !d) return date
  return `${MONTHS_SHORT[m - 1]} ${d}, ${y}`
}

export function enhanceDatePicker(root: ParentNode): void {
  for (const el of claim(root, '[data-slot="date-picker"]', 'date-picker')) {
    const trigger = el.querySelector<HTMLElement>('[data-slot="date-picker-trigger"]')
    const positioner = el.querySelector<HTMLElement>('[data-slot="date-picker-positioner"]')
    const valueEl = el.querySelector<HTMLElement>('[data-slot="date-picker-value"]') ?? trigger
    if (!trigger || !positioner) continue

    let teardown: (() => void) | null = null
    const close = (): void => {
      if (!teardown) return
      teardown()
      teardown = null
      positioner.hidden = true
      trigger.setAttribute('aria-expanded', 'false')
    }
    const open = (): void => {
      if (teardown) return
      positioner.hidden = false
      positionAnchored(trigger, positioner, { side: 'bottom', align: 'start' })
      trigger.setAttribute('aria-expanded', 'true')
      teardown = activateOverlay(positioner, close, { dismissOnOutside: true, ignore: trigger })
      positioner.querySelector<HTMLElement>('[data-slot="calendar-day"][tabindex="0"]')?.focus()
    }

    trigger.addEventListener('click', () => (teardown ? close() : open()))
    el.addEventListener('cui:calendar-select', (event) => {
      const date = (event as CustomEvent<{ date: string }>).detail.date
      if (valueEl) valueEl.textContent = formatISO(date)
      trigger.setAttribute('data-value', date)
      close()
      trigger.focus()
    })
  }
}
