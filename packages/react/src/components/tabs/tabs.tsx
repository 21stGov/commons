// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { DirectionProvider } from '@base-ui/react/direction-provider'
import {
  Tabs as BaseTabs,
  type TabsListProps as BaseTabsListProps,
  type TabsPanelProps as BaseTabsPanelProps,
  type TabsRootProps as BaseTabsRootProps,
  type TabsRootOrientation,
  type TabsTabProps as BaseTabsTabProps,
  type TabsTabValue,
} from '@base-ui/react/tabs'
import { cva } from 'class-variance-authority'
import * as React from 'react'

import { AmbientDirection } from '@/lib/ambient-direction'
import { cn } from '@/lib/cn'

/** The value identifying a tab / panel pair. */
export type TabsValue = TabsTabValue

/** Layout flow of the tab list: `"horizontal"` (default) or `"vertical"`. */
export type TabsOrientation = TabsRootOrientation

export const tabsVariants = cva(
  // Root groups the list and the panels. Base UI stamps
  // `data-orientation` from the root's orientation prop, so a vertical
  // tabs group lays the list beside the panels with no extra wiring.
  ['flex flex-col', 'data-[orientation=vertical]:flex-row']
)

export const tabsListVariants = cva([
  // The list's border-block-end is the rail the active tab's indicator
  // sits on. Logical utilities only, so nothing needs mirroring in RTL.
  'flex flex-wrap items-end gap-1',
  'border-b border-border',
  // Vertical: stack the tabs and move the rail to the inline-end edge.
  'data-[orientation=vertical]:flex-col data-[orientation=vertical]:flex-nowrap',
  'data-[orientation=vertical]:items-stretch data-[orientation=vertical]:self-start',
  'data-[orientation=vertical]:border-b-0 data-[orientation=vertical]:border-e',
])

export const tabsTabVariants = cva([
  // Geometry: 44px (2.75rem) minimum target, rem font size, sharp corners.
  // The focus ring alone picks up rounded-sm, keeping the resting
  // geometry crisp while the ring reads as a distinct focus artifact.
  'relative inline-flex min-h-11 select-none items-center justify-center gap-1 px-2 text-sm',
  'cursor-pointer bg-transparent',
  'transition-colors motion-reduce:transition-none',
  'focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  // Every side keeps a transparent border so forced-colors mode paints a
  // boundary; the block-end side is 2px — the selected-state indicator
  // slot. `-mb-px` overlaps the list's 1px rail so the active indicator
  // replaces it instead of stacking under it.
  'border border-b-2 border-transparent',
  'data-[orientation=horizontal]:-mb-px',
  // Selected state is never color-only (WCAG 1.4.1): a 2px block-end
  // border in the primary token PLUS a font-weight change.
  'text-muted-foreground',
  'hover:bg-muted hover:text-foreground',
  'data-[active]:font-medium data-[active]:text-foreground',
  'data-[orientation=horizontal]:data-[active]:border-b-primary',
  // Vertical: indicator moves to the inline-end edge (logical, flips in
  // RTL) and labels align to the text start.
  'data-[orientation=vertical]:-me-px data-[orientation=vertical]:justify-start',
  'data-[orientation=vertical]:border-b data-[orientation=vertical]:border-e-2',
  'data-[orientation=vertical]:data-[active]:border-e-primary',
  // Disabled tabs stay visible but inert; arrow navigation skips them.
  'data-[disabled]:cursor-not-allowed data-[disabled]:text-disabled-foreground',
  'data-[disabled]:hover:bg-transparent',
])

export const tabsPanelVariants = cva([
  // Base UI keeps the open panel in the page tab order (tabindex="0"), so
  // it needs a visible focus indicator of its own.
  'pt-2 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  'data-[orientation=vertical]:pt-0 data-[orientation=vertical]:ps-2',
])

export interface TabsProps extends Omit<BaseTabsRootProps, 'className'> {
  className?: string
}

/**
 * Groups a tab list with its panels (APG Tabs pattern, on Base UI).
 * Uncontrolled via `defaultValue`, controlled via `value` +
 * `onValueChange`. `orientation` defaults to `"horizontal"`.
 *
 * RTL: Base UI reads text direction from its DirectionContext — not from
 * the DOM `dir` attribute — and defaults to LTR. Pass `dir="rtl"` here
 * (or wrap the app in Base UI's `DirectionProvider`) and Tabs provides
 * the context itself, so arrow-key navigation flips to match the visual
 * order: in RTL, ArrowLeft moves to the NEXT tab (which sits visually to
 * the left) and ArrowRight moves to the previous one.
 */
export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { className, dir, ...props },
  ref
) {
  const root = (
    <BaseTabs.Root
      {...props}
      dir={dir}
      ref={ref}
      data-slot="tabs"
      className={cn(tabsVariants(), className)}
    />
  )

  // An explicit `dir` prop wins and is fed straight to Base UI's provider.
  // Otherwise AmbientDirection detects the resolved DOM direction (global or a
  // local `dir="rtl"`) and supplies it — so Tabs follows `dir` with no prop,
  // like the native components, while keeping the explicit-prop escape hatch.
  if (dir === 'rtl' || dir === 'ltr') {
    return <DirectionProvider direction={dir}>{root}</DirectionProvider>
  }
  return <AmbientDirection>{root}</AmbientDirection>
})

