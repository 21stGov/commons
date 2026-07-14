// SPDX-License-Identifier: MIT

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  Sidebar,
  SidebarGroup,
  SidebarItem,
  SidebarNav,
  SidebarSection,
  SidebarTrigger,
} from '@/components/sidebar'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

// The nav is collapsed (hidden attribute) below `md`, and jsdom has no CSS to
// apply the `md:block` override, so structural tests render with the menu
// expanded to put the nav content in the accessibility tree — the same approach
// the Header tests use.
function Example({
  groupOpen = true,
  triggerExpanded = true,
}: {
  groupOpen?: boolean
  triggerExpanded?: boolean
}): React.JSX.Element {
  return (
    <Sidebar defaultMenuExpanded={triggerExpanded}>
      <SidebarTrigger />
      <SidebarNav ariaLabel="Parks &amp; Recreation">
        <SidebarItem href="/parks" current>
          Overview
        </SidebarItem>
        <SidebarGroup label="Departments" defaultOpen={groupOpen}>
          <SidebarItem href="/parks/permits">Permits</SidebarItem>
          <SidebarItem href="/parks/facilities">Facilities</SidebarItem>
        </SidebarGroup>
        <SidebarSection label="Resources">
          <SidebarItem href="/parks/forms">Forms</SidebarItem>
          <SidebarItem href="/parks/contact">Contact</SidebarItem>
        </SidebarSection>
      </SidebarNav>
    </Sidebar>
  )
}

