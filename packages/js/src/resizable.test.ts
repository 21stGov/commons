// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from 'vitest'

import { enhanceResizable } from './resizable.ts'

// jsdom has no layout, so give elements measurable sizes for the math.
function mockWidth(el: Element, width: number): void {
  el.getBoundingClientRect = () =>
    ({ width, height: 0, top: 0, left: 0, right: width, bottom: 0, x: 0, y: 0, toJSON() {} }) as DOMRect
}

function panels(): void {
  document.body.innerHTML = `
    <div data-slot="resizable-panels" data-direction="horizontal">
      <div data-slot="resizable-panel">A</div>
      <div data-slot="resizable-handle" tabindex="0" role="separator" aria-valuenow="50"></div>
      <div data-slot="resizable-panel">B</div>
    </div>`
}

describe('enhanceResizable', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('enhances its markup without throwing', () => {
    panels()
    expect(() => enhanceResizable(document)).not.toThrow()
  })

  it('ArrowRight nudges flex-basis toward the previous panel and updates aria-valuenow', () => {
    panels()
    const container = document.querySelector('[data-slot="resizable-panels"]')!
    const [a, handle, b] = Array.from(container.children) as HTMLElement[]
    mockWidth(container, 200)
    mockWidth(a, 100)
    mockWidth(b, 100)
    enhanceResizable(document)
    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    // step = 200 * 0.02 = 4px → prev 100→104, next 100→96 → 52% / 48%
    expect(a.style.flexBasis).toBe('52%')
    expect(b.style.flexBasis).toBe('48%')
    expect(handle.getAttribute('aria-valuenow')).toBe('52')
  })
})
