// SPDX-License-Identifier: MIT

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/cn'

// ---------------------------------------------------------------------------
// Prose styles arbitrary flow content it does not control the markup of —
// rendered Markdown, CMS output, or hand-authored rich text. Unlike every
// other Commons component it has no compound sub-parts to attach `data-slot`
// to; instead it applies tokenized typography to plain semantic elements
// (`h2`, `p`, `ul`, `a`, `code`, `blockquote`, `table`, `img`, `hr`) via
// Tailwind's `[&_tag]:` descendant-selector variants, the same technique
// `summary-box.tsx` and `table.tsx` use for their own nested markup.
//
// Because Prose never renders those elements itself, it adds NO roles, NO
// aria-*, and NO keyboard behavior of its own (see the accessibility notes
// in the JSDoc below). Its entire contract is: cap the reading measure, keep
// vertical rhythm predictable, and reuse the same link/code/border tokens
// the rest of Commons uses — so consumer content never needs re-theming and
// never breaks in dark mode or forced-colors mode.
// ---------------------------------------------------------------------------

export const proseVariants = cva(
  [
    'min-w-0 text-foreground',

    // Headings: weight/leading/tracking/spacing are size-independent; the
    // actual font-size per level comes from the `size` variant below so a
    // heading's scale moves together with the body-text size. `first-child`
    // removes the leading gap so Prose never opens with a floating margin
    // above its first block.
    // Headings: weight/leading/tracking/spacing are size-independent; the
    // actual font-size per level comes from the `size` variant below so a
    // heading's scale moves together with the body-text size. `first-child`
    // removes the leading gap so Prose never opens with a floating margin
    // above its first block. (These vertical margins rely on the core reset's
    // margin-zero living in `@layer base` — below Tailwind's utilities layer —
    // so plain utilities win; see packages/core/src/reset.css.)
    '[&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:font-semibold [&_h1]:leading-snug [&_h1]:tracking-tight [&_h1]:text-foreground',
    '[&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:font-semibold [&_h2]:leading-snug [&_h2]:tracking-tight [&_h2]:text-foreground',
    '[&_h3]:mt-4 [&_h3]:mb-105 [&_h3]:font-semibold [&_h3]:leading-snug [&_h3]:text-foreground',
    '[&_h4]:mt-3 [&_h4]:mb-1 [&_h4]:font-semibold [&_h4]:leading-snug [&_h4]:text-foreground',
    '[&_h5]:mt-3 [&_h5]:mb-1 [&_h5]:font-semibold [&_h5]:leading-snug [&_h5]:text-foreground',
    '[&_h6]:mt-3 [&_h6]:mb-1 [&_h6]:font-semibold [&_h6]:uppercase [&_h6]:tracking-wide [&_h6]:leading-snug [&_h6]:text-muted-foreground',
    '[&_:is(h1,h2,h3,h4,h5,h6):first-child]:mt-0',

    // Paragraphs: comfortable (not tight, not loose) line-height for
    // sustained reading; margin only trails a paragraph, never leads one, so
    // stacking never double-counts the gap against a heading's own margin.
    '[&_p]:mb-2 [&_p]:leading-normal [&_p:last-child]:mb-0',

    // Lists: Tailwind's preflight strips markers and padding, so both are
    // restored explicitly (same technique as summary-box.tsx). `ps-5` is a
    // logical (inline-start) indent so markers hang on the correct side in
    // RTL. Marker color is muted so the text itself stays the visual anchor.
    '[&_ul]:list-disc [&_ol]:list-decimal',
    '[&_ul]:mb-2 [&_ol]:mb-2 [&_ul:last-child]:mb-0 [&_ol:last-child]:mb-0',
    '[&_:is(ul,ol)]:ps-5 [&_:is(ul,ol)]:marker:text-muted-foreground',
    '[&_li]:leading-normal',
    '[&_li+li]:mt-05',
    '[&_li_:is(ul,ol)]:mb-0 [&_li_:is(ul,ol)]:mt-05',

    // Links: reuse the exact Commons Link visual contract (link.tsx) —
    // ALWAYS underlined, because color alone never conveys link-ness (WCAG
    // 1.4.1). Rendered content can't import the <Link> component, so the
    // same tokens are re-declared here at the CSS level.
    '[&_a]:rounded-sm [&_a]:font-medium [&_a]:text-link [&_a]:underline [&_a]:underline-offset-2',
    '[&_a]:visited:text-link-visited',
    '[&_a]:hover:text-link-hover',
    '[&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-2 [&_a]:focus-visible:outline-ring',

    // Inline code: a visible border (not background alone) so the token
    // survives forced-colors mode, where background-color is suppressed.
    '[&_code]:rounded-sm [&_code]:border [&_code]:border-border [&_code]:bg-muted',
    '[&_code]:px-05 [&_code]:py-[0.0625em] [&_code]:font-mono [&_code]:text-[0.875em] [&_code]:text-foreground',
    'forced-colors:[&_code]:border-[CanvasText]',

    // Code blocks: horizontally scrollable (never lets a long line blow out
    // the reading measure) with the same muted-surface + border treatment.
    // `pre code` resets the inline-code padding/border/background so a
    // Markdown-rendered ```block``` (a <code> inside the <pre>) isn't
    // double-boxed.
    '[&_pre]:mb-2 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted',
    '[&_pre]:p-105 [&_pre]:font-mono [&_pre]:text-[0.875em] [&_pre]:leading-normal [&_pre]:text-foreground',
    '[&_pre:last-child]:mb-0',
    '[&_pre_code]:border-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[1em]',
    'forced-colors:[&_pre]:border-[CanvasText]',

    // Blockquote: border on the INLINE-START edge (`border-s-4`, not
    // `border-l-4`) so it sits on the correct side of the text in RTL. Muted
    // + italic marks it as quoted without relying on color alone — the
    // border and the (redundant) indent both survive forced-colors mode.
    '[&_blockquote]:mb-2 [&_blockquote]:border-s-4 [&_blockquote]:border-border-strong [&_blockquote]:ps-2',
    '[&_blockquote]:italic [&_blockquote]:leading-normal [&_blockquote]:text-muted-foreground',
    '[&_blockquote:last-child]:mb-0',
    '[&_blockquote_p]:mb-1 [&_blockquote_p:last-child]:mb-0',
    'forced-colors:[&_blockquote]:border-[CanvasText]',

    // Thematic break.
    '[&_hr]:my-4 [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-border-strong',
    'forced-colors:[&_hr]:border-[CanvasText]',

    // Images: capped to the column width (never overflow the measure) with
    // soft corners. Alt text stays entirely the consumer's responsibility —
    // Prose adds no role or accessible name of its own.
    '[&_img]:mb-2 [&_img]:block [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md',
    '[&_img:last-child]:mb-0',

    // Tables: a real semantic <table> keeps its native row/column
    // announcements — Prose only borders and pads the cells (see table.tsx
    // for the fuller, interactive Table component; this is the "basic",
    // markup-only counterpart for rendered content).
    '[&_table]:mb-2 [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-border [&_table]:text-start [&_table]:text-[0.875em]',
    '[&_table:last-child]:mb-0',
    '[&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-105 [&_th]:py-1 [&_th]:text-start [&_th]:align-top [&_th]:font-semibold',
    '[&_td]:border [&_td]:border-border [&_td]:px-105 [&_td]:py-1 [&_td]:align-top',
    'forced-colors:[&_table]:border-[CanvasText] forced-colors:[&_th]:border-[CanvasText] forced-colors:[&_td]:border-[CanvasText]',
  ],
  {
    variants: {
      size: {
        // Reading measure is capped with the `measure-*` container tokens
        // (ch-based, so it tracks the actual glyph width of the active
        // font). Heading sizes are set per level here — NOT as fixed rem
        // values on the base classes above — so the whole scale moves
        // together when `size` changes. All sizes are the rem-based `text-*`
        // tokens, so they scale with the user's browser text-size setting
        // (WCAG 1.4.4) exactly like every other Commons component.
        sm: [
          'max-w-measure-sm text-sm',
          '[&_h1]:text-xl',
          '[&_h2]:text-lg',
          '[&_h3]:text-md',
          '[&_h4]:text-sm',
          '[&_h5]:text-sm',
          '[&_h6]:text-sm',
        ],
        // ~65ch is the classic comfortable prose measure; `measure-lg`
        // (68ch) is the closest available token to that target.
        base: [
          'max-w-measure-lg text-md',
          '[&_h1]:text-2xl',
          '[&_h2]:text-xl',
          '[&_h3]:text-lg',
          '[&_h4]:text-md',
          '[&_h5]:text-sm',
          '[&_h6]:text-sm',
        ],
        lg: [
          'max-w-measure-xl text-lg',
          '[&_h1]:text-3xl',
          '[&_h2]:text-2xl',
          '[&_h3]:text-xl',
          '[&_h4]:text-lg',
          '[&_h5]:text-md',
          '[&_h6]:text-md',
        ],
      },
    },
    defaultVariants: { size: 'base' },
  }
)

