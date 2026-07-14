// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it } from 'vitest'

import { Icon, SearchIcon, iconNames } from '@/components/icon'
import { axeCheck } from '../../../test/setup.js'

describe('Icon accessibility (axe)', () => {
  it('decorative icon (default) is axe-clean', async () => {
    const { container } = render(<Icon name="search" />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('labelled (meaningful) icon is axe-clean', async () => {
    const { container } = render(<Icon name="alert-triangle" label="Warning" />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('a labelled icon beside text is axe-clean', async () => {
    const { container } = render(
      <p>
        <Icon name="info" label="Note" /> Applications close Friday.
      </p>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('every curated glyph renders axe-clean when decorative', async () => {
    const { container } = render(
      <span>
        {iconNames.map((n) => (
          <Icon key={n} name={n} />
        ))}
      </span>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Icon accessibility contract', () => {
  it('is decorative by default: aria-hidden and focusable=false, not in the a11y tree', () => {
    const { container } = render(<Icon name="search" data-testid="i" />)
    const svg = container.querySelector('[data-slot="icon"]')!
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveAttribute('focusable', 'false')
    expect(svg).not.toHaveAttribute('role')
    // A decorative icon exposes no accessible image role.
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('becomes meaningful with a label: role=img and an accessible name', () => {
    render(<Icon name="alert-triangle" label="Warning" />)
    const img = screen.getByRole('img', { name: 'Warning' })
    expect(img).not.toHaveAttribute('aria-hidden')
  })

  it('a title also names the icon and renders a <title> element', () => {
    const { container } = render(<Icon name="clock" title="Due soon" />)
    const svg = container.querySelector('[data-slot="icon"]')!
    expect(svg).toHaveAttribute('role', 'img')
    expect(container.querySelector('title')).toHaveTextContent('Due soon')
    expect(screen.getByRole('img', { name: 'Due soon' })).toBeInTheDocument()
  })
})

describe('Icon paint and sizing', () => {
  it('strokes with currentColor so it inherits text color (forced-colors safe)', () => {
    const { container } = render(<Icon name="check" />)
    const svg = container.querySelector('[data-slot="icon"]')!
    expect(svg).toHaveAttribute('stroke', 'currentColor')
    expect(svg).toHaveAttribute('fill', 'none')
    expect(svg).toHaveAttribute('viewBox', '0 0 16 16')
  })

  it('defaults to 1em so it scales with adjacent text', () => {
    const { container } = render(<Icon name="check" />)
    // SVGElement.className is an SVGAnimatedString, not a string — read the
    // class attribute via jest-dom's toHaveClass (as pagination.test.tsx does).
    expect(container.querySelector('[data-slot="icon"]')).toHaveClass('size-[1em]')
  })

  it('supports named sizes', () => {
    const { container } = render(<Icon name="check" size="lg" />)
    expect(container.querySelector('[data-slot="icon"]')).toHaveClass('size-4')
  })

  it('lets an arbitrary size utility win via className', () => {
    const { container } = render(<Icon name="check" className="size-[3rem]" />)
    const svg = container.querySelector('[data-slot="icon"]')!
    expect(svg).toHaveClass('size-[3rem]')
    expect(svg).not.toHaveClass('size-[1em]')
  })
})

describe('Icon RTL mirroring', () => {
  it('flips directional glyphs (chevron, arrow, external-link) in RTL', () => {
    const { container } = render(<Icon name="chevron-right" />)
    expect(container.querySelector('[data-slot="icon"]')).toHaveClass('rtl:-scale-x-100')
  })

  it('does not flip non-directional glyphs', () => {
    const { container } = render(<Icon name="search" />)
    expect(container.querySelector('[data-slot="icon"]')).not.toHaveClass('rtl:-scale-x-100')
  })

  it('flip=false pins a directional glyph', () => {
    const { container } = render(<Icon name="chevron-right" flip={false} />)
    expect(container.querySelector('[data-slot="icon"]')).not.toHaveClass('rtl:-scale-x-100')
  })

  it('flip=true mirrors a custom glyph', () => {
    const { container } = render(
      <Icon flip>
        <path d="M2 8h12" />
      </Icon>
    )
    expect(container.querySelector('[data-slot="icon"]')).toHaveClass('rtl:-scale-x-100')
  })
})

describe('Icon custom glyphs and named exports', () => {
  it('renders custom children when no name is given', () => {
    const { container } = render(
      <Icon label="Custom">
        <path d="M2 8h12" data-testid="custom-path" />
      </Icon>
    )
    expect(container.querySelector('[data-testid="custom-path"]')).toBeInTheDocument()
  })

  it('named convenience component matches the name prop', () => {
    const { container } = render(<SearchIcon label="Search" />)
    expect(screen.getByRole('img', { name: 'Search' })).toBeInTheDocument()
    expect(container.querySelector('[data-slot="icon"]')).toBeInTheDocument()
  })

  it('exposes the full curated set via iconNames', () => {
    expect(iconNames).toContain('search')
    expect(iconNames).toContain('external-link')
    expect(iconNames.length).toBeGreaterThanOrEqual(18)
  })
})
