// SPDX-License-Identifier: MIT

import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const embla = vi.hoisted(() => {
  const listeners = new Map<string, (api: unknown) => void>()
  const api = {
    selectedScrollSnap: vi.fn(() => 0),
    scrollSnapList: vi.fn(() => [0, 1, 2]),
    canScrollPrev: vi.fn(() => false),
    canScrollNext: vi.fn(() => true),
    scrollPrev: vi.fn(),
    scrollNext: vi.fn(),
    scrollTo: vi.fn(),
    on: vi.fn((name: string, callback: (value: unknown) => void) => {
      listeners.set(name, callback)
      return api
    }),
    off: vi.fn((name: string) => {
      listeners.delete(name)
      return api
    }),
  }
  return { api, listeners, hook: vi.fn(() => [vi.fn(), api]) }
})

vi.mock('embla-carousel-react', () => ({ default: embla.hook }))

import {
  Carousel,
  CarouselContent,
  CarouselControls,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselStatus,
} from '@/components/carousel'
import { axeCheck } from '../../../test/setup.js'

function matchMedia(matches = false): typeof window.matchMedia {
  return vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

function Example(props: Partial<React.ComponentProps<typeof Carousel>> = {}) {
  return (
    <Carousel label="Featured services" {...props}>
      <CarouselContent>
        <CarouselItem>Permits</CarouselItem>
        <CarouselItem>Trash pickup</CarouselItem>
        <CarouselItem>Public meetings</CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots />
      <CarouselStatus />
    </Carousel>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  embla.api.selectedScrollSnap.mockReturnValue(0)
  embla.api.scrollSnapList.mockReturnValue([0, 1, 2])
  embla.api.canScrollPrev.mockReturnValue(false)
  embla.api.canScrollNext.mockReturnValue(true)
  window.matchMedia = matchMedia(false)
})

describe('Carousel accessibility and structure', () => {
  it('is a named, axe-clean carousel with named slides and a live status', async () => {
    const { container } = render(<Example />)
    const region = screen.getByRole('region', { name: 'Featured services' })
    expect(region).toHaveAttribute('aria-roledescription', 'carousel')
    expect(region).toHaveAttribute('dir', 'ltr')
    expect(screen.getAllByRole('group')).toHaveLength(3)
    expect(screen.getByRole('group', { name: 'Slide 2 of 3' })).toHaveTextContent('Trash pickup')
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent('Slide 1 of 3')
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('supports localized control, slide, dot, and status names', () => {
    const { container } = render(
      <Example
        label="الخدمات المميزة"
        dir="rtl"
        previousLabel="الشريحة السابقة"
        nextLabel="الشريحة التالية"
        getSlideLabel={(index, count) => `${index + 1} من ${count}`}
        getDotLabel={(index, count) => `انتقل إلى ${index + 1} من ${count}`}
        statusLabel={(index, count) => `المعروض ${index + 1} من ${count}`}
      />
    )
    expect(screen.getByRole('button', { name: 'الشريحة السابقة' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: '2 من 3' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'انتقل إلى 3 من 3' })).toBeInTheDocument()
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent('المعروض 1 من 3')
    expect(container.querySelector('[data-slot="carousel-status"]')).toHaveTextContent('المعروض 1 من 3')
  })

  it('offers visible API-backed position text without a duplicate announcement', () => {
    render(<Example />)
    const status = screen.getByText('Slide 1 of 3', { selector: '[data-slot="carousel-status"]' })
    expect(status).toHaveAttribute('aria-hidden', 'true')
    expect(status).toHaveClass('tabular-nums', 'pt-[0.3125rem]')
  })
})

describe('Carousel controls', () => {
  it('uses native 44px controls, disables at bounds, and scrolls without autoplay', async () => {
    const user = userEvent.setup()
    render(<Example />)
    const previous = screen.getByRole('button', { name: 'Previous slide' })
    const next = screen.getByRole('button', { name: 'Next slide' })
    expect(previous).toBeDisabled()
    expect(next).not.toBeDisabled()
    expect(previous).toHaveClass('min-h-11', 'min-w-11')
    await user.click(next)
    expect(embla.api.scrollNext).toHaveBeenCalledWith(false)
  })

  it('renders 44px dots with a non-color current state and scrolls to a chosen slide', async () => {
    const user = userEvent.setup()
    render(<Example />)
    const dots = [1, 2, 3].map((number) =>
      screen.getByRole('button', { name: `Go to slide ${number} of 3` })
    )
    expect(dots[0]).toHaveAttribute('aria-current', 'true')
    expect(dots[0]).toHaveClass('min-h-11', 'min-w-11')
    await user.click(dots[2]!)
    expect(embla.api.scrollTo).toHaveBeenCalledWith(2, false)
  })

  it('uses instant control movement when reduced motion is requested', async () => {
    window.matchMedia = matchMedia(true)
    const user = userEvent.setup()
    render(<Example />)
    await user.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(embla.api.scrollNext).toHaveBeenCalledWith(true)
  })
})

describe('Carousel keyboard and direction', () => {
  it('uses left/right in LTR and does not consume arrows inside an input', () => {
    render(
      <Carousel label="Services">
        <input aria-label="Filter" />
      </Carousel>
    )
    const region = screen.getByRole('region', { name: 'Services' })
    fireEvent.keyDown(region, { key: 'ArrowRight' })
    fireEvent.keyDown(region, { key: 'ArrowLeft' })
    expect(embla.api.scrollNext).toHaveBeenCalledTimes(1)
    expect(embla.api.scrollPrev).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Filter' }), { key: 'ArrowRight' })
    expect(embla.api.scrollNext).toHaveBeenCalledTimes(1)
  })

  it('flips horizontal arrows in RTL and uses up/down vertically', () => {
    const { rerender } = render(
      <Carousel label="RTL" dir="rtl"><CarouselPrevious /><CarouselNext /></Carousel>
    )
    fireEvent.keyDown(screen.getByRole('region', { name: 'RTL' }), { key: 'ArrowLeft' })
    expect(embla.api.scrollNext).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Previous slide' }).querySelector('svg'))
      .not.toHaveClass('rotate-180')
    expect(screen.getByRole('button', { name: 'Next slide' }).querySelector('svg'))
      .toHaveClass('rotate-180')

    rerender(
      <Carousel label="Vertical" orientation="vertical"><CarouselPrevious /><CarouselNext /></Carousel>
    )
    const region = screen.getByRole('region', { name: 'Vertical' })
    fireEvent.keyDown(region, { key: 'ArrowDown' })
    fireEvent.keyDown(region, { key: 'ArrowUp' })
    expect(embla.api.scrollNext).toHaveBeenCalledTimes(2)
    expect(embla.api.scrollPrev).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Previous slide' }).querySelector('svg'))
      .toHaveClass('-rotate-90')
    expect(screen.getByRole('button', { name: 'Next slide' }).querySelector('svg'))
      .toHaveClass('rotate-90')
  })

  it('forwards refs and custom classes to the public parts', () => {
    const rootRef = React.createRef<HTMLDivElement>()
    render(
      <Carousel ref={rootRef} label="Refs" className="root-class">
        <CarouselContent className="track-class"><CarouselItem>One</CarouselItem></CarouselContent>
      </Carousel>
    )
    expect(rootRef.current).toHaveClass('root-class')
    expect(within(rootRef.current!).getByRole('group')).toHaveClass('basis-full')
    expect(rootRef.current?.querySelector('[data-slot="carousel-content"]')).toHaveClass('track-class')
  })

  it('provides a separated control row that reports orientation', () => {
    render(
      <Carousel label="Vertical" orientation="vertical">
        <CarouselControls className="custom-controls">
          <CarouselPrevious /><CarouselStatus /><CarouselNext />
        </CarouselControls>
      </Carousel>
    )
    const controls = screen.getByText('Slide 1 of 3', { selector: '[data-slot="carousel-status"]' }).parentElement
    expect(controls).toHaveAttribute('data-slot', 'carousel-controls')
    expect(controls).toHaveAttribute('data-orientation', 'vertical')
    expect(controls).toHaveClass('custom-controls')
    expect(controls).toHaveStyle({ marginBlockStart: 'var(--cui-spacing-2)' })
  })
})
