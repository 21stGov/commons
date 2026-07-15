// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from 'vitest'

import { enhanceCharacterCount } from './charactercount.ts'

function counter(max = 10): void {
  document.body.innerHTML = `
    <div data-slot="character-count" data-max="${max}">
      <textarea data-slot="textarea"></textarea>
      <span data-slot="character-count-message"></span>
      <span data-slot="character-count-status" aria-live="polite"></span>
    </div>`
}
const root = () => document.querySelector<HTMLElement>('[data-slot="character-count"]')!
const field = () => document.querySelector<HTMLTextAreaElement>('[data-slot="textarea"]')!
const message = () => document.querySelector<HTMLElement>('[data-slot="character-count-message"]')!
const status = () => document.querySelector<HTMLElement>('[data-slot="character-count-status"]')!

function type(value: string): void {
  field().value = value
  field().dispatchEvent(new Event('input', { bubbles: true }))
}

describe('enhanceCharacterCount', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('shows the full remaining count on load and mirrors it to the live status', () => {
    counter(10)
    enhanceCharacterCount(document)
    expect(message().textContent).toBe('10 characters left')
    expect(status().textContent).toBe('10 characters left')
  })

  it('updates the remaining count as the field changes', () => {
    counter(10)
    enhanceCharacterCount(document)
    type('hello')
    expect(message().textContent).toBe('5 characters left')
  })

  it('uses the singular form at one character remaining', () => {
    counter(10)
    enhanceCharacterCount(document)
    type('123456789') // 9 chars → 1 left
    expect(message().textContent).toBe('1 character left')
  })

  it('flags over-limit with data-over and an "over limit" message', () => {
    counter(10)
    enhanceCharacterCount(document)
    type('123456789012') // 12 chars → 2 over
    expect(message().textContent).toBe('2 characters over limit')
    expect(root().hasAttribute('data-over')).toBe(true)
  })
})
