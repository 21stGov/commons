// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { DirectionProvider } from '@base-ui/react/direction-provider'
import { Toolbar as BaseToolbar } from '@base-ui/react/toolbar'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

// Cross-component imports via the PUBLISHED layout specifier so the shipped
// source resolves in a consumer repo; `button` and `separator` are listed in
// registryDependencies so the import closure is satisfied.
import { Button, type ButtonProps } from '@/components/ui/button'
import { Separator, type SeparatorProps } from '@/components/ui/separator'
import { AmbientDirection } from '@/lib/ambient-direction'
import { cn } from '@/lib/cn'

// Minimal ambient typing so the dev-only guard compiles without
// @types/node. Bundlers statically replace `process.env.NODE_ENV`.
declare const process: { env: { NODE_ENV?: string | undefined } } | undefined

export const toolbarVariants = cva(
  // A `role="toolbar"` bar of related controls. Unlike button-group (visual
  // seam-collapse with normal Tab), the toolbar is ONE tab stop with roving
  // tabindex + arrow navigation, so `gap-05` keeps the controls visually
  // separated (each keeps its own 44px target and un-clipped focus ring).
  // `w-fit` hugs the controls by default; pass `w-full` for a stretched action
  // bar.
  ['flex w-fit gap-05'],
  {
    variants: {
      orientation: {
        // Inline row; arrow Left/Right move between items (RTL-aware).
        horizontal: 'flex-row items-center',
        // Block column; arrow Up/Down move between items. `items-stretch` gives
        // the controls a shared width so the column reads as one unit.
        vertical: 'flex-col items-stretch',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  }
)

type BaseToolbarRootProps = React.ComponentProps<typeof BaseToolbar.Root>

export interface ToolbarProps
  extends Omit<BaseToolbarRootProps, 'className' | 'render' | 'orientation'>,
    VariantProps<typeof toolbarVariants> {
  /** Internal composition marker; defaults to `toolbar`. */
  'data-slot'?: string
  /** Extra classes merged onto the toolbar container. */
  className?: string
  /**
   * Explicit reading direction. When set, it is fed straight to Base UI's
   * DirectionProvider (and the DOM `dir`) so arrow-key navigation flips to
   * match; when omitted, the toolbar follows the ambient DOM direction.
   */
  dir?: 'ltr' | 'rtl'
  /**
   * Accessible name for the toolbar. Required: `role="toolbar"` conveys nothing
   * on its own, so a screen reader would announce just "toolbar" without it.
   * Pass a localized string, or use `aria-labelledby` when the name already
   * exists in visible text.
   */
  'aria-label'?: string
}

/**
 * Groups a cluster of related controls (buttons, toggles, a separator, maybe an
 * input) into a single `role="toolbar"` with APG roving-tabindex navigation —
 * built on Base UI's Toolbar.
 *
 * This is the key difference from `ButtonGroup`, which is only visual grouping
 * with a normal Tab stop per button:
 *
 * - **Keyboard (APG):** the whole toolbar is ONE Tab stop; focus lands on a
 *   single item (roving tabindex). Arrow keys move focus between items —
 *   Left/Right on a horizontal toolbar (RTL-aware: in `dir="rtl"`, ArrowLeft
 *   moves to the next item that sits visually to the left), Up/Down on a
 *   vertical one. Focus loops at the ends by default (`loopFocus`). Disabled
 *   items that are not focusable-when-disabled are skipped.
 * - **Name:** the container REQUIRES an `aria-label` (or `aria-labelledby`); a
 *   dev-only guard warns when neither is present. Controls keep their own names.
 * - **RTL:** Base UI reads direction from its DirectionProvider, not the DOM
 *   `dir`. An explicit `dir` prop wins and is fed to the provider; otherwise
 *   `AmbientDirection` supplies the resolved DOM direction so arrow order
 *   matches the visual order — exactly like the native components.
 * - **Forced colors:** every control (Commons `Button`, `Toggle`, and the
 *   `ToolbarSeparator`) keeps a real border in each state, so the bar stays
 *   legible in Windows High Contrast / forced-colors mode; nothing relies on
 *   color alone.
 *
 * Compose `ToolbarButton` (a Commons `Button` wired into the roving tabindex),
 * `ToolbarGroup`, and `ToolbarSeparator`. A Commons `ToggleGroup` may be nested
 * directly — Base UI integrates it into the toolbar's single tab stop.
 *
 * Use a `Toolbar` when you want one tab stop with arrow navigation over a
 * cluster of controls (a text-editor formatting bar, a table action bar). Use
 * `ButtonGroup` for a simple segmented set of buttons with normal Tab order.
 */
export const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar(
  { className, orientation, dir, children, 'data-slot': dataSlot = 'toolbar', ...props },
  ref
) {
  const innerRef = React.useRef<HTMLDivElement | null>(null)
  const warnedRef = React.useRef(false)

  // Dev-only guard: a role=toolbar needs an accessible name (WCAG 1.3.1 /
  // 4.1.2) so screen-reader users hear what the control cluster is for.
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
        '[commons] <Toolbar> has no accessible name. Set `aria-label` or ' +
          '`aria-labelledby` so the toolbar announces what it controls (e.g. ' +
          '<Toolbar aria-label="Text formatting">).'
      )
    }
  }, [])

  const root = (
    <BaseToolbar.Root
      {...props}
      ref={(node) => {
        innerRef.current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      }}
      orientation={orientation ?? 'horizontal'}
      data-slot={dataSlot}
      className={cn(toolbarVariants({ orientation }), className)}
    >
      {children}
    </BaseToolbar.Root>
  )

  // An explicit `dir` prop wins and is fed straight to Base UI's provider.
  // Otherwise AmbientDirection detects the resolved DOM direction (global or a
  // local `dir="rtl"`) so arrow-key order follows `dir` with no prop, keeping
  // the explicit-prop escape hatch.
  if (dir === 'rtl' || dir === 'ltr') {
    return <DirectionProvider direction={dir}>{root}</DirectionProvider>
  }
  return <AmbientDirection>{root}</AmbientDirection>
})

