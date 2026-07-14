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
