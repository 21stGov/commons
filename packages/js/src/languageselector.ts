// SPDX-License-Identifier: MIT

/**
 * Language Selector behavior — reflects the chosen language.
 *
 * Toggle variant: clicking a `<button data-slot="language-selector-item">`
 * marks it active (`aria-current="true"` + `--active`) and clears its siblings.
 * (Real `<a>` items navigate, so they are left alone.) Dropdown variant: the
 * native `<select>`'s change is mirrored the same way.
 *
 * A sibling element carrying `[data-language-active]` — or, in the demos, a
 * following `<p>` whose text starts with "Active language" — is updated to the
 * chosen code so the "Active language: …" readout tracks the control.
 */

import { all, claim } from './dom.ts'

const ACTIVE = 'cui-language-selector-item--active'

export function enhanceLanguageSelector(root: ParentNode): void {
  for (const selector of claim(root, '[data-slot="language-selector"]', 'language-selector')) {
    const items = all<HTMLElement>(selector, '[data-slot="language-selector-item"]')
    const select = selector.querySelector<HTMLSelectElement>('select')

    // The demo readout: a following sibling <p> ("Active language: …") or any
    // element flagged with data-language-active.
    const readout =
      selector.parentElement?.querySelector<HTMLElement>('[data-language-active]') ??
      Array.from(selector.parentElement?.children ?? []).find(
        (el): el is HTMLElement =>
          el instanceof HTMLElement && /^\s*Active language/i.test(el.textContent ?? ''),
      ) ??
      null

    const setActive = (code: string): void => {
      for (const item of items) {
        const on = item.getAttribute('lang') === code
        item.classList.toggle(ACTIVE, on)
        if (on) item.setAttribute('aria-current', 'true')
        else item.removeAttribute('aria-current')
      }
      if (select && select.value !== code) select.value = code
      if (readout) readout.textContent = `Active language: ${code}`
    }

    for (const item of items) {
      // Buttons toggle in place; anchors are real navigation, left untouched.
      if (item.tagName === 'BUTTON') {
        const code = item.getAttribute('lang')
        if (code) item.addEventListener('click', () => setActive(code))
      }
    }
    select?.addEventListener('change', () => setActive(select.value))
  }
}