export type ProseSize = NonNullable<VariantProps<typeof proseVariants>['size']>

export interface ProseProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof proseVariants> {
  /**
   * Element (or component) to render as the root. Use a landmark like
   * `"article"` when the Prose block is a standalone, independently
   * understandable region (an article, a policy page), or `"section"` when
   * it is one part of a larger labelled page. Defaults to a plain `<div>` so
   * Prose never invents document structure the consumer didn't ask for.
   * @default "div"
   */
  as?: React.ElementType
  /**
   * Scales both the reading measure (max-width, in `ch`) and the base type
   * size together, so a narrower measure never pairs with oversized text or
   * vice versa. Heading sizes move with it. @default "base"
   */
  size?: ProseSize
}

/**
 * Applies readable long-form typography to rendered rich text — Markdown
 * output, CMS content, or any HTML Prose does not itself control the markup
 * of. It renders a single neutral wrapper (`<div>` by default; override with
 * `as`) and styles descendant elements entirely through CSS child selectors:
 * Prose never re-parses, clones, or injects props into its children.
 *
 * Accessibility is inherited, not added:
 * - Prose sets no role, no `aria-*`, and no tab stops. Whatever semantics
 *   the underlying markup has (real `<h2>`s, a real `<table>`, a real `<a>`)
 *   are exactly what assistive technology sees — Prose only changes paint.
 * - Links are ALWAYS underlined (WCAG 1.4.1 — color alone never conveys
 *   link-ness) and keep a visible `focus-visible` ring, matching
 *   `link.tsx`'s contract exactly.
 * - The reading-measure cap (`max-w-measure-*`, ~65ch) is itself an
 *   accessibility feature: WCAG 1.4.8 recommends capping line length for
 *   sustained reading. All type sizes are the rem-based `text-*` tokens, so
 *   they scale with the user's browser/OS text-size setting.
 * - Inline `code`, code blocks, blockquotes, `hr`, and tables keep a visible
 *   BORDER (not a background-color alone) so their boundaries survive
 *   forced-colors / Windows High Contrast Mode.
 * - The blockquote's accent border is on the INLINE-START edge (`border-s-4`
 *   via a logical property), so it renders on the correct side of the text
 *   automatically in `dir="rtl"` — no `rtl:` override needed.
 * - Every color comes from a semantic theme token (`text-foreground`,
 *   `text-muted-foreground`, `bg-muted`, `border-border`, `text-link`, …),
 *   so Prose never fights a consumer's dark or high-contrast theme.
 *
 * Prose is a styling layer, not a content model: it does not sanitize HTML,
 * add table sorting, or validate `img` alt text. Compose the dedicated
 * `Table`, `Card`, or `Collection` components instead when you control the
 * markup and want their fuller interactive/structural contract.
 */
export const Prose = React.forwardRef<HTMLElement, ProseProps>(function Prose(
  { as, size, className, children, ...props },
  ref
) {
  const Component = as ?? 'div'

  return (
    <Component
      {...props}
      ref={ref}
      data-slot="prose"
      className={cn(proseVariants({ size }), className)}
    >
      {children}
    </Component>
  )
})
