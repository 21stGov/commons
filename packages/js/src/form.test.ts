// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from 'vitest'

import { enhanceCheckboxAll, enhanceIndeterminate } from './form.ts'

describe('enhanceIndeterminate', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('sets the IDL indeterminate property from the data hint', () => {
    document.body.innerHTML = '<input type="checkbox" data-indeterminate />'
    enhanceIndeterminate(document)
    expect(document.querySelector<HTMLInputElement>('input')!.indeterminate).toBe(true)
  })

  it('leaves a plain checkbox untouched', () => {
    document.body.innerHTML = '<input type="checkbox" />'
    enhanceIndeterminate(document)
    expect(document.querySelector<HTMLInputElement>('input')!.indeterminate).toBe(false)
  })
})

describe('enhanceCheckboxAll', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  function tree(): void {
    document.body.innerHTML = `
      <input type="checkbox" data-checkbox-all="g" />
      <input type="checkbox" data-checkbox-member="g" />
      <input type="checkbox" data-checkbox-member="g" />`
  }
  const master = () => document.querySelector<HTMLInputElement>('[data-checkbox-all]')!
  const members = () => document.querySelectorAll<HTMLInputElement>('[data-checkbox-member]')

  it('checking the master checks every member', () => {
    tree()
    enhanceCheckboxAll(document)
    master().checked = true
    master().dispatchEvent(new Event('change', { bubbles: true }))
    for (const m of members()) expect(m.checked).toBe(true)
  })

  it('goes indeterminate when only some members are checked', () => {
    tree()
    enhanceCheckboxAll(document)
    const [m1] = members()
    m1.checked = true
    m1.dispatchEvent(new Event('change', { bubbles: true }))
    expect(master().indeterminate).toBe(true)
    expect(master().checked).toBe(false)
  })

  it('is checked (not indeterminate) when every member is checked', () => {
    tree()
    enhanceCheckboxAll(document)
    for (const m of members()) {
      m.checked = true
      m.dispatchEvent(new Event('change', { bubbles: true }))
    }
    expect(master().checked).toBe(true)
    expect(master().indeterminate).toBe(false)
  })
})