describe('Sidebar accessibility (axe)', () => {
  it('default (expanded group) is axe-clean', async () => {
    const { container } = render(<Example />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('collapsed group is axe-clean', async () => {
    const { container } = render(<Example groupOpen={false} />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('mobile menu expanded is axe-clean', async () => {
    const { container } = render(<Example triggerExpanded />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Sidebar landmark and structure', () => {
  it('renders a nav landmark named by its ariaLabel', () => {
    render(<Example />)
    expect(screen.getByRole('navigation', { name: 'Parks & Recreation' })).toBeInTheDocument()
  })

  it('a native aria-label prop wins over ariaLabel', () => {
    render(
      <SidebarNav ariaLabel="Default" aria-label="Explicit">
        <SidebarItem href="/a">A</SidebarItem>
      </SidebarNav>
    )
    expect(screen.getByRole('navigation', { name: 'Explicit' })).toBeInTheDocument()
  })

  it('names the section list via its heading (aria-labelledby)', () => {
    render(<Example />)
    // The nested list carries the section heading as its accessible name.
    expect(screen.getByRole('list', { name: 'Resources' })).toBeInTheDocument()
  })
})

describe('Sidebar current page', () => {
  it('marks the current item with aria-current="page"', () => {
    render(<Example />)
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Permits' })).not.toHaveAttribute('aria-current')
  })

  it('signals the current page without relying on color alone (accent bar + weight)', () => {
    render(<Example />)
    const current = screen.getByRole('link', { name: 'Overview' })
    // Inline-start accent bar (border-s) flips in RTL, plus heavier weight —
    // survives forced-colors mode where the accent color is overridden.
    expect(current.className).toContain('border-s-2')
    expect(current.className).toContain('border-primary')
    expect(current.className).toContain('font-semibold')
  })
})

describe('Sidebar expandable group', () => {
  it('exposes the group label as a button with aria-expanded', () => {
    render(<Example groupOpen={false} />)
    const trigger = screen.getByRole('button', { name: 'Departments' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('toggles the group open on click and reveals its items', async () => {
    const user = userEvent.setup()
    render(<Example groupOpen={false} />)
    const trigger = screen.getByRole('button', { name: 'Departments' })

    expect(screen.queryByRole('link', { name: 'Permits' })).not.toBeInTheDocument()
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: 'Permits' })).toBeInTheDocument()
  })

  it('toggles the group with the keyboard (Enter)', async () => {
    const user = userEvent.setup()
    render(<Example groupOpen={false} />)
    const trigger = screen.getByRole('button', { name: 'Departments' })

    trigger.focus()
    await user.keyboard('{Enter}')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })
})

describe('Sidebar mobile disclosure', () => {
  it('renders a trigger wired to the nav via aria-controls', () => {
    const { container } = render(<Example triggerExpanded={false} />)
    const trigger = screen.getByRole('button', { name: 'Sections' })
    // Collapsed, so the nav is hidden — select it by data-slot.
    const nav = container.querySelector('[data-slot="sidebar-nav"]')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveAttribute('aria-controls', nav?.id)
  })

  it('collapses via the hidden class (not the attribute) so md:block can override it', async () => {
    const user = userEvent.setup()
    const { container } = render(<Example triggerExpanded={false} />)
    const trigger = screen.getByRole('button', { name: 'Sections' })
    const nav = container.querySelector('[data-slot="sidebar-nav"]') as HTMLElement

    // Collapsed by default on mobile: the nav carries the `hidden` CLASS plus
    // `md:block` (which overrides it on wider viewports via CSS). It must NOT use
    // the `hidden` ATTRIBUTE — Tailwind v4 Preflight makes that
    // `display:none !important`, which `md:block` could never override, leaving a
    // blank dead spot at md+ where the trigger is also hidden.
    expect(nav).not.toHaveAttribute('hidden')
    expect(nav).toHaveClass('hidden')
    expect(nav).toHaveClass('md:block')

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(nav).not.toHaveClass('hidden')
    expect(nav).toHaveClass('md:block')
  })

  it('Escape closes the open menu and returns focus to the trigger', async () => {
    const user = userEvent.setup()
    render(<Example triggerExpanded={false} />)
    const trigger = screen.getByRole('button', { name: 'Sections' })

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    // Move focus into the nav, then Escape from within.
    const overview = screen.getByRole('link', { name: 'Overview' })
    overview.focus()
    await user.keyboard('{Escape}')

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
  })

  it('supports a controlled menu via menuExpanded + onMenuExpandedChange', async () => {
    const user = userEvent.setup()
    const onMenuExpandedChange = vi.fn()

    function Controlled(): React.JSX.Element {
      const [open, setOpen] = React.useState(false)
      return (
        <Sidebar
          menuExpanded={open}
          onMenuExpandedChange={(next) => {
            onMenuExpandedChange(next)
            setOpen(next)
          }}
        >
          <SidebarTrigger />
          <SidebarNav ariaLabel="Services">
            <SidebarItem href="/a">A</SidebarItem>
          </SidebarNav>
        </Sidebar>
      )
    }

    render(<Controlled />)
    const trigger = screen.getByRole('button', { name: 'Sections' })
    await user.click(trigger)
    expect(onMenuExpandedChange).toHaveBeenCalledWith(true)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })
})

describe('Sidebar leading icons', () => {
  it('renders a decorative leading icon without adding to the link name', () => {
    render(
      <SidebarNav ariaLabel="Services">
        <SidebarItem
          href="/permits"
          icon={<svg data-testid="permit-icon" aria-hidden="true" />}
        >
          Permits
        </SidebarItem>
      </SidebarNav>
    )
    const link = screen.getByRole('link', { name: 'Permits' })
    expect(within(link).getByTestId('permit-icon')).toBeInTheDocument()
  })
})

describe('Sidebar RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <Sidebar defaultMenuExpanded>
          <SidebarNav ariaLabel="أقسام">
            <SidebarItem href="/home" current>
              الرئيسية
            </SidebarItem>
            <SidebarGroup label="الخدمات" defaultOpen>
              <SidebarItem href="/services/permits">التصاريح</SidebarItem>
            </SidebarGroup>
          </SidebarNav>
        </Sidebar>
      </div>
    )
    expect(screen.getByRole('link', { name: 'الرئيسية' })).toHaveAttribute('aria-current', 'page')
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})
