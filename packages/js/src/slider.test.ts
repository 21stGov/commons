// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from 'vitest'

import { enhanceSlider } from './slider.ts'

function slider(value = '50'): void {
  document.body.innerHTML = `
    <div data-slot="slider">
      <span data-slot="slider-value">0</span>
      <div data-slot="slider-control">
        <div data-slot="slider-track"><div data-slot="slider-indicator"></div></div>
        <div data-slot="slider-thumb"></div>
        <input data-slot="slider-input" type="range" min="0" max="100" step="1" value="${value}" />
      </div>
    </div>`
}
const input = () => document.querySelector<HTMLInputElement>('[data-slot="slider-input"]')!
const readout = () => document.querySelector<HTMLElement>('[data-slot="slider-value"]')!

describe('enhanceSlider', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('mirrors the initial value to the readout and aria-valuenow', () => {
    slider('50')
    enhanceSlider(document)
    expect(readout().textContent).toBe('50')
    expect(input().getAttribute('aria-valuenow')).toBe('50')
  })

  it('updates on input events from the native range', () => {
    slider('50')
    enhanceSlider(document)
    input().value = '75'
    input().dispatchEvent(new Event('input', { bubbles: true }))
    expect(readout().textContent).toBe('75')
    expect(input().getAttribute('aria-valuenow')).toBe('75')
  })

  it('Shift+ArrowRight jumps by the large step (default 10)', () => {
    slider('50')
    enhanceSlider(document)
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true, bubbles: true }))
    expect(input().value).toBe('60')
  })

  it('Ctrl/Cmd+ArrowRight jumps by the medium step (default 5)', () => {
    slider('50')
    enhanceSlider(document)
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', ctrlKey: true, bubbles: true }))
    expect(input().value).toBe('55')
  })

  it('leaves plain Arrow keys to the native input (enhancer no-op)', () => {
    slider('50')
    enhanceSlider(document)
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    expect(input().value).toBe('50')
  })

  it('clamps the large step at the max bound', () => {
    slider('95')
    enhanceSlider(document)
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true, bubbles: true }))
    expect(input().value).toBe('100')
  })
})
