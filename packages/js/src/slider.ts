// SPDX-License-Identifier: MIT

/**
 * Slider behavior — sync the visual thumb/indicator to a native range input.
 *
 * Contract (authored markup):
 *   root      <div data-slot="slider">
 *   value     <span data-slot="slider-value">          (optional readout)
 *   control   <div data-slot="slider-control">          (position: relative)
 *     track       <div data-slot="slider-track">
 *       indicator <div data-slot="slider-indicator">    (filled portion)
 *     thumb       <div data-slot="slider-thumb">
 *     input       <input data-slot="slider-input" type="range">  (overlays, opacity 0)
 *
 * The native input owns interaction (drag, click, arrows, page-up/down); the
 * enhancer just positions the thumb + fills the indicator from its value and
 * mirrors it to the value readout / aria-valuenow.
 */

import { all, claim } from './dom.ts'

export function enhanceSlider(root: ParentNode): void {
  for (const el of claim(root, '[data-slot="slider"]', 'slider')) {
    const input = el.querySelector<HTMLInputElement>('[data-slot="slider-input"]')
    const thumb = el.querySelector<HTMLElement>('[data-slot="slider-thumb"]')
    const indicator = el.querySelector<HTMLElement>('[data-slot="slider-indicator"]')
    const valueEls = all<HTMLElement>(el, '[data-slot="slider-value"]')
    if (!input) continue
    const min = Number(input.min || 0)
    const max = Number(input.max || 100)

    const update = (): void => {
      const value = Number(input.value)
      const pct = max === min ? 0 : ((value - min) / (max - min)) * 100
      if (thumb) thumb.style.insetInlineStart = `${pct}%`
      if (indicator) indicator.style.inlineSize = `${pct}%`
      for (const v of valueEls) v.textContent = String(value)
      input.setAttribute('aria-valuenow', String(value))
    }
    input.addEventListener('input', update)

    // Native range inputs only step by `step` on Arrow keys. Add the larger
    // jumps: Shift+Arrow moves by `data-large-step` (default 10), and
    // Cmd/Ctrl+Arrow by `data-medium-step` (default 5) — the modifier is
    // metaKey OR ctrlKey, so it works on every OS, not just macOS.
    const largeStep = Number(input.getAttribute('data-large-step')) || 10
    const mediumStep = Number(input.getAttribute('data-medium-step')) || 5
    input.addEventListener('keydown', (event) => {
      const dir =
        event.key === 'ArrowRight' || event.key === 'ArrowUp'
          ? 1
          : event.key === 'ArrowLeft' || event.key === 'ArrowDown'
            ? -1
            : 0
      if (dir === 0) return
      let step = 0
      if (event.shiftKey) step = largeStep
      else if (event.metaKey || event.ctrlKey) step = mediumStep
      else return // plain Arrow: let the native range input handle it
      event.preventDefault()
      const cur = Number(input.value)
      const next = Math.min(max, Math.max(min, cur + step * dir))
      if (next !== cur) {
        input.value = String(next)
        input.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    update()
  }
}
