// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from 'vitest'

import { enhanceInputMask, enhanceInputMaskReveal } from './inputmask.ts'

describe('enhanceInputMask', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  function masked(value = ''): HTMLInputElement {
    document.body.innerHTML = `<input data-slot="input-mask" data-mask="(###) ###-####" value="${value}" />`
    return document.querySelector<HTMLInputElement>('input')!
  }

  it('inserts template literals as digits are typed', () => {
    const input = masked()
    enhanceInputMask(document)
    input.value = '1234567890'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(input.value).toBe('(123) 456-7890')
  })

  it('ignores non-digit characters', () => {
    const input = masked()
    enhanceInputMask(document)
    input.value = 'abc123'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(input.value).toBe('(123')
  })

  it('stops at the end of the template, dropping extra digits', () => {
    const input = masked()
    enhanceInputMask(document)
    input.value = '123456789012345'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(input.value).toBe('(123) 456-7890')
  })

  it('formats an initial value on enhance', () => {
    const input = masked('5551234567')
    enhanceInputMask(document)
    expect(input.value).toBe('(555) 123-4567')
  })
})

describe('enhanceInputMaskReveal', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  function secure(): void {
    document.body.innerHTML = `
      <div data-slot="input-mask-secure">
        <input data-slot="input-mask" type="password" value="123" />
        <button data-slot="input-mask-reveal" aria-pressed="false" data-show-label="Show" data-hide-label="Hide">
          <svg data-im-eye></svg><svg data-im-eye-off hidden></svg>
        </button>
      </div>`
  }

  it('toggles the input between password and text and swaps glyphs + labels', () => {
    secure()
    enhanceInputMaskReveal(document)
    const input = document.querySelector<HTMLInputElement>('input')!
    const btn = document.querySelector<HTMLButtonElement>('[data-slot="input-mask-reveal"]')!
    const eye = document.querySelector<HTMLElement>('[data-im-eye]')!
    const eyeOff = document.querySelector<HTMLElement>('[data-im-eye-off]')!

    expect(input.type).toBe('password')
    btn.click()
    expect(input.type).toBe('text')
    expect(btn.getAttribute('aria-pressed')).toBe('true')
    expect(btn.getAttribute('aria-label')).toBe('Hide')
    expect(eye.hidden).toBe(true)
    expect(eyeOff.hidden).toBe(false)

    btn.click()
    expect(input.type).toBe('password')
    expect(btn.getAttribute('aria-pressed')).toBe('false')
    expect(btn.getAttribute('aria-label')).toBe('Show')
  })
})
