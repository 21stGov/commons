// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from 'vitest'

import { enhanceCarousel } from './carousel.ts'

function carouselMarkup(): void {
  document.body.innerHTML = `
    <div data-slot="carousel">
      <div data-slot="carousel-viewport">
        <div data-slot="carousel-content">
          <div data-slot="carousel-item"><a href="#">A</a></div>
          <div data-slot="carousel-item"><a href="#">B</a></div>
          <div data-slot="carousel-item"><a href="#">C</a></div>
        </div>
      </div>
      <button data-slot="carousel-previous">Prev</button>
      <button data-slot="carousel-next">Next</button>
      <span data-slot="carousel-status"></span>
    </div>`
}
const items = () => document.querySelectorAll<HTMLElement>('[data-slot="carousel-item"]')
const prev = () => document.querySelector<HTMLButtonElement>('[data-slot="carousel-previous"]')!
const next = () => document.querySelector<HTMLButtonElement>('[data-slot="carousel-next"]')!
const status = () => document.querySelector<HTMLElement>('[data-slot="carousel-status"]')!

describe('enhanceCarousel', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('sets the initial status, disables Prev at the start, and hides off-screen slides', () => {
    carouselMarkup()
    enhanceCarousel(document)
    expect(status().textContent).toBe('1 of 3')
    expect(prev().disabled).toBe(true)
    expect(next().disabled).toBe(false)
    const [a, b, c] = items()
    expect(a.getAttribute('aria-hidden')).toBe('false')
    expect(b.getAttribute('aria-hidden')).toBe('true')
    expect(c.getAttribute('aria-hidden')).toBe('true')
  })

  it('Next advances the current slide and updates status + button bounds', () => {
    carouselMarkup()
    enhanceCarousel(document)
    next().click()
    expect(status().textContent).toBe('2 of 3')
    expect(prev().disabled).toBe(false)
    expect(items()[1].getAttribute('aria-hidden')).toBe('false')
  })

  it('disables Next at the last slide', () => {
    carouselMarkup()
    enhanceCarousel(document)
    next().click()
    next().click()
    expect(status().textContent).toBe('3 of 3')
    expect(next().disabled).toBe(true)
  })

  it('keeps only the current slide’s controls in the tab order', () => {
    carouselMarkup()
    enhanceCarousel(document)
    expect(items()[0].querySelector('a')!.tabIndex).toBe(0)
    expect(items()[1].querySelector('a')!.tabIndex).toBe(-1)
    next().click()
    expect(items()[0].querySelector('a')!.tabIndex).toBe(-1)
    expect(items()[1].querySelector('a')!.tabIndex).toBe(0)
  })
})
