// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Skeleton } from '@/components/skeleton'
import { axeCheck } from '../../../test/setup.js'

describe('Skeleton accessibility (axe)', () => {
  it('is axe-clean inside a labelled busy container', async () => {
    const { container } = render(
      <div role="status" aria-busy="true" aria-label="Loading results">
        <Skeleton variant="text" />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="block" height="8rem" />
        <Skeleton variant="circle" width="3rem" />
      </div>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean when it renders its own sr-only status label', async () => {
    const { container } = render(<Skeleton label="Loading your dashboard" />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Skeleton semantics', () => {
  it('is always aria-hidden and exposes no role, name, or progress semantics', () => {
    const { container } = render(<Skeleton />)
    const node = container.querySelector('[data-slot="skeleton"]')
    expect(node).not.toBeNull()
    expect(node).toHaveAttribute('aria-hidden', 'true')
    expect(node).not.toHaveAttribute('role')
    expect(node).not.toHaveAttribute('aria-valuenow')
    expect(node).not.toHaveAttribute('aria-label')
  })

  it('cannot have its aria-hidden overridden by a passed prop', () => {
    // Deliberately trying to expose the placeholder — the component must win.
    const { container } = render(<Skeleton aria-hidden={false as unknown as true} />)
    expect(container.querySelector('[data-slot="skeleton"]')).toHaveAttribute(
      'aria-hidden',
      'true'
    )
  })

  it('renders a static block under reduced motion (pulse is motion-safe only)', () => {
    const { container } = render(<Skeleton />)
    const node = container.querySelector('[data-slot="skeleton"]')
    // The animation is gated behind motion-safe; there is no unconditional
    // animate-* class that reduced-motion users would still see.
    expect(node?.className).toContain('motion-safe:animate-pulse')
    expect(node?.className).not.toContain(' animate-pulse')
    expect(node?.className.startsWith('animate-pulse')).toBe(false)
  })
})

describe('Skeleton shape variants', () => {
  it('defaults to the block shape', () => {
    const { container } = render(<Skeleton />)
    const node = container.querySelector('[data-slot="skeleton"]')
    expect(node).toHaveAttribute('data-variant', 'block')
    expect(node?.className).toContain('rounded-sm')
  })

  it('renders a text-line shape sized to the current font size', () => {
    const { container } = render(<Skeleton variant="text" />)
    const node = container.querySelector('[data-slot="skeleton"]')
    expect(node).toHaveAttribute('data-variant', 'text')
    expect(node?.className).toContain('h-[1em]')
  })

  it('renders a circle shape', () => {
    const { container } = render(<Skeleton variant="circle" width="2.5rem" />)
    const node = container.querySelector('[data-slot="skeleton"]')
    expect(node).toHaveAttribute('data-variant', 'circle')
    expect(node?.className).toContain('rounded-full')
    expect(node?.className).toContain('aspect-square')
  })

  it('maps width and height to logical inline-size and block-size', () => {
    const { container } = render(<Skeleton width="50%" height={40} />)
    const node = container.querySelector('[data-slot="skeleton"]') as HTMLElement
    expect(node.style.inlineSize).toBe('50%')
    expect(node.style.blockSize).toBe('40px')
  })
})

describe('Skeleton loading announcement', () => {
  it('renders an sr-only role=status region when a label is provided', () => {
    render(<Skeleton label="Loading your dashboard" />)
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Loading your dashboard')
    expect(status).toHaveClass('sr-only')
  })

  it('renders no status region without a label', () => {
    render(<Skeleton />)
    expect(screen.queryByRole('status')).toBeNull()
  })
})

describe('Skeleton RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <div role="status" aria-busy="true" aria-label="جارٍ التحميل">
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="circle" width="3rem" />
        </div>
      </div>
    )
    expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})
