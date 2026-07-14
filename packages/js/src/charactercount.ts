// SPDX-License-Identifier: MIT

/**
 * Character Count behavior.
 *
 * Contract (authored markup):
 *   root    <div data-slot="character-count" data-max="N">
 *   field   <textarea data-slot="textarea"> (or any input/textarea inside)
 *   message <span data-slot="character-count-message">
 *   status  <span data-slot="character-count-status" aria-live="polite">
 *
 * Updates the remaining/over count as the field changes and flags over-limit
 * with `data-over` on the root (for the error styling). Soft by default; add
 * `maxlength` to the field for a hard cap.
 */

import { claim } from './dom.ts'

export function enhanceCharacterCount(root: ParentNode): void {
  for (const el of claim(root, '[data-slot="character-count"]', 'character-count')) {
    const field = el.querySelector<HTMLTextAreaElement | HTMLInputElement>(
      '[data-slot="textarea"], textarea, input',
    )
    const message = el.querySelector<HTMLElement>('[data-slot="character-count-message"]')
    const status = el.querySelector<HTMLElement>('[data-slot="character-count-status"]')
    if (!field) continue
    const max = Number(el.getAttribute('data-max') ?? field.getAttribute('maxlength') ?? 0)

    const update = (): void => {
      const remaining = max - field.value.length
      const text =
        remaining >= 0
          ? `${remaining} character${remaining === 1 ? '' : 's'} left`
          : `${-remaining} character${remaining === -1 ? '' : 's'} over limit`
      if (message) message.textContent = text
      if (status) status.textContent = text
      el.toggleAttribute('data-over', remaining < 0)
    }
    field.addEventListener('input', update)
    update()
  }
}
