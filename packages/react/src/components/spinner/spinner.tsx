// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/cn'

export const spinnerVariants = cva(
  // Inline SVG (background-image icons vanish in forced-colors mode), stroked
  // with `currentColor` so it inherits the surrounding text color and stays
  // visible in forced-colors mode. Spins only when motion is allowed; reduced
  // motion leaves a static ring, and the adjacent status text carries meaning.
  // The `-0.0625em` block-start inset lifts the icon onto the optical center
  // of adjacent text: the ring centers geometrically on the line box, but
  // Atkinson Hyperlegible's letterforms sit high in that box, so an un-nudged
  // spinner reads low beside a label (inline or inside a button). The nudge is
  // em-relative, so it scales with size, and is invisible when the spinner
  // stands alone.
  ['relative shrink-0 motion-safe:animate-spin [inset-block-start:-0.0625em]'],
  {
    variants: {
      // rem-based sizes via Tailwind's size scale (size-3 = 0.75rem,
      // size-4 = 1rem, size-5 = 1.25rem).
      size: {
        sm: 'size-3',
        md: 'size-4',
        lg: 'size-5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

function SpinnerIcon({ className }: { className?: string }): React.JSX.Element {
  // Same visual language as the Button's internal spinner: a faint full ring
  // plus a solid quarter-arc, both stroked with currentColor.
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path
        d="M14.5 8a6.5 6.5 0 0 0-6.5-6.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

interface SpinnerBaseProps extends VariantProps<typeof spinnerVariants> {
  /** Additional classes for the SVG. */
  className?: string
}

export interface SpinnerProps
  extends SpinnerBaseProps,
    Omit<React.HTMLAttributes<HTMLSpanElement>, keyof SpinnerBaseProps | 'aria-label'> {
  /**
   * Visually hidden text announced by screen readers while loading. A spinning
   * icon conveys nothing to a stationary assistive technology, so the Spinner
   * wraps the icon in a polite `role="status"` live region and renders this
   * text inside it. Translation-ready: pass a localized string.
   * @default "Loading"
   */
  label?: string
  /**
   * Provide the status text through `aria-label` on the `role="status"`
   * wrapper instead of visually-hidden text. Use when you do not want the
   * label in the accessibility tree's text tree but still need a name.
   */
  'aria-label'?: string
  /**
   * Mark the spinner purely decorative: the icon is `aria-hidden` and no
   * `role="status"` region is rendered. Use this only when an adjacent
   * element already announces the loading state (e.g. a Button in its loading
   * state, or a sibling status message), so the wait is not announced twice.
   * @default false
   */
  decorative?: boolean
}

/**
 * An accessible loading indicator. By default the spinning icon is paired
 * with a status message inside a polite `role="status"` live region, because
 * a purely visual spinner is invisible to a stationary screen reader. Set
 * `decorative` when a sibling already announces the wait.
 */
export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { className, size, label = 'Loading', decorative = false, 'aria-label': ariaLabel, ...props },
  ref
) {
  // `role="status"` does not take its accessible name from its contents, so
  // the visually hidden label is wired up with `aria-labelledby` to name the
  // region — while still being the text the live region announces.
  const labelId = React.useId()
  const icon = <SpinnerIcon className={cn(spinnerVariants({ size }), className)} />

  // Decorative: no status role, icon hidden — a sibling owns the announcement.
  if (decorative) {
    return (
      <span {...props} ref={ref} data-slot="spinner" aria-hidden="true" className="inline-flex items-center">
        {icon}
      </span>
    )
  }

  // Named via aria-label: the status region carries the name, no visible text.
  if (ariaLabel != null) {
    return (
      <span
        {...props}
        ref={ref}
        data-slot="spinner"
        role="status"
        aria-live="polite"
        aria-label={ariaLabel}
        className="inline-flex items-center"
      >
        {icon}
      </span>
    )
  }

  // Default: polite live region with visually hidden status text.
  return (
    <span
      {...props}
      ref={ref}
      data-slot="spinner"
      role="status"
      aria-live="polite"
      aria-labelledby={labelId}
      className="inline-flex items-center"
    >
      {icon}
      <span id={labelId} className="sr-only">
        {label}
      </span>
    </span>
  )
})
