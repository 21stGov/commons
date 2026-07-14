// SPDX-License-Identifier: MIT

/**
 * Dialog / Alert Dialog behavior.
 *
 * Contract (authored markup):
 *   root      <div data-slot="dialog" [data-dialog-role="alertdialog"]>
 *   trigger   <button data-slot="dialog-trigger" aria-expanded>
 *   backdrop  <div data-slot="dialog-backdrop" hidden>
 *   viewport  <div data-slot="dialog-viewport" hidden>
 *               popup <div data-slot="dialog-popup" role="dialog" aria-modal="true" tabindex="-1">
 *   close      any [data-slot="dialog-dismiss"] or [data-dialog-close]
 *
 * A plain modal: focus moves in on open and is trapped, Escape and (for a
 * normal dialog) an outside press close it, body scroll locks, and focus
 * returns to the trigger on close. `alertdialog` opts out of outside-dismiss.
 */

import { claim } from './dom.ts'
import { activateOverlay, focusFirst, lockScroll } from './overlay.ts'

export function enhanceDialog(root: ParentNode): void {
  for (const el of claim(root, '[data-slot="dialog"]', 'dialog')) {
    const trigger = el.querySelector<HTMLElement>('[data-slot="dialog-trigger"]')
    const backdrop = el.querySelector<HTMLElement>('[data-slot="dialog-backdrop"]')
    const viewport = el.querySelector<HTMLElement>('[data-slot="dialog-viewport"]')
    const popup = el.querySelector<HTMLElement>('[data-slot="dialog-popup"]')
    if (!trigger || !viewport || !popup) continue

    const alert = el.getAttribute('data-dialog-role') === 'alertdialog'
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
    for (const closer of el.querySelectorAll<HTMLElement>('[data-slot="dialog-dismiss"], [data-dialog-close]')) {
      closer.addEventListener('click', close)
    }
  }
}
