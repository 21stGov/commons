// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it } from 'vitest'

import {
  ScrollArea,
  scrollAreaScrollbarVariants,
  scrollAreaThumbVariants,
} from '@/components/scroll-area'
import { axeCheck } from '../../../test/setup.js'

// A tall block of content so the region has something to scroll. jsdom has no
// layout engine, so we never assert scroll offsets or thumb sizes here — we
// assert structure, roles, data-slots, props, and the on-token/forced-colors
// class contract (via the exported cva variants).
function LongContent(): React.JSX.Element {
  return (
    <>
      {Array.from({ length: 20 }, (_, i) => (
        <p key={i}>Row {i + 1}</p>
      ))}
    </>
  )
}

describe('ScrollArea accessibility (axe)', () => {
  it('vertical (default) is axe-clean', async () => {
    const { container } = render(
      <ScrollArea className="h-40">
        <LongContent />
      </ScrollArea>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('horizontal is axe-clean', async () => {
    const { container } = render(
      <ScrollArea orientation="horizontal" className="w-40">
        <div className="w-[80rem]">Wide content</div>
      </ScrollArea>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('both axes is axe-clean', async () => {
    const { container } = render(
      <ScrollArea orientation="both" className="h-40 w-40">
        <div className="w-[80rem]">
          <LongContent />
        </div>
      </ScrollArea>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean when labelling the scrolled content at the call site', async () => {
    const { container } = render(
      <section aria-label="Meeting minutes">
        <ScrollArea className="h-40">
          <LongContent />
        </ScrollArea>
      </section>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <ScrollArea className="h-40">
          <LongContent />
        </ScrollArea>
      </div>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('ScrollArea structure and slots', () => {
  it('renders the root, viewport, and content slots wrapping the children', () => {
    const { container } = render(
      <ScrollArea>
        <p>Hello</p>
      </ScrollArea>
    )

    const root = container.querySelector('[data-slot="scroll-area"]')
    const viewport = container.querySelector('[data-slot="scroll-area-viewport"]')
    const content = container.querySelector('[data-slot="scroll-area-content"]')

    expect(root).not.toBeNull()
    expect(viewport).not.toBeNull()
    expect(content).not.toBeNull()
    // Nesting: root > viewport > content > children.
    expect(root).toContainElement(viewport as HTMLElement)
    expect(viewport).toContainElement(content as HTMLElement)
    expect(content).toContainElement(screen.getByText('Hello'))
  })

  it('applies className to the viewport (where the box size is set) and rootClassName to the root', () => {
    const { container } = render(
      <ScrollArea className="h-40 max-h-64" rootClassName="rounded-md border">
        <p>Body</p>
      </ScrollArea>
    )

    const root = container.querySelector('[data-slot="scroll-area"]')
    const viewport = container.querySelector('[data-slot="scroll-area-viewport"]')

    expect(viewport?.className).toContain('h-40')
    expect(viewport?.className).toContain('max-h-64')
    expect(root?.className).toContain('rounded-md')
    expect(root?.className).toContain('border')
  })

  it('keeps the content natively scrollable (a real scrolling viewport, not a scroll trap)', () => {
    const { container } = render(
      <ScrollArea className="h-40">
        <LongContent />
      </ScrollArea>
    )
    // Base UI renders a presentational viewport that owns native overflow
    // scrolling and is keyboard-reachable; we don't hide or replace it.
    const viewport = container.querySelector('[data-slot="scroll-area-viewport"]')
    expect(viewport).toHaveAttribute('role', 'presentation')
  })

  it('forwards the ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <ScrollArea ref={ref}>
        <p>Body</p>
      </ScrollArea>
    )
    expect(ref.current).not.toBeNull()
    expect(ref.current).toHaveAttribute('data-slot', 'scroll-area')
  })
})

describe('ScrollArea scrollbar/thumb variant contract', () => {
  it('sets the cross-axis thickness per orientation', () => {
    expect(scrollAreaScrollbarVariants({ orientation: 'vertical' })).toContain('w-[0.75rem]')
    expect(scrollAreaScrollbarVariants({ orientation: 'horizontal' })).toContain('h-[0.75rem]')
  })

  it('keeps a visible border in every state for forced-colors mode (not color alone)', () => {
    // A transparent border paints as a visible boundary in forced-colors mode.
    expect(scrollAreaScrollbarVariants({ orientation: 'vertical' })).toContain('border')
    expect(scrollAreaThumbVariants({ orientation: 'vertical' })).toContain('border')
  })

  it('floors the thumb at the 44px minimum target on its scroll axis', () => {
    expect(scrollAreaThumbVariants({ orientation: 'vertical' })).toContain('min-h-11')
    expect(scrollAreaThumbVariants({ orientation: 'horizontal' })).toContain('min-w-11')
  })

  it('uses an on-token muted thumb fill with a hover affordance', () => {
    const thumb = scrollAreaThumbVariants({ orientation: 'vertical' })
    expect(thumb).toContain('bg-border-strong')
    expect(thumb).toContain('hover:bg-muted-foreground')
  })

  it('disables transitions for reduced-motion users', () => {
    expect(scrollAreaThumbVariants({ orientation: 'vertical' })).toContain(
      'motion-reduce:transition-none'
    )
    expect(scrollAreaScrollbarVariants({ orientation: 'vertical' })).toContain(
      'motion-reduce:transition-none'
    )
  })
})

describe('ScrollArea orientation', () => {
  it.each(['vertical', 'horizontal', 'both'] as const)(
    'renders the viewport and content for orientation=%s',
    (orientation) => {
      const { container } = render(
        <ScrollArea orientation={orientation}>
          <p>Body</p>
        </ScrollArea>
      )
      expect(
        container.querySelector('[data-slot="scroll-area-viewport"]')
      ).not.toBeNull()
      expect(screen.getByText('Body')).toBeInTheDocument()
    }
  )
})
