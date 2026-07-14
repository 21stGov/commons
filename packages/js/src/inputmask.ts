// SPDX-License-Identifier: MIT

/**
 * Input Mask behavior — fixed-format formatting as you type.
 *
 * Contract (authored markup):
 *   <input data-slot="input-mask" data-mask="(###) ###-####">
 *
 * `#` consumes one typed digit; every other character in the template is a
 * literal inserted automatically. Non-digits are ignored. (Cursor is placed at
 * the end — good enough for a fixed-format field; fancier caret handling is a
 * later refinement.)
 */

import { claim } from './dom.ts'

export function enhanceInputMask(root: ParentNode): void {
  for (const input of claim(root, 'input[data-mask]', 'input-mask')) {
    const template = input.getAttribute('data-mask')
    if (!template) continue
    const field = input as HTMLInputElement

    const format = (): void => {
      const digits = field.value.replace(/\D/g, '')
      let out = ''
      let di = 0
      for (const ch of template) {
        if (di >= digits.length) break
        if (ch === '#') out += digits[di++]
        else out += ch
      }
      field.value = out
    }
    field.addEventListener('input', format)
    format()
  }
}

/**
 * Reveal toggle for a `secure` input mask (e.g. SSN). The value renders as
 * password dots until the user presses the eye button, which flips the input
 * between `password` and `text` and swaps the eye / eye-off glyphs.
 *
 * Contract (authored markup):
 *   <div data-slot="input-mask-secure">
 *     <input data-slot="input-mask" type="password" …>
 *     <button data-slot="input-mask-reveal" aria-pressed="false"
 *             data-show-label="Show" data-hide-label="Hide">
 *       <svg data-im-eye>…</svg><svg data-im-eye-off hidden>…</svg>
 *     </button>
 *   </div>
 */
export function enhanceInputMaskReveal(root: ParentNode): void {
  for (const btn of claim(root, '[data-slot="input-mask-reveal"]', 'input-mask-reveal')) {
    const secure = btn.closest('[data-slot="input-mask-secure"]')
    const input = secure?.querySelector<HTMLInputElement>('input')
    if (!input) continue
    const eye = btn.querySelector<HTMLElement>('[data-im-eye]')
    const eyeOff = btn.querySelector<HTMLElement>('[data-im-eye-off]')
    const showLabel = btn.getAttribute('data-show-label') ?? 'Show'
    const hideLabel = btn.getAttribute('data-hide-label') ?? 'Hide'
    btn.addEventListener('click', () => {
      const nowRevealed = input.type === 'password'
      input.type = nowRevealed ? 'text' : 'password'
      btn.setAttribute('aria-pressed', String(nowRevealed))
      btn.setAttribute('aria-label', nowRevealed ? hideLabel : showLabel)
      if (eye) eye.hidden = nowRevealed
      if (eyeOff) eyeOff.hidden = !nowRevealed
    })
  }
}
