// SPDX-License-Identifier: MIT

/**
 * Combo Box behavior — a text input that filters a listbox.
 *
 * Contract (authored markup):
 *   root       <div data-slot="combo-box">
 *   input      <input data-slot="combo-box-input" role="combobox" aria-expanded aria-controls>
 *   trigger    <button data-slot="combo-box-trigger">   (optional open/close)
 *   clear      <button data-slot="combo-box-clear">      (optional)
 *   positioner <div data-slot="combo-box-positioner" hidden>
 *                list <div data-slot="combo-box-list" role="listbox">
 *                  item  <div data-slot="combo-box-item" role="option" data-label data-value>
 *                empty <div data-slot="combo-box-empty" hidden>
 *
 * Typing filters items by label and opens the list; the active option carries
 * `data-highlighted` and drives `aria-activedescendant` (focus stays in the
 * input). Arrows/Enter/Escape as per the APG combobox pattern; an outside press
 * closes. Picking an item fills the input and closes.
 */

import { positionAnchored } from './anchor.ts'
import { all, claim } from './dom.ts'

export function enhanceComboBox(root: ParentNode): void {
  for (const el of claim(root, '[data-slot="combo-box"]', 'combo-box')) {
    const input = el.querySelector<HTMLInputElement>('[data-slot="combo-box-input"]')
    const positioner = el.querySelector<HTMLElement>('[data-slot="combo-box-positioner"]')
    const trigger = el.querySelector<HTMLElement>('[data-slot="combo-box-trigger"]')
    const clear = el.querySelector<HTMLElement>('[data-slot="combo-box-clear"]')
    const empty = el.querySelector<HTMLElement>('[data-slot="combo-box-empty"]')
    if (!input || !positioner) continue
    const items = all<HTMLElement>(el, '[data-slot="combo-box-item"]')
    const label = (item: HTMLElement): string =>
      item.getAttribute('data-label') ?? item.textContent?.trim() ?? ''
    const visible = (): HTMLElement[] => items.filter((i) => !i.hidden)

    let open = false
    // Set while pick() re-focuses the input, so the focus handler below does
    // not immediately re-open the list we just closed on selection.
    let suppressFocusOpen = false
    const highlight = (item: HTMLElement | undefined): void => {
      for (const i of items) i.removeAttribute('data-highlighted')
      if (item) {
        item.setAttribute('data-highlighted', '')
        if (item.id) input.setAttribute('aria-activedescendant', item.id)
        item.scrollIntoView({ block: 'nearest' })
      } else {
        input.removeAttribute('aria-activedescendant')
      }
    }

    const filter = (): void => {
      const q = input.value.trim().toLowerCase()
      for (const item of items) item.hidden = q !== '' && !label(item).toLowerCase().includes(q)
      if (empty) empty.hidden = visible().length > 0
      highlight(visible()[0])
    }

    const setOpen = (next: boolean): void => {
      open = next
      positioner.hidden = !next
      input.setAttribute('aria-expanded', String(next))
      if (next) positionAnchored(el, positioner, { side: 'bottom', align: 'start' })
      else highlight(undefined)
    }

    const pick = (item: HTMLElement): void => {
      input.value = label(item)
      for (const i of items) {
        i.setAttribute('aria-selected', String(i === item))
        const indicator = i.querySelector<HTMLElement>('[data-slot="combo-box-item-indicator"]')
        if (indicator) indicator.hidden = i !== item
      }
      setOpen(false)
      suppressFocusOpen = true
      input.focus()
      suppressFocusOpen = false
    }

    input.addEventListener('input', () => {
      if (!open) setOpen(true)
      filter()
    })
    input.addEventListener('focus', () => {
      if (!open && !suppressFocusOpen) {
        setOpen(true)
        filter()
      }
    })
    input.addEventListener('keydown', (event) => {
      const list = visible()
      const active = items.find((i) => i.hasAttribute('data-highlighted'))
      const idx = active ? list.indexOf(active) : -1
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        if (!open) setOpen(true)
        highlight(list[idx < 0 ? 0 : (idx + 1) % list.length])
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        highlight(list[idx < 0 ? list.length - 1 : (idx - 1 + list.length) % list.length])
      } else if (event.key === 'Enter' && open && active) {
        event.preventDefault()
        pick(active)
      } else if (event.key === 'Escape') {
        if (open) setOpen(false)
      }
    })

    trigger?.addEventListener('click', () => {
      setOpen(!open)
      if (open) {
        filter()
        input.focus()
      }
    })
    clear?.addEventListener('click', () => {
      input.value = ''
      filter()
      input.focus()
    })
    for (const item of items) item.addEventListener('click', () => pick(item))

    document.addEventListener('pointerdown', (event) => {
      if (open && !el.contains(event.target as Node)) setOpen(false)
    })
  }
}
