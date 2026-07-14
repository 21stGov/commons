// SPDX-License-Identifier: MIT

/**
 * Number Field behavior.
 *
 * Contract (authored markup):
 *   root      <div data-slot="number-field" [data-step] [data-min] [data-max]>
 *   input     <input data-slot="number-field-input" role="spinbutton" aria-valuenow>
 *   increment <button data-slot="number-field-increment">
 *   decrement <button data-slot="number-field-decrement">
 *
 * Steps the value with the buttons or Arrow Up/Down, clamps to min/max, keeps
 * aria-valuenow in step, and disables a button at its bound.
 */

import { claim } from './dom.ts'

const num = (v: string | null | undefined, fallback: number): number => {
  const n = Number(v)
  return v == null || v === '' || Number.isNaN(n) ? fallback : n
}

export function enhanceNumberField(root: ParentNode): void {
  for (const el of claim(root, '[data-slot="number-field"]', 'number-field')) {
    const input = el.querySelector<HTMLInputElement>('[data-slot="number-field-input"]')
    const inc = el.querySelector<HTMLButtonElement>('[data-slot="number-field-increment"]')
    const dec = el.querySelector<HTMLButtonElement>('[data-slot="number-field-decrement"]')
    if (!input) continue
    const step = num(el.getAttribute('data-step') ?? input.step, 1)
    const min = num(el.getAttribute('data-min') ?? input.min, -Infinity)
    const max = num(el.getAttribute('data-max') ?? input.max, Infinity)

    const sync = (): void => {
      const v = num(input.value, 0)
      input.setAttribute('aria-valuenow', String(v))
      if (inc) inc.disabled = v >= max
      if (dec) dec.disabled = v <= min
    }
    const nudge = (dir: number): void => {
      const v = Math.min(max, Math.max(min, num(input.value, 0) + dir * step))
      input.value = String(Math.round(v * 1e6) / 1e6)
      sync()
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }

    inc?.addEventListener('click', () => nudge(1))
    dec?.addEventListener('click', () => nudge(-1))
    input.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        nudge(1)
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        nudge(-1)
      }
    })
    input.addEventListener('input', sync)
    sync()
  }
}
