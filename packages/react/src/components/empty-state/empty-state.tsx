// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/cn'

export const emptyStateVariants = cva(
  // A centered, single-column message block. This is ordinary content — a
  // plain container with no role, never an alert: "nothing here" is an
  // expected state, not an error to be announced. rem-only type; logical
  // spacing only, so it centers correctly in LTR and RTL.
  ['flex flex-col items-center justify-center gap-2 px-4 py-8 text-center'],
  {
    variants: {
      // "empty" (first-run: nothing has been created yet) and "no-results"
      // (a search or filter matched nothing) share the same layout — the
      // difference is copy, which the consumer supplies via the props. The
      // variant is exposed as a data attribute for styling hooks and intent.
      variant: {
        empty: '',
        'no-results': '',
      },
    },
    defaultVariants: {
      variant: 'empty',
    },
  }
)

export type EmptyStateVariant = NonNullable<VariantProps<typeof emptyStateVariants>['variant']>

/**
 * Heading levels the region title can render. Pick the level that fits the
 * page outline (no skipped levels).
 */
export type EmptyStateHeadingLevel = 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof emptyStateVariants> {
  /**
   * The title of the empty state — a short, plain-language statement of what
   * is (not) here ("No results", "No documents yet"). Required: it gives the
   * region a real heading in the page outline. Translation-ready.
   */
  heading: React.ReactNode
  /**
   * Heading element to render. Defaults to `h2`: an empty state usually
   * titles a primary content region (a page or panel body), so `h2` sits
   * directly under the page `h1`. Drop to `h3`+ when it lives inside an
   * already-headed section so you never skip a level (WCAG 1.3.1 / 2.4.6).
   * @default "h2"
   */
  headingLevel?: EmptyStateHeadingLevel
  /**
   * Optional decorative illustration or icon shown above the heading. It is
   * wrapped `aria-hidden` — the meaning must live in the heading and body
   * text, not in an announced icon name.
   */
  icon?: React.ReactNode
  /**
   * Optional primary action, typically a Button (e.g. "Clear filters" for
   * no-results, "Create your first item" for empty). Rendered after the body
   * as a real focusable control in the normal tab order.
   */
  action?: React.ReactNode
  /**
   * Supporting body copy: one or two plain-language sentences explaining the
   * state and, ideally, the next step. Optional.
   */
  children?: React.ReactNode
}

/**
 * The "no results / nothing here yet" pattern: a centered region with an
 * optional decorative icon, a real heading, supporting body text, and an
 * optional action. It is content, not an error — it carries no `alert` role
 * and is not a live region.
 */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { className, variant, heading, headingLevel = 'h2', icon, action, children, ...props },
  ref
) {
  const resolvedVariant: EmptyStateVariant = variant ?? 'empty'
  const HeadingTag = headingLevel

  return (
    <div
      {...props}
      ref={ref}
      data-slot="empty-state"
      data-variant={resolvedVariant}
      className={cn(emptyStateVariants({ variant }), className)}
    >
      {icon != null ? (
        <span
          aria-hidden="true"
          data-slot="empty-state-icon"
          className="flex text-muted-foreground [&_svg]:size-5"
        >
          {icon}
        </span>
      ) : null}
      <HeadingTag
        data-slot="empty-state-heading"
        className="text-md font-semibold leading-snug text-foreground"
      >
        {heading}
      </HeadingTag>
      {children != null ? (
        <div
          data-slot="empty-state-body"
          className="max-w-prose text-sm leading-normal text-muted-foreground"
        >
          {children}
        </div>
      ) : null}
      {action != null ? (
        <div data-slot="empty-state-action" className="mt-2 flex flex-wrap justify-center gap-2">
          {action}
        </div>
      ) : null}
    </div>
  )
})
