// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from 'vitest'

import { behaviors, enhance } from './index.ts'

describe('enhance', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('exposes every behavior as a callable function', () => {
    expect(behaviors.length).toBeGreaterThan(30)
    for (const behavior of behaviors) expect(typeof behavior).toBe('function')
  })

  it('does not throw on an empty document', () => {
    expect(() => enhance()).not.toThrow()
  })

  it('does not throw on markup with no Commons components', () => {
    document.body.innerHTML = '<main><p>hello</p><button>plain</button></main>'
    expect(() => enhance()).not.toThrow()
  })

  it('scopes to the provided root without throwing', () => {
    document.body.innerHTML = '<div id="scope"></div>'
    expect(() => enhance(document.getElementById('scope')!)).not.toThrow()
  })

  it('is idempotent — a second enhance() does not double-wire a component', () => {
    document.body.innerHTML = `
      <div data-slot="accordion">
        <div data-slot="accordion-item">
          <button data-slot="accordion-trigger" aria-expanded="false" aria-controls="p1">One</button>
          <div id="p1" data-slot="accordion-panel" hidden></div>
        </div>
      </div>`
    enhance()
    enhance() // a second listener would flip the state twice per click
    const trigger = document.querySelector<HTMLElement>('[data-slot="accordion-trigger"]')!
    trigger.click()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })
})
