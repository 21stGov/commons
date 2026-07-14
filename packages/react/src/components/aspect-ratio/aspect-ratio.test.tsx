// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it } from 'vitest'

import { AspectRatio } from '@/components/aspect-ratio'
import { expectNonInteractive } from '../../../test/keyboard.js'
import { axeCheck } from '../../../test/setup.js'

describe('AspectRatio accessibility', () => {
  it('is axe-clean with an informative image', async () => {
    const { container } = render(
      <AspectRatio ratio={16 / 9}>
        <img src="/city-hall.jpg" alt="City Hall entrance" />
      </AspectRatio>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean in RTL because its geometry is direction-neutral', async () => {
    const { container } = render(
      <div dir="rtl">
        <AspectRatio ratio={4 / 3} />
      </div>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('AspectRatio contract', () => {
  it('sets the native CSS aspect-ratio from width divided by height', () => {
    render(<AspectRatio ratio={16 / 9} data-testid="ratio" />)
    expect(screen.getByTestId('ratio')).toHaveStyle({ aspectRatio: String(16 / 9) })
  })

  it('renders a neutral div and does not invent media semantics', () => {
    render(<AspectRatio ratio={1} data-testid="ratio" />)
    const root = screen.getByTestId('ratio')
    expect(root.tagName).toBe('DIV')
    expect(root).not.toHaveAttribute('role')
    expect(root).not.toHaveAttribute('aria-label')
    expect(root).toHaveAttribute('data-slot', 'aspect-ratio')
  })

  it('forwards children, attributes, className, and refs', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <AspectRatio ref={ref} ratio={1} lang="es" className="custom-ratio">
        <span>Vista previa</span>
      </AspectRatio>
    )

    expect(screen.getByText('Vista previa')).toBeInTheDocument()
    expect(ref.current).toHaveAttribute('lang', 'es')
    expect(ref.current).toHaveClass('custom-ratio', 'min-w-0', 'w-full')
  })

  it('composes other inline styles while the ratio prop remains authoritative', () => {
    render(
      <AspectRatio
        ratio={4 / 3}
        style={{ opacity: 0.5, aspectRatio: '1' }}
        data-testid="ratio"
      />
    )
    const root = screen.getByTestId('ratio')
    expect(root).toHaveStyle({ opacity: '0.5' })
    expect(root.style.aspectRatio).toContain(String(4 / 3))
  })

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects the invalid ratio %s',
    (ratio) => {
      expect(() => render(<AspectRatio ratio={ratio} />)).toThrow(/finite number greater than 0/)
    }
  )
})

describe('AspectRatio keyboard contract (verified)', () => {
  // Verifies accessibility.keyboard: this component adds no tab stop / keyboard behavior.
  it('exposes no keyboard focus surface', () => {
    const { container } = render(
      <AspectRatio ratio={16 / 9}>
        <img src="/city-hall.jpg" alt="City Hall entrance" />
      </AspectRatio>,
    )
    expectNonInteractive(container)
  })
})
