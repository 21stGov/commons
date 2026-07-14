// SPDX-License-Identifier: MIT

/**
 * Sidebar behavior — a collapsible nav with collapsible groups.
 *
 * Contract (authored markup):
 *   sidebar        <nav data-slot="sidebar" [data-collapsed]>
 *   collapse toggle <button data-slot="sidebar-trigger" aria-controls="<sidebarId>">
 *   group trigger   <button data-slot="sidebar-group-trigger" aria-expanded aria-controls="<panelId>">
 *   group panel     <div data-slot="sidebar-group-panel" id="<panelId>" [hidden]>
 *
 * The trigger toggles `data-collapsed` on the sidebar (the CSS collapses it);
 * each group trigger shows/hides its panel like a disclosure.
 */

import { claim } from './dom.ts'

export function enhanceSidebar(root: ParentNode): void {
  // Collapsible groups.
  for (const trigger of claim(root, '[data-slot="sidebar-group-trigger"]', 'sidebar-group')) {
    const id = trigger.getAttribute('aria-controls')
    const panel =
      (id && document.getElementById(id)) ??
      trigger.parentElement?.querySelector<HTMLElement>('[data-slot="sidebar-group-panel"]') ??
      null
    trigger.addEventListener('click', () => {
      const open = trigger.getAttribute('aria-expanded') === 'true'
      trigger.setAttribute('aria-expanded', String(!open))
      if (panel) panel.hidden = open
    })
  }

  // Whole-sidebar collapse toggle.
  for (const trigger of claim(root, '[data-slot="sidebar-trigger"]', 'sidebar-toggle')) {
    const id = trigger.getAttribute('aria-controls')
    const sidebar =
      (id && document.getElementById(id)) ??
      trigger.closest<HTMLElement>('[data-slot="sidebar"]') ??
      document.querySelector<HTMLElement>('[data-slot="sidebar"]')
    if (!sidebar) continue
    trigger.addEventListener('click', () => {
      const collapsed = sidebar.hasAttribute('data-collapsed')
      sidebar.toggleAttribute('data-collapsed', !collapsed)
      trigger.setAttribute('aria-expanded', String(collapsed))
    })
  }
}
