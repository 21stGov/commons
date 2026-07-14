// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { DirectionProvider } from '@base-ui/react/direction-provider'
import {
  ToggleGroup as BaseToggleGroup,
  type ToggleGroupProps as BaseToggleGroupProps,
} from '@base-ui/react/toggle-group'
import { cva } from 'class-variance-authority'
import * as React from 'react'

// Cross-component import via the PUBLISHED layout specifier so the shipped
// source resolves in a consumer repo; `toggle` is listed in
// registryDependencies so the import closure is satisfied.
import { Toggle } from '@/components/ui/toggle'
import { AmbientDirection } from '@/lib/ambient-direction'
import { cn } from '@/lib/cn'

// Minimal ambient typing so the dev-only guard compiles without
// @types/node. Bundlers statically replace `process.env.NODE_ENV`.
declare const process: { env: { NODE_ENV?: string | undefined } } | undefined

// Re-exported so a Toggle group is self-contained: consumers import both
// `ToggleGroup` and its `Toggle` items from the same module.
export { Toggle }

export const toggleGroupVariants = cva([
  // A role=group row of toggles. `w-fit` keeps the group hugging its items so
  // the accessible-name border does not stretch across the page.
  'inline-flex w-fit items-center gap-05',
  // Vertical groups stack and stretch their items to a shared width.
  'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
])

export interface ToggleGroupProps
  extends Omit<BaseToggleGroupProps<string>, 'className' | 'render'> {
  /** Internal composition marker; defaults to `toggle-group`. */
  'data-slot'?: string
  /** Extra classes merged onto the group container. */
  className?: string
  /**
   * Explicit reading direction. When set, it is fed straight to Base UI's
   * DirectionProvider (and the DOM `dir`) so arrow-key navigation flips to
   * match; when omitted, the group follows the ambient DOM direction.
   */
  dir?: 'ltr' | 'rtl'
}

/**
 * A set of related toggle buttons sharing one pressed state (APG toolbar-style
 * roving tabindex on Base UI's ToggleGroup). `single` selection (the default)
 * lets at most one item stay pressed; `multiple` lets several. The group is a
 * `role="group"` and MUST be named — pass `aria-label` or `aria-labelledby`
 * (a dev-only guard warns when neither is present).
 *
 * Keyboard (APG): one Tab stop lands on the group; Arrow keys move focus
 * between items (roving tabindex) and are RTL-aware — in `dir="rtl"`,
 * ArrowLeft moves to the NEXT item that sits visually to the left. Enter/Space
 * toggles the focused item; focus loops at the ends by default.
 *
 * RTL: Base UI reads direction from its DirectionProvider, not the DOM `dir`.
 * An explicit `dir` prop wins and is fed to the provider; otherwise
 * `AmbientDirection` supplies the resolved DOM direction so the group follows
 * `dir="rtl"` with no setup — exactly like the native components.
 *
 * Composes the Commons `Toggle` (re-exported here) for its items.
 */
export const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(function ToggleGroup(
  { className, dir, children, 'data-slot': dataSlot = 'toggle-group', ...props },
  ref
) {
  const innerRef = React.useRef<HTMLDivElement | null>(null)
  const warnedRef = React.useRef(false)

  // Dev-only guard: a role=group needs an accessible name (WCAG 1.3.1 / 4.1.2)
  // so screen-reader users hear what the toggle set controls.
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
    const hasName = node.hasAttribute('aria-label') || node.hasAttribute('aria-labelledby')
    if (!hasName) {
      warnedRef.current = true
      console.warn(
        '[commons] <ToggleGroup> has no accessible name. Set `aria-label` or ' +
          '`aria-labelledby` so the group announces what it controls (e.g. ' +
          '<ToggleGroup aria-label="Text formatting">).'
      )
    }
  }, [])

  const root = (
    <BaseToggleGroup
      {...props}
      ref={(node) => {
        innerRef.current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      }}
      dir={dir}
      data-slot={dataSlot}
      className={cn(toggleGroupVariants(), className)}
    >
      {children}
    </BaseToggleGroup>
  )

  // An explicit `dir` prop wins and is fed straight to Base UI's provider.
  // Otherwise AmbientDirection detects the resolved DOM direction (global or a
  // local `dir="rtl"`) and supplies it — so the group follows `dir` with no
  // prop, keeping the explicit-prop escape hatch.
  if (dir === 'rtl' || dir === 'ltr') {
    return <DirectionProvider direction={dir}>{root}</DirectionProvider>
  }
  return <AmbientDirection>{root}</AmbientDirection>
})
