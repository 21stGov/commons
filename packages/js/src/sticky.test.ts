// SPDX-License-Identifier: MIT

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { enhanceSticky } from './sticky.ts'

// jsdom has no layout, so give each region a measurable height.
function setHeight(el: HTMLElement, h: number): void {
  Object.defineProperty(el, 'offsetHeight', { configurable: true, value: h })
}
const flush = (): void => {
  vi.advanceTimersByTime(20) // fire the rAF-coalesced recompute
}

describe('enhanceSticky', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = ''
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('pins each sticky region at the cumulative height of those before it', () => {
    document.body.innerHTML = `
      <div data-cui-sticky id="banner"></div>
      <div data-cui-sticky id="header"></div>
      <div data-cui-sticky id="alert"></div>`
    const banner = document.getElementById('banner')!
    const header = document.getElementById('header')!
    const alert = document.getElementById('alert')!
    setHeight(banner, 40)
    setHeight(header, 64)
    setHeight(alert, 60)

    enhanceSticky(document)
    flush()

    expect(banner.style.top).toBe('0px')
    expect(header.style.top).toBe('40px') // below the banner
    expect(alert.style.top).toBe('104px') // below banner + header
  })

  it('stacks only the sticky regions, skipping non-sticky siblings', () => {
    document.body.innerHTML = `
      <div data-cui-sticky id="header"></div>
      <div id="hero"></div>
      <div data-cui-sticky id="alert"></div>`
    const header = document.getElementById('header')!
    const alert = document.getElementById('alert')!
    setHeight(header, 50)

    enhanceSticky(document)
    flush()

    expect(header.style.top).toBe('0px')
    expect(alert.style.top).toBe('50px')
  })

  it('does nothing (and does not throw) when no region is sticky', () => {
    document.body.innerHTML = '<div id="x"></div>'
    expect(() => {
      enhanceSticky(document)
      flush()
    }).not.toThrow()
  })
})
