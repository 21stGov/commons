// SPDX-License-Identifier: MIT

/**
 * Tabs behavior.
 *
 * Contract (authored markup):
 *   root   <div data-slot="tabs" data-orientation="horizontal">
 *   list   <div data-slot="tabs-list" role="tablist">
 *   tab    <button data-slot="tabs-tab" role="tab" aria-controls="<panelId>"
 *             [data-active] [data-disabled]>
 *   panel  <div data-slot="tabs-panel" id="<panelId>" role="tabpanel" [hidden]>
 *
 * The active tab carries `data-active` (the CSS underline) and `aria-selected`;
 * its panel is shown and the rest are `hidden`. Roving tabindex + arrow keys
 * follow the WAI-ARIA tabs pattern (activation follows focus).
 */

import { all, claim } from './dom.ts'

export function enhanceTabs(root: ParentNode): void {
  for (const tabs of claim(root, '[data-slot="tabs"]', 'tabs')) {
    const list = tabs.querySelector<HTMLElement>('[data-slot="tabs-list"]')
    const tabEls = all<HTMLElement>(tabs, '[data-slot="tabs-tab"]')
    const panels = all<HTMLElement>(tabs, '[data-slot="tabs-panel"]')
    const enabled = (): HTMLElement[] => tabEls.filter((t) => !t.hasAttribute('data-disabled'))

    const select = (tab: HTMLElement): void => {
      if (tab.hasAttribute('data-disabled')) return
      for (const t of tabEls) {
        const active = t === tab
        t.toggleAttribute('data-active', active)
        t.setAttribute('aria-selected', String(active))
        t.tabIndex = active ? 0 : -1
      }
      const id = tab.getAttribute('aria-controls')
      for (const p of panels) p.hidden = p.id !== id
    }

    for (const tab of tabEls) {
      tab.addEventListener('click', () => {
        select(tab)
        tab.focus()
      })
    }

    list?.addEventListener('keydown', (event) => {
      const items = enabled()
      const idx = items.indexOf(document.activeElement as HTMLElement)
      if (idx === -1) return
      let next = -1
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (idx + 1) % items.length
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (idx - 1 + items.length) % items.length
      else if (event.key === 'Home') next = 0
      else if (event.key === 'End') next = items.length - 1
      if (next !== -1) {
        event.preventDefault()
        const tab = items[next]!
        select(tab)
        tab.focus()
      }
    })
  }
}
