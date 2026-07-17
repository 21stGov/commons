// SPDX-License-Identifier: MIT

/**
 * Menubar + Navigation Menu behavior — a horizontal bar of triggers, each
 * opening an anchored panel, with one open at a time.
 *
 * Contract (authored markup), with `<p>` = `menubar` | `navigation-menu`:
 *   bar      <div data-slot="<p>" role="menubar">
 *   menu     <div data-slot="<p>-menu|item">      (wraps a trigger + its panel)
 *     trigger    <button data-slot="<p>-trigger" aria-expanded aria-haspopup>
 *     positioner <div data-slot="<p>-positioner" hidden>
 *       content  <div data-slot="<p>-content|popup">  (menu items, or a link panel)
 *
 * Click toggles a menu; while one is open, hovering another trigger switches to
 * it; ArrowLeft/Right move between triggers; Escape and an outside press close.
 * For the menubar, ArrowDown opens and focuses the first item, and the items
 * take arrow-key roving focus.
 */

import { positionAnchored } from './anchor.ts'
import { all, claim } from './dom.ts'

function wireBar(root: ParentNode, slot: string, isMenu: boolean): void {
  for (const bar of claim(root, `[data-slot="${slot}"]`, slot)) {
    const triggers = all<HTMLElement>(bar, `[data-slot="${slot}-trigger"]`)
    if (triggers.length === 0) continue
    const positionerOf = (t: HTMLElement): HTMLElement | null =>
      t.parentElement?.querySelector<HTMLElement>(`[data-slot="${slot}-positioner"]`) ?? null
    const contentOf = (t: HTMLElement): HTMLElement | null =>
      positionerOf(t)?.querySelector<HTMLElement>(`[data-slot="${slot}-popup"], [data-slot="${slot}-content"]`) ??
      null
    const items = (t: HTMLElement): HTMLElement[] =>
      Array.from(contentOf(t)?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])

    // Mirror React's Base UI state on the trigger and its chevron so the same
    // generated CSS fires — the open trigger's border/weight and the chevron's
    // rotation key off `[data-popup-open]`, not `aria-expanded`.
    const setOpenState = (t: HTMLElement, open: boolean): void => {
      const icon = t.querySelector<HTMLElement>(`[data-slot="${slot}-trigger-icon"]`)
      for (const el of [t, icon]) {
        if (!el) continue
        if (open) el.setAttribute('data-popup-open', '')
        else el.removeAttribute('data-popup-open')
      }
    }

    let openIndex = -1
    const close = (focusTrigger = false): void => {
      if (openIndex === -1) return
      const t = triggers[openIndex]!
      t.setAttribute('aria-expanded', 'false')
      setOpenState(t, false)
      const p = positionerOf(t)
      if (p) p.hidden = true
      if (focusTrigger) t.focus()
      openIndex = -1
    }
    const open = (index: number): void => {
      if (openIndex === index) return
      close()
      const t = triggers[index]!
      const p = positionerOf(t)
      if (!p) return
      p.hidden = false
      positionAnchored(t, p, { side: 'bottom', align: 'start' })
      t.setAttribute('aria-expanded', 'true')
      setOpenState(t, true)
      openIndex = index
    }

    triggers.forEach((trigger, index) => {
      trigger.addEventListener('click', () => (openIndex === index ? close(true) : open(index)))
      trigger.addEventListener('pointerenter', () => {
        if (openIndex !== -1) {
          open(index)
          trigger.focus()
        }
      })
      trigger.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault()
          const next =
            event.key === 'ArrowRight'
              ? (index + 1) % triggers.length
              : (index - 1 + triggers.length) % triggers.length
          triggers[next]!.focus()
          if (openIndex !== -1) open(next)
        } else if ((event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') && isMenu) {
          event.preventDefault()
          open(index)
          items(trigger)[0]?.focus()
        } else if (event.key === 'Escape') {
          close(true)
        }
      })

      if (isMenu) {
        const content = contentOf(trigger)
        content?.addEventListener('keydown', (event) => {
          const list = items(trigger)
          const i = list.indexOf(document.activeElement as HTMLElement)
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            list[i < 0 ? 0 : (i + 1) % list.length]?.focus()
          } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            list[i < 0 ? list.length - 1 : (i - 1 + list.length) % list.length]?.focus()
          } else if (event.key === 'Escape') {
            event.preventDefault()
            close(true)
          }
        })
        for (const item of items(trigger)) item.addEventListener('click', () => close())
      }
    })

    document.addEventListener('pointerdown', (event) => {
      if (openIndex !== -1 && !bar.contains(event.target as Node)) {
        const p = positionerOf(triggers[openIndex]!)
        if (!p?.contains(event.target as Node)) close()
      }
    })
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && openIndex !== -1) close(true)
    })
  }
}

export function enhanceMenubar(root: ParentNode): void {
  wireBar(root, 'menubar', true)
}
export function enhanceNavigationMenu(root: ParentNode): void {
  wireBar(root, 'navigation-menu', false)
}
