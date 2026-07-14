// SPDX-License-Identifier: MIT
// Composition adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

'use client'

import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'

export type CarouselApi = NonNullable<UseEmblaCarouselType[1]>
export type CarouselOptions = NonNullable<Parameters<typeof useEmblaCarousel>[0]>
export type CarouselOrientation = 'horizontal' | 'vertical'
export type CarouselDirection = 'ltr' | 'rtl'

interface CarouselContextValue {
  viewportRef: UseEmblaCarouselType[0]
  api: CarouselApi | undefined
  orientation: CarouselOrientation
  direction: CarouselDirection
  selected: number
  count: number
  canScrollPrevious: boolean
  canScrollNext: boolean
  reducedMotion: boolean
  previousLabel: string
  nextLabel: string
  getSlideLabel: (index: number, count: number) => string
  getDotLabel: (index: number, count: number) => string
  statusLabel: (index: number, count: number) => string
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null)

function useCarouselContext(component: string): CarouselContextValue {
  const context = React.useContext(CarouselContext)
  if (!context) {
    throw new Error(`[commons] <${component}> must be rendered inside <Carousel>.`)
  }
  return context
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener?.('change', update)
    return () => query.removeEventListener?.('change', update)
  }, [])

  return reduced
}

export interface CarouselProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'dir'> {
  /** Descriptive landmark name, such as “Featured city services”. */
  label: string
  orientation?: CarouselOrientation
  /** Must match the surrounding text direction. @default "ltr" */
  dir?: CarouselDirection
  options?: Omit<CarouselOptions, 'axis' | 'direction'>
  setApi?: (api: CarouselApi) => void
  previousLabel?: string
  nextLabel?: string
  getSlideLabel?: (index: number, count: number) => string
  getDotLabel?: (index: number, count: number) => string
  statusLabel?: (index: number, count: number) => string
}

/**
 * Named carousel landmark with swipe support, native controls, arrow-key
 * navigation, a polite current-slide announcement, RTL, and reduced-motion
 * handling. Autoplay is intentionally not part of the Commons contract.
 */
export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(function Carousel(
  {
    className,
    label,
    orientation = 'horizontal',
    dir = 'ltr',
    options,
    setApi,
    previousLabel = 'Previous slide',
    nextLabel = 'Next slide',
    getSlideLabel = (index, count) => `Slide ${index + 1} of ${count}`,
    getDotLabel = (index, count) => `Go to slide ${index + 1} of ${count}`,
    statusLabel = (index, count) => `Slide ${index + 1} of ${count}`,
    onKeyDown,
    children,
    ...props
  },
  ref
) {
  const reducedMotion = useReducedMotion()
  const [viewportRef, api] = useEmblaCarousel({
    ...options,
    axis: orientation === 'horizontal' ? 'x' : 'y',
    direction: dir,
  })
  const [selected, setSelected] = React.useState(0)
  const [count, setCount] = React.useState(0)
  const [canScrollPrevious, setCanScrollPrevious] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const updateState = React.useCallback((instance: CarouselApi) => {
    setSelected(instance.selectedScrollSnap())
    setCount(instance.scrollSnapList().length)
    setCanScrollPrevious(instance.canScrollPrev())
    setCanScrollNext(instance.canScrollNext())
  }, [])

  React.useEffect(() => {
    if (!api) return undefined
    setApi?.(api)
    updateState(api)
    api.on('select', updateState)
    api.on('reInit', updateState)
    return () => {
      api.off('select', updateState)
      api.off('reInit', updateState)
    }
  }, [api, setApi, updateState])

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    onKeyDown?.(event)
    if (event.defaultPrevented || !api) return
    const target = event.target as HTMLElement
    if (target.matches('input, textarea, select, [contenteditable="true"]')) return

    const previousKey = orientation === 'vertical' ? 'ArrowUp' : dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft'
    const nextKey = orientation === 'vertical' ? 'ArrowDown' : dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
    if (event.key === previousKey) {
      event.preventDefault()
      api.scrollPrev(reducedMotion)
    } else if (event.key === nextKey) {
      event.preventDefault()
      api.scrollNext(reducedMotion)
    }
  }

  return (
    <CarouselContext.Provider
      value={{
        viewportRef,
        api,
        orientation,
        direction: dir,
        selected,
        count,
        canScrollPrevious,
        canScrollNext,
        reducedMotion,
        previousLabel,
        nextLabel,
        getSlideLabel,
        getDotLabel,
        statusLabel,
      }}
    >
      <div
        {...props}
        ref={ref}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        dir={dir}
        data-slot="carousel"
        data-orientation={orientation}
        onKeyDown={handleKeyDown}
        className={cn('relative min-w-0', className)}
      >
        {children}
        <p aria-live="polite" aria-atomic="true" className="sr-only">
          {count > 0 ? statusLabel(selected, count) : ''}
        </p>
      </div>
    </CarouselContext.Provider>
  )
})

