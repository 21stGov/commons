// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it } from 'vitest'

import { Prose } from '@/components/prose'
import { expectNonInteractive } from '../../../test/keyboard.js'
import { axeCheck } from '../../../test/setup.js'

function Article(): React.JSX.Element {
  return (
    <Prose as="article" aria-label="Sample article">
      <h2>Applying for a building permit</h2>
      <p>
        Most residential projects require a permit before work begins. Review the checklist
        below and reach out to <a href="/contact">the permits office</a> with any questions.
      </p>
      <h3>What you will need</h3>
      <ul>
        <li>A completed application form</li>
        <li>Proof of property ownership</li>
        <li>
          Site plans that reference the <code>setback</code> requirements
        </li>
      </ul>
      <blockquote>
        <p>Permits typically process within 10 business days.</p>
      </blockquote>
      <pre>
        <code>{'GET /api/permits/status?id=1234'}</code>
      </pre>
      <hr />
      <p>Contact the office for further assistance.</p>
    </Prose>
  )
}

describe('Prose accessibility (axe)', () => {
  it('a representative article is axe-clean', async () => {
    const { container } = render(<Article />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('a table-bearing article is axe-clean', async () => {
    const { container } = render(
      <Prose>
        <table>
          <thead>
            <tr>
              <th scope="col">Fee</th>
              <th scope="col">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Base permit fee</td>
              <td>$125</td>
            </tr>
          </tbody>
        </table>
      </Prose>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('each size variant is axe-clean', async () => {
    for (const size of ['sm', 'base', 'lg'] as const) {
      const { container, unmount } = render(
        <Prose size={size}>
          <h2>Heading</h2>
          <p>Body copy.</p>
        </Prose>
      )
      expect(await axeCheck(container)).toHaveNoViolations()
      unmount()
    }
  })
})

describe('Prose structure', () => {
  it('renders as a plain div by default and forwards ref, class, and attributes', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <Prose ref={ref} lang="es" className="custom-prose">
        Contenido
      </Prose>
    )
    expect(ref.current?.tagName).toBe('DIV')
    expect(ref.current).toHaveAttribute('data-slot', 'prose')
    expect(ref.current).toHaveAttribute('lang', 'es')
    expect(ref.current).toHaveClass('custom-prose')
    expect(ref.current).not.toHaveAttribute('role')
  })

  it('renders its children verbatim without re-parsing or injecting props', () => {
    render(
      <Prose>
        <h2>Section heading</h2>
        <p>Some paragraph text.</p>
      </Prose>
    )
    expect(screen.getByRole('heading', { level: 2, name: 'Section heading' })).toBeInTheDocument()
    expect(screen.getByText('Some paragraph text.')).toBeInTheDocument()
  })

  it('renders the requested element via `as` without adding a role', () => {
    render(
      <Prose as="section" data-testid="prose-root">
        <p>Body</p>
      </Prose>
    )
    const root = screen.getByTestId('prose-root')
    expect(root.tagName).toBe('SECTION')
    expect(root).not.toHaveAttribute('role')
  })
})

describe('Prose size variant', () => {
  it('defaults to the base measure and type scale', () => {
    render(
      <Prose data-testid="prose-root">
        <p>Body</p>
      </Prose>
    )
    const root = screen.getByTestId('prose-root')
    expect(root).toHaveClass('max-w-measure-lg', 'text-md')
  })

  it('applies the sm size classes when requested', () => {
    render(
      <Prose size="sm" data-testid="prose-root">
        <p>Body</p>
      </Prose>
    )
    expect(screen.getByTestId('prose-root')).toHaveClass('max-w-measure-sm', 'text-sm')
  })

  it('applies the lg size classes when requested', () => {
    render(
      <Prose size="lg" data-testid="prose-root">
        <p>Body</p>
      </Prose>
    )
    expect(screen.getByTestId('prose-root')).toHaveClass('max-w-measure-xl', 'text-lg')
  })
})

describe('Prose keyboard contract (verified)', () => {
  // Verifies accessibility.keyboard: static content — no tab stop / keyboard behavior of its own.
  it('exposes no keyboard focus surface', () => {
    const { container } = render(
      <Prose>
        <p>Some body copy the consumer supplied.</p>
      </Prose>,
    )
    expectNonInteractive(container)
  })
})
