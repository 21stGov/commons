// SPDX-License-Identifier: MIT
// Compound API adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/cn'

// The row. A neutral flex container: leading media, a flexing content column,
// and trailing actions. Meaning is never color-only — the `outline` and
// `muted` surfaces keep a visible border (transparent borders resolve to
// `CanvasText` in forced-colors mode) so the row boundary survives WHCM.
export const itemVariants = cva(
  [
    'flex min-w-0 items-start gap-105 text-sm text-foreground',
    // Comfortable inset via tokens. A padded row also means an interactive
    // whole-row pattern (see the JSDoc) clears the 44px minimum target.
    'p-105',
  ],
  {
    variants: {
      variant: {
        // Plain row with no surface — pairs with ItemGroup dividers/spacing.
        default: '',
        outline: 'rounded-md border border-border bg-background forced-colors:border-[CanvasText]',
        muted:
          'rounded-md border border-transparent bg-muted forced-colors:border-[CanvasText]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export const itemGroupVariants = cva('flex min-w-0 flex-col', {
  variants: {
    variant: {
      // Even spacing between free-standing rows (e.g. `outline`/`muted` items).
      plain: 'gap-1',
      // Flush rows separated by hairlines — the settings/list look. The border
      // token keeps the divider visible; forced-colors mode paints it too.
      divided: 'divide-y divide-border',
    },
  },
  defaultVariants: { variant: 'plain' },
})

export interface ItemProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof itemVariants> {}

/**
 * A generic, composable media/content/action row — the building block for
 * settings rows, notification rows, search results, and list rows. The root is
 * a neutral `<div>` with NO forced role or accessible name: it is content, not
 * a control, so it stays out of the accessibility tree's interactive surface
 * and lets whatever it wraps (links, buttons, a Switch) own its own semantics.
 *
 * Layout: ItemMedia is pinned to the first line, ItemContent flexes and can
 * shrink (`min-w-0`), and ItemActions is pushed to the inline end with
 * `margin-inline-start:auto`. Every offset is a logical property, so the row
 * mirrors correctly under `dir="rtl"` with no extra work.
 *
 * Item deliberately does NOT depend on the Icon component — ItemMedia renders
 * whatever you put in it (an icon, an avatar, an `<img>`), so Item ships free of
 * that coupling.
 *
 * Interactive whole rows: if the ENTIRE row should be one link or button,
 * render a single `<a>`/`<button>` as the item's only interactive descendant
 * (or stretch it over the row with an absolutely-positioned `::after`). Because
 * the row is already padded to at least 44px, the target meets the project's
 * minimum pointer size, and the nested control keeps its own focus-visible
 * ring. Do NOT make the row a click target while it also contains other
 * separately focusable controls — that traps them behind the row.
 */
export const Item = React.forwardRef<HTMLDivElement, ItemProps>(function Item(
  { className, variant, ...props },
  ref
) {
  return (
    <div
      {...props}
      ref={ref}
      data-slot="item"
      data-variant={variant ?? 'default'}
      className={cn(itemVariants({ variant }), className)}
    />
  )
})

export interface ItemGroupProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof itemGroupVariants> {}

/**
 * Groups a set of Items with consistent spacing (`plain`) or hairline dividers
 * (`divided`). The wrapper adds no role by default so it never forces its
 * children to be list items; when the group is a genuine list, pass
 * `role="list"` here and `role="listitem"` on each Item so assistive
 * technology announces the count.
 */
export const ItemGroup = React.forwardRef<HTMLDivElement, ItemGroupProps>(function ItemGroup(
  { className, variant, ...props },
  ref
) {
  return (
    <div
      {...props}
      ref={ref}
      data-slot="item-group"
      data-variant={variant ?? 'plain'}
      className={cn(itemGroupVariants({ variant }), className)}
    />
  )
})

export interface ItemMediaProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Leading slot for an icon, avatar, or thumbnail. Aligned to the first line so
 * it stays put whether the content is one line or several. Adds no role or
 * accessible name — a child `<img>` keeps its own alt text; decorative images
 * should use `alt=""`.
 */
export const ItemMedia = React.forwardRef<HTMLDivElement, ItemMediaProps>(function ItemMedia(
  { className, ...props },
  ref
) {
  return (
    <div
      {...props}
      ref={ref}
      data-slot="item-media"
      className={cn(
        'flex shrink-0 items-center justify-center self-start',
        '[&_svg]:shrink-0 [&_img]:block [&_img]:max-w-full [&_img]:rounded-sm [&_img]:object-cover',
        className
      )}
    />
  )
})

export interface ItemContentProps extends React.HTMLAttributes<HTMLDivElement> {}

/** The flexing middle column — a title stacked over an optional description. */
export const ItemContent = React.forwardRef<HTMLDivElement, ItemContentProps>(
  function ItemContent({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-slot="item-content"
        className={cn('flex min-w-0 flex-1 flex-col gap-05', className)}
      />
    )
  }
)

export interface ItemTitleProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * The item's primary line. Rendered as a neutral element (not a heading) so a
 * long list of rows does not inject dozens of headings into the page outline.
 * When a row genuinely is a section, nest a real heading element inside.
 */
export const ItemTitle = React.forwardRef<HTMLDivElement, ItemTitleProps>(function ItemTitle(
  { className, ...props },
  ref
) {
  return (
    <div
      {...props}
      ref={ref}
      data-slot="item-title"
      className={cn('min-w-0 break-words text-sm font-medium leading-snug text-foreground', className)}
    />
  )
})

export interface ItemDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

/** Optional supporting text below the title. */
export const ItemDescription = React.forwardRef<HTMLParagraphElement, ItemDescriptionProps>(
  function ItemDescription({ className, ...props }, ref) {
    return (
      <p
        {...props}
        ref={ref}
        data-slot="item-description"
        className={cn('min-w-0 break-words text-sm leading-normal text-muted-foreground', className)}
      />
    )
  }
)

export interface ItemActionsProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Trailing controls, pushed to the inline end with `margin-inline-start:auto`
 * so they mirror under RTL. Vertically centered against the content. Each
 * control inside keeps its own accessible name, focus ring, and target size.
 */
export const ItemActions = React.forwardRef<HTMLDivElement, ItemActionsProps>(
  function ItemActions({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-slot="item-actions"
        className={cn('flex shrink-0 items-center gap-05 self-center ms-auto', className)}
      />
    )
  }
)
