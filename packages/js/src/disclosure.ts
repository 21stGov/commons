// SPDX-License-Identifier: MIT

/**
 * Disclosure behaviors — Accordion and Collapsible.
 *
 * Contract (authored markup):
 *   trigger  <button data-slot="…-trigger" aria-expanded aria-controls="<panelId>">
 *   panel    <div id="<panelId>" data-slot="…-panel" [hidden]>
 *
 * Open state is expressed the way the CSS already reads it: `aria-expanded` on
 * the trigger (drives the chevron/plus-minus) and the `hidden` attribute +
 * `--…-panel-height:auto` on the panel (drives visibility). No framework, and
 * it degrades to a plain expanded section if the script never runs.
 */

import { all, claim } from './dom.ts'

function setOpen(trigger: HTMLElement, panel: HTMLElement | null, open: boolean, cssVar: string): void {
  trigger.setAttribute('aria-expanded', String(open))
  const item = trigger.closest('[data-slot$="-item"]') ?? trigger.parentElement
  item?.toggleAttribute('data-open', open)
  item?.toggleAttribute('data-closed', !open)
  if (!panel) return
  panel.hidden = !open
  panel.toggleAttribute('data-open', open)
  panel.toggleAttribute('data-closed', !open)
  if (open) panel.style.setProperty(cssVar, 'auto')
  else panel.style.removeProperty(cssVar)
}

function panelOf(trigger: HTMLElement): HTMLElement | null {
  const id = trigger.getAttribute('aria-controls')
  if (id) {
    const byId = document.getElementById(id)
    if (byId) return byId
  }
  // Fall back to the nearest panel in the same disclosure container: Base UI's
  // Collapsible/Accordion markup (e.g. the collapsible In-Page Nav) links the
  // trigger and panel by data-slot + CSS, not aria-controls.
  const root = trigger.closest(
    '[data-slot="collapsible"], [data-slot="accordion-item"]',
  )
  return root?.querySelector<HTMLElement>('[data-slot$="-panel"]') ?? null
}

/** Move roving focus between a group of trigger buttons (WAI-ARIA accordion keys). */
function keyboardNav(container: HTMLElement, triggers: HTMLElement[]): void {
  container.addEventListener('keydown', (event) => {
    const idx = triggers.indexOf(document.activeElement as HTMLElement)
    if (idx === -1) return
    let next = -1
    if (event.key === 'ArrowDown') next = (idx + 1) % triggers.length
    else if (event.key === 'ArrowUp') next = (idx - 1 + triggers.length) % triggers.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = triggers.length - 1
    if (next !== -1) {
      event.preventDefault()
      triggers[next]!.focus()
    }
  })
}

/** Wire every accordion under `root`. `data-accordion="single"` closes siblings on open. */
export function enhanceAccordion(root: ParentNode): void {
  for (const acc of claim(root, '[data-slot="accordion"]', 'accordion')) {
    const single = acc.getAttribute('data-accordion') === 'single'
    const triggers = all<HTMLElement>(acc, '[data-slot="accordion-trigger"]')
    for (const trigger of triggers) {
      trigger.addEventListener('click', () => {
        const open = trigger.getAttribute('aria-expanded') === 'true'
        if (single && !open) {
          for (const other of triggers) {
            if (other !== trigger) setOpen(other, panelOf(other), false, '--accordion-panel-height')
          }
        }
        setOpen(trigger, panelOf(trigger), !open, '--accordion-panel-height')
      })
    }
    keyboardNav(acc, triggers)
  }
}

/** Wire every standalone collapsible under `root`. */
export function enhanceCollapsible(root: ParentNode): void {
  for (const trigger of claim(root, '[data-slot="collapsible-trigger"]', 'collapsible')) {
    trigger.addEventListener('click', () => {
      const open = trigger.getAttribute('aria-expanded') === 'true'
      setOpen(trigger, panelOf(trigger), !open, '--collapsible-panel-height')
    })
  }
}

// The Header menu button swaps a hamburger for a close glyph with its state,
// the same two paths React's `MenuIcon` renders.
const HEADER_MENU_ICON = {
  closed: '<path d="M2.5 4.5h11"></path><path d="M2.5 8h11"></path><path d="M2.5 11.5h11"></path>',
  open: '<path d="m3.5 3.5 9 9"></path><path d="m12.5 3.5-9 9"></path>',
}

/**
 * Wire the Header's mobile menu button: a native `<button>` with `aria-expanded`
 * + `aria-controls` pointing at the primary nav. Below `md` it toggles the nav;
 * from `md` up the button is hidden and the nav is always visible.
 *
 * The nav is collapsed with the `hidden` attribute. On the framework-agnostic
 * path there is no Tailwind Preflight, so `[hidden]` carries only the UA
 * `display:none` (no `!important`) — the nav's own `md:block` / `md:hidden`
 * author rules still win at `md`+, so the desktop nav stays visible. (React
 * can't use the attribute for exactly this reason: Preflight's
 * `[hidden]{display:none!important}` there would beat the breakpoint, so it
 * toggles a class instead.) Escape closes the menu and returns focus to the
 * button (the React disclosure contract), and the glyph flips to match state.
 */
export function enhanceHeader(root: ParentNode): void {
  for (const header of claim(root, '[data-slot="header"]', 'header')) {
    const button = header.querySelector<HTMLElement>('[data-slot="header-menu-button"]')
    const nav = button && document.getElementById(button.getAttribute('aria-controls') ?? '')
    if (!button || !nav) continue
    const icon = button.querySelector('svg')
    const apply = (expanded: boolean): void => {
      button.setAttribute('aria-expanded', String(expanded))
      nav.hidden = !expanded
      if (icon) icon.innerHTML = expanded ? HEADER_MENU_ICON.open : HEADER_MENU_ICON.closed
    }
    // Sync to the button's initial state (SSR markup can land out of step).
    apply(button.getAttribute('aria-expanded') === 'true')
    button.addEventListener('click', () => apply(button.getAttribute('aria-expanded') !== 'true'))
    header.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
        apply(false)
        button.focus()
      }
    })
  }
}

/**
 * Wire the Gov Banner's "how to verify this site" disclosure: a native button
 * with `aria-expanded` + `aria-controls` pointing at a region that is toggled
 * via the `hidden` attribute (matching the React component).
 */
export function enhanceGovBanner(root: ParentNode): void {
  for (const banner of claim(root, '[data-slot="gov-banner"]', 'gov-banner')) {
    const trigger = banner.querySelector<HTMLElement>('button[aria-controls][aria-expanded]')
    const region = trigger && document.getElementById(trigger.getAttribute('aria-controls') ?? '')
    if (!trigger || !region) continue
    // Sync the region to the button on load: the SSR-rewritten markup can land
    // with the two out of step (button collapsed, region still visible).
    region.hidden = trigger.getAttribute('aria-expanded') !== 'true'
    trigger.addEventListener('click', () => {
      const open = trigger.getAttribute('aria-expanded') === 'true'
      trigger.setAttribute('aria-expanded', String(!open))
      region.hidden = open
    })
  }
}