export interface ToolbarButtonProps extends ButtonProps {
  /**
   * When `true`, the button stays focusable while disabled so it is not skipped
   * by arrow navigation (an APG toolbar keeps disabled items reachable). Base UI
   * sets `aria-disabled` instead of removing it from the roving tabindex.
   * @default true
   */
  focusableWhenDisabled?: boolean
}

/**
 * A Commons `Button` wired into the toolbar's roving tabindex. Renders the
 * Commons `Button` (via Base UI's `render`) so it keeps every variant, size,
 * 44px target, focus-visible ring, and forced-colors border — while Base UI
 * owns the arrow-key navigation and tabindex. Defaults to the chromeless
 * `ghost` variant that suits a toolbar; pass `variant`/`size` to override.
 */
export const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  function ToolbarButton(
    {
      variant = 'ghost',
      size,
      className,
      disabled,
      focusableWhenDisabled,
      children,
      'data-slot': dataSlot = 'toolbar-button',
      ...props
    },
    ref
  ) {
    return (
      <BaseToolbar.Button
        {...props}
        ref={ref}
        disabled={disabled}
        focusableWhenDisabled={focusableWhenDisabled}
        render={<Button variant={variant} size={size} />}
        data-slot={dataSlot}
        className={className}
      >
        {children}
      </BaseToolbar.Button>
    )
  }
)

type BaseToolbarGroupProps = React.ComponentProps<typeof BaseToolbar.Group>

export interface ToolbarGroupProps extends Omit<BaseToolbarGroupProps, 'className' | 'render'> {
  /** Internal composition marker; defaults to `toolbar-group`. */
  'data-slot'?: string
  /** Extra classes merged onto the group container. */
  className?: string
}

/**
 * Visually and semantically clusters a subset of toolbar items (e.g. all the
 * text-style toggles). Renders a `role="group"` inside the toolbar; pass
 * `aria-label` to name the cluster. Setting `disabled` disables every item in
 * the group at once.
 */
export const ToolbarGroup = React.forwardRef<HTMLDivElement, ToolbarGroupProps>(
  function ToolbarGroup(
    { className, children, 'data-slot': dataSlot = 'toolbar-group', ...props },
    ref
  ) {
    return (
      <BaseToolbar.Group
        {...props}
        ref={ref}
        data-slot={dataSlot}
        className={cn('flex items-center gap-05', className)}
      >
        {children}
      </BaseToolbar.Group>
    )
  }
)

export type ToolbarSeparatorProps = SeparatorProps

/**
 * A rule between clusters of toolbar controls. Reuses the Commons `Separator`,
 * so the line is drawn with a border (surviving forced-colors mode) and exposes
 * a real `role="separator"` with `aria-orientation`. Defaults to a `vertical`
 * rule for the common horizontal toolbar; pass `orientation="horizontal"` in a
 * vertical toolbar. `self-stretch` lets the vertical rule span the 44px control
 * height without clipping the neighbouring focus rings.
 */
export const ToolbarSeparator = React.forwardRef<HTMLDivElement, ToolbarSeparatorProps>(
  function ToolbarSeparator({ orientation = 'vertical', className, ...props }, ref) {
    return <Separator {...props} ref={ref} orientation={orientation} className={className} />
  }
)
