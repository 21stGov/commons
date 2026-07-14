// SPDX-License-Identifier: MIT

import * as React from 'react'

import { cn } from '@/lib/cn'

export type SummaryBoxHeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export interface SummaryBoxProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Heading for the box — the key it summarizes ("What you'll need", "Next
   * steps"). Renders inside the box and names its labelled region, so it is
   * required copy. Translation-ready: pass a localized string.
   */
  heading: React.ReactNode
  /**
   * Heading element to render. Pick the level that fits the page outline
   * (no skipped levels).
   * @default "h3"
   */
  headingLevel?: SummaryBoxHeadingLevel
  /**
   * Explicit id for the heading, used to label the region via
   * `aria-labelledby`. Auto-generated with `useId` when omitted; supply one
   * only if another element must also reference the heading.
   */
  headingId?: string
  /**
   * The summarized content — usually a list of documents, requirements, or
   * next steps.
   */
  children?: React.ReactNode
}

/**
 * Bordered, emphasized box that highlights key information or next steps so
 * users do not have to hunt for it (e.g. "What you'll need"). Renders a
 * `<section>` labelled by its heading. Structural, not status-colored: the
 * heading and border — never color alone — carry its meaning, so it stays
 * legible in forced-colors mode.
 */
export const SummaryBox = React.forwardRef<HTMLElement, SummaryBoxProps>(function SummaryBox(
  { className, heading, headingLevel = 'h3', headingId, children, ...props },
  ref
) {
  const generatedId = React.useId()
  const resolvedHeadingId = headingId ?? generatedId
  const HeadingTag = headingLevel

  return (
    <section
      {...props}
      ref={ref}
      aria-labelledby={resolvedHeadingId}
      data-slot="summary-box"
      className={cn(
        // Subtle tint + full border (visible in forced-colors mode) +
        // rounded container. rem-only text; logical spacing utilities only.
        'flex flex-col gap-105 rounded-md border border-border bg-muted p-205 text-sm text-foreground',
        '[&_a]:underline',
        className
      )}
    >
      <HeadingTag
        id={resolvedHeadingId}
        data-slot="summary-box-heading"
        className="text-md font-semibold leading-snug"
      >
        {heading}
      </HeadingTag>
      {children != null ? (
        <div
          data-slot="summary-box-body"
          // List indentation lives here (not on the consumer's list) because
          // Tailwind's preflight strips list markers + padding. `ps-*`
          // (padding, not margin) survives the core reset; the markers hang
          // in the padding so item text aligns under the heading.
          className={cn(
            'leading-normal',
            // list-disc/decimal restore markers; ps-5 indents so the markers
            // hang and item text aligns under the heading. Not `display:flex`
            // (that suppresses ::marker). Row spacing via li padding since
            // margin utilities are reset away.
            '[&_ul]:list-disc [&_ol]:list-decimal',
            '[&_:is(ul,ol)]:ps-5 [&_:is(ul,ol)]:marker:text-muted-foreground',
            '[&_li]:pb-05 [&_li:last-child]:pb-0'
          )}
        >
          {children}
        </div>
      ) : null}
    </section>
  )
})
