// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { AmbientDirection } from '@/lib/ambient-direction'
import { cn } from '@/lib/cn'

export const collapsibleVariants = cva(
  // The collapsible is a lightweight wrapper: it groups one trigger and one
  // panel and renders a plain block. No border of its own — a single
  // disclosure lives inline in body copy, unlike the bordered Accordion
  // group. Consumers add framing via className when they want it.
  ['text-foreground']
)

export const collapsibleTriggerVariants = cva([
  // A single show/hide disclosure control. Link-styled and underlined so the
  // affordance never depends on color alone (WCAG 1.4.1), matching the
  // GovBanner disclosure. 44px (2.75rem) minimum target via min-h-11.
  // `group` lets the chevron track the trigger's aria-expanded state.
  'group inline-flex min-h-11 items-center gap-1',
  // Transparent border so forced-colors mode paints a control boundary
  // (Tailwind preflight strips the native button border).
  'border border-transparent',
  'text-start text-sm font-medium text-link underline hover:text-link-hover',
  'transition-colors motion-reduce:transition-none',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  'disabled:cursor-not-allowed disabled:text-disabled-foreground disabled:no-underline',
])

export const collapsiblePanelVariants = cva([
  // Base UI publishes the measured content height as
  // --collapsible-panel-height and toggles data-starting-style /
  // data-ending-style around open/close. Animating height is gated behind
  // motion-safe; reduced-motion users get an instant show/hide.
  'overflow-hidden text-sm text-foreground',
  'h-[var(--collapsible-panel-height)]',
  'motion-safe:transition-[height] motion-safe:duration-200 motion-safe:ease-out',
  'motion-safe:data-starting-style:h-0 motion-safe:data-ending-style:h-0',
])

type BaseRootProps = React.ComponentProps<typeof BaseCollapsible.Root>
type BaseTriggerProps = React.ComponentProps<typeof BaseCollapsible.Trigger>
type BasePanelProps = React.ComponentProps<typeof BaseCollapsible.Panel>

export interface CollapsibleProps
  extends Omit<BaseRootProps, 'className'>, VariantProps<typeof collapsibleVariants> {
  className?: string
}

export interface CollapsibleTriggerProps extends Omit<BaseTriggerProps, 'className'> {
  className?: string
  /**
   * Render the decorative chevron affordance that rotates when the panel
   * opens. Its direction (plus the trigger's `aria-expanded`) conveys state
   * without relying on color. Set `false` when you supply your own indicator.
   * @default true
   */
  showIndicator?: boolean
}

export interface CollapsiblePanelProps extends Omit<BasePanelProps, 'className'> {
  className?: string
}

/**
 * Chevron affordance. Decorative (`aria-hidden`), drawn with `currentColor`
 * so it survives forced-colors mode. Its direction is the visible
 * open/closed indicator (non-color-dependent, WCAG 1.4.1); the programmatic
 * state lives in `aria-expanded` on the trigger.
 */
function ChevronIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      data-slot="collapsible-chevron"
      viewBox="0 0 16 16"
      className={cn(
        'size-2 shrink-0',
        'transition-transform motion-reduce:transition-none',
        'group-aria-expanded:rotate-180'
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m4 6 4 4 4-4" />
    </svg>
  )
}

/**
 * A single show/hide disclosure. Groups one `CollapsibleTrigger` and one
 * `CollapsiblePanel`; renders a plain block. Built on Base UI's collapsible,
 * which wires the trigger's `aria-expanded` / `aria-controls` and manages the
 * panel's mount state. Use this for one inline section of supporting detail —
 * reach for Accordion when several sections should stack and coordinate, and
 * for Dialog when the content must overlay the page.
 */
export const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(function Collapsible(
  { className, ...props },
  ref
) {
  return (
    // AmbientDirection makes the collapsible follow the DOM `dir` (global or a
    // local `dir="rtl"`) like the native components — Base UI reads a provider,
    // not the DOM.
    <AmbientDirection>
      <BaseCollapsible.Root
        {...props}
        ref={ref}
        data-slot="collapsible"
        className={cn(collapsibleVariants(), className)}
      />
    </AmbientDirection>
  )
})

/**
 * The disclosure button. A native `<button>` (Base UI wires `aria-expanded`
 * and `aria-controls`); Enter or Space toggles the panel. Pass `render` to
 * swap in your own element — for example a Commons `Button`.
 */
export const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  function CollapsibleTrigger({ className, showIndicator = true, children, ...props }, ref) {
    return (
      <BaseCollapsible.Trigger
        {...props}
        ref={ref}
        data-slot="collapsible-trigger"
        className={cn(collapsibleTriggerVariants(), className)}
      >
        {children}
        {showIndicator ? <ChevronIcon /> : null}
      </BaseCollapsible.Trigger>
    )
  }
)

/**
 * The collapsible content. Base UI removes the closed panel from the DOM by
 * default; pass `keepMounted` to keep it rendered, or `hiddenUntilFound` so
 * the browser's find-in-page can reveal and expand it (`hidden="until-found"`).
 * Padding lives on an inner element so the motion-safe height animation
 * measures cleanly.
 */
export const CollapsiblePanel = React.forwardRef<HTMLDivElement, CollapsiblePanelProps>(
  function CollapsiblePanel({ className, children, ...props }, ref) {
    return (
      <BaseCollapsible.Panel
        {...props}
        ref={ref}
        data-slot="collapsible-panel"
        className={cn(collapsiblePanelVariants(), className)}
      >
        <div data-slot="collapsible-panel-content" className="pt-1">
          {children}
        </div>
      </BaseCollapsible.Panel>
    )
  }
)
