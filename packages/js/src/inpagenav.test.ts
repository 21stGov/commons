// SPDX-License-Identifier: MIT

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { enhanceInPageNavigation } from './inpagenav.ts'

// jsdom has no IntersectionObserver; capture the callback so we can drive
// scroll-spy manually.
let ioCallback: IntersectionObserverCallback | undefined
class MockIntersectionObserver {
  constructor(cb: IntersectionObserverCallback) {
    ioCallback = cb
  }
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

function markup(): void {
  document.body.innerHTML = `
    <nav data-slot="in-page-navigation">
      <a data-slot="in-page-navigation-link" href="#s1">One</a>
      <a data-slot="in-page-navigation-link" href="#s2">Two</a>
    </nav>
    <section id="s1">1</section>
    <section id="s2">2</section>`
}
const links = () => document.querySelectorAll<HTMLElement>('[data-slot="in-page-navigation-link"]')

describe('enhanceInPageNavigation', () => {
  beforeEach(() => {
    ioCallback = undefined
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
    document.body.innerHTML = ''
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('clicking a link marks it active and clears the others', () => {
    markup()
    enhanceInPageNavigation(document)
    const [l1, l2] = links()
    l2.click()
    expect(l2.getAttribute('aria-current')).toBe('location')
    expect(l2.classList.contains('cui-in-page-navigation-link--active')).toBe(true)
    expect(l1.hasAttribute('aria-current')).toBe(false)
  })

  it('scroll-spy activates the link for the top-most section in view', () => {
    markup()
    enhanceInPageNavigation(document)
    const [l1, l2] = links()
    const s1 = document.getElementById('s1')!
    const s2 = document.getElementById('s2')!
    // s2 sits higher in the viewport (smaller top) than s1.
    ioCallback?.(
      [
        { isIntersecting: true, target: s1, boundingClientRect: { top: 200 } },
        { isIntersecting: true, target: s2, boundingClientRect: { top: 50 } },
      ] as unknown as IntersectionObserverEntry[],
      {} as IntersectionObserver,
    )
    expect(l2.getAttribute('aria-current')).toBe('location')
    expect(l1.hasAttribute('aria-current')).toBe(false)
  })
})
