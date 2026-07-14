// SPDX-License-Identifier: MIT

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/cn'

// ---------------------------------------------------------------------------
// List: <ol>/<ul>, native semantics only — no Base UI, no ARIA listbox.
// ---------------------------------------------------------------------------
//
// Tailwind's preflight strips `list-style` and padding from every `<ul>`/
// `<ol>` (see the `[&_ul]:list-disc` comment in summary-box.tsx). `ordered`
// and `unordered` restore native markers, so the browser never treats them as
// style-less and list semantics stay intact everywhere, including Safari.
//
// `unstyled` keeps `list-style: none` (no markers, no indent — for nav-like
// lists such as a footer link list). Safari/VoiceOver drops list semantics
// from a `<ul>`/`<ol>` once `list-style` is removed, so that variant adds an
// explicit `role="list"` to keep it announced as a list (the same fix
// `packages/core/src/reset.css` documents for `ul[role="list"]`, and the
// pattern `card.tsx`'s `CardGroup` / `collection.tsx`'s `Collection` already
// use).

export type ListVariant = 'ordered' | 'unordered' | 'unstyled'
export type ListElement = 'ol' | 'ul'

export const listVariants = cva(
  // rem-only type; ps-* (not pl-*) is a logical property so the marker +
  // indentation flip automatically under dir="rtl" — no AmbientDirection
  // needed, this is native browser behavior, not a Base UI primitive.
  ['m-0 min-w-0 text-sm leading-normal text-foreground'],
  {
    variants: {
      variant: {
        ordered: 'list-decimal ps-5 marker:text-muted-foreground',
        unordered: 'list-disc ps-5 marker:text-muted-foreground',
        unstyled: 'list-none ps-0',
      },
    },
    defaultVariants: { variant: 'unordered' },
  }
)

export interface ListProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof listVariants> {
  /**
   * Marker style. `ordered` renders decimal markers, `unordered` renders disc
   * markers, `unstyled` renders no markers and no indent (for nav-like lists
   * — wrap in a `<nav>` yourself for a landmark).
   * @default "unordered"
   */
  variant?: ListVariant
  /**
   * Overrides the rendered element. Defaults to `<ol>` for `variant="ordered"`
   * and `<ul>` for every other variant. Reach for this only when the
   * semantics and the marker style must disagree — e.g. an `unstyled` numbered
   * sequence that hides its markers but must still be an `<ol>`.
   */
  as?: ListElement
}

/**
 * A native, semantic list — `<ol>` or `<ul>` — never an ARIA `listbox`/
 * `menu`. Use `List` for content that is genuinely a list (steps,
 * requirements, links); use a `RadioGroup`/`ComboBox`/`DropdownMenu` for a
 * list of *choices* the user interacts with.
 *
 * Pair with `ListItem` for each entry. `unstyled` still announces as a list
 * to assistive technology via an explicit `role="list"` (removing
 * `list-style` alone silently drops list semantics in Safari/VoiceOver).
 */
export const List = React.forwardRef<HTMLElement, ListProps>(function List(
  { className, variant = 'unordered', as, ...props },
  ref
) {
  // Cast to ElementType: 'ol' and 'ul' resolve to different DOM interfaces
  // (HTMLOListElement vs HTMLUListElement) in the JSX intrinsics table, so a
  // single shared `ref`/props type needs the dynamic-tag escape hatch.
  const Tag = (as ?? (variant === 'ordered' ? 'ol' : 'ul')) as React.ElementType

  return (
    <Tag
      {...props}
      // Only `unstyled` needs the role — see the file-level comment.
      role={variant === 'unstyled' ? 'list' : undefined}
      ref={ref}
      data-slot="list"
      data-variant={variant}
      className={cn(listVariants({ variant }), className)}
    />
  )
})

export type ListItemProps = React.LiHTMLAttributes<HTMLLIElement>

/**
 * One entry in a `List`. Row spacing lives here as block padding (not
 * margin, and not a flex `gap` — `display: flex` on the list would suppress
 * `::marker` rendering).
 */
