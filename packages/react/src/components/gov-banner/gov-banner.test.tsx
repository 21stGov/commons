// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { GovBanner } from '@/components/gov-banner'
import { axeCheck } from '../../../test/setup.js'

describe('GovBanner accessibility (axe)', () => {
  it('collapsed state is axe-clean', async () => {
    const { container } = render(<GovBanner />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('expanded state is axe-clean', async () => {
    const { container } = render(<GovBanner defaultExpanded />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean after expanding and collapsing interactively', async () => {
    const user = userEvent.setup()
    const { container } = render(<GovBanner />)
    const button = screen.getByRole('button')

    await user.click(button)
    expect(await axeCheck(container)).toHaveNoViolations()

    await user.click(button)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('collapsed state with every string prop overridden is axe-clean', async () => {
    const { container } = render(
      <GovBanner
        ariaLabel="Custom banner label"
        entity="the Town of Riverdale"
        bannerText="A verified website of {entity}"
        actionText="Learn how to verify"
        domainHeading="Custom domain heading"
        domainText="Custom domain body."
        httpsHeading="Custom HTTPS heading"
        httpsText="Custom HTTPS body."
      />
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('expanded state with overridden explainer strings and children is axe-clean', async () => {
    const { container } = render(
      <GovBanner
        defaultExpanded
        domainHeading="Custom domain heading"
        domainText="Custom domain body."
        httpsHeading="Custom HTTPS heading"
        httpsText="Custom HTTPS body."
      >
        <p>Extra explainer content</p>
      </GovBanner>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('GovBanner name, role, and value', () => {
  it('renders a labelled region landmark', () => {
    render(<GovBanner />)
    expect(
      screen.getByRole('region', { name: 'Official local government website' })
    ).toHaveAttribute('data-slot', 'gov-banner')
  })

  it('accepts a custom region label', () => {
    render(<GovBanner ariaLabel="Sitio web oficial del gobierno" />)
    expect(
      screen.getByRole('region', { name: 'Sitio web oficial del gobierno' })
    ).toBeInTheDocument()
  })

  it('renders a native disclosure button with its accessible name', () => {
    render(<GovBanner />)
    const button = screen.getByRole('button', {
      name: 'How to verify this site',
    })
    expect(button.tagName).toBe('BUTTON')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('wires aria-expanded and aria-controls to the explainer content', () => {
    render(<GovBanner />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-expanded', 'false')

    const contentId = button.getAttribute('aria-controls')
    expect(contentId).toBeTruthy()
    // eslint-disable-next-line testing-library/no-node-access
    const content = document.getElementById(contentId as string)
    expect(content).toBeInTheDocument()
    expect(content).toHaveAttribute('hidden')
  })

  it('interpolates the entity into the default banner text', () => {
    render(<GovBanner entity="the City of Springfield" />)
    expect(screen.getByText('An official website of the City of Springfield')).toBeInTheDocument()
  })

  it('uses the default entity when none is given', () => {
    render(<GovBanner />)
    expect(screen.getByText('An official website of your local government')).toBeInTheDocument()
  })

  it('accepts a custom agency mark or no mark', () => {
    const { container, rerender } = render(
      <GovBanner brandMark={<img src="/city-seal.svg" alt="" />} />
    )
    const mark = container.querySelector('[data-slot="gov-banner-brand-mark"]')
    expect(mark).toContainElement(screen.getByRole('presentation'))

    rerender(<GovBanner brandMark={null} />)
    expect(container.querySelector('[data-slot="gov-banner-brand-mark"]')).not.toBeInTheDocument()
  })

  it('accepts custom explainer icons independently', () => {
    const { container } = render(
      <GovBanner
        defaultExpanded
        identityIcon={<span data-testid="custom-identity-icon">Identity</span>}
        securityIcon={null}
      />
    )

    expect(screen.getByTestId('custom-identity-icon')).toBeVisible()
    expect(
      container.querySelector('[data-slot="gov-banner-security-icon"]')
    ).not.toBeInTheDocument()
  })
})

describe('GovBanner keyboard contract', () => {
  it('Tab moves focus to the disclosure button and Enter toggles it', async () => {
    const user = userEvent.setup()
    render(<GovBanner />)
    const button = screen.getByRole('button')

    await user.tab()
    expect(button).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(button).toHaveAttribute('aria-expanded', 'true')

    await user.keyboard('{Enter}')
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('Space toggles the disclosure', async () => {
    const user = userEvent.setup()
    render(<GovBanner />)

    await user.tab()
    await user.keyboard(' ')
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
  })

  it('supports a controlled expanded state', async () => {
    const user = userEvent.setup()
    const onExpandedChange = vi.fn()
    const { rerender } = render(<GovBanner expanded={false} onExpandedChange={onExpandedChange} />)

    await user.click(screen.getByRole('button'))
    expect(onExpandedChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')

    rerender(<GovBanner expanded onExpandedChange={onExpandedChange} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
  })
})

describe('GovBanner expanded content', () => {
  it('keeps the explainer in the DOM while collapsed (hidden attribute)', () => {
    render(<GovBanner />)
    // Content is present for find-in-page/SR consistency but hidden.
    const heading = screen.getByText('Check who runs this website')
    expect(heading).toBeInTheDocument()
    expect(heading).not.toBeVisible()
  })

  it('reveals the explainer when toggled and hides it again', async () => {
    const user = userEvent.setup()
    render(<GovBanner />)
    const button = screen.getByRole('button')

    await user.click(button)
    expect(screen.getByText('Check who runs this website')).toBeVisible()
    expect(screen.getByText('Your connection should be secure')).toBeVisible()

    await user.click(button)
    expect(screen.getByText('Check who runs this website')).not.toBeVisible()
  })

  it('supports defaultExpanded', () => {
    render(<GovBanner defaultExpanded />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Check who runs this website')).toBeVisible()
  })

  it('shows both default explainer bodies when expanded', () => {
    render(<GovBanner defaultExpanded />)
    expect(screen.getByText(/managed by your local government/)).toBeVisible()
    expect(screen.getByText(/Encryption protects information in transit/)).toBeVisible()
  })

  it('lets explainer columns shrink at narrow widths and enlarged text', () => {
    const { container } = render(<GovBanner defaultExpanded />)
    const explainers = container.querySelectorAll('[data-slot="gov-banner-explainer"]')

    expect(explainers).toHaveLength(2)
    for (const explainer of explainers) {
      expect(explainer).toHaveClass('min-w-0', 'basis-64')
      expect(explainer).not.toHaveClass('min-w-64')
    }
  })
})

describe('GovBanner string overrides (i18n)', () => {
  it('renders fully translated Spanish strings', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <GovBanner
        lang="es"
        ariaLabel="Sitio web oficial del gobierno"
        entity="el Condado de Maricopa"
        bannerText="Un sitio web oficial de {entity}"
        actionText="Así es como usted puede verificarlo"
        identityHeading="Verifique quién administra este sitio"
        identityText="Este sitio web es administrado por {entity}. Confirme la dirección antes de compartir información personal."
        securityHeading="Su conexión debe ser segura"
        securityText="Busque https:// y el indicador de conexión segura de su navegador."
      />
    )

    expect(screen.getByText('Un sitio web oficial de el Condado de Maricopa')).toBeInTheDocument()

    const button = screen.getByRole('button', {
      name: 'Así es como usted puede verificarlo',
    })
    await user.click(button)

    expect(screen.getByText('Verifique quién administra este sitio')).toBeVisible()
    expect(screen.getByText('Su conexión debe ser segura')).toBeVisible()
    expect(screen.getByText(/administrado por el Condado de Maricopa/)).toBeVisible()
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('accepts a bannerText without the {entity} placeholder', () => {
    render(<GovBanner bannerText="An official website" />)
    expect(screen.getByText('An official website')).toBeInTheDocument()
  })

  it('overrides actionText on the disclosure button', () => {
    render(<GovBanner actionText="Learn how to verify" />)
    expect(screen.getByRole('button', { name: 'Learn how to verify' })).toBeInTheDocument()
  })

  it('overrides domainHeading independently and keeps the other defaults', () => {
    render(<GovBanner defaultExpanded domainHeading="Custom domain heading" />)
    expect(screen.getByText('Custom domain heading')).toBeVisible()
    expect(screen.getByText('Your connection should be secure')).toBeVisible()
  })

  it('overrides domainText independently', () => {
    render(<GovBanner defaultExpanded domainText="Custom domain body." />)
    expect(screen.getByText('Custom domain body.')).toBeVisible()
    expect(screen.queryByText(/managed by your local government/)).not.toBeInTheDocument()
  })

  it('overrides httpsHeading independently and keeps the other defaults', () => {
    render(<GovBanner defaultExpanded httpsHeading="Custom HTTPS heading" />)
    expect(screen.getByText('Custom HTTPS heading')).toBeVisible()
    expect(screen.getByText('Check who runs this website')).toBeVisible()
  })

  it('overrides httpsText independently', () => {
    render(<GovBanner defaultExpanded httpsText="Custom HTTPS body." />)
    expect(screen.getByText('Custom HTTPS body.')).toBeVisible()
    expect(screen.queryByText(/Encryption protects information in transit/)).not.toBeInTheDocument()
  })

  it('interpolates a custom entity into a custom bannerText', () => {
    render(
      <GovBanner entity="the City of Springfield" bannerText="A verified website of {entity}" />
    )
    expect(screen.getByText('A verified website of the City of Springfield')).toBeInTheDocument()
  })
})

describe('GovBanner RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <GovBanner
          lang="ar"
          ariaLabel="موقع حكومي رسمي"
          bannerText="موقع رسمي تابع لـ {entity}"
          entity="حكومتك المحلية"
          actionText="إليك كيف تتحقق"
          defaultExpanded
        />
      </div>
    )

    expect(screen.getByText('موقع رسمي تابع لـ حكومتك المحلية')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'إليك كيف تتحقق' })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})
