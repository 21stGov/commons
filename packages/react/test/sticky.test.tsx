// SPDX-License-Identifier: MIT

import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GovBanner } from '@/components/gov-banner'
import { Header, HeaderTitle } from '@/components/header'
import { SiteAlert } from '@/components/site-alert'

// jsdom has no layout, so give each sticky region a measurable height.
function setHeight(el: HTMLElement, h: number): void {
  Object.defineProperty(el, 'offsetHeight', { configurable: true, value: h })
}

describe('sticky stacking (React)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('stacks a sticky gov banner, header, and site alert by cumulative height', () => {
    const { container } = render(
      <>
        <GovBanner sticky entity="the Town of Example" />
        <Header sticky>
          <HeaderTitle title="Town of Example" href="/" />
        </Header>
        <SiteAlert sticky heading="Notice">
          Body
        </SiteAlert>
      </>
    )
    const banner = container.querySelector<HTMLElement>('[data-slot="gov-banner"]')!
    const header = container.querySelector<HTMLElement>('[data-slot="header"]')!
    const alert = container.querySelector<HTMLElement>('[data-slot="site-alert"]')!

    // Each region opts into the stack and gets position: sticky from its cva.
    expect(banner).toHaveAttribute('data-cui-sticky')
    expect(header).toHaveAttribute('data-cui-sticky')
    expect(alert).toHaveAttribute('data-cui-sticky')
    expect(banner.className).toContain('sticky')

    setHeight(banner, 40)
    setHeight(header, 64)
    setHeight(alert, 60)
    vi.advanceTimersByTime(20) // fire the coordinator's rAF

    expect(banner.style.top).toBe('0px')
    expect(header.style.top).toBe('40px')
    expect(alert.style.top).toBe('104px')
  })

  it('leaves non-sticky regions unmarked and unpositioned', () => {
    const { container } = render(
      <Header>
        <HeaderTitle title="Town" href="/" />
      </Header>
    )
    const header = container.querySelector<HTMLElement>('[data-slot="header"]')!
    expect(header).not.toHaveAttribute('data-cui-sticky')
    expect(header.className).not.toContain('sticky')
  })
})
