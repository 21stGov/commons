// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/cn'

export const separatorVariants = cva(
  // The element is a padded, centered flex box; the visible rule is a
  // *border* on a `::before` pseudo, centered in that padding. Two reasons:
  //   • Border, not background: forced-colors mode flattens backgrounds to
  //     Canvas (the line would vanish) but repaints borders with a system
  //     color, so the rule survives.
  //   • Padding, not margin, for the breathing room: the Commons reset zeroes
  //     margins on every element (`* { margin: 0 }`), so margin utilities are
  //     inert here — padding on the box is what actually separates neighbors.
  // The pseudo keeps the rule centered so the space is symmetric on both
  // sides. Consumers can shrink the space via `className` (padding wins by
  // tailwind-merge); the rule color overrides `before:border-*`.
  ['flex shrink-0 items-center justify-center'],
  {
    variants: {
      orientation: {
        // Horizontal line: block-axis padding gives top/bottom room; the
        // ::before draws a full-width top border, centered by the flex box.
        // Block axis is not mirrored by direction, so `border-t` is safe.
        horizontal: [
          'w-full py-2',
          'before:h-0 before:w-full before:border-t before:border-border before:content-[""]',
          'forced-colors:before:border-[CanvasText]',
        ],
        // Vertical line: inline-axis padding gives start/end room; the
        // ::before draws a start border and stretches to the box height.
        // `self-stretch` fills the cross axis of a flex row; add height on
        // the parent otherwise.
        vertical: [
          'self-stretch px-2',
          'before:w-0 before:self-stretch before:border-s before:border-border before:content-[""]',
          'forced-colors:before:border-[CanvasText]',
        ],
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  }
)

export interface SeparatorProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'role' | 'aria-orientation'>,
    VariantProps<typeof separatorVariants> {
  /**
   * Visual and semantic direction of the rule.
   * @default "horizontal"
   */
  orientation?: 'horizontal' | 'vertical'
  /**
   * When `true`, the separator is purely decorative: it is hidden from
   * assistive technology (`aria-hidden`) and exposes no role. Use this when
   * an adjacent heading, spacing, or grouping already conveys the boundary.
   * When `false` (default) it is a real `role="separator"` with an
   * `aria-orientation`, announced by screen readers.
   * @default false
   */
  decorative?: boolean
}

/**
 * A thin rule that separates or groups content. Renders a non-interactive
 * `<div>`: a semantic `role="separator"` by default, or an `aria-hidden`
 * decoration when `decorative`. The line survives Windows High Contrast /
 * forced-colors mode because it is drawn with a border, not a background.
 */
export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  { className, orientation = 'horizontal', decorative = false, ...props },
  ref
) {
  return (
    <div
      {...props}
      ref={ref}
      data-slot="separator"
      data-orientation={orientation}
      role={decorative ? undefined : 'separator'}
      aria-hidden={decorative ? true : undefined}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(separatorVariants({ orientation }), className)}
    />
  )
})
