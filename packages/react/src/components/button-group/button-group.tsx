// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/cn'

// Minimal ambient typing so the dev-only guard compiles without
// @types/node. Bundlers statically replace `process.env.NODE_ENV`.
declare const process: { env: { NODE_ENV?: string | undefined } } | undefined

export const buttonGroupVariants = cva(
  [
    // `isolate` opens a stacking context so a focused child's z-index stays
    // scoped to the group; `inline-flex` keeps the group only as wide/tall as
    // its buttons.
    'isolate inline-flex',
    // Seam collapse — the group styles the PASSED buttons rather than rendering
    // its own, so each child keeps its variant, size, and 44px target while the
    // group owns the shared corners. Square EVERY child first, then re-round
    // only the outer corners in the orientation rules below. `!` wins over each
    // Commons <Button>'s own `rounded-sm` (otherwise equal specificity).
    '[&>*]:relative [&>*]:rounded-none!',
    // A focused control lifts above its siblings so its focus-visible ring —
    // which sits OUTSIDE the button via `outline-offset` — is not clipped by
    // the adjacent button that paints after it in source order. `focus-within`
    // also covers a focused descendant (e.g. a split-button menu trigger whose
    // real <button> is nested a level down).
    '[&>*:focus-visible]:z-10 [&>*:focus-within]:z-10',
  ],
  {
    variants: {
      orientation: {
        // Horizontal: pull each button a hairline toward the previous one so
        // the two adjacent borders overlap into a SINGLE seam, then round the
        // inline start/end corners with LOGICAL radii so the first/last
        // rounding flips correctly under `dir="rtl"`.
        horizontal: [
          'flex-row',
          '[&>*:not(:first-child)]:-ms-px',
          '[&>*:first-child]:rounded-s-sm!',
          '[&>*:last-child]:rounded-e-sm!',
        ],
        // Vertical: overlap the block-direction borders and round the top/bottom
        // corners. The block axis is not mirrored by RTL, so physical
        // top/bottom radii are correct here.
        vertical: [
          'flex-col',
          '[&>*:not(:first-child)]:-mt-px',
          '[&>*:first-child]:rounded-t-sm!',
          '[&>*:last-child]:rounded-b-sm!',
        ],
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  }
)

export interface ButtonGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof buttonGroupVariants> {
  /**
   * Accessible name for the group. Required: `role="group"` conveys nothing on
   * its own, so a screen reader would announce just "group" without it. Pass a
   * localized string (translation-ready), or use `aria-labelledby` instead when
   * the name already exists in visible text.
   */
  'aria-label'?: string
}

/**
 * Lays out related Commons `Button`s as one connected segment — a segmented
 * control of independent actions (e.g. Cut / Copy / Paste) or a split button
 * (a primary action attached to a menu trigger).
 *
 * Grouping is purely visual: the group collapses the seam between adjacent
 * buttons (shared border, only the OUTER corners rounded) but does not change
 * their behavior. Each child stays an independent action —
 *
 * - **Keyboard:** normal Tab order between buttons (NOT a radio/toggle group,
 *   so there is no roving `tabindex`); every button keeps its own focus-visible
 *   ring, and the focused button is lifted with `z-index` so that ring overlays
 *   its neighbors instead of being clipped by the collapsed seam.
 * - **Name:** the container is `role="group"` and REQUIRES an `aria-label`
 *   (or `aria-labelledby`); the buttons keep their own accessible names.
 * - **RTL:** the outer rounding uses logical radii, so the first button rounds
 *   the inline-start corners and the last rounds the inline-end corners,
 *   flipping automatically under `dir="rtl"`.
 * - **Forced colors:** each Commons `Button` keeps a real border in every
 *   state, so the seams stay visible in Windows High Contrast / forced-colors
 *   mode — the grouping never relies on color alone.
 *
 * For a set of mutually exclusive choices use a radio-group or toggle instead;
 * `ButtonGroup` is for a cluster of separate actions.
 */
export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { className, orientation, children, ...props },
  ref
) {
  const warnedRef = React.useRef(false)

  // Dev-only guard: a role=group with no accessible name announces as a bare
  // "group" (WCAG 4.1.2 / 1.3.1). Warn once so the missing name is caught in
  // development without a runtime cost in production.
  React.useEffect(() => {
    if (
      (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') ||
      warnedRef.current
    ) {
      return
    }
    const hasName =
      (props['aria-label'] != null && props['aria-label'] !== '') ||
      props['aria-labelledby'] != null
    if (!hasName) {
      warnedRef.current = true
      console.warn(
        '[commons] <ButtonGroup> requires an `aria-label` (or `aria-labelledby`). ' +
          'role="group" conveys nothing to a screen reader without an accessible name.'
      )
    }
  })

  return (
    <div
      {...props}
      ref={ref}
      role="group"
      data-slot="button-group"
      data-orientation={orientation ?? 'horizontal'}
      className={cn(buttonGroupVariants({ orientation }), className)}
    >
      {children}
    </div>
  )
})
