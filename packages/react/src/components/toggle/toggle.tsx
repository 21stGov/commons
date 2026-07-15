// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

'use client'

import { Toggle as BaseToggle, type ToggleProps as BaseToggleProps } from '@base-ui/react/toggle'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/cn'

// Minimal ambient typing so the dev-only guard compiles without
// @types/node. Bundlers statically replace `process.env.NODE_ENV`.
declare const process: { env: { NODE_ENV?: string | undefined } } | undefined

export const toggleVariants = cva(
  // Base: a two-state button (Base UI Toggle → native `<button>` with
  // `aria-pressed`) plus Commons accessibility defaults.
  // - Every variant keeps a border so the control has a visible boundary in
  //   forced-colors mode (transparent borders are painted there).
  // - The PRESSED state is never signaled by color alone (WCAG 1.4.1): the
  //   content is nudged in (`translate-y-px` — a "pressed-in" position cue)
  //   AND the border switches to the primary token, so on/off survives
  //   forced-colors mode where the pressed FILL color is overridden.
  //   `translate-y` is a block-axis (vertical) transform, so it needs no RTL
  //   mirror — direction only flips the inline (horizontal) axis.
  // - Focus ring: 2px outline with offset, token-driven.
  // - rem-only font sizes; logical properties only (no ml-/pl-/left-).
  [
    // w-fit keeps the toggle sized to its content (with the size variant's
    // min-w-11 as the 44px floor for icon-only) so it never stretches to full
    // width when it lands in a stretching flex/grid parent — an icon toggle
    // must stay a compact square, not a full-bleed bar.
    'relative inline-flex w-fit min-w-0 cursor-pointer select-none items-center justify-center text-center',
    'rounded-sm border text-sm font-medium leading-snug',
    'transition-colors motion-reduce:transition-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    'data-[disabled]:cursor-not-allowed data-[disabled]:border-disabled-border data-[disabled]:bg-disabled data-[disabled]:text-disabled-foreground data-[disabled]:shadow-none',
    'data-[pressed]:[&_[data-slot=toggle-content]]:translate-y-px',
    '[&_svg]:pointer-events-none [&_svg]:size-2 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        // Bordered resting state → filled + primary border when pressed.
        outline: [
          'border-border-strong bg-transparent text-foreground shadow-1',
          'hover:bg-muted active:bg-muted',
          'data-[pressed]:border-primary data-[pressed]:bg-primary data-[pressed]:text-primary-foreground data-[pressed]:shadow-none',
          'data-[pressed]:hover:bg-primary-hover',
        ],
        // Chromeless resting state for icon toolbars; a primary border appears
        // on press so the boundary is never color-only.
        ghost: [
          'border-transparent bg-transparent text-foreground',
          'hover:bg-muted active:bg-muted',
          'data-[pressed]:border-primary data-[pressed]:bg-primary data-[pressed]:text-primary-foreground',
          'data-[pressed]:hover:bg-primary-hover',
        ],
      },
      // Every size meets the 44px (2.75rem) Commons target-size default on BOTH
      // axes (min-w-11 keeps an icon-only toggle ≥44px wide): min-h/w-11 =
      // 2.75rem, 12 = 3rem, 14 = 3.5rem.
      size: {
        sm: 'min-h-11 min-w-11 px-105 py-05 text-sm',
        md: 'min-h-12 min-w-12 px-2 py-1 text-sm',
        lg: 'min-h-14 min-w-14 px-3 py-105 text-base',
      },
    },
    defaultVariants: {
      variant: 'outline',
      size: 'md',
    },
  }
)

export interface ToggleProps
  extends Omit<BaseToggleProps<string>, 'className' | 'render'>,
    VariantProps<typeof toggleVariants> {
  /** Internal composition marker; defaults to `toggle`. */
  'data-slot'?: string
  /** Extra classes merged onto the button. */
  className?: string
}

/**
 * A two-state button that stays "on" while pressed — for in-context
 * formatting or filter presses (Bold, Show map, Grid view). Built on Base UI's
 * Toggle, so it renders a native `<button>` exposing `aria-pressed` and toggles
 * with Enter/Space. State is announced by `aria-pressed` and shown visually by
 * a filled background PLUS a "pressed-in" position/border cue, so it is never
 * color-only (WCAG 1.4.1) and survives Windows High Contrast / forced-colors.
 *
 * Use a Toggle for an immediate two-state press that keeps its state in view;
 * use a Checkbox for a form value submitted with a form, and a Switch for a
 * setting that takes effect immediately as an on/off row.
 *
 * Icon-only toggles MUST set an accessible name (`aria-label`) and should carry
 * a matching tooltip — a dev-only guard warns when the name is missing.
 */
export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  { className, variant, size, children, 'data-slot': dataSlot = 'toggle', ...props },
  ref
) {
  const innerRef = React.useRef<HTMLButtonElement | null>(null)
  const warnedRef = React.useRef(false)

  // Dev-only guard: an icon-only toggle must still have an accessible name
  // (WCAG 4.1.2). Checked after render against the rendered node.
  React.useEffect(() => {
    if (
      (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') ||
      warnedRef.current
    ) {
      return
    }
    const node = innerRef.current
    if (!node) {
      return
    }
    const hasName =
      (node.textContent ?? '').trim().length > 0 ||
      node.hasAttribute('aria-label') ||
      node.hasAttribute('aria-labelledby') ||
      node.hasAttribute('title')
    if (!hasName) {
      warnedRef.current = true
      console.warn(
        '[commons] <Toggle> has no accessible name. Icon-only toggles must ' +
          'set `aria-label` (e.g. <Toggle aria-label="Bold">) plus a matching tooltip.'
      )
    }
  })

  return (
    <BaseToggle
      {...props}
      ref={(node) => {
        innerRef.current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      }}
      data-slot={dataSlot}
      className={cn(toggleVariants({ variant, size }), className)}
    >
      <span
        data-slot="toggle-content"
        className={cn(
          'relative inline-flex items-center justify-center gap-1 [inset-block-start:0.0625em]',
          '[&:has(>svg:only-child)]:[inset-block-start:0]',
          'transition-transform motion-reduce:transition-none'
        )}
      >
        {children}
      </span>
    </BaseToggle>
  )
})
