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
