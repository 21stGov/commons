// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from 'vitest'

import { enhanceStepIndicator } from './stepindicator.ts'

function steps(): void {
  document.body.innerHTML = `
    <section>
      <div data-slot="step-indicator">
        <div data-slot="step-indicator-step" data-status="current"><span>1</span></div>
        <div data-slot="step-indicator-step" data-status="incomplete"><span>2</span></div>
        <div data-slot="step-indicator-step" data-status="incomplete"><span>3</span></div>
        <span data-slot="step-indicator-counter">Step 1 of 3</span>
      </div>
      <button>Back</button>
      <button>Next</button>
    </section>`
}
const stepEls = () => document.querySelectorAll<HTMLElement>('[data-slot="step-indicator-step"]')
const counter = () => document.querySelector<HTMLElement>('[data-slot="step-indicator-counter"]')!
const back = () => document.querySelectorAll<HTMLButtonElement>('button')[0]
const next = () => document.querySelectorAll<HTMLButtonElement>('button')[1]

describe('enhanceStepIndicator', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('advancing marks the prior step complete, moves aria-current, and updates the counter', () => {
    steps()
    enhanceStepIndicator(document)
    next().click()
    const els = stepEls()
    expect(els[0].getAttribute('data-status')).toBe('complete')
    expect(els[0].hasAttribute('aria-current')).toBe(false)
    expect(els[1].getAttribute('data-status')).toBe('current')
    expect(els[1].getAttribute('aria-current')).toBe('step')
    expect(counter().textContent).toBe('Step 2 of 3')
  })

  it('disables Next at the last step', () => {
    steps()
    enhanceStepIndicator(document)
    next().click()
    next().click()
    expect(counter().textContent).toBe('Step 3 of 3')
    expect(next().disabled).toBe(true)
  })

  it('disables Back at the first step', () => {
    steps()
    enhanceStepIndicator(document)
    next().click()
    back().click()
    expect(counter().textContent).toBe('Step 1 of 3')
    expect(back().disabled).toBe(true)
  })
})
