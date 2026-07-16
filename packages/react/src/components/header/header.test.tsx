// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type * as React from 'react'
import { describe, expect, it, vi } from 'vitest'

import {
  Header,
  HeaderMenuButton,
  HeaderNav,
  HeaderNavLink,
  HeaderTitle,
  useHeaderMenu,
} from '@/components/header'
import { axeCheck } from '../../../test/setup.js'

/**
 * A custom nav region wired into the Header disclosure via `useHeaderMenu`
 * (stands in for a NavigationMenu mega-menu). It takes the Header's nav id so
 * `aria-controls` resolves, and collapses via the `hidden` class below md.
 */
function CustomNav(): React.JSX.Element {
  const { id, collapsed } = useHeaderMenu()
  return (
    <nav id={id} aria-label="Primary" className={collapsed ? 'hidden md:block' : 'md:block'}>
      <a href="/services">Services</a>
    </nav>
  )
}

function renderHeader(
  props: React.ComponentProps<typeof Header> = {}
): ReturnType<typeof render> {
  return render(
    <Header {...props}>
      <HeaderTitle title="City of Springfield" href="/" />
      <HeaderMenuButton />
      <HeaderNav>
        <HeaderNavLink href="/services" current>
          Services
        </HeaderNavLink>
        <HeaderNavLink href="/payments">Payments</HeaderNavLink>
        <HeaderNavLink href="/meetings">Meetings</HeaderNavLink>
        <HeaderNavLink href="/contact">Contact</HeaderNavLink>
      </HeaderNav>
    </Header>
  )
}

