// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from 'vitest'

import { enhanceToggle } from './toggle.ts'

describe('enhanceToggle', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('flips a standalone toggle between pressed states', () => {
    document.body.innerHTML = '<button data-slot="toggle" aria-pressed="false">Bold</button>'
    enhanceToggle(document)
    const t = document.querySelector<HTMLElement>('[data-slot="toggle"]')!
    t.click()
    expect(t.getAttribute('aria-pressed')).toBe('true')
    expect(t.hasAttribute('data-pressed')).toBe(true)
    t.click()
    expect(t.getAttribute('aria-pressed')).toBe('false')
    expect(t.hasAttribute('data-pressed')).toBe(false)
  })

  it('single-select group keeps at most one toggle pressed', () => {
    document.body.innerHTML = `
      <div data-slot="toggle-group" role="group">
        <button data-slot="toggle" aria-pressed="false">A</button>
        <button data-slot="toggle" aria-pressed="false">B</button>
      </div>`
    enhanceToggle(document)
    const [a, b] = document.querySelectorAll<HTMLElement>('[data-slot="toggle"]')
    a.click()
    b.click()
    expect(a.getAttribute('aria-pressed')).toBe('false')
    expect(b.getAttribute('aria-pressed')).toBe('true')
  })

  it('multiple group lets several toggles be pressed at once', () => {
    document.body.innerHTML = `
      <div data-slot="toggle-group" role="group" data-toggle-multiple>
        <button data-slot="toggle" aria-pressed="false">A</button>
        <button data-slot="toggle" aria-pressed="false">B</button>
      </div>`
    enhanceToggle(document)
    const [a, b] = document.querySelectorAll<HTMLElement>('[data-slot="toggle"]')
    a.click()
    b.click()
    expect(a.getAttribute('aria-pressed')).toBe('true')
    expect(b.getAttribute('aria-pressed')).toBe('true')
  })

  it('ArrowRight moves roving focus to the next toggle in a group', () => {
    document.body.innerHTML = `
      <div data-slot="toggle-group" role="group">
        <button data-slot="toggle" aria-pressed="false">A</button>
        <button data-slot="toggle" aria-pressed="false">B</button>
      </div>`
    enhanceToggle(document)
    const [a, b] = document.querySelectorAll<HTMLElement>('[data-slot="toggle"]')
    a.focus()
    a.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    expect(document.activeElement).toBe(b)
  })
})
