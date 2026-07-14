// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/cn'

// ---------------------------------------------------------------------------
// Range helper
// ---------------------------------------------------------------------------

/** One slot in a pagination range: a page number or an overflow marker. */
export type PaginationRangeItem = number | 'ellipsis'

function rangeOf(start: number, end: number): number[] {
  const out: number[] = []
  for (let page = start; page <= end; page += 1) {
    out.push(page)
  }
  return out
}

/**
 * Compute the visible page slots for a pagination control.
 *
 * Always includes the first page, the last page, and `siblingCount`
 * pages on each side of `current`; gaps collapse to `"ellipsis"`
 * markers. The result has a constant length (`2 * siblingCount + 5`
 * slots) once `total` is large enough, so the control does not change
 * width as the user moves through pages.
 *
 * - `total < 1` returns `[]`.
 * - `current` is clamped into `[1, total]`.
 * - When every page fits (`total <= 2 * siblingCount + 5`), all pages
 *   are returned and no ellipsis appears.
 */
export function paginationRange(
  current: number,
  total: number,
  siblingCount = 1
): PaginationRangeItem[] {
  const totalPages = Math.trunc(total)
  if (!Number.isFinite(totalPages) || totalPages < 1) {
    return []
  }
  const siblings = Math.max(Math.trunc(siblingCount), 0)
  const clamped = Math.min(Math.max(Math.trunc(current) || 1, 1), totalPages)

  // first + last + current + siblings on both sides + the two slots an
  // ellipsis would otherwise occupy.
  const maxSlots = siblings * 2 + 5
  if (totalPages <= maxSlots) {
    return rangeOf(1, totalPages)
  }

  const leftSibling = Math.max(clamped - siblings, 1)
  const rightSibling = Math.min(clamped + siblings, totalPages)
  const showLeftEllipsis = leftSibling > 2
  const showRightEllipsis = rightSibling < totalPages - 1

  if (!showLeftEllipsis && showRightEllipsis) {
    // Near the start: grow the leading run so length stays constant.
    return [...rangeOf(1, maxSlots - 2), 'ellipsis', totalPages]
  }
  if (showLeftEllipsis && !showRightEllipsis) {
    // Near the end: grow the trailing run so length stays constant.
    return [1, 'ellipsis', ...rangeOf(totalPages - (maxSlots - 3), totalPages)]
  }
  return [1, 'ellipsis', ...rangeOf(leftSibling, rightSibling), 'ellipsis', totalPages]
}

// ---------------------------------------------------------------------------
// Shared control styling
// ---------------------------------------------------------------------------

export const paginationControlVariants = cva(
  // Every control is a real link or button with a >= 44px hit area
  // (min-h-11 = 2.75rem) and a border: transparent on plain controls so
  // forced-colors mode still paints a boundary, visible on the current
  // page so "you are here" is never conveyed by color alone.
  [
    'inline-flex min-h-11 cursor-pointer select-none items-center justify-center',
    'rounded-md border bg-transparent text-sm underline-offset-2',
    'transition-colors motion-reduce:transition-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    '[&_svg]:pointer-events-none [&_svg]:size-[1em] [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        // A numbered page: square-ish 44px target.
        page: 'min-w-11 px-05',
        // Previous/Next: text + directional icon.
        direction: 'gap-05 px-105',
      },
      current: {
        // Current page: aria-current plus TWO non-color signals — a
        // visible border and heavier weight.
        true: 'border-border-strong font-semibold text-foreground',
        false: 'border-transparent text-link hover:text-link-hover hover:underline',
      },
    },
    defaultVariants: {
      variant: 'page',
      current: false,
    },
  }
)

/**
 * Props shared by every pagination control. Each control renders a real
 * `<a>` when `href` is given, otherwise a `<button type="button">` —
 * link-based pagination for server-rendered pages, callback-based for
 * client-side data tables. Never both patterns faked with one element.
 */
interface PaginationControlOwnProps {
  /** Destination URL. Present → renders `<a>`; absent → `<button type="button">`. */
  href?: string
}

type PaginationControlProps = PaginationControlOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, 'aria-current'>

type ControlElement = HTMLAnchorElement | HTMLButtonElement

const PaginationControl = React.forwardRef<
  ControlElement,
  PaginationControlProps & { 'aria-current'?: 'page'; 'data-slot': string }
>(function PaginationControl({ href, children, ...props }, ref) {
  if (href != null) {
    return (
      <a {...props} ref={ref as React.Ref<HTMLAnchorElement>} href={href}>
        {children}
      </a>
    )
  }
  return (
    <button
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
    >
      {children}
    </button>
  )
})

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

/**
 * Directional chevron for Previous/Next. Decorative (`aria-hidden`) —
 * the accessible name comes from the visible label text. Mirrors in RTL
 * (`rtl:-scale-x-100`): "previous" always points against the reading
 * direction, "next" along it.
 */
function Chevron(props: { direction: 'previous' | 'next' }): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="rtl:-scale-x-100"
    >
      <path
        d={props.direction === 'previous' ? 'M10 3.5 5.5 8l4.5 4.5' : 'm6 3.5 4.5 4.5L6 12.5'}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Accessible name for the pagination landmark. Translation-ready:
   * pass a localized string.
   * @default "Pagination"
   */
  label?: string
}