export interface CarouselContentProps extends React.HTMLAttributes<HTMLDivElement> {
  viewportClassName?: string
}

export const CarouselContent = React.forwardRef<HTMLDivElement, CarouselContentProps>(
  function CarouselContent({ className, viewportClassName, children, ...props }, ref) {
    const context = useCarouselContext('CarouselContent')
    const slides = React.Children.toArray(children)
    return (
      <div
        ref={context.viewportRef}
        data-slot="carousel-viewport"
        className={cn(
          'overflow-hidden rounded-md',
          context.orientation === 'vertical' && 'h-80',
          viewportClassName
        )}
      >
        <div
          {...props}
          ref={ref}
          data-slot="carousel-content"
          className={cn(
            'flex touch-pan-y gap-2',
            context.orientation === 'vertical' && 'h-full flex-col touch-pan-x',
            className
          )}
        >
          {slides.map((child, index) =>
            React.isValidElement<CarouselItemProps>(child)
              ? React.cloneElement(child, {
                  'aria-label': child.props['aria-label'] ?? context.getSlideLabel(index, slides.length),
                })
              : child
          )}
        </div>
      </div>
    )
  }
)

export interface CarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CarouselItem = React.forwardRef<HTMLDivElement, CarouselItemProps>(function CarouselItem(
  { className, ...props },
  ref
) {
  const { orientation } = useCarouselContext('CarouselItem')
  return (
    <div
      {...props}
      ref={ref}
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        'min-w-0 shrink-0 grow-0 basis-full',
        orientation === 'vertical' && 'min-h-0',
        className
      )}
    />
  )
})

function ArrowIcon({ next, orientation, direction }: { next: boolean; orientation: CarouselOrientation; direction: CarouselDirection }): React.JSX.Element {
  const rotate =
    orientation === 'vertical'
      ? next
        ? 'rotate-90'
        : '-rotate-90'
      : next === (direction === 'ltr')
        ? ''
        : 'rotate-180'
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={cn('size-2', rotate)}>
      <path d="m6 3.5 4.5 4.5L6 12.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export type CarouselControlProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export const CarouselPrevious = React.forwardRef<HTMLButtonElement, CarouselControlProps>(
  function CarouselPrevious({ className, 'aria-label': ariaLabel, ...props }, ref) {
    const context = useCarouselContext('CarouselPrevious')
    return (
      <Button
        {...props}
        ref={ref}
        type="button"
        variant="outline"
        size="sm"
        data-slot="carousel-previous"
        aria-label={ariaLabel ?? context.previousLabel}
        disabled={props.disabled ?? !context.canScrollPrevious}
        onClick={(event) => {
          props.onClick?.(event)
          if (!event.defaultPrevented) context.api?.scrollPrev(context.reducedMotion)
        }}
        className={cn('min-w-11 shrink-0 rounded-full p-0', className)}
      >
        <ArrowIcon next={false} orientation={context.orientation} direction={context.direction} />
      </Button>
    )
  }
)

