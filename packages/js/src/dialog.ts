// SPDX-License-Identifier: MIT

/**
 * Modal behaviors — Dialog, Alert Dialog, and Drawer. They share one shape:
 *   root      <div data-slot="<p>" [data-dialog-role="alertdialog"]>
 *   trigger   <button data-slot="<p>-trigger" aria-expanded>
 *   backdrop  <div data-slot="<p>-backdrop" hidden>
 *   viewport  <div data-slot="<p>-viewport" hidden>
 *               popup <div data-slot="<p>-popup|content" role="dialog" aria-modal="true" tabindex="-1">
 *   close     any [data-slot="<p>-dismiss"] or [data-dialog-close]
 *
 * where `<p>` is `dialog`, `alert-dialog`, or `drawer`. Focus moves in and is
 * trapped, body scroll locks, Escape closes, focus returns to the trigger.
 * Alert dialogs (and any root marked `alertdialog`) opt out of outside-dismiss;
 * the drawer's slide direction is purely CSS (`--start/--end/--top/--bottom`).
 */

import { claim } from './dom.ts'
import { activateOverlay, focusFirst, lockScroll } from './overlay.ts'

const MODALS: { prefix: string; alert: boolean }[] = [
  { prefix: 'dialog', alert: false },
  { prefix: 'alert-dialog', alert: true },
  { prefix: 'drawer', alert: false },
]

function wireModal(root: ParentNode, prefix: string, alertDefault: boolean): void {
  for (const el of claim(root, `[data-slot="${prefix}"]`, prefix)) {
    const trigger = el.querySelector<HTMLElement>(`[data-slot="${prefix}-trigger"]`)
    const backdrop = el.querySelector<HTMLElement>(`[data-slot="${prefix}-backdrop"]`)
    const viewport = el.querySelector<HTMLElement>(`[data-slot="${prefix}-viewport"]`)
    const popup = el.querySelector<HTMLElement>(`[data-slot="${prefix}-popup"], [data-slot="${prefix}-content"]`)
    if (!trigger || !viewport || !popup) continue

    const alert = alertDefault || el.getAttribute('data-dialog-role') === 'alertdialog'
    let teardown: (() => void) | null = null
    let unlock: (() => void) | null = null

    const close = (): void => {
      if (!teardown) return
      teardown()
      teardown = null
      unlock?.()
      unlock = null
      viewport.hidden = true
      viewport.removeAttribute('data-open')
      if (backdrop) backdrop.hidden = true
      popup.removeAttribute('data-open')
      trigger.setAttribute('aria-expanded', 'false')
    }

    const open = (): void => {
      if (teardown) return
      if (backdrop) backdrop.hidden = false
      viewport.hidden = false
      viewport.setAttribute('data-open', '')
      popup.setAttribute('data-open', '')
      trigger.setAttribute('aria-expanded', 'true')
      unlock = lockScroll()
      teardown = activateOverlay(popup, close, { dismissOnOutside: !alert, ignore: trigger })
      focusFirst(popup)
    }

    trigger.addEventListener('click', open)
    for (const closer of el.querySelectorAll<HTMLElement>(`[data-slot="${prefix}-dismiss"], [data-dialog-close]`)) {
      closer.addEventListener('click', close)
    }
  }
}

export function enhanceDialog(root: ParentNode): void {
  for (const { prefix, alert } of MODALS) wireModal(root, prefix, alert)
}
