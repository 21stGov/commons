// SPDX-License-Identifier: MIT

/**
 * Custom Select behavior — a listbox opened from a button trigger.
 *
 * Contract (authored markup):
 *   root       <div data-slot="custom-select">
 *   trigger    <button data-slot="custom-select-trigger" aria-haspopup="listbox" aria-expanded>
 *                value <span data-slot="custom-select-value">
 *   positioner <div data-slot="custom-select-positioner" hidden>
 *                list <div data-slot="custom-select-list" role="listbox">
 *                  item <div data-slot="custom-select-item" role="option" aria-selected
 *                         [data-highlighted] [data-disabled]>
 *                    text      <span data-slot="custom-select-item-text">
 *                    indicator <span data-slot="custom-select-item-indicator" [hidden]>
 *
 * The highlighted option (keyboard/hover) carries `data-highlighted`; the chosen
 * one carries `aria-selected` and shows its indicator. Selecting updates the
 * trigger's value text and closes. Full keyboard: arrows, Home/End, Enter/Space,
 * Escape, and type-ahead.
 */

import { positionAnchored } from './anchor.ts'
import { all, claim } from './dom.ts'
import { activateOverlay } from './overlay.ts'

export function enhanceCustomSelect(root: ParentNode): void {
  for (const el of claim(root, '[data-slot="custom-select"]', 'custom-select')) {
    const trigger = el.querySelector<HTMLElement>('[data-slot="custom-select-trigger"]')
    const positioner = el.querySelector<HTMLElement>('[data-slot="custom-select-positioner"]')
    const valueEl = el.querySelector<HTMLElement>('[data-slot="custom-select-value"]')
    if (!trigger || !positioner) continue
    const options = all<HTMLElement>(el, '[data-slot="custom-select-item"]')
    const enabled = (): HTMLElement[] => options.filter((o) => !o.hasAttribute('data-disabled'))

    let teardown: (() => void) | null = null
    let typeahead = ''
    let typeaheadTimer: ReturnType<typeof setTimeout> | undefined

    const highlight = (option: HTMLElement | undefined): void => {
      for (const o of options) o.removeAttribute('data-highlighted')
      if (option) {
        option.setAttribute('data-highlighted', '')
        option.scrollIntoView({ block: 'nearest' })
      }
    }

    const select = (option: HTMLElement): void => {
      if (option.hasAttribute('data-disabled')) return
      for (const o of options) {
        const chosen = o === option
        o.setAttribute('aria-selected', String(chosen))
        const indicator = o.querySelector<HTMLElement>('[data-slot="custom-select-item-indicator"]')
        if (indicator) indicator.hidden = !chosen
      }
      const text = option.querySelector('[data-slot="custom-select-item-text"]')?.textContent ?? option.textContent
      if (valueEl) valueEl.textContent = (text ?? '').trim()
      trigger.setAttribute('data-value', option.getAttribute('data-value') ?? '')
      close()
    }

    const close = (): void => {
      if (!teardown) return
      teardown()
      teardown = null
      positioner.hidden = true
      trigger.setAttribute('aria-expanded', 'false')
      highlight(undefined)
      trigger.focus()
    }

    const open = (): void => {
      if (teardown) return
      positioner.hidden = false
      positionAnchored(trigger, positioner, { side: 'bottom', align: 'start' })
      trigger.setAttribute('aria-expanded', 'true')
      const list = positioner.querySelector<HTMLElement>('[data-slot="custom-select-list"]')
      list?.focus()
      const current = options.find((o) => o.getAttribute('aria-selected') === 'true') ?? enabled()[0]
      highlight(current)
      teardown = activateOverlay(positioner, close, { dismissOnOutside: true, ignore: trigger })
    }

    trigger.addEventListener('click', () => (teardown ? close() : open()))
    for (const option of options) {
      option.addEventListener('click', () => select(option))
      option.addEventListener('pointermove', () => highlight(option))
    }

    positioner.addEventListener('keydown', (event) => {
      const items = enabled()
      const active = options.find((o) => o.hasAttribute('data-highlighted'))
      const idx = active ? items.indexOf(active) : -1
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        highlight(items[idx < 0 ? 0 : (idx + 1) % items.length])
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        highlight(items[idx < 0 ? items.length - 1 : (idx - 1 + items.length) % items.length])
      } else if (event.key === 'Home') {
        event.preventDefault()
        highlight(items[0])
      } else if (event.key === 'End') {
        event.preventDefault()
        highlight(items[items.length - 1])
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        if (active) select(active)
      } else if (event.key.length === 1) {
        typeahead += event.key.toLowerCase()
        clearTimeout(typeaheadTimer)
        typeaheadTimer = setTimeout(() => (typeahead = ''), 500)
        const match = items.find((o) => (o.textContent ?? '').trim().toLowerCase().startsWith(typeahead))
        if (match) highlight(match)
      }
    })
  }
}
