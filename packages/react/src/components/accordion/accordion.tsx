// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { Accordion as BaseAccordion } from '@base-ui/react/accordion'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { AmbientDirection } from '@/lib/ambient-direction'
import { cn } from '@/lib/cn'

export const accordionVariants = cva(
  // The whole accordion reads as one bordered group. The border stays on
  // every state so forced-colors mode paints a boundary; rounded-md keeps
  // the Commons sharp-geometry look (0.25rem).
  ['rounded-md border border-border bg-background text-foreground']
)

export const accordionItemVariants = cva(
  // A divider between items (block-end, so it sits between rows in any
  // writing mode); the container border already closes the last row.
  ['border-b border-border last:border-b-0']
)

export const accordionTriggerVariants = cva([
  // Full-width disclosure row. 44px (2.75rem) minimum target via min-h-11.
  // `group` lets the +/− indicator track the trigger's aria-expanded state.
  'group flex w-full min-h-11 items-center justify-between gap-2',
  // Transparent border so forced-colors mode paints a control boundary
  // (Tailwind preflight strips the native button border).
  'border border-transparent px-2 py-105',
  'text-start text-sm font-medium text-foreground',
  'transition-colors motion-reduce:transition-none',
  'hover:bg-muted active:bg-muted',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  'disabled:cursor-not-allowed disabled:text-disabled-foreground',
])

export const accordionPanelVariants = cva([
  // Base UI publishes the measured content height as
  // --accordion-panel-height and toggles data-starting-style /
  // data-ending-style around open/close. Animating height is gated behind
  // motion-safe; reduced-motion users get an instant show/hide.
  'overflow-hidden text-sm text-foreground',
  'h-[var(--accordion-panel-height)]',
  'motion-safe:transition-[height] motion-safe:duration-200 motion-safe:ease-out',
  'motion-safe:data-starting-style:h-0 motion-safe:data-ending-style:h-0',
])

/** Heading levels the trigger can render. Match the page outline. */
export type AccordionHeadingLevel = 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

type BaseRootProps = React.ComponentProps<typeof BaseAccordion.Root>
type BaseItemProps = React.ComponentProps<typeof BaseAccordion.Item>
type BaseTriggerProps = React.ComponentProps<typeof BaseAccordion.Trigger>
type BasePanelProps = React.ComponentProps<typeof BaseAccordion.Panel>

export interface AccordionProps
  extends
    // `orientation` and `loopFocus` are deprecated upstream (the APG
    // removed arrow-key roving focus from the accordion pattern) — they
    // no longer do anything, so they are not part of the Commons API.
    Omit<BaseRootProps, 'className' | 'orientation' | 'loopFocus'>,
    VariantProps<typeof accordionVariants> {
  className?: string
  /**
   * Whether several panels may be open at once. Defaults to `true`,
   * following USWDS convention (readers comparing answers should not have
   * one panel snap shut when they open another). Set to `false` for the
   * classic single-open accordion.
   * @default true
   */
  multiple?: boolean
}

export interface AccordionItemProps extends Omit<BaseItemProps, 'className'> {
  className?: string
}

export interface AccordionTriggerProps extends Omit<BaseTriggerProps, 'className' | 'render'> {
  className?: string
  /**
   * Heading element wrapped around the trigger button (APG accordion
   * pattern: each header is a heading containing a button). Pick the
   * level that fits the page outline — no skipped levels.
   * @default "h3"
   */
  headingLevel?: AccordionHeadingLevel
}

export interface AccordionPanelProps extends Omit<BasePanelProps, 'className'> {
  className?: string
}

/**
 * Plus/minus affordance. Decorative (`aria-hidden`), drawn with
 * `currentColor` so it survives forced-colors mode. A "+" marks a closed
 * panel and a "−" marks an open one — the shape change is a non-color
 * open/closed indicator (WCAG 1.4.1). It is built from a permanent
 * horizontal bar plus a vertical bar that fades out when the trigger's
 * `group-aria-expanded` flips to `true`, turning the "+" into a "−". The
 * programmatic state still lives in `aria-expanded` on the trigger.
 */
function PlusMinusIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      data-slot="accordion-indicator"
      viewBox="0 0 16 16"
      className="size-3 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Crossbar — always visible: the "−", and the middle of the "+". */}
      <path d="M3 8h10" />
      {/* Upright — hidden when the panel is open so "+" becomes "−".
          Motion-safe: reduced-motion users get an instant swap. */}
      <path
        d="M8 3v10"
        className="origin-center transition-opacity motion-reduce:transition-none group-aria-expanded:opacity-0"
      />
    </svg>
  )
}

/**
 * Vertically stacked disclosure sections. Built on Base UI's accordion:
 * each trigger is a native `<button>` (wrapped in a heading) that Base UI
 * wires with `aria-expanded`, and each open panel is a `region` labelled
 * by its trigger. Multiple panels may be open at once by default
 * (USWDS convention); pass `multiple={false}` for single-open behavior.
 */
export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  { className, multiple = true, ...props },
  ref
) {
  return (
    // AmbientDirection makes the accordion follow the DOM `dir` (global or a
    // local `dir="rtl"`) so the +/- indicator flips to the inline-end edge
    // like the native components — Base UI reads a provider, not the DOM.
    <AmbientDirection>
      <BaseAccordion.Root
        {...props}
        multiple={multiple}
        ref={ref}
        data-slot="accordion"
        className={cn(accordionVariants(), className)}
      />
    </AmbientDirection>
  )
})

/** One disclosure section: an `AccordionTrigger` plus an `AccordionPanel`. */
export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  function AccordionItem({ className, ...props }, ref) {
    return (
      <BaseAccordion.Item
        {...props}
        ref={ref}
        data-slot="accordion-item"
        className={cn(accordionItemVariants(), className)}
      />
    )
  }
)

/**
 * The header row of a section: a heading element (level set by
 * `headingLevel`) wrapping a native button. A "+" (closed) / "−" (open)
 * indicator plus `aria-expanded` convey state without relying on color.
 */
export const AccordionTrigger = React.forwardRef<HTMLElement, AccordionTriggerProps>(
  function AccordionTrigger({ className, headingLevel = 'h3', children, ...props }, ref) {
    const HeadingTag = headingLevel
    return (
      <BaseAccordion.Header
        data-slot="accordion-header"
        // The heading is purely structural: kill UA margins and inherit
        // the row's typography so the button styles win.
        className="m-0"
        render={<HeadingTag />}
      >
        <BaseAccordion.Trigger
          {...props}
          ref={ref}
          data-slot="accordion-trigger"
          className={cn(accordionTriggerVariants(), className)}
        >
          {children}
          <PlusMinusIcon />
        </BaseAccordion.Trigger>
      </BaseAccordion.Header>
    )
  }
)

/**
 * The collapsible content of a section. Base UI removes the closed panel
 * from the DOM by default; pass `keepMounted` or `hiddenUntilFound` (the
 * latter lets find-in-page expand the section) to keep it rendered.
 * Padding lives on an inner element so the motion-safe height animation
 * measures cleanly.
 */
export const AccordionPanel = React.forwardRef<HTMLDivElement, AccordionPanelProps>(
  function AccordionPanel({ className, children, ...props }, ref) {
    return (
      <BaseAccordion.Panel
        {...props}
        ref={ref}
        data-slot="accordion-panel"
        className={cn(accordionPanelVariants(), className)}
      >
        <div data-slot="accordion-panel-content" className="px-2 py-105">
          {children}
        </div>
      </BaseAccordion.Panel>
    )
  }
)
