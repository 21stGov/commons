// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type * as React from 'react'
import { describe, expect, it } from 'vitest'

import { Header, HeaderMenuButton, HeaderTitle } from '@/components/header'
import { HeaderNavigationMenu } from '@/components/header-navigation-menu'
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuLinkGroup,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '@/components/navigation-menu'
import { axeCheck } from '../../../test/setup.js'

function renderInHeader(
  props: React.ComponentProps<typeof Header> = {}
): ReturnType<typeof render> {
  return render(
    <Header {...props}>
      <HeaderTitle title="City of Springfield" href="/" />
      <HeaderMenuButton />
      <HeaderNavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/" current>
              Home
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem value="services">
            <NavigationMenuTrigger>Services</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLinkGroup label="Residents">
                <NavigationMenuLink href="/permits">Permits</NavigationMenuLink>
                <NavigationMenuLink href="/pay">Pay a bill</NavigationMenuLink>
              </NavigationMenuLinkGroup>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuViewport />
      </HeaderNavigationMenu>
    </Header>
  )
}

describe('HeaderNavigationMenu (mega-menu wired into a Header)', () => {
  it('wires the menu button aria-controls to the nav landmark id', () => {
    renderInHeader()
    const button = screen.getByRole('button', { name: 'Menu' })
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(nav.id).toBeTruthy()
    expect(button).toHaveAttribute('aria-controls', nav.id)
  })

  it('collapses below md when closed and reveals on toggle (disclosure)', async () => {
    const user = userEvent.setup()
    renderInHeader()
    const button = screen.getByRole('button', { name: 'Menu' })
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    // jsdom applies no CSS: assert the collapse mechanism (the `hidden` class)
    // and the `md:block` escape hatch rather than computed visibility.
    expect(nav).toHaveClass('hidden')
    expect(nav).toHaveClass('md:block')
    await user.click(button)
    expect(nav).not.toHaveClass('hidden')
    await user.click(button)
    expect(nav).toHaveClass('hidden')
  })

  it('opens a mega-menu panel from a trigger', async () => {
    const user = userEvent.setup()
    renderInHeader({ defaultMenuExpanded: true })
    const trigger = screen.getByRole('button', { name: 'Services' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(await screen.findByRole('link', { name: 'Permits' })).toBeInTheDocument()
  })

  it('marks the current page with aria-current', () => {
    renderInHeader({ defaultMenuExpanded: true })
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
  })

  it('is axe-clean with a panel open', async () => {
    const user = userEvent.setup()
    const { container } = renderInHeader({ defaultMenuExpanded: true })
    await user.click(screen.getByRole('button', { name: 'Services' }))
    await screen.findByRole('link', { name: 'Permits' })
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('renders standalone outside a Header (no collapse, no id)', () => {
    render(
      <HeaderNavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/">Home</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuViewport />
      </HeaderNavigationMenu>
    )
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(nav.id).toBe('')
    expect(nav).not.toHaveClass('hidden')
  })
})
