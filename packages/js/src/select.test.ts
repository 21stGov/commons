// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from 'vitest'

import { enhanceCustomSelect } from './select.ts'

function selectMarkup(): void {
  document.body.innerHTML = `
    <div data-slot="custom-select">
      <button data-slot="custom-select-trigger" aria-haspopup="listbox" aria-expanded="false">
        <span data-slot="custom-select-value">Choose</span>
      </button>
      <div data-slot="custom-select-positioner" hidden>
        <div data-slot="custom-select-list" role="listbox" tabindex="-1">
          <div data-slot="custom-select-item" role="option" aria-selected="false" data-value="a">
            <span data-slot="custom-select-item-text">Apple</span>
            <span data-slot="custom-select-item-indicator" hidden></span>
          </div>
          <div data-slot="custom-select-item" role="option" aria-selected="false" data-value="b">
            <span data-slot="custom-select-item-text">Banana</span>
            <span data-slot="custom-select-item-indicator" hidden></span>
          </div>
        </div>
      </div>
    </div>`
}

const trigger = () => document.querySelector<HTMLElement>('[data-slot="custom-select-trigger"]')!
const positioner = () => document.querySelector<HTMLElement>('[data-slot="custom-select-positioner"]')!
const items = () => document.querySelectorAll<HTMLElement>('[data-slot="custom-select-item"]')
const listbox = () => document.querySelector<HTMLElement>('[data-slot="custom-select-list"]')!

describe('enhanceCustomSelect', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('opens the listbox on trigger click and highlights an option', () => {
    selectMarkup()
    enhanceCustomSelect(document)
    trigger().click()
    expect(trigger().getAttribute('aria-expanded')).toBe('true')
    expect(positioner().hidden).toBe(false)
    expect(items()[0].hasAttribute('data-highlighted')).toBe(true)
    trigger().click() // leave closed
  })

  it('selecting an option updates value text + aria-selected + indicator and closes', () => {
    selectMarkup()
    enhanceCustomSelect(document)
    trigger().click()
    const banana = items()[1]
    banana.click()
    expect(banana.getAttribute('aria-selected')).toBe('true')
    expect(banana.querySelector<HTMLElement>('[data-slot="custom-select-item-indicator"]')!.hidden).toBe(false)
    expect(document.querySelector('[data-slot="custom-select-value"]')!.textContent).toBe('Banana')
    expect(trigger().getAttribute('data-value')).toBe('b')
    expect(positioner().hidden).toBe(true)
  })

  it('ArrowDown moves the highlight and Enter selects the highlighted option', () => {
    selectMarkup()
    enhanceCustomSelect(document)
    trigger().click() // Apple highlighted
    listbox().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    expect(items()[1].hasAttribute('data-highlighted')).toBe(true)
    listbox().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    expect(items()[1].getAttribute('aria-selected')).toBe('true')
    expect(positioner().hidden).toBe(true)
  })

  it('Escape closes the listbox', () => {
    selectMarkup()
    enhanceCustomSelect(document)
    trigger().click()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(positioner().hidden).toBe(true)
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
  })

  it('an outside pointer press closes the listbox', () => {
    selectMarkup()
    enhanceCustomSelect(document)
    trigger().click()
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(positioner().hidden).toBe(true)
  })
})
