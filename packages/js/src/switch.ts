// SPDX-License-Identifier: MIT

/**
 * Switch behavior — a hidden checkbox drives a styled track + thumb.
 *
 * Contract (component markup):
 *   root   <div data-slot="switch">
 *     box    <span data-slot="switch-control-box">
 *       track  <span data-slot="switch-track" role="switch" tabindex="0" [data-checked]>
 *         thumb  <span data-slot="switch-thumb" [data-checked]>
 *       input  <input type="checkbox" …>                (visually hidden, real state)
 *     label  <label data-slot="switch-label" for="<inputId>">
 *
 * The native checkbox is the source of truth (the label's `for` toggles it);
 * this enhancer mirrors its `checked` onto the track/thumb `data-checked`
 * (which the CSS reads) and makes the track itself an operable toggle.
 */

import { claim } from './dom.ts'

export function enhanceSwitch(root: ParentNode): void {
  for (const el of claim(root, '[data-slot="switch"]', 'switch')) {
    const track = el.querySelector<HTMLElement>('[data-slot="switch-track"]')
    const thumb = el.querySelector<HTMLElement>('[data-slot="switch-thumb"]')
    const input = el.querySelector<HTMLInputElement>('input[type="checkbox"]')
    if (!track || !input) continue

    const reflect = (): void => {
      track.toggleAttribute('data-checked', input.checked)
      thumb?.toggleAttribute('data-checked', input.checked)
      track.setAttribute('aria-checked', String(input.checked))
    }
    const toggle = (): void => {
      if (input.disabled) return
      input.checked = !input.checked
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }

    // The label ([for]) toggles the native input directly; sync on its change.
    input.addEventListener('change', reflect)
    track.addEventListener('click', toggle)
    track.addEventListener('keydown', (event) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        toggle()
      }
    })
    reflect()
  }
}
