// SPDX-License-Identifier: MIT

/**
 * Command Palette behavior — a modal launcher with a filtered command list.
 *
 * Contract (authored markup):
 *   root      <div data-slot="command-palette-root">
 *   trigger   <button data-slot="command-palette-trigger">
 *   backdrop  <div data-slot="command-palette-backdrop" hidden>
 *   viewport  <div data-slot="command-palette-viewport" hidden>
 *     palette <div data-slot="command-palette" role="dialog" aria-modal="true">
 *       input <input data-slot="command-palette-input" role="combobox">
 *       list  <div data-slot="command-palette-list" role="listbox">
 *         group <div data-slot="command-palette-group"> … items …
 *         item  <div data-slot="command-palette-item" role="option" data-label data-keywords>
 *       empty <div data-slot="command-palette-empty" hidden>
 *
 * Opens as a modal (backdrop, scroll lock, Escape/outside dismiss, focus in the
 * input) on the trigger or Cmd/Ctrl-K. Typing filters items by label + keywords,
 * hides emptied groups, shows the empty state, and drives arrow/Enter selection.
 */

import { all, claim } from './dom.ts'
import { activateOverlay, lockScroll } from './overlay.ts'

export function enhanceCommandPalette(root: ParentNode): void {
  for (const el of claim(root, '[data-slot="command-palette-root"]', 'command-palette')) {
    const trigger = el.querySelector<HTMLElement>('[data-slot="command-palette-trigger"]')
    const backdrop = el.querySelector<HTMLElement>('[data-slot="command-palette-backdrop"]')
    const viewport = el.querySelector<HTMLElement>('[data-slot="command-palette-viewport"]')
    const palette = el.querySelector<HTMLElement>('[data-slot="command-palette"]')
    const input = el.querySelector<HTMLInputElement>('[data-slot="command-palette-input"]')
    const empty = el.querySelector<HTMLElement>('[data-slot="command-palette-empty"]')
    if (!trigger || !viewport || !palette || !input) continue
    const items = all<HTMLElement>(el, '[data-slot="command-palette-item"]')
    const groups = all<HTMLElement>(el, '[data-slot="command-palette-group"]')
    const label = (i: HTMLElement): string =>
      `${i.getAttribute('data-label') ?? i.textContent ?? ''} ${i.getAttribute('data-keywords') ?? ''}`.toLowerCase()
    const visible = (): HTMLElement[] => items.filter((i) => !i.hidden)
    // Disabled commands stay visible (so the list reads the same every open)
    // but are skipped by keyboard roving and activation.
    const selectable = (): HTMLElement[] =>
      items.filter((i) => !i.hidden && !i.hasAttribute('data-disabled'))

    let teardown: (() => void) | null = null
    let unlock: (() => void) | null = null

    const highlight = (item: HTMLElement | undefined): void => {
      for (const i of items) i.removeAttribute('data-highlighted')
      if (item) {
        item.setAttribute('data-highlighted', '')
        if (item.id) input.setAttribute('aria-activedescendant', item.id)
        item.scrollIntoView({ block: 'nearest' })
      } else input.removeAttribute('aria-activedescendant')
    }

    const filter = (): void => {
      const q = input.value.trim().toLowerCase()
      for (const item of items) item.hidden = q !== '' && !label(item).includes(q)
      for (const group of groups) {
        group.hidden = !group.querySelector('[data-slot="command-palette-item"]:not([hidden])')
      }
      if (empty) empty.hidden = visible().length > 0
      highlight(selectable()[0])
    }

    const close = (): void => {
      if (!teardown) return
      teardown()
      teardown = null
      unlock?.()
      unlock = null
      viewport.hidden = true
      if (backdrop) backdrop.hidden = true
      trigger.setAttribute('aria-expanded', 'false')
    }

    const open = (): void => {
      if (teardown) return
      if (backdrop) backdrop.hidden = false
      viewport.hidden = false
      trigger.setAttribute('aria-expanded', 'true')
      unlock = lockScroll()
      input.value = ''
      filter()
      teardown = activateOverlay(palette, close, { dismissOnOutside: true, ignore: trigger })
      input.focus()
    }

    const run = (item: HTMLElement): void => {
      if (item.hasAttribute('data-disabled')) return
      item.dispatchEvent(new CustomEvent('cui:command', { bubbles: true }))
      close()
    }

    trigger.addEventListener('click', open)
    input.addEventListener('input', filter)
    input.addEventListener('keydown', (event) => {
      const list = selectable()
      const active = items.find((i) => i.hasAttribute('data-highlighted'))
      const idx = active ? list.indexOf(active) : -1
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        highlight(list[idx < 0 ? 0 : (idx + 1) % list.length])
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        highlight(list[idx < 0 ? list.length - 1 : (idx - 1 + list.length) % list.length])
      } else if (event.key === 'Enter' && active) {
        event.preventDefault()
        run(active)
      }
    })
    for (const item of items) item.addEventListener('click', () => run(item))

    document.addEventListener('keydown', (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        teardown ? close() : open()
      }
    })
  }
}
