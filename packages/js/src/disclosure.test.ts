// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from 'vitest'

import { enhanceAccordion, enhanceCollapsible, enhanceGovBanner } from './disclosure.ts'

function accordion(single = false): void {
  document.body.innerHTML = `
    <div data-slot="accordion"${single ? ' data-accordion="single"' : ''}>
      <div data-slot="accordion-item">
        <button data-slot="accordion-trigger" aria-expanded="false" aria-controls="p1">One</button>
        <div id="p1" data-slot="accordion-panel" hidden></div>
      </div>
      <div data-slot="accordion-item">
        <button data-slot="accordion-trigger" aria-expanded="false" aria-controls="p2">Two</button>
        <div id="p2" data-slot="accordion-panel" hidden></div>
      </div>
    </div>`
}

describe('enhanceAccordion', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('toggles aria-expanded, panel visibility, and data-open on click', () => {
    accordion()
    enhanceAccordion(document)
    const t1 = document.querySelector<HTMLElement>('[data-slot="accordion-trigger"]')!
    const p1 = document.getElementById('p1')!
    const item = t1.closest('[data-slot="accordion-item"]')!
    expect(p1.hidden).toBe(true)

    t1.click()
    expect(t1.getAttribute('aria-expanded')).toBe('true')
    expect(p1.hidden).toBe(false)
    expect(item.hasAttribute('data-open')).toBe(true)

    t1.click()
    expect(t1.getAttribute('aria-expanded')).toBe('false')
    expect(p1.hidden).toBe(true)
  })

  it('single mode closes the open panel when another opens', () => {
    accordion(true)
    enhanceAccordion(document)
    const [t1, t2] = document.querySelectorAll<HTMLElement>('[data-slot="accordion-trigger"]')
    t1.click()
    t2.click()
    expect(t1.getAttribute('aria-expanded')).toBe('false')
    expect(t2.getAttribute('aria-expanded')).toBe('true')
  })

  it('multiple mode (default) keeps panels independently open', () => {
    accordion(false)
    enhanceAccordion(document)
    const [t1, t2] = document.querySelectorAll<HTMLElement>('[data-slot="accordion-trigger"]')
    t1.click()
    t2.click()
    expect(t1.getAttribute('aria-expanded')).toBe('true')
    expect(t2.getAttribute('aria-expanded')).toBe('true')
  })

  it('ArrowDown moves roving focus to the next trigger (APG accordion keys)', () => {
    accordion()
    enhanceAccordion(document)
    const [t1, t2] = document.querySelectorAll<HTMLElement>('[data-slot="accordion-trigger"]')
    t1.focus()
    t1.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    expect(document.activeElement).toBe(t2)
  })
})

describe('enhanceCollapsible', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('toggles the linked panel on trigger click', () => {
    document.body.innerHTML = `
      <div data-slot="collapsible">
        <button data-slot="collapsible-trigger" aria-expanded="false" aria-controls="cp">Toggle</button>
        <div id="cp" data-slot="collapsible-panel" hidden></div>
      </div>`
    enhanceCollapsible(document)
    const trigger = document.querySelector<HTMLElement>('[data-slot="collapsible-trigger"]')!
    const panel = document.getElementById('cp')!
    trigger.click()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(panel.hidden).toBe(false)
  })
})

describe('enhanceGovBanner', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('syncs the region closed on load and toggles it on click', () => {
    document.body.innerHTML = `
      <section data-slot="gov-banner">
        <button aria-expanded="false" aria-controls="gb">How you know</button>
        <div id="gb">content</div>
      </section>`
    const region = document.getElementById('gb')!
    enhanceGovBanner(document)
    expect(region.hidden).toBe(true)

    const trigger = document.querySelector<HTMLElement>('button[aria-controls]')!
    trigger.click()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(region.hidden).toBe(false)
  })
})
