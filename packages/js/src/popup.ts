// SPDX-License-Identifier: MIT

/**
 * Anchored-popup behaviors — dropdown menu, popover, context menu, tooltip,
 * hover card. They share one shape:
 *   root       <div data-slot="<name>">
 *   trigger    <button data-slot="<name>-trigger" aria-expanded>
 *   positioner <div data-slot="<name>-positioner" hidden>  (position: fixed)
 *                popup <div data-slot="<name>-popup|content">
 *
 * `enhance()` positions the popup next to its trigger, and opens/closes it on
 * the configured interaction (click, right-click, or hover), with outside/Escape
 * dismiss and — for menus — arrow-key roving focus over the items.
 */

import { positionAnchored, type Align, type Side } from './anchor.ts'
import { claim } from './dom.ts'
import { activateOverlay, focusFirst } from './overlay.ts'

interface PopupConfig {
  slot: string
  open: 'click' | 'contextmenu' | 'hover'
  /** Items get roving arrow-key focus and the popup grabs focus on open. */
  menu?: boolean
  side?: Side
  align?: Align
}

const MENU_ITEMS = '[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]'

function menuItems(popup: HTMLElement): HTMLElement[] {
  return Array.from(popup.querySelectorAll<HTMLElement>(MENU_ITEMS)).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true',
  )
}

function wireMenuKeys(popup: HTMLElement, close: () => void): void {
  popup.addEventListener('keydown', (event) => {
    const items = menuItems(popup)
    if (items.length === 0) return
    const idx = items.indexOf(document.activeElement as HTMLElement)
    let next = -1
    if (event.key === 'ArrowDown') next = idx < 0 ? 0 : (idx + 1) % items.length
    else if (event.key === 'ArrowUp') next = idx < 0 ? items.length - 1 : (idx - 1 + items.length) % items.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = items.length - 1
    else if (event.key === 'Tab') {
      close()
      return
    }
    if (next !== -1) {
      event.preventDefault()
      items[next]!.focus()
    }
  })
}

function enhancePopup(root: ParentNode, cfg: PopupConfig): void {
  for (const el of claim(root, `[data-slot="${cfg.slot}"]`, cfg.slot)) {
    const trigger = el.querySelector<HTMLElement>(`[data-slot="${cfg.slot}-trigger"]`)
    const positioner = el.querySelector<HTMLElement>(`[data-slot="${cfg.slot}-positioner"]`)
    const popup = positioner?.querySelector<HTMLElement>(`[data-slot="${cfg.slot}-popup"], [data-slot="${cfg.slot}-content"]`)
    if (!trigger || !positioner || !popup) continue

    let teardown: (() => void) | null = null
    let point: { x: number; y: number } | null = null

    const place = (): void => {
      if (point) {
        positioner.style.position = 'fixed'
        positioner.style.insetInlineStart = `${point.x}px`
        positioner.style.insetBlockStart = `${point.y}px`
      } else {
        positionAnchored(trigger, positioner, { side: cfg.side, align: cfg.align })
      }
    }

    const close = (): void => {
      if (!teardown) return
      teardown()
      teardown = null
      positioner.hidden = true
      popup.removeAttribute('data-open')
      trigger.setAttribute('aria-expanded', 'false')
      point = null
    }

    const open = (): void => {
      if (teardown) return
      positioner.hidden = false
      place()
      popup.setAttribute('data-open', '')
      trigger.setAttribute('aria-expanded', 'true')
      teardown = activateOverlay(popup, close, { dismissOnOutside: true, ignore: trigger })
      if (cfg.menu) {
        for (const item of menuItems(popup)) item.tabIndex = -1
        ;(menuItems(popup)[0] ?? popup).focus()
      } else {
        focusFirst(popup)
      }
    }

    if (cfg.open === 'click') {
      trigger.addEventListener('click', () => (teardown ? close() : open()))
    } else if (cfg.open === 'contextmenu') {
      trigger.addEventListener('contextmenu', (event) => {
        event.preventDefault()
        close()
        point = { x: event.clientX, y: event.clientY }
        open()
      })
    }
    if (cfg.menu) wireMenuKeys(popup, close)
    for (const closer of el.querySelectorAll<HTMLElement>('[data-slot$="-close"], [data-popup-close]')) {
      closer.addEventListener('click', close)
    }
    // Menu items close the menu after activating.
    if (cfg.menu) {
      for (const item of menuItems(popup)) {
        item.addEventListener('click', () => {
          if (item.getAttribute('role') === 'menuitem') close()
        })
      }
    }
  }
}

/** Hover/focus popups — tooltip, hover card. Shown while the trigger is hovered or focused. */
function enhanceHover(root: ParentNode, slot: string): void {
  for (const el of claim(root, `[data-slot="${slot}"]`, slot)) {
    const trigger = el.querySelector<HTMLElement>(`[data-slot="${slot}-trigger"]`)
    const positioner = el.querySelector<HTMLElement>(`[data-slot="${slot}-positioner"]`)
    const popup = positioner?.querySelector<HTMLElement>(`[data-slot="${slot}-popup"], [data-slot="${slot}-content"]`)
    if (!trigger || !positioner || !popup) continue

    let timer: ReturnType<typeof setTimeout> | undefined
    const show = (): void => {
      clearTimeout(timer)
      positioner.hidden = false
      positionAnchored(trigger, positioner, { side: 'top', align: 'center' })
      popup.setAttribute('data-open', '')
    }
    const hide = (): void => {
      timer = setTimeout(() => {
        positioner.hidden = true
        popup.removeAttribute('data-open')
      }, 80)
    }
    trigger.addEventListener('pointerenter', show)
    trigger.addEventListener('pointerleave', hide)
    trigger.addEventListener('focus', show)
    trigger.addEventListener('blur', hide)
    positioner.addEventListener('pointerenter', () => clearTimeout(timer))
    positioner.addEventListener('pointerleave', hide)
    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') hide()
    })
  }
}

export function enhancePopover(root: ParentNode): void {
  enhancePopup(root, { slot: 'popover', open: 'click' })
}
export function enhanceDropdownMenu(root: ParentNode): void {
  enhancePopup(root, { slot: 'dropdown-menu', open: 'click', menu: true })
}
export function enhanceContextMenu(root: ParentNode): void {
  enhancePopup(root, { slot: 'context-menu', open: 'contextmenu', menu: true })
}
export function enhanceTooltip(root: ParentNode): void {
  enhanceHover(root, 'tooltip')
}
export function enhanceHoverCard(root: ParentNode): void {
  enhanceHover(root, 'hover-card')
}
