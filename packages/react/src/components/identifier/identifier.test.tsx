// SPDX-License-Identifier: MIT

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type * as React from 'react'
import { describe, expect, it } from 'vitest'

import {
  Identifier,
  IdentifierResource,
  IdentifierIdentity,
  IdentifierLink,
  IdentifierLinks,
} from '@/components/identifier'
import { axeCheck } from '../../../test/setup.js'

function FullIdentifier(): React.JSX.Element {
  return (
    <Identifier>
      <IdentifierIdentity agencyName="City of Example" domain="cityofexample.example" />
      <IdentifierLinks>
        <IdentifierLink href="/about">About the City of Example</IdentifierLink>
        <IdentifierLink href="/accessibility">Accessibility statement</IdentifierLink>
        <IdentifierLink href="/records">Public records</IdentifierLink>
        <IdentifierLink href="/privacy">Privacy policy</IdentifierLink>
      </IdentifierLinks>
      <IdentifierResource
        text="Need help finding a city service?"
        linkText="Contact the City"
        href="/contact"
      />
    </Identifier>
  )
}

describe('Identifier accessibility (axe)', () => {
  it('a full identifier composition is axe-clean', async () => {
    const { container } = render(<FullIdentifier />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('an empty identifier shell is axe-clean', async () => {
    const { container } = render(<Identifier />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean with every string prop overridden', async () => {
    const { container } = render(
      <Identifier ariaLabel="Identificador de agencia">
        <IdentifierIdentity
          agencyName="Ciudad de Ejemplo"
          domain="ciudaddeejemplo.example"
          officialText="Este sitio web es administrado por {agency}"
        />
        <IdentifierLinks ariaLabel="Enlaces importantes">
          <IdentifierLink href="/acerca">Acerca de</IdentifierLink>
        </IdentifierLinks>
        <IdentifierResource
          text="¿Necesita ayuda para encontrar un servicio local?"
          linkText="Contacte con la ciudad"
          href="/contacto"
        />
      </Identifier>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Identifier name, role, and value', () => {
  it('renders a region landmark with the default "Agency identifier" label', () => {
    render(<FullIdentifier />)
    expect(screen.getByRole('region', { name: 'Agency identifier' })).toHaveAttribute(
      'data-slot',
      'identifier'
    )
  })

  it('accepts a custom region label via the ariaLabel prop', () => {
    render(<Identifier ariaLabel="Identificador de agencia" />)
    expect(screen.getByRole('region', { name: 'Identificador de agencia' })).toBeInTheDocument()
  })

  it('lets a native aria-label win over the ariaLabel prop', () => {
    render(<Identifier aria-label="Native label" ariaLabel="Prop label" />)
    expect(screen.getByRole('region', { name: 'Native label' })).toBeInTheDocument()
  })

  it('renders the links nav landmark with the default "Important links" label', () => {
    render(<FullIdentifier />)
    expect(screen.getByRole('navigation', { name: 'Important links' })).toHaveAttribute(
      'data-slot',
      'identifier-links'
    )
  })

  it('accepts a custom links nav label', () => {
    render(
      <IdentifierLinks ariaLabel="Enlaces importantes">
        <IdentifierLink href="/acerca">Acerca de</IdentifierLink>
      </IdentifierLinks>
    )
    expect(screen.getByRole('navigation', { name: 'Enlaces importantes' })).toBeInTheDocument()
  })

  it('exposes policy links as a real list of list items', () => {
    render(<FullIdentifier />)
    const nav = screen.getByRole('navigation', { name: 'Important links' })
    const list = within(nav).getByRole('list')
    expect(within(list).getAllByRole('listitem')).toHaveLength(4)
    expect(list).toHaveAttribute('role', 'list')
    expect(list).toHaveClass('m-0', 'list-none', 'flex-col', 'items-start', 'p-0')
    expect(list).toHaveStyle({ paddingInlineStart: '0' })
  })

  it('renders each required link with its accessible name and href', () => {
    render(<FullIdentifier />)
    expect(screen.getByRole('link', { name: 'Accessibility statement' })).toHaveAttribute(
      'href',
      '/accessibility'
    )
    expect(screen.getByRole('link', { name: 'Public records' })).toHaveAttribute(
      'href',
      '/records'
    )
  })
})

describe('IdentifierIdentity string interpolation', () => {
  it('interpolates agencyName into the default official text', () => {
    render(<IdentifierIdentity agencyName="City of Example" />)
    expect(screen.getByText('This website is operated by City of Example')).toBeInTheDocument()
  })

  it('prefers parentAgency over agencyName in the interpolation', () => {
    render(<IdentifierIdentity agencyName="Parks Department" parentAgency="City of Example" />)
    expect(screen.getByText('This website is operated by City of Example')).toBeInTheDocument()
    expect(screen.queryByText(/Parks Department/)).not.toBeInTheDocument()
  })

  it('interpolates into a custom (translated) officialText', () => {
    render(
      <IdentifierIdentity
        agencyName="la Ciudad de Ejemplo"
        officialText="Un sitio web oficial de {agency}"
      />
    )
    expect(screen.getByText('Un sitio web oficial de la Ciudad de Ejemplo')).toBeInTheDocument()
  })

  it('accepts an officialText without the {agency} placeholder', () => {
    render(<IdentifierIdentity agencyName="City of Example" officialText="An official website" />)
    expect(screen.getByText('An official website')).toBeInTheDocument()
  })

  it('renders the domain masthead', () => {
    render(<IdentifierIdentity agencyName="City of Example" domain="cityofexample.example" />)
    expect(screen.getByText('cityofexample.example')).toBeInTheDocument()
  })

  it('omits the domain masthead when domain is not given', () => {
    const { container } = render(<IdentifierIdentity agencyName="City of Example" />)
    // eslint-disable-next-line testing-library/no-node-access
    expect(container.querySelector('[data-slot="identifier-domain"]')).not.toBeInTheDocument()
  })
})

describe('IdentifierResource', () => {
  it('renders only the local resource text and destination supplied by the site', () => {
    render(
      <IdentifierResource
        text="¿Necesita ayuda para encontrar un servicio local?"
        linkText="Contacte con la ciudad"
        href="/contacto"
      />
    )
    expect(
      screen.getByText(/¿Necesita ayuda para encontrar un servicio local\?/)
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Contacte con la ciudad' })).toHaveAttribute(
      'href', '/contacto'
    )
  })
})

describe('Identifier on-dark link cues', () => {
  it('every link on the dark band is underlined and uses the on-emphasis foreground', () => {
    render(<FullIdentifier />)
    for (const link of screen.getAllByRole('link')) {
      expect(link).toHaveClass('underline', 'text-emphasis-foreground')
    }
  })

  it('the band pairs the emphasis background with the on-emphasis foreground', () => {
    render(<FullIdentifier />)
    expect(screen.getByRole('region', { name: 'Agency identifier' })).toHaveClass(
      'bg-emphasis',
      'text-emphasis-foreground'
    )
  })

  it('links meet the 44px project target size', () => {
    render(<FullIdentifier />)
    expect(screen.getByRole('link', { name: 'Privacy policy' })).toHaveClass('min-h-11')
  })
})

describe('Identifier keyboard contract', () => {
  it('Tab moves through policy links to the local resource in document order', async () => {
    const user = userEvent.setup()
    render(<FullIdentifier />)

    await user.tab()
    expect(screen.getByRole('link', { name: 'About the City of Example' })).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('link', { name: 'Accessibility statement' })).toHaveFocus()

    await user.tab()
    await user.tab()
    await user.tab()
    expect(screen.getByRole('link', { name: 'Contact the City' })).toHaveFocus()
  })
})

describe('Identifier RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <Identifier lang="ar" ariaLabel="معرّف الجهة الحكومية">
          <IdentifierIdentity
            agencyName="مدينة المثال"
            domain="cityofexample.example"
            officialText="يتم تشغيل هذا الموقع بواسطة {agency}"
          />
          <IdentifierLinks ariaLabel="روابط مهمة">
            <IdentifierLink href="/about">حول المدينة</IdentifierLink>
          </IdentifierLinks>
          <IdentifierResource
            text="هل تحتاج إلى مساعدة في العثور على خدمة محلية؟"
            linkText="اتصل بالمدينة"
            href="/contact"
          />
        </Identifier>
      </div>
    )

    expect(screen.getByRole('region', { name: 'معرّف الجهة الحكومية' })).toBeInTheDocument()
    expect(screen.getByText('يتم تشغيل هذا الموقع بواسطة مدينة المثال')).toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})