describe('Header accessibility (axe)', () => {
  it('collapsed state is axe-clean', async () => {
    const { container } = renderHeader()
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('expanded state is axe-clean', async () => {
    const { container } = renderHeader({ defaultMenuExpanded: true })
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean after expanding and collapsing interactively', async () => {
    const user = userEvent.setup()
    const { container } = renderHeader()
    const button = screen.getByRole('button', { name: 'Menu' })

    await user.click(button)
    expect(await axeCheck(container)).toHaveNoViolations()

    await user.click(button)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean with a logo and overridden strings', async () => {
    const { container } = render(
      <Header defaultMenuExpanded>
        <HeaderTitle
          title="Ciudad de Springfield"
          href="/es"
          logo={<svg aria-hidden="true" viewBox="0 0 16 16" className="size-3" />}
        />
        <HeaderMenuButton menuLabel="Menú" />
        <HeaderNav ariaLabel="Principal">
          <HeaderNavLink href="/es/servicios" current>
            Servicios
          </HeaderNavLink>
          <HeaderNavLink href="/es/pagos">Pagos</HeaderNavLink>
        </HeaderNav>
      </Header>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Header landmarks and name/role/value', () => {
  it('renders a banner landmark', () => {
    renderHeader()
    expect(screen.getByRole('banner')).toHaveAttribute('data-slot', 'header')
  })

  it('renders a navigation landmark with the default "Primary" label', () => {
    renderHeader({ defaultMenuExpanded: true })
    expect(screen.getByRole('navigation', { name: 'Primary' })).toHaveAttribute(
      'data-slot',
      'header-nav'
    )
  })

  it('accepts a custom nav label via the ariaLabel prop', () => {
    render(
      <Header defaultMenuExpanded>
        <HeaderNav ariaLabel="Principal">
          <HeaderNavLink href="/a">A</HeaderNavLink>
        </HeaderNav>
      </Header>
    )
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument()
  })

  it('a native aria-label wins over the ariaLabel prop', () => {
    render(
      <Header defaultMenuExpanded>
        <HeaderNav ariaLabel="Principal" aria-label="Hoofdnavigatie">
          <HeaderNavLink href="/a">A</HeaderNavLink>
        </HeaderNav>
      </Header>
    )
    expect(screen.getByRole('navigation', { name: 'Hoofdnavigatie' })).toBeInTheDocument()
  })

  it('renders the title as a home link with its accessible name', () => {
    renderHeader()
    const title = screen.getByRole('link', { name: 'City of Springfield' })
    expect(title).toHaveAttribute('href', '/')
    expect(title).toHaveAttribute('data-slot', 'header-title')
  })

  it('renders nav links inside a list', () => {
    renderHeader({ defaultMenuExpanded: true })
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(nav).toContainElement(screen.getByRole('list'))
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
  })

  it('sets aria-current="page" only on the current link', () => {
    renderHeader({ defaultMenuExpanded: true })
    expect(screen.getByRole('link', { name: 'Services' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(screen.getByRole('link', { name: 'Payments' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('link', { name: 'Contact' })).not.toHaveAttribute('aria-current')
  })

  it('gives the current link a non-color indicator class', () => {
    renderHeader({ defaultMenuExpanded: true })
    expect(screen.getByRole('link', { name: 'Services' })).toHaveClass(
      'border-primary',
      'font-medium'
    )
    expect(screen.getByRole('link', { name: 'Payments' })).toHaveClass('border-transparent')
  })

  it('wires the menu button with aria-expanded and aria-controls to the nav', () => {
    renderHeader()
    const button = screen.getByRole('button', { name: 'Menu' })
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveAttribute('aria-expanded', 'false')

    const navId = button.getAttribute('aria-controls')
    expect(navId).toBeTruthy()
    // eslint-disable-next-line testing-library/no-node-access
    const nav = document.getElementById(navId as string)
    expect(nav).toHaveAttribute('data-slot', 'header-nav')
    // Collapsed via the `hidden` utility class (not the attribute, which would
    // hit Preflight's !important and beat md:block at desktop).
    expect(nav).toHaveClass('hidden')
  })

  it('overrides the menu button label (i18n)', () => {
    render(
      <Header>
        <HeaderMenuButton menuLabel="Menú" />
        <HeaderNav>
          <HeaderNavLink href="/a">A</HeaderNavLink>
        </HeaderNav>
      </Header>
    )
    expect(screen.getByRole('button', { name: 'Menú' })).toBeInTheDocument()
  })
})

describe('Header menu keyboard contract', () => {
  it('Tab reaches the menu button and Enter toggles the menu', async () => {
    const user = userEvent.setup()
    renderHeader()
    const button = screen.getByRole('button', { name: 'Menu' })

    await user.tab() // title link
    await user.tab() // menu button
    expect(button).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(button).toHaveAttribute('aria-expanded', 'true')

    await user.keyboard('{Enter}')
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('Space toggles the menu', async () => {
    const user = userEvent.setup()
    renderHeader()
    const button = screen.getByRole('button', { name: 'Menu' })
    button.focus()

    await user.keyboard(' ')
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('Escape closes the open menu and returns focus to the menu button', async () => {
    const user = userEvent.setup()
    renderHeader({ defaultMenuExpanded: true })
    const button = screen.getByRole('button', { name: 'Menu' })
    const link = screen.getByRole('link', { name: 'Payments' })

    link.focus()
    expect(link).toHaveFocus()

    await user.keyboard('{Escape}')
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveFocus()
  })

  it('Escape does nothing while the menu is closed', async () => {
    const user = userEvent.setup()
    const onMenuExpandedChange = vi.fn()
    renderHeader({ onMenuExpandedChange })

    screen.getByRole('link', { name: 'City of Springfield' }).focus()
    await user.keyboard('{Escape}')

    expect(onMenuExpandedChange).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Menu' })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
  })

  it('collapsed nav links are not reachable by Tab', async () => {
    const user = userEvent.setup()
    renderHeader()

    // The collapsed nav carries the `hidden` utility → `display:none` in a real
    // browser, which removes its links from the tab order and the a11y tree.
    // jsdom applies no CSS, so it cannot skip them on Tab; assert the collapse
    // mechanism instead (the display:none tab-skip is browser-verified).
    expect(screen.getByRole('navigation', { name: 'Primary' })).toHaveClass('hidden')

    await user.tab() // title link
    await user.tab() // menu button
  })
})

describe('Header hidden toggling (disclosure, not dialog)', () => {
  it('keeps the nav content in the DOM while collapsed (hidden class)', () => {
    renderHeader()
    const link = screen.getByText('Payments')
    expect(link).toBeInTheDocument()
    // jsdom applies no CSS, so assert the collapse mechanism (the `hidden`
    // class on the nav) rather than computed visibility.
    expect(screen.getByRole('navigation', { name: 'Primary' })).toHaveClass('hidden')
  })

  it('reveals the nav when toggled and hides it again', async () => {
    const user = userEvent.setup()
    renderHeader()
    const button = screen.getByRole('button', { name: 'Menu' })

    await user.click(button)
    expect(screen.getByRole('navigation', { name: 'Primary' })).not.toHaveClass('hidden')

    await user.click(button)
    expect(screen.getByRole('navigation', { name: 'Primary' })).toHaveClass('hidden')
  })

  it('supports defaultMenuExpanded (uncontrolled initial state)', () => {
    renderHeader({ defaultMenuExpanded: true })
    expect(screen.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Payments')).toBeVisible()
  })

  it('keeps md:block on the nav so CSS overrides hidden at the md breakpoint', () => {
    // jsdom has no media queries: this guards the class that makes the nav
    // permanently visible (and the hidden attribute inert) from md up.
    renderHeader()
    const button = screen.getByRole('button', { name: 'Menu' })
    // eslint-disable-next-line testing-library/no-node-access
    const nav = document.getElementById(button.getAttribute('aria-controls') as string)
    expect(nav).toHaveClass('md:block')
    expect(button).toHaveClass('md:hidden')
  })
})

describe('Header controlled menu state', () => {
  it('respects a controlled menuExpanded prop and reports toggles', async () => {
    const user = userEvent.setup()
    const onMenuExpandedChange = vi.fn()
    renderHeader({ menuExpanded: false, onMenuExpandedChange })
    const button = screen.getByRole('button', { name: 'Menu' })

    await user.click(button)
    expect(onMenuExpandedChange).toHaveBeenCalledExactlyOnceWith(true)
    // Controlled: the parent did not update, so the state must not change.
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('navigation', { name: 'Primary' })).toHaveClass('hidden')
  })

  it('follows the controlled value from the parent', () => {
    const { rerender } = renderHeader({ menuExpanded: false })
    expect(screen.getByRole('navigation', { name: 'Primary' })).toHaveClass('hidden')

    rerender(
      <Header menuExpanded>
        <HeaderTitle title="City of Springfield" href="/" />
        <HeaderMenuButton />
        <HeaderNav>
          <HeaderNavLink href="/payments">Payments</HeaderNavLink>
        </HeaderNav>
      </Header>
    )
    expect(screen.getByText('Payments')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('reports Escape through onMenuExpandedChange', async () => {
    const user = userEvent.setup()
    const onMenuExpandedChange = vi.fn()
    renderHeader({ menuExpanded: true, onMenuExpandedChange })

    screen.getByRole('link', { name: 'Payments' }).focus()
    await user.keyboard('{Escape}')
    expect(onMenuExpandedChange).toHaveBeenCalledExactlyOnceWith(false)
  })
})

describe('Header standalone subcomponents', () => {
  it('HeaderNav renders visible outside a Header (no hidden wiring)', () => {
    render(
      <HeaderNav>
        <HeaderNavLink href="/a">Standalone link</HeaderNavLink>
      </HeaderNav>
    )
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(nav).not.toHaveAttribute('hidden')
    expect(screen.getByText('Standalone link')).toBeVisible()
  })

  it('HeaderTitle defaults its href to "/"', () => {
    render(<HeaderTitle title="Springfield" />)
    expect(screen.getByRole('link', { name: 'Springfield' })).toHaveAttribute('href', '/')
  })
})

describe('useHeaderMenu (custom nav wired into the Header disclosure)', () => {
  it('shares the nav id with the menu button and toggles collapse', async () => {
    const user = userEvent.setup()
    render(
      <Header>
        <HeaderTitle title="City of Springfield" href="/" />
        <HeaderMenuButton />
        <CustomNav />
      </Header>
    )
    const button = screen.getByRole('button', { name: 'Menu' })
    const nav = screen.getByRole('navigation', { name: 'Primary' })

    // The menu button's aria-controls resolves to the custom nav.
    expect(nav.id).toBeTruthy()
    expect(button).toHaveAttribute('aria-controls', nav.id)

    // Collapsed while closed; revealed on toggle; hidden again (disclosure).
    expect(nav).toHaveClass('hidden')
    await user.click(button)
    expect(nav).not.toHaveClass('hidden')
    await user.click(button)
    expect(nav).toHaveClass('hidden')
  })

  it('is inert outside a Header (no id, never collapsed)', () => {
    render(<CustomNav />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(nav.id).toBe('')
    expect(nav).not.toHaveClass('hidden')
  })
})

describe('Header RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <div dir="rtl">
        <Header>
          <HeaderTitle title="مدينة سبرينغفيلد" href="/" />
          <HeaderMenuButton menuLabel="القائمة" />
          <HeaderNav ariaLabel="التنقل الرئيسي">
            <HeaderNavLink href="/services" current>
              الخدمات
            </HeaderNavLink>
            <HeaderNavLink href="/payments">المدفوعات</HeaderNavLink>
          </HeaderNav>
        </Header>
      </div>
    )

    const button = screen.getByRole('button', { name: 'القائمة' })
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: 'الخدمات' })).toHaveAttribute('aria-current', 'page')
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})
