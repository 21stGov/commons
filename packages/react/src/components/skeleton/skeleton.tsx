// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/cn'

export const skeletonVariants = cva(
  // A neutral placeholder block on a token surface. The pulse is gated behind
  // `motion-safe`, so reduced-motion users get a STATIC block with no shimmer
  // (WCAG 2.3.3 / prefers-reduced-motion). `bg-muted` is a theme token, never
  // a raw color. The block carries no text and is hidden from assistive tech.
  ['block bg-muted motion-safe:animate-pulse'],
  {
    variants: {
      variant: {
        // One line of text: height tracks the current font size (1em) so a
        // text-line placeholder matches the surrounding rem-based type. Set a
        // shorter width via `width` / className to suggest a partial line.
        text: 'h-[1em] w-full rounded-sm',
        // A rectangular content region (card, media, thumbnail). Give it a
        // height via `height` / className.
        block: 'w-full rounded-sm',
        // A circular placeholder (avatar). Square by aspect ratio; set a size
        // via `width` (height follows) or className.
        circle: 'aspect-square rounded-full',
      },
    },
    defaultVariants: {
      variant: 'block',
    },
  }
)

export type SkeletonVariant = NonNullable<VariantProps<typeof skeletonVariants>['variant']>

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof skeletonVariants> {
  /**
   * Convenience dimension mapped to the logical `inline-size`. Accepts any CSS
   * length or a number (px). Prefer this or `className` over inline layout
   * hacks. Directionally neutral — it does not flip in RTL.
   */
  width?: string | number
  /**
   * Convenience dimension mapped to the logical `block-size`. Accepts any CSS
   * length or a number (px).
   */
  height?: string | number
  /**
   * Optional visually-hidden loading message. When set, the Skeleton also
   * renders a sibling `role="status"` region so a screen reader hears that
   * content is loading — the placeholder itself stays `aria-hidden`.
   *
   * This is a convenience for a lone placeholder. When you render MANY
   * skeletons, prefer a single `role="status"` / `aria-busy="true"` container
   * around the whole loading region and omit `label` on each Skeleton (see the
   * component docs) so the load is announced once, not once per block.
   */
  label?: string
}

/**
 * A loading placeholder that mirrors the geometry of content that has not
 * arrived yet. It conveys NO progress or content to assistive technology and
 * is always `aria-hidden`; announce the loading state on a surrounding
 * `role="status"` / `aria-busy` container (or via `label`), never on the
 * placeholder itself. Reduced-motion users see a static block, not a shimmer.
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { className, variant, width, height, label, style, ...props },
  ref
) {
  const dimensionStyle: React.CSSProperties = {
    ...style,
    ...(width != null ? { inlineSize: width } : null),
    ...(height != null ? { blockSize: height } : null),
  }

  const placeholder = (
    <div
      {...props}
      ref={ref}
      // Enforced, never overridable: a skeleton must not be announced. It has
      // no accessible name, role, or progress semantics.
      aria-hidden="true"
      data-slot="skeleton"
      data-variant={variant ?? 'block'}
      style={dimensionStyle}
      className={cn(skeletonVariants({ variant }), className)}
    />
  )

  if (label == null || label === '') {
    return placeholder
  }

  return (
    <>
      <span role="status" className="sr-only">
        {label}
      </span>
      {placeholder}
    </>
  )
})