export interface TabsListProps extends Omit<BaseTabsListProps, 'className'> {
  className?: string
  /**
   * Whether arrow-key focus also activates the focused tab (APG
   * "automatic activation"). Commons defaults to `true` — panels render
   * locally and instantly, so selection following focus is the least
   * surprising behavior. Note this flips Base UI v1.6's own default
   * (`false`, manual activation); pass `false` to require Enter/Space
   * when switching panels is expensive (e.g. triggers network fetches).
   * @default true
   */
  activateOnFocus?: boolean
}

/**
 * The `role="tablist"` container. Keyboard contract (Base UI):
 * - One tab stop: only the selected tab is in the page tab order
 *   (roving tabindex); Tab then moves on into the open panel.
 * - ArrowRight / ArrowLeft move between tabs when horizontal
 *   (ArrowDown / ArrowUp when vertical), wrapping at the ends
 *   (`loopFocus`, default `true`); disabled tabs are skipped.
 * - Home / End jump to the first / last enabled tab.
 * - Arrow keys follow reading direction in RTL (see `Tabs` on `dir`).
 *
 * The selected-tab indicator is the tab's own 2px block-end border
 * (see `TabsTab`) rather than Base UI's separate `Indicator` part: the
 * Indicator positions itself with measured pixel offsets exposed as
 * physical left/right CSS variables, which conflicts with the
 * logical-properties-only rule and adds a moving element that would need
 * reduced-motion handling. A static border needs neither.
 */
export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { className, activateOnFocus = true, onKeyDownCapture, ...props },
  ref
) {
  function handleKeyDownCapture(event: React.KeyboardEvent<HTMLDivElement>): void {
    ;(
      onKeyDownCapture as
        | ((consumerEvent: React.KeyboardEvent<HTMLDivElement>) => void)
        | undefined
    )?.(event)
    if (event.defaultPrevented) {
      return
    }

    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        '[role="tab"]:not([data-disabled]):not([aria-disabled="true"])'
      )
    )
    const currentIndex = tabs.indexOf(event.target as HTMLElement)
    if (currentIndex < 0 || tabs.length === 0) {
      return
    }

    const orientation = event.currentTarget.dataset.orientation ?? 'horizontal'
    const directionNode = event.currentTarget.closest<HTMLElement>('[dir]')
    const direction = directionNode?.dir || document.documentElement.dir || 'ltr'
    let nextIndex: number | undefined

    if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = tabs.length - 1
    } else if (orientation === 'vertical' && event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % tabs.length
    } else if (orientation === 'vertical' && event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
    } else if (orientation === 'horizontal' && event.key === 'ArrowRight') {
      const step = direction === 'rtl' ? -1 : 1
      nextIndex = (currentIndex + step + tabs.length) % tabs.length
    } else if (orientation === 'horizontal' && event.key === 'ArrowLeft') {
      const step = direction === 'rtl' ? 1 : -1
      nextIndex = (currentIndex + step + tabs.length) % tabs.length
    }

    if (nextIndex === undefined) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    tabs[nextIndex]?.focus()
  }

  return (
    <BaseTabs.List
      {...props}
      activateOnFocus={activateOnFocus}
      onKeyDownCapture={handleKeyDownCapture}
      ref={ref}
      data-slot="tabs-list"
      className={cn(tabsListVariants(), className)}
    />
  )
})

export interface TabsTabProps extends Omit<BaseTabsTabProps, 'className'> {
  className?: string
}

/**
 * An individual `role="tab"` button. Minimum 2.75rem (44px) target.
 * The selected state is a 2px block-end border in the primary token plus
 * a font-weight change — never color alone (WCAG 1.4.1). Base UI wires
 * `aria-selected`, `aria-controls`, and the roving `tabindex`.
 */
export const TabsTab = React.forwardRef<HTMLElement, TabsTabProps>(function TabsTab(
  { className, ...props },
  ref
) {
  return (
    <BaseTabs.Tab
      {...props}
      ref={ref}
      data-slot="tabs-tab"
      className={cn(tabsTabVariants(), className)}
    />
  )
})

export interface TabsPanelProps extends Omit<BaseTabsPanelProps, 'className'> {
  className?: string
}

/**
 * A `role="tabpanel"` labelled by its tab (`aria-labelledby`). Base UI
 * renders the open panel with `tabindex="0"`, so keyboard users can
 * always Tab from the tab list into the panel — even when the panel has
 * no focusable children (screen-reader browse mode is not the only way
 * in). Hidden panels are unmounted unless `keepMounted` is set, in which
 * case they render inert with the `hidden` attribute.
 */
export const TabsPanel = React.forwardRef<HTMLDivElement, TabsPanelProps>(function TabsPanel(
  { className, ...props },
  ref
) {
  return (
    <BaseTabs.Panel
      {...props}
      ref={ref}
      data-slot="tabs-panel"
      className={cn(tabsPanelVariants(), className)}
    />
  )
})
