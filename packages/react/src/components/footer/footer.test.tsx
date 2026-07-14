// SPDX-License-Identifier: MIT

import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  Footer,
  FooterBottom,
  FooterCopyright,
  FooterLink,
  FooterNav,
  FooterSection,
} from '@/components/footer'
import { Identifier, IdentifierIdentity } from '@/components/identifier'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.useRealTimers()
})

function FullFooter(): React.JSX.Element {
  return (
    <Footer>
      <FooterNav>
        <FooterSection heading="Services">
          <FooterLink href="/trash">Trash and recycling</FooterLink>
          <FooterLink href="/permits">Permits</FooterLink>
        </FooterSection>
        <FooterSection heading="Government">
          <FooterLink href="/council">City council</FooterLink>
          <FooterLink href="/meetings">Public meetings</FooterLink>
        </FooterSection>
      </FooterNav>
      <FooterBottom agencyName="City of Example">
        <a href="tel:+15555550100">(555) 555-0100</a>
        <a href="mailto:info@cityofexample.gov">info@cityofexample.gov</a>
      </FooterBottom>
    </Footer>
  )
}

describe('Footer accessibility (axe)', () => {
  it('a full footer composition is axe-clean', async () => {
    const { container } = render(<FullFooter />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('an empty footer shell is axe-clean', async () => {
    const { container } = render(<Footer />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean with overridden strings and heading levels', async () => {
    const { container } = render(
      <Footer>
        <FooterNav ariaLabel="Pie de página">
          <FooterSection heading="Servicios" headingLevel="h3">
            <FooterLink href="/basura">Basura y reciclaje</FooterLink>
          </FooterSection>
        </FooterNav>
        <FooterBottom agencyName="Ciudad de Ejemplo" />
      </Footer>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Footer name, role, and value', () => {
  it('renders a contentinfo landmark', () => {
    render(<FullFooter />)
    expect(screen.getByRole('contentinfo')).toHaveAttribute('data-slot', 'footer')
  })

  it('renders the nav landmark with the default "Footer" label', () => {
    render(<FullFooter />)
    expect(screen.getByRole('navigation', { name: 'Footer' })).toHaveAttribute(
      'data-slot',
      'footer-nav'
    )
  })

  it('accepts a custom nav label via the ariaLabel prop', () => {
    render(
      <FooterNav ariaLabel="Pie de página">
        <FooterSection heading="Servicios">
          <FooterLink href="/basura">Basura</FooterLink>
        </FooterSection>
      </FooterNav>
    )
    expect(screen.getByRole('navigation', { name: 'Pie de página' })).toBeInTheDocument()
  })

  it('lets a native aria-label win over the ariaLabel prop', () => {
    render(<FooterNav aria-label="Native label" ariaLabel="Prop label" />)
    expect(screen.getByRole('navigation', { name: 'Native label' })).toBeInTheDocument()
  })

  it('renders each link with its accessible name and href', () => {
    render(<FullFooter />)
    const link = screen.getByRole('link', { name: 'Trash and recycling' })
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/trash')
  })

  it('exposes section links as real lists of list items', () => {
    render(<FullFooter />)
    const nav = screen.getByRole('navigation', { name: 'Footer' })
    const lists = within(nav).getAllByRole('list')
    expect(lists).toHaveLength(2)
    expect(within(lists[0] as HTMLElement).getAllByRole('listitem')).toHaveLength(2)
    expect(lists[0]).toHaveAttribute('role', 'list')
    expect(lists[0]).toHaveClass('m-0', 'list-none', 'p-0')
    expect(lists[0]).toHaveStyle({ paddingInlineStart: '0' })
  })
})

describe('Footer heading structure', () => {
  it('renders section headings as visible h2 elements by default', () => {
    render(<FullFooter />)
    const heading = screen.getByRole('heading', { level: 2, name: 'Services' })
    expect(heading).toBeVisible()
    expect(heading.tagName).toBe('H2')
  })

  it('respects headingLevel', () => {
    render(
      <FooterSection heading="Services" headingLevel="h3">
        <FooterLink href="/permits">Permits</FooterLink>
      </FooterSection>
    )
    expect(screen.getByRole('heading', { level: 3, name: 'Services' }).tagName).toBe('H3')
  })
})

describe('FooterLink visual link cues', () => {
  it('is always underlined (link-ness never by color alone)', () => {
    render(<FullFooter />)
    for (const link of screen.getAllByRole('link')) {
      if (link.getAttribute('data-slot') === 'footer-link') {
        expect(link).toHaveClass('underline')
      }
    }
  })

  it('meets the 44px project target size', () => {
    render(<FullFooter />)
    expect(screen.getByRole('link', { name: 'Permits' })).toHaveClass('min-h-11')
  })
})

describe('FooterBottom', () => {
  it('renders the agency line', () => {
    render(<FooterBottom agencyName="City of Example" />)
    expect(screen.getByText('City of Example')).toBeInTheDocument()
  })

  it('renders contact slots passed as children', () => {
    render(
      <FooterBottom agencyName="City of Example">
        <a href="tel:+15555550100">(555) 555-0100</a>
        <a href="mailto:info@cityofexample.gov">info@cityofexample.gov</a>
      </FooterBottom>
    )
    expect(screen.getByRole('link', { name: '(555) 555-0100' })).toHaveAttribute(
      'href',
      'tel:+15555550100'
    )
    expect(screen.getByRole('link', { name: 'info@cityofexample.gov' })).toHaveAttribute(
      'href',
      'mailto:info@cityofexample.gov'
    )
  })

  it('omits the agency line when agencyName is not given', () => {
    const { container } = render(<FooterBottom />)
    // eslint-disable-next-line testing-library/no-node-access
    expect(container.querySelector('[data-slot="footer-agency"]')).not.toBeInTheDocument()
  })
})

describe('FooterCopyright', () => {
  it('shows the current local year by default', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 12, 12))
    const { container } = render(<FooterCopyright>City of Example</FooterCopyright>)

    expect(screen.getByText('2026')).toHaveAttribute('data-slot', 'footer-copyright-year')
    expect(container.querySelector('[data-slot="footer-copyright"]')).toHaveTextContent(
      '© 2026 City of Example'
    )
  })

  it('updates automatically when the local calendar year changes', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 11, 31, 23, 59, 59))
    render(<FooterCopyright>City of Example</FooterCopyright>)
    expect(screen.getByText('2026')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(2100)
    })
    expect(screen.getByText('2027')).toBeInTheDocument()
  })

  it('supports an explicit fixed year when legal copy requires one', () => {
    const { container } = render(<FooterCopyright year={2020}>City archive</FooterCopyright>)
    expect(container.querySelector('[data-slot="footer-copyright"]')).toHaveTextContent(
      '© 2020 City archive'
    )
  })

  it('is axe-clean as the final footer section', async () => {
    const { container } = render(
      <Footer>
        <FooterCopyright>City of Example</FooterCopyright>
      </Footer>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('stays below an optional Identifier when composed last', () => {
    const { container } = render(
      <Footer>
        <Identifier>
          <IdentifierIdentity agencyName="City of Example" />
        </Identifier>
        <FooterCopyright>City of Example</FooterCopyright>
      </Footer>
    )

    const footer = container.querySelector('[data-slot="footer"]')
    const identifier = container.querySelector('[data-slot="identifier"]')
    const copyright = container.querySelector('[data-slot="footer-copyright"]')
    expect(footer?.lastElementChild).toBe(copyright)
    expect(copyright?.previousElementSibling).toBe(identifier)
  })
})

describe('Footer keyboard contract', () => {
  it('Tab moves through footer links in document order', async () => {
    const user = userEvent.setup()
    render(<FullFooter />)

    await user.tab()
    expect(screen.getByRole('link', { name: 'Trash and recycling' })).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('link', { name: 'Permits' })).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('link', { name: 'City council' })).toHaveFocus()
  })

  it('Shift+Tab moves backwards', async () => {
    const user = userEvent.setup()
    render(<FullFooter />)

    await user.tab()
    await user.tab()
    await user.tab({ shift: true })
    expect(screen.getByRole('link', { name: 'Trash and recycling' })).toHaveFocus()
  })
})

describe('Footer RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <Footer lang="ar">
          <FooterNav ariaLabel="تذييل الصفحة">
            <FooterSection heading="الخدمات">
              <FooterLink href="/services">النفايات وإعادة التدوير</FooterLink>
            </FooterSection>
          </FooterNav>
          <FooterBottom agencyName="مدينة المثال" />
        </Footer>
      </div>
    )

    expect(screen.getByRole('navigation', { name: 'تذييل الصفحة' })).toBeInTheDocument()
    expect(screen.getByText('مدينة المثال')).toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})
