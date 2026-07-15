// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from 'vitest'

import { enhanceProgress } from './progress.ts'

function progressMarkup(now = 20): void {
  document.body.innerHTML = `
    <section>
      <div data-slot="progress" aria-valuenow="${now}" aria-valuemax="100">
        <div data-slot="progress-indicator"></div>
        <span data-slot="progress-value">${now}%</span>
      </div>
      <button>+10%</button>
      <button>-10%</button>
    </section>`
}
const progress = () => document.querySelector<HTMLElement>('[data-slot="progress"]')!
const value = () => document.querySelector<HTMLElement>('[data-slot="progress-value"]')!
const buttons = () => document.querySelectorAll<HTMLButtonElement>('button')

describe('enhanceProgress', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('a +N% button raises aria-valuenow, aria-valuetext, and the readout', () => {
    progressMarkup(20)
    enhanceProgress(document)
    buttons()[0].click()
    expect(progress().getAttribute('aria-valuenow')).toBe('30')
    expect(progress().getAttribute('aria-valuetext')).toBe('30%')
    expect(value().textContent).toBe('30%')
  })

  it('a -N% button lowers the value', () => {
    progressMarkup(20)
    enhanceProgress(document)
    buttons()[1].click()
    expect(progress().getAttribute('aria-valuenow')).toBe('10')
  })

  it('clamps at the 100 upper bound', () => {
    progressMarkup(95)
    enhanceProgress(document)
    buttons()[0].click()
    expect(progress().getAttribute('aria-valuenow')).toBe('100')
  })

  it('clamps at the 0 lower bound', () => {
    progressMarkup(5)
    enhanceProgress(document)
    buttons()[1].click()
    expect(progress().getAttribute('aria-valuenow')).toBe('0')
  })
})