export const CarouselNext = React.forwardRef<HTMLButtonElement, CarouselControlProps>(
  function CarouselNext({ className, 'aria-label': ariaLabel, ...props }, ref) {
    const context = useCarouselContext('CarouselNext')
    return (
      <Button
        {...props}
        ref={ref}
        type="button"
        variant="outline"
        size="sm"
        data-slot="carousel-next"
        aria-label={ariaLabel ?? context.nextLabel}
        disabled={props.disabled ?? !context.canScrollNext}
        onClick={(event) => {
          props.onClick?.(event)
          if (!event.defaultPrevented) context.api?.scrollNext(context.reducedMotion)
        }}
        className={cn('min-w-11 shrink-0 rounded-full p-0', className)}
      >
        <ArrowIcon next orientation={context.orientation} direction={context.direction} />
      </Button>
    )
  }
)

export type CarouselDotsProps = React.HTMLAttributes<HTMLDivElement>

export const CarouselDots = React.forwardRef<HTMLDivElement, CarouselDotsProps>(function CarouselDots(
  { className, ...props },
  ref
) {
  const context = useCarouselContext('CarouselDots')
  return (
    <div {...props} ref={ref} data-slot="carousel-dots" className={cn('flex flex-wrap items-center justify-center gap-05', className)}>
      {Array.from({ length: context.count }, (_, index) => (
        <button
          key={index}
          type="button"
          aria-label={context.getDotLabel(index, context.count)}
          aria-current={context.selected === index ? 'true' : undefined}
          onClick={() => context.api?.scrollTo(index, context.reducedMotion)}
          className={cn(
            'inline-flex min-h-11 min-w-11 items-center justify-center rounded-full',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'block size-1 rounded-full border border-border-strong bg-transparent',
              context.selected === index && 'size-105 bg-foreground'
            )}
          />
        </button>
      ))}
    </div>
  )
})

export type CarouselControlsProps = React.HTMLAttributes<HTMLDivElement>

/**
 * Dedicated control row that keeps navigation outside the slide viewport.
 * Its explicit block gap prevents circular controls from colliding with the
 * frame at any text size.
 */
export const CarouselControls = React.forwardRef<HTMLDivElement, CarouselControlsProps>(
  function CarouselControls({ className, style, ...props }, ref) {
    const { orientation } = useCarouselContext('CarouselControls')
    return (
      <div
        {...props}
        ref={ref}
        data-slot="carousel-controls"
        data-orientation={orientation}
        style={{ marginBlockStart: 'var(--cui-spacing-2)', ...style }}
        className={cn('flex min-w-0 items-center justify-between gap-2', className)}
      />
    )
  }
)

export interface CarouselStatusProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Overrides the root's localized status formatter for this visible instance. */
  formatLabel?: (index: number, count: number) => string
}

/**
 * Visible API-backed position text. The root's single screen-reader-only live
 * region announces the same change, so this visual copy stays aria-hidden and
 * never causes a duplicate announcement.
 */
export const CarouselStatus = React.forwardRef<HTMLParagraphElement, CarouselStatusProps>(
  function CarouselStatus({ className, formatLabel, ...props }, ref) {
    const context = useCarouselContext('CarouselStatus')
    const label =
      context.count > 0
        ? (formatLabel ?? context.statusLabel)(context.selected, context.count)
        : ''
    return (
      <p
        {...props}
        ref={ref}
        aria-hidden="true"
        data-slot="carousel-status"
        className={cn(
          // Vertical padding split 5px/3px (from symmetric 4px) so the label
          // sits optically centered in the pill — the top-heavy font metrics
          // otherwise leave it ~1px high. (Replaces an inset-block-start nudge
          // that also pushed the pill 1px past the container edge.)
          'm-0 min-w-0 rounded-full border border-border bg-muted px-105 pt-[0.3125rem] pb-[0.1875rem]',
          'text-center text-sm font-medium leading-snug tabular-nums text-muted-foreground',
          className
        )}
      >
        {label}
      </p>
    )
  }
)
