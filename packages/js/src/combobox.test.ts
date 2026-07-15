// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from 'vitest'

import { enhanceComboBox } from './combobox.ts'

function comboMarkup(): void {
  document.body.innerHTML = `
    <div data-slot="combo-box">
      <input data-slot="combo-box-input" role="combobox" aria-expanded="false" aria-controls="cblist" />
      <button data-slot="combo-box-trigger">v</button>
      <button data-slot="combo-box-clear">x</button>
      <div data-slot="combo-box-positioner" hidden>
        <div id="cblist" data-slot="combo-box-list" role="listbox">
          <div id="o1" data-slot="combo-box-item" role="option" data-label="Apple" data-value="a">Apple</div>
          <div id="o2" data-slot="combo-box-item" role="option" data-label="Apricot" data-value="ap">Apricot</div>
          <div id="o3" data-slot="combo-box-item" role="option" data-label="Banana" data-value="b">Banana</div>
        </div>
        <div data-slot="combo-box-empty" hidden>No results</div>
      </div>
    </div>`
}

const input = () => document.querySelector<HTMLInputElement>('[data-slot="combo-box-input"]')!
const positioner = () => document.querySelector<HTMLElement>('[data-slot="combo-box-positioner"]')!
const empty = () => document.querySelector<HTMLElement>('[data-slot="combo-box-empty"]')!
const items = () => document.querySelectorAll<HTMLElement>('[data-slot="combo-box-item"]')

function type(value: string): void {
  input().value = value
  input().dispatchEvent(new Event('input', { bubbles: true }))
}

describe('enhanceComboBox', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('typing opens the list and filters items by label', () => {
    comboMarkup()
    enhanceComboBox(document)
    type('Ap')
    expect(input().getAttribute('aria-expanded')).toBe('true')
    expect(positioner().hidden).toBe(false)
    const [apple, apricot, banana] = items()
    expect(apple.hidden).toBe(false)
    expect(apricot.hidden).toBe(false)
    expect(banana.hidden).toBe(true)
    expect(empty().hidden).toBe(true)
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })) // leave closed
  })

  it('shows the empty state when nothing matches', () => {
    comboMarkup()
    enhanceComboBox(document)
    type('zzz')
    expect(empty().hidden).toBe(false)
    for (const item of items()) expect(item.hidden).toBe(true)
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  })

  it('ArrowDown drives aria-activedescendant and Enter picks the active option', () => {
    comboMarkup()
    enhanceComboBox(document)
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })) // open + highlight Apple
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })) // → Apricot
    expect(input().getAttribute('aria-activedescendant')).toBe('o2')
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    expect(input().value).toBe('Apricot')
    expect(positioner().hidden).toBe(true)
  })

  it('clicking an item fills the input, marks it selected, and closes', () => {
    comboMarkup()
    enhanceComboBox(document)
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })) // open
    const banana = items()[2]
    banana.click()
    expect(input().value).toBe('Banana')
    expect(banana.getAttribute('aria-selected')).toBe('true')
    expect(positioner().hidden).toBe(true)
  })

  it('Escape closes the open list', () => {
    comboMarkup()
    enhanceComboBox(document)
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    expect(positioner().hidden).toBe(false)
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(positioner().hidden).toBe(true)
    expect(input().getAttribute('aria-expanded')).toBe('false')
  })

  it('the clear button empties the input and restores all items', () => {
    comboMarkup()
    enhanceComboBox(document)
    type('Ap')
    document.querySelector<HTMLElement>('[data-slot="combo-box-clear"]')!.click()
    expect(input().value).toBe('')
    for (const item of items()) expect(item.hidden).toBe(false)
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  })
})
