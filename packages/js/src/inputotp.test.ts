// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from 'vitest'

import { enhanceInputOTP } from './inputotp.ts'

function otp(count = 3): void {
  document.body.innerHTML = `
    <div data-slot="input-otp-group">
      ${Array.from({ length: count }, () => '<input data-slot="input-otp-cell" />').join('\n')}
    </div>`
}
const cells = () => document.querySelectorAll<HTMLInputElement>('input[data-slot="input-otp-cell"]')

function typeInto(cell: HTMLInputElement, value: string): void {
  cell.value = value
  cell.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('enhanceInputOTP', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('caps each cell at one character', () => {
    otp()
    enhanceInputOTP(document)
    for (const c of cells()) expect(c.maxLength).toBe(1)
  })

  it('typing a character advances focus to the next cell', () => {
    otp()
    enhanceInputOTP(document)
    const [c0, c1] = cells()
    typeInto(c0, '4')
    expect(document.activeElement).toBe(c1)
  })

  it('Backspace on an empty cell steps focus back', () => {
    otp()
    enhanceInputOTP(document)
    const [c0, c1] = cells()
    c1.focus()
    c1.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }))
    expect(document.activeElement).toBe(c0)
  })

  it('Arrow keys move between cells', () => {
    otp()
    enhanceInputOTP(document)
    const [c0, c1] = cells()
    c0.focus()
    c0.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    expect(document.activeElement).toBe(c1)
    c1.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    expect(document.activeElement).toBe(c0)
  })

  it('pasting a code distributes digits across the cells', () => {
    otp()
    enhanceInputOTP(document)
    const [c0, c1, c2] = cells()
    const ev = new Event('paste', { bubbles: true, cancelable: true })
    Object.defineProperty(ev, 'clipboardData', { value: { getData: () => '123' } })
    c0.dispatchEvent(ev)
    expect([c0.value, c1.value, c2.value]).toEqual(['1', '2', '3'])
  })
})
