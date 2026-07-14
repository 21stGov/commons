// SPDX-License-Identifier: MIT

import * as React from 'react'

import { cn } from '@/lib/cn'

export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Width divided by height. Examples: `16 / 9`, `4 / 3`, or `1`.
   * Must be a finite number greater than zero.
   */
  ratio: number
}

/**
 * Gives its content a preferred width-to-height ratio using native CSS.
 *
 * The wrapper deliberately adds no role, accessible name, or media semantics:
 * those belong to its child. Images still need useful `alt` text (or `alt=""`
 * when decorative), videos still need captions, and interactive content still
 * needs an unclipped visible focus indicator.
 */
export const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  function AspectRatio({ ratio, className, style, ...props }, ref) {
    if (!Number.isFinite(ratio) || ratio <= 0) {
      throw new RangeError('[commons] <AspectRatio> `ratio` must be a finite number greater than 0.')
    }

    return (
      <div
        {...props}
        ref={ref}
        data-slot="aspect-ratio"
        // The ratio prop is the component's contract, so it wins over a
        // consumer-supplied style.aspectRatio while all other styles compose.
        style={{ ...style, aspectRatio: String(ratio) }}
        className={cn('relative block min-h-0 min-w-0 w-full', className)}
      />
    )
  }
)
