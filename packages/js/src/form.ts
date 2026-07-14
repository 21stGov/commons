// SPDX-License-Identifier: MIT

/**
 * Form-control enhancers for state that HTML attributes can't express.
 *
 * `indeterminate` is an IDL-only property on `<input type="checkbox">` — it has
 * no HTML attribute, so server-rendered / authored markup can only hint at it
 * with `data-indeterminate`. Set the real property from that hint; the existing
 * `:indeterminate` CSS (the peer-indeterminate mark) then fires with no extra
 * styling.
 */

import { claim } from './dom.ts'

export function enhanceIndeterminate(root: ParentNode): void {
  for (const input of claim(root, 'input[type="checkbox"][data-indeterminate]', 'indeterminate')) {
    ;(input as HTMLInputElement).indeterminate = true
  }
}

/**
 * Select-all checkbox tree. A master `input[data-checkbox-all="<name>"]` toggles
 * every `input[data-checkbox-member="<name>"]`; the master reflects the members
 * (all → checked, none → unchecked, some → indeterminate).
 */
export function enhanceCheckboxAll(root: ParentNode): void {
  for (const master of claim(root, 'input[data-checkbox-all]', 'checkbox-all')) {
    const name = master.getAttribute('data-checkbox-all')
    const input = master as HTMLInputElement
    const members = Array.from(
      root.querySelectorAll<HTMLInputElement>(`input[data-checkbox-member="${name}"]`),
    )
    if (members.length === 0) continue

    const sync = (): void => {
      const checked = members.filter((m) => m.checked).length
      input.checked = checked === members.length
      input.indeterminate = checked > 0 && checked < members.length
      input.toggleAttribute('data-indeterminate', input.indeterminate)
    }
    input.addEventListener('change', () => {
      for (const m of members) m.checked = input.checked
      input.indeterminate = false
      input.removeAttribute('data-indeterminate')
    })
    for (const m of members) m.addEventListener('change', sync)
    sync()
  }
}
