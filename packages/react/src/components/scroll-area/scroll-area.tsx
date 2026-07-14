// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area'
import { cva } from 'class-variance-authority'
import * as React from 'react'

import { AmbientDirection } from '@/lib/ambient-direction'
import { cn } from '@/lib/cn'

/**
 * The scrollable viewport. Base UI gives it `overflow: scroll`, `tabIndex=0`,
 * and `role="presentation"`, so NATIVE scrolling is fully intact: the wheel,
 * touch, and — crucially — the keyboard (arrows / PageUp / PageDown / Home /
 * End with the region focused) all work, and the region is reachable by Tab
 * (WCAG 2.1.1 keyboard, 2.4.3 focus order). We only paint a focus-visible ring
 * so the focusable region is discoverable, and set `overscroll-contain` so a
 * nested scroll does not chain into the page. The native OS scrollbar is
 * suppressed by Base UI and replaced with the styled overlay below — the
 * overlay is always visible while the content overflows, never a scroll trap.
 */
export const scrollAreaViewportVariants = cva([
  'size-full overscroll-contain rounded-[inherit]',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
])

/**
 * A scrollbar track. Base UI positions it absolutely against the root (block
 * edges for vertical, inline edges for horizontal) and reads `dir` from the
 * DirectionProvider, so under `dir="rtl"` the vertical bar sits on the inline
 * start — handled for us by `AmbientDirection`. We only set the cross-axis
 * thickness per orientation, disable text/touch selection while dragging, and
 * keep it visible whenever content overflows (no hover-only reveal, so the bar
 * stays usable for low-vision and motor users). Thickness ≈ 12px gives a
 * comfortable pointer target without an arbitrary token.
 */
export const scrollAreaScrollbarVariants = cva(
  [
    'flex touch-none select-none p-2px',
    'transition-colors motion-reduce:transition-none',
    // A transparent border becomes a visible boundary in forced-colors mode so
    // the track is perceivable even when background colors are overridden.
    'border border-transparent',
  ],
  {
    variants: {
      orientation: {
        vertical: 'w-[0.75rem] flex-col',
        horizontal: 'h-[0.75rem] flex-row',
      },
    },
    defaultVariants: { orientation: 'vertical' },
  }
)

/**
 * The draggable thumb. Its length ALONG THE SCROLL AXIS is set by Base UI as an
 * inline `height`/`width: var(--scroll-area-thumb-…)` (proportional to the
 * scrolled content); we must not let a flex rule override that, so the thumb is
 * NOT `flex-1` — instead it fills only the CROSS axis (`w-full` for a vertical
 * bar, `h-full` for a horizontal one) and takes its main-axis length from Base
 * UI. We floor that length at 44px on the scroll axis so it is never smaller
 * than the project minimum pointer target (WCAG 2.5.8). Colour is
 * `bg-border-strong` (a muted, on-token fill) that darkens to
 * `bg-muted-foreground` on hover — a redundant, non-color cue is unnecessary
 * because the thumb's POSITION and LENGTH already convey scroll state. A
 * transparent border paints as a visible outline in forced-colors mode so the
 * thumb never disappears into an overridden track.
 */
export const scrollAreaThumbVariants = cva(
  [
    'relative rounded-full bg-border-strong',
    'border border-transparent',
    'transition-colors motion-reduce:transition-none hover:bg-muted-foreground',
  ],
  {
    variants: {
      orientation: {
        vertical: 'w-full min-h-11',
        horizontal: 'h-full min-w-11',
      },
    },
    defaultVariants: { orientation: 'vertical' },
  }
)

type BaseRootProps = React.ComponentProps<typeof BaseScrollArea.Root>

export interface ScrollAreaProps
  extends Omit<BaseRootProps, 'className' | 'children'> {
  /**
   * Which axis (or axes) can overflow and get a styled scrollbar.
   * - `vertical` (default) — block-axis scrolling only.
   * - `horizontal` — inline-axis scrolling only.
   * - `both` — both axes, with a corner where the two bars meet.
   * @default 'vertical'
   */
  orientation?: 'vertical' | 'horizontal' | 'both'
  /**
   * The scrollable content.
   */
  children: React.ReactNode
  /**
   * Classes for the VIEWPORT — this is where you set the box's size, e.g.
   * `h-64`, `max-h-80`, `max-w-full`. The viewport is the element that
   * actually scrolls, so its height/max-height defines how much fits before
   * the scrollbar appears.
   */
  className?: string
  /** Classes for the outer root wrapper (rarely needed — usually a border/radius). */
  rootClassName?: string
}

