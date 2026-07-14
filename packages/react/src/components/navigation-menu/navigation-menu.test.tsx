// SPDX-License-Identifier: MIT

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuLinkGroup,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '@/components/navigation-menu'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

/** A representative government primary nav: two direct links + one mega panel. */
function Menu(props: React.ComponentProps<typeof NavigationMenu>): React.JSX.Element {
  return (
    <NavigationMenu aria-label="Primary" {...props}>
      <NavigationMenuList>
        <NavigationMenuItem value="home">
          <NavigationMenuLink href="/" current>
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem value="services">
          <NavigationMenuTrigger>Services</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLinkGroup label="Residents">
              <NavigationMenuLink href="/permits">Permits</NavigationMenuLink>
              <NavigationMenuLink href="/trash">Trash & recycling</NavigationMenuLink>
            </NavigationMenuLinkGroup>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="about">
          <NavigationMenuLink href="/about">About</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuViewport />
    </NavigationMenu>
  )
}

describe('NavigationMenu accessibility (axe)', () => {
  it('closed bar is axe-clean', async () => {
    const { container } = render(<Menu />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('open panel is axe-clean', async () => {
    const user = userEvent.setup()
    render(<Menu />)
    await user.click(screen.getByRole('button', { name: 'Services' }))
    await screen.findByRole('link', { name: 'Permits' })
    // Both nav landmarks (root + panel) are named and unique.
    expect(await axeCheck(document.body)).toHaveNoViolations()
  })

  it('current-page link is axe-clean', async () => {
    const { container } = render(<Menu />)
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <Menu aria-label="التنقل الرئيسي" />
      </div>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('NavigationMenu landmark and links', () => {
  it('renders a nav landmark named by aria-label', () => {
    render(<Menu />)
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })

  it('supports aria-labelledby instead of aria-label', () => {
    render(
      <>
        <h2 id="nav-heading">Site sections</h2>
        <NavigationMenu aria-labelledby="nav-heading">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="/about">About</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
          <NavigationMenuViewport />
        </NavigationMenu>
      </>
    )
    expect(screen.getByRole('navigation', { name: 'Site sections' })).toBeInTheDocument()
  })

  it('marks the current page with aria-current and omits it otherwise', () => {
    render(<Menu />)
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'About' })).not.toHaveAttribute('aria-current')
  })

  it('renders links as native anchors with their href', () => {
    render(<Menu />)
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
  })
})

describe('NavigationMenu trigger and panel', () => {
  it('the trigger exposes aria-expanded reflecting the panel state', async () => {
    const user = userEvent.setup()
    render(<Menu />)
    const trigger = screen.getByRole('button', { name: 'Services' })

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await user.click(trigger)
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
    expect(await screen.findByRole('link', { name: 'Permits' })).toBeInTheDocument()
  })

  it('closes the panel and returns focus to the trigger on Escape', async () => {
    const user = userEvent.setup()
    render(<Menu />)
    const trigger = screen.getByRole('button', { name: 'Services' })

    await user.click(trigger)
    await screen.findByRole('link', { name: 'Permits' })

    await user.keyboard('{Escape}')
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
    expect(trigger).toHaveFocus()
  })

  it('opens the panel from the keyboard with ArrowDown on a horizontal bar', async () => {
    const user = userEvent.setup()
    render(<Menu />)
    const trigger = screen.getByRole('button', { name: 'Services' })

    trigger.focus()
    expect(trigger).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
  })

  it('renders a grouped panel with an accessible group name', async () => {
    const user = userEvent.setup()
    render(<Menu />)
    await user.click(screen.getByRole('button', { name: 'Services' }))
    await screen.findByRole('link', { name: 'Permits' })
    expect(screen.getByRole('group', { name: 'Residents' })).toBeInTheDocument()
  })
})

describe('NavigationMenu controlled usage', () => {
  it('honors a controlled value and reports changes', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    function Controlled(): React.JSX.Element {
      const [value, setValue] = React.useState<string | null>(null)
      return (
        <NavigationMenu
          aria-label="Primary"
          value={value}
          onValueChange={(next) => {
            onValueChange(next)
            setValue(next)
          }}
        >
          <NavigationMenuList>
            <NavigationMenuItem value="services">
              <NavigationMenuTrigger>Services</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="/permits">Permits</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
          <NavigationMenuViewport />
        </NavigationMenu>
      )
    }

    render(<Controlled />)
    await user.click(screen.getByRole('button', { name: 'Services' }))
    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith('services'))
    expect(await screen.findByRole('link', { name: 'Permits' })).toBeInTheDocument()
  })
})

describe('NavigationMenu forced-colors redundancy', () => {
  it('signals the current page with weight, not color alone (bar item)', () => {
    render(<Menu />)
    const current = screen.getByRole('link', { name: 'Home' })
    expect(current.className).toContain('font-medium')
  })

  it('keeps a visible border on the popup surface', async () => {
    const user = userEvent.setup()
    render(<Menu />)
    await user.click(screen.getByRole('button', { name: 'Services' }))
    const popup = await screen.findByRole('navigation', { name: 'Submenu' })
    expect(popup.className).toContain('border')
  })
})