/**
 * Splits long result sets into pages. Renders a `<nav>` landmark
 * containing an ordered list of page controls.
 *
 * Bounds behavior (documented choice, matching USWDS): at the first
 * page, do not render `PaginationPrevious` at all — and likewise
 * `PaginationNext` at the last page. Nothing disabled-but-focusable is
 * left in the tab order, and screen reader users never hear a control
 * that does nothing.
 */
export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(function Pagination(
  { label = 'Pagination', className, ...props },
  ref
) {
  return (
    <nav {...props} ref={ref} aria-label={label} data-slot="pagination" className={cn(className)} />
  )
})

export interface PaginationListProps extends React.OlHTMLAttributes<HTMLOListElement> {}

/**
 * The ordered list of pagination controls. An `<ol>` because the pages
 * are an ordered sequence; wraps on narrow viewports (WCAG 1.4.10).
 */
export const PaginationList = React.forwardRef<HTMLOListElement, PaginationListProps>(
  function PaginationList({ className, ...props }, ref) {
    return (
      <ol
        {...props}
        ref={ref}
        data-slot="pagination-list"
        className={cn(
          'm-0 flex list-none flex-wrap items-center justify-center gap-05 p-0',
          className
        )}
      />
    )
  }
)

export interface PaginationItemProps extends React.LiHTMLAttributes<HTMLLIElement> {}

/** One slot in the pagination list. */
export const PaginationItem = React.forwardRef<HTMLLIElement, PaginationItemProps>(
  function PaginationItem({ className, ...props }, ref) {
    return <li {...props} ref={ref} data-slot="pagination-item" className={cn('flex', className)} />
  }
)

export interface PaginationPageProps extends PaginationControlProps {
  /**
   * Marks this page as the one the user is on: adds
   * `aria-current="page"` plus non-color styling (visible border,
   * heavier weight). The current page stays focusable and activatable —
   * re-activating it is a no-op navigation, not an error.
   */
  current?: boolean
}

/**
 * A numbered page control. Renders `<a>` with `href`, otherwise
 * `<button type="button">` (pass `onClick`). The visible number is the
 * accessible name; pass `aria-label` (e.g. `"Page 3"`) for a more
 * descriptive announcement.
 */
export const PaginationPage = React.forwardRef<ControlElement, PaginationPageProps>(
  function PaginationPage({ current = false, className, ...props }, ref) {
    return (
      <PaginationControl
        {...props}
        ref={ref}
        data-slot="pagination-page"
        aria-current={current ? 'page' : undefined}
        className={cn(paginationControlVariants({ variant: 'page', current }), className)}
      />
    )
  }
)

export interface PaginationPreviousProps extends PaginationControlProps {
  /**
   * Visible text and accessible name of the control.
   * Translation-ready: pass a localized string.
   * @default "Previous"
   */
  label?: string
}

/**
 * Goes to the previous page. On the first page, render nothing instead
 * of a disabled control (USWDS behavior — see `Pagination`).
 */
export const PaginationPrevious = React.forwardRef<ControlElement, PaginationPreviousProps>(
  function PaginationPrevious({ label = 'Previous', className, ...props }, ref) {
    return (
      <PaginationControl
        {...props}
        ref={ref}
        data-slot="pagination-previous"
        className={cn(paginationControlVariants({ variant: 'direction' }), className)}
      >
        <Chevron direction="previous" />
        {label}
      </PaginationControl>
    )
  }
)

export interface PaginationNextProps extends PaginationControlProps {
  /**
   * Visible text and accessible name of the control.
   * Translation-ready: pass a localized string.
   * @default "Next"
   */
  label?: string
}

/**
 * Goes to the next page. On the last page, render nothing instead of a
 * disabled control (USWDS behavior — see `Pagination`).
 */
export const PaginationNext = React.forwardRef<ControlElement, PaginationNextProps>(
  function PaginationNext({ label = 'Next', className, ...props }, ref) {
    return (
      <PaginationControl
        {...props}
        ref={ref}
        data-slot="pagination-next"
        className={cn(paginationControlVariants({ variant: 'direction' }), className)}
      >
        {label}
        <Chevron direction="next" />
      </PaginationControl>
    )
  }
)

export interface PaginationEllipsisProps extends React.HTMLAttributes<HTMLSpanElement> {}

/**
 * Overflow marker for pages collapsed out of the range. Purely visual:
 * an `aria-hidden` span, never focusable, never announced — screen
 * reader users get the structure from the list itself ("list, N items")
 * and the first/last page numbers.
 */
export const PaginationEllipsis = React.forwardRef<HTMLSpanElement, PaginationEllipsisProps>(
  function PaginationEllipsis({ className, children, ...props }, ref) {
    return (
      <span
        {...props}
        ref={ref}
        aria-hidden="true"
        data-slot="pagination-ellipsis"
        className={cn(
          'inline-flex min-h-11 min-w-11 select-none items-center justify-center',
          'text-sm text-muted-foreground',
          className
        )}
      >
        {children ?? '…'}
      </span>
    )
  }
)
