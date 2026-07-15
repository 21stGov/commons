// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from 'vitest'

import { enhanceLanguageSelector } from './languageselector.ts'

describe('enhanceLanguageSelector', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('toggle variant: clicking an item marks it current, clears siblings, updates readout', () => {
    document.body.innerHTML = `
      <div>
        <div data-slot="language-selector">
          <button data-slot="language-selector-item" lang="en">English</button>
          <button data-slot="language-selector-item" lang="es">Español</button>
        </div>
        <p data-language-active>Active language: en</p>
      </div>`
    enhanceLanguageSelector(document)
    const [en, es] = document.querySelectorAll<HTMLElement>('[data-slot="language-selector-item"]')
    es.click()
    expect(es.getAttribute('aria-current')).toBe('true')
    expect(es.classList.contains('cui-language-selector-item--active')).toBe(true)
    expect(en.hasAttribute('aria-current')).toBe(false)
    expect(document.querySelector('[data-language-active]')!.textContent).toBe('Active language: es')
  })

  it('dropdown variant: a select change updates the readout', () => {
    document.body.innerHTML = `
      <div>
        <div data-slot="language-selector">
          <select>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>
        <p data-language-active>Active language: en</p>
      </div>`
    enhanceLanguageSelector(document)
    const select = document.querySelector<HTMLSelectElement>('select')!
    select.value = 'es'
    select.dispatchEvent(new Event('change', { bubbles: true }))
    expect(document.querySelector('[data-language-active]')!.textContent).toBe('Active language: es')
  })
})
