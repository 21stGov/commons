// SPDX-License-Identifier: MIT

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { enhanceToolbar } from './toolbar.ts'

// jsdom has no layout, so offsetParent is null for everything and the toolbar's
// visibility filter would drop every control. Treat attached elements as visible
// for this file only (vitest isolates the environment per test file).
let original: PropertyDescriptor | undefined
beforeEach(() => {
  original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent')
  Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    configurable: true,
    get(this: HTMLElement) {
      return this.parentElement
    },
  })
})
afterEach(() => {
  if (original) Object.defineProperty(HTMLElement.prototype, 'offsetParent', original)
  document.body.innerHTML = ''
})

function toolbar(orientation = 'horizontal'): void {
  document.body.innerHTML = `
    <div role="toolbar" aria-orientation="${orientation}">
      <button>Bold</button>
      <button>Italic</button>
      <button>Underline</button>
    </div>`
}
const buttons = () => document.querySelectorAll<HTMLButtonElement>('[role="toolbar"] button')

describe('enhanceToolbar', () => {
  it('makes the toolbar a single tab stop (roving tabindex)', () => {
    toolbar()
    enhanceToolbar(document)
    const [b0, b1, b2] = buttons()
    expect(b0.tabIndex).toBe(0)
    expect(b1.tabIndex).toBe(-1)
    expect(b2.tabIndex).toBe(-1)
  })

  it('ArrowRight moves focus and the tabindex to the next control', () => {
    toolbar()
    enhanceToolbar(document)
    const [b0, b1] = buttons()
    b0.focus()
    b0.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    expect(document.activeElement).toBe(b1)
    expect(b1.tabIndex).toBe(0)
    expect(b0.tabIndex).toBe(-1)
  })

  it('End jumps to the last control and Home back to the first', () => {
    toolbar()
    enhanceToolbar(document)
    const [b0, , b2] = buttons()
    b0.focus()
    b0.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }))
    expect(document.activeElement).toBe(b2)
    b2.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }))
    expect(document.activeElement).toBe(b0)
  })

  it('uses ArrowDown/ArrowUp when vertical', () => {
    toolbar('vertical')
    enhanceToolbar(document)
    const [b0, b1] = buttons()
    b0.focus()
    b0.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    expect(document.activeElement).toBe(b1)
  })
})
