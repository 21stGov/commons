// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from 'vitest'

import { enhanceNumberField } from './numberfield.ts'

function field(attrs = 'data-step="1" data-min="0" data-max="3"', value = '1'): void {
  document.body.innerHTML = `
    <div data-slot="number-field" ${attrs}>
      <input data-slot="number-field-input" role="spinbutton" value="${value}" />
      <button data-slot="number-field-decrement">-</button>
      <button data-slot="number-field-increment">+</button>
    </div>`
}
const input = () => document.querySelector<HTMLInputElement>('[data-slot="number-field-input"]')!
const inc = () => document.querySelector<HTMLButtonElement>('[data-slot="number-field-increment"]')!
const dec = () => document.querySelector<HTMLButtonElement>('[data-slot="number-field-decrement"]')!

describe('enhanceNumberField', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('increments and decrements by step via the buttons, keeping aria-valuenow', () => {
    field()
    enhanceNumberField(document)
    inc().click()
    expect(input().value).toBe('2')
    expect(input().getAttribute('aria-valuenow')).toBe('2')
    dec().click()
    expect(input().value).toBe('1')
  })

  it('steps with ArrowUp / ArrowDown', () => {
    field()
    enhanceNumberField(document)
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }))
    expect(input().value).toBe('2')
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    expect(input().value).toBe('1')
  })

  it('clamps at max and disables the increment button at the bound', () => {
    field('data-step="1" data-min="0" data-max="2"', '2')
    enhanceNumberField(document)
    expect(inc().disabled).toBe(true)
    inc().click()
    expect(input().value).toBe('2')
  })

  it('clamps at min and disables the decrement button at the bound', () => {
    field('data-step="1" data-min="0" data-max="3"', '0')
    enhanceNumberField(document)
    expect(dec().disabled).toBe(true)
    dec().click()
    expect(input().value).toBe('0')
  })
})
