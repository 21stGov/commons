// SPDX-License-Identifier: MIT

/**
 * Toolbar behavior — roving tabindex over the controls of a `[role="toolbar"]`.
 *
 * The toolbar is one Tab stop; Arrow keys move between its controls (Left/Right,
 * or Up/Down when `aria-orientation="vertical"`), Home/End jump to the ends.
 * Controls work natively without this — it only adds the APG roving-focus nicety.
 */

import { all, claim } from './dom.ts'

const CONTROLS = 'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),[tabindex]'

export function enhanceToolbar(root: ParentNode): void {
  for (const toolbar of claim(root, '[role="toolbar"]', 'toolbar')) {
    const items = all<HTMLElement>(toolbar, CONTROLS).filter((el) => el.offsetParent !== null)
    if (items.length === 0) continue
    items.forEach((item, i) => (item.tabIndex = i === 0 ? 0 : -1))
    const vertical = toolbar.getAttribute('aria-orientation') === 'vertical'

    toolbar.addEventListener('keydown', (event) => {
      const i = items.indexOf(document.activeElement as HTMLElement)
      if (i === -1) return
      const nextKey = vertical ? 'ArrowDown' : 'ArrowRight'
      const prevKey = vertical ? 'ArrowUp' : 'ArrowLeft'
      let n = -1
      if (event.key === nextKey) n = (i + 1) % items.length
      else if (event.key === prevKey) n = (i - 1 + items.length) % items.length
      else if (event.key === 'Home') n = 0
      else if (event.key === 'End') n = items.length - 1
      if (n !== -1) {
        event.preventDefault()
        items.forEach((item, j) => (item.tabIndex = j === n ? 0 : -1))
        items[n]!.focus()
      }
    })
  }
}