export const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(function ListItem(
  { className, ...props },
  ref
) {
  return (
    <li
      {...props}
      ref={ref}
      data-slot="list-item"
      className={cn('break-words pb-1 leading-normal last:pb-0', className)}
    />
  )
})

// ---------------------------------------------------------------------------
// DescriptionList: <dl>/<dt>/<dd> — term/details pairs, not a bullet list.
// ---------------------------------------------------------------------------

export type DescriptionListLayout = 'stacked' | 'inline'

export const descriptionListVariants = cva(
  [
    'm-0 min-w-0 text-sm text-foreground',
    // Term/detail styling lives on the root via descendant selectors (the
    // same technique table.tsx uses for `[&_th]`/`[&_td]`) so DescriptionTerm
    // and DescriptionDetails stay two plain, semantic elements with no
    // variant awareness of their own.
    '[&_dt]:font-semibold [&_dt]:text-foreground [&_dt]:leading-snug',
    '[&_dd]:m-0 [&_dd]:text-muted-foreground [&_dd]:leading-normal',
  ],
  {
    variants: {
      layout: {
        // Term stacked directly above its detail(s); any number of <dd> per
        // <dt> reads correctly since spacing only opens above each new <dt>.
        stacked: '[&_dt]:mt-105 [&_dt:first-child]:mt-0',
        // Two-column "label: value" rows from `sm` up. Assumes exactly one
        // <dd> per <dt> — the grid auto-flows dt/dd pairs into alternating
        // columns, so a term with multiple details breaks the alignment.
        inline: [
          'mt-105 [&_dt:first-child]:mt-0 sm:mt-0',
          'sm:grid sm:grid-cols-[minmax(8rem,auto)_minmax(0,1fr)] sm:items-baseline sm:gap-x-3 sm:gap-y-105',
          '[&_dt]:mt-105 sm:[&_dt]:mt-0 [&_dt:first-child]:mt-0',
        ],
      },
    },
    defaultVariants: { layout: 'stacked' },
  }
)

export interface DescriptionListProps
  extends React.HTMLAttributes<HTMLDListElement>,
    VariantProps<typeof descriptionListVariants> {
  /**
   * `stacked` (default) puts each term above its detail(s) — safe for any
   * number of `<dd>` per `<dt>`. `inline` arranges term/detail as two columns
   * from the `sm` breakpoint up; use it only when every term has exactly one
   * detail (e.g. a compact "Property ID: 123-456" summary).
   * @default "stacked"
   */
  layout?: DescriptionListLayout
}

/**
 * A native `<dl>` for term/detail pairs (a case summary, a set of contact
 * details) — not a substitute for `List`, which is for bullet/number
 * sequences. `<dt>`/`<dd>` keep their built-in term-to-detail association;
 * no ARIA is added or needed.
 */
export const DescriptionList = React.forwardRef<HTMLDListElement, DescriptionListProps>(
  function DescriptionList({ className, layout = 'stacked', ...props }, ref) {
    return (
      <dl
        {...props}
        ref={ref}
        data-slot="description-list"
        data-layout={layout}
        className={cn(descriptionListVariants({ layout }), className)}
      />
    )
  }
)

export type DescriptionTermProps = React.HTMLAttributes<HTMLElement>

/** A `<dt>` — the term being defined. Styled by the parent `DescriptionList`. */
export const DescriptionTerm = React.forwardRef<HTMLElement, DescriptionTermProps>(
  function DescriptionTerm({ className, ...props }, ref) {
    return <dt {...props} ref={ref} data-slot="description-term" className={className} />
  }
)

export type DescriptionDetailsProps = React.HTMLAttributes<HTMLElement>

/**
 * A `<dd>` — the detail for the preceding `<dt>`. Multiple `DescriptionDetails`
 * may follow one `DescriptionTerm` (e.g. several phone numbers for one
 * contact); use `layout="stacked"` (the default) when they do.
 */
export const DescriptionDetails = React.forwardRef<HTMLElement, DescriptionDetailsProps>(
  function DescriptionDetails({ className, ...props }, ref) {
    return <dd {...props} ref={ref} data-slot="description-details" className={className} />
  }
)