/**
 * A scrollable region with a styled overlay scrollbar, built on Base UI's
 * ScrollArea. It never traps or hides scrolling: the viewport keeps native
 * `overflow: scroll`, is focusable (`tabIndex=0`) so keyboard scrolling works,
 * and the overlay scrollbar stays visible while content overflows. The OS
 * scrollbar is replaced — not removed — by an on-token thumb (`bg-border-strong`,
 * ≥44px on its axis) that darkens on hover and keeps a visible border in
 * forced-colors mode.
 *
 * Set the box size with `className` (applied to the viewport), e.g.
 * `<ScrollArea className="h-64">…</ScrollArea>`. Choose the axis with
 * `orientation`. Under `dir="rtl"` the vertical bar flips to the inline start
 * because the root is wrapped in `AmbientDirection`, matching the native
 * components. If a consumer copies this source into an environment without the
 * component's CSS, the underlying element still scrolls natively — the styling
 * is purely additive.
 *
 * This is a presentational container: it has no accessible name of its own.
 * When the scrollable content is a discrete landmark (a long list, a code
 * block, a table), give the region meaning at the call site with a heading or
 * `aria-label`/`role` on the content — not on the scroll machinery.
 */
export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  function ScrollArea(
    { orientation = 'vertical', children, className, rootClassName, ...props },
    ref
  ) {
    const showVertical = orientation === 'vertical' || orientation === 'both'
    const showHorizontal = orientation === 'horizontal' || orientation === 'both'

    return (
      // AmbientDirection feeds the DOM `dir` (global or a local `dir="rtl"`) to
      // Base UI's DirectionProvider, so the vertical scrollbar sits on the
      // correct inline edge and horizontal scrolling anchors correctly —
      // Base UI reads a provider, not the DOM attribute.
      <AmbientDirection>
        <BaseScrollArea.Root
          {...props}
          ref={ref}
          data-slot="scroll-area"
          className={cn('relative overflow-hidden', rootClassName)}
        >
          <BaseScrollArea.Viewport
            data-slot="scroll-area-viewport"
            className={cn(scrollAreaViewportVariants(), className)}
          >
            <BaseScrollArea.Content data-slot="scroll-area-content">
              {children}
            </BaseScrollArea.Content>
          </BaseScrollArea.Viewport>

          {showVertical ? (
            <BaseScrollArea.Scrollbar
              orientation="vertical"
              data-slot="scroll-area-scrollbar"
              className={scrollAreaScrollbarVariants({ orientation: 'vertical' })}
            >
              <BaseScrollArea.Thumb
                data-slot="scroll-area-thumb"
                className={scrollAreaThumbVariants({ orientation: 'vertical' })}
              />
            </BaseScrollArea.Scrollbar>
          ) : null}

          {showHorizontal ? (
            <BaseScrollArea.Scrollbar
              orientation="horizontal"
              data-slot="scroll-area-scrollbar"
              className={scrollAreaScrollbarVariants({ orientation: 'horizontal' })}
            >
              <BaseScrollArea.Thumb
                data-slot="scroll-area-thumb"
                className={scrollAreaThumbVariants({ orientation: 'horizontal' })}
              />
            </BaseScrollArea.Scrollbar>
          ) : null}

          {showVertical && showHorizontal ? (
            <BaseScrollArea.Corner
              data-slot="scroll-area-corner"
              className="bg-transparent"
            />
          ) : null}
        </BaseScrollArea.Root>
      </AmbientDirection>
    )
  }
)

/**
 * The raw Base UI ScrollArea parts (`Root`, `Viewport`, `Content`, `Scrollbar`,
 * `Thumb`, `Corner`) for composing a layout the `<ScrollArea>` wrapper does not
 * cover. Style with the exported `scrollAreaScrollbarVariants` /
 * `scrollAreaThumbVariants` to stay on-token, and wrap the `Root` in
 * `AmbientDirection` yourself to keep RTL behavior.
 */
export const ScrollAreaPrimitive = BaseScrollArea
