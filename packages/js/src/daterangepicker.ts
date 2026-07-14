// SPDX-License-Identifier: MIT

/**
 * Date Range Picker behavior — a trigger that opens a range-mode Calendar.
 *
 * Contract (authored markup):
 *   root       <div data-slot="date-range-picker">
 *   trigger    <button data-slot="date-range-picker-trigger" aria-expanded>
 *                value <span data-slot="date-range-picker-value">
 *   positioner <div data-slot="date-range-picker-positioner" hidden>
 *                calendar <div data-slot="calendar" data-mode="range" …>
 *
 * Opens/positions the popover; the range-mode Calendar emits `cui:calendar-range`
 * once both ends are chosen, which fills the trigger ("Jul 14 – Jul 22") and
 * closes.
 */

import { positionAnchored } from './anchor.ts'
import { formatISO } from './datepicker.ts'
import { claim } from './dom.ts'
import { activateOverlay } from './overlay.ts'

export function enhanceDateRangePicker(root: ParentNode): void {
  for (const el of claim(root, '[data-slot="date-range-picker"]', 'date-range-picker')) {
    const trigger = el.querySelector<HTMLElement>('[data-slot="date-range-picker-trigger"]')
    const positioner = el.querySelector<HTMLElement>('[data-slot="date-range-picker-positioner"]')
    const valueEl = el.querySelector<HTMLElement>('[data-slot="date-range-picker-value"]') ?? trigger
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
    el.addEventListener('cui:calendar-range', (event) => {
      const { start, end } = (event as CustomEvent<{ start: string; end: string }>).detail
      if (valueEl) valueEl.textContent = `${formatISO(start)} – ${formatISO(end)}`
      trigger.setAttribute('data-range-start', start)
      trigger.setAttribute('data-range-end', end)
      close()
      trigger.focus()
    })
  }
}
