// SPDX-License-Identifier: MIT

/**
 * Toggle + Toggle Group behavior.
 *
 * Contract (authored markup):
 *   group  <div data-slot="toggle-group" role="group" [data-toggle-multiple]>
 *   toggle <button data-slot="toggle" aria-pressed [data-pressed]>
 *
 * A toggle flips `aria-pressed` and the `data-pressed` attribute the CSS reads
 * (fill + primary border + pressed-in nudge). In a group, `single` (default)
 * keeps at most one pressed; `data-toggle-multiple` lets several. Groups get
 * roving tabindex + arrow-key focus (APG toolbar pattern). Standalone toggles
 * (not inside a group) flip independently.
 */

import { claim } from './dom.ts'

function setPressed(toggle: HTMLElement, on: boolean): void {
  toggle.toggleAttribute('data-pressed', on)
  toggle.setAttribute('aria-pressed', String(on))
}

export function enhanceToggle(root: ParentNode): void {
  for (const group of claim(root, '[data-slot="toggle-group"]', 'toggle-group')) {
    const multiple = group.hasAttribute('data-toggle-multiple')
    const toggles = claim(group, '[data-slot="toggle"]', 'toggle')
    const focusIndex = (i: number): void => {
      toggles.forEach((t, j) => (t.tabIndex = j === i ? 0 : -1))
      toggles[i]?.focus()
    }
    toggles.forEach((toggle, i) => {
      if (toggle.tabIndex < 0 && i !== 0) toggle.tabIndex = -1
      toggle.addEventListener('click', () => {
        const on = toggle.getAttribute('aria-pressed') === 'true'
        if (!multiple && !on) for (const other of toggles) setPressed(other, false)
        setPressed(toggle, !on)
      })
    })
    group.addEventListener('keydown', (event) => {
      const i = toggles.indexOf(document.activeElement as HTMLElement)
      if (i === -1) return
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault()
        focusIndex((i + 1) % toggles.length)
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault()
        focusIndex((i - 1 + toggles.length) % toggles.length)
      } else if (event.key === 'Home') {
        event.preventDefault()
        focusIndex(0)
      } else if (event.key === 'End') {
        event.preventDefault()
        focusIndex(toggles.length - 1)
      }
    })
  }

  // Standalone toggles (any not already claimed inside a group).
  for (const toggle of claim(root, '[data-slot="toggle"]', 'toggle')) {
    if (toggle.closest('[data-slot="toggle-group"]')) continue
    toggle.addEventListener('click', () => {
      setPressed(toggle, toggle.getAttribute('aria-pressed') !== 'true')
    })
  }
}
