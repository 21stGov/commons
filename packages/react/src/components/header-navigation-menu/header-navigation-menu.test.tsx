// SPDX-License-Identifier: MIT

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type * as React from 'react'
import { describe, expect, it } from 'vitest'

import { Header, HeaderMenuButton, HeaderTitle } from '@/components/header'
import { HeaderNavigationMenu, type HeaderNavItem } from '@/components/header-navigation-menu'
import { axeCheck } from '../../../test/setup.js'

const NAV: readonly HeaderNavItem[] = [
  { label: 'Home', href: '/', current: true },
  {
    label: 'Services',
    groups: [
      {
        heading: 'Residents',
        links: [
          { label: 'Permits', href: '/permits' },
          { label: 'Pay a bill', href: '/pay' },
        ],
      },
    ],
  },
]

function renderInHeader(props: React.ComponentProps<typeof Header> = {}): ReturnType<typeof render> {
  return render(
    <Header {...props}>
      <HeaderTitle title="City of Springfield" href="/" />
      <HeaderMenuButton />
      <HeaderNavigationMenu items={NAV} />
    </Header>
  )
}

// One `items` array renders two presentations: the desktop NavigationMenu bar
// and the mobile <details> accordion. jsdom computes no CSS, so both sit in the
// DOM at once (in a browser only one shows per breakpoint) — these helpers
// target each by its stable marker.

/** The mobile accordion nav: the landmark the menu button controls by id. */
function mobileNav(): HTMLElement {
  const id = screen.getByRole('button', { name: 'Menu' }).getAttribute('aria-controls')
  const nav = id ? document.getElementById(id) : null
  if (!nav) throw new Error('mobile accordion nav not found')
  return nav
}

/** The desktop mega-menu bar (the NavigationMenu root). */
function desktopBar(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>('[data-slot="navigation-menu"]')
  if (!el) throw new Error('desktop bar not found')
  return el
}

describe('HeaderNavigationMenu (responsive: desktop mega-menu + mobile accordion)', () => {
  it('wires the menu button aria-controls to the mobile nav landmark', () => {
    renderInHeader()
    const nav = mobileNav()
    expect(nav.tagName).toBe('NAV')
    expect(screen.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-controls', nav.id)
  })

  it('collapses the mobile accordion when closed and reveals it on toggle', async () => {
    const user = userEvent.setup()
    renderInHeader()
    const button = screen.getByRole('button', { name: 'Menu' })
    const nav = mobileNav()
    // jsdom applies no CSS: assert the collapse mechanism (the `hidden` class
    // and the md-only class that keeps this a mobile-only tree), not visibility.
    expect(nav).toHaveClass('hidden')
    expect(nav).toHaveClass('md:hidden')
    await user.click(button)
    expect(nav).not.toHaveClass('hidden')
    await user.click(button)
    expect(nav).toHaveClass('hidden')
  })

  it('renders panels as exclusive <details> sections in the mobile accordion', () => {
    renderInHeader({ defaultMenuExpanded: true })
    const nav = mobileNav()
    const details = nav.querySelectorAll('details')
    expect(details).toHaveLength(1) // "Services" (Home is a direct link)
    // A shared name makes the sections single-open where the browser supports it.
    expect(details[0].getAttribute('name')).toBeTruthy()
    expect(within(nav).getByText('Services')).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'Permits' })).toBeInTheDocument()
  })

  it('opens a mega-menu panel from a desktop trigger', async () => {
    const user = userEvent.setup()
    const { container } = renderInHeader({ defaultMenuExpanded: true })
    const trigger = within(desktopBar(container)).getByRole('button', { name: 'Services' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('marks the current page with aria-current in both presentations', () => {
    renderInHeader({ defaultMenuExpanded: true })
    const home = screen.getAllByRole('link', { name: 'Home' })
    expect(home.length).toBeGreaterThanOrEqual(1)
    for (const link of home) expect(link).toHaveAttribute('aria-current', 'page')
  })

  it('the mobile accordion is axe-clean', async () => {
    renderInHeader({ defaultMenuExpanded: true })
    // Scope to one presentation: both responsive navs share the "Primary" name,
    // a duplicate landmark only under jsdom's no-CSS rendering (in a browser one
    // is display:none). Audit each tree on its own.
    expect(await axeCheck(mobileNav())).toHaveNoViolations()
  })

  it('renders standalone outside a Header (accordion never collapses, no id)', () => {
    const { container } = render(<HeaderNavigationMenu items={NAV} />)
    const mob = [...container.querySelectorAll<HTMLElement>('nav')].find((n) =>
      n.className.includes('md:hidden')
    )
    expect(mob).toBeDefined()
    expect(mob).not.toHaveClass('hidden')
    expect(mob?.id).toBe('')
  })
})
