// SPDX-License-Identifier: MIT

import * as React from 'react'

import { Icon, type IconName } from '@/components/ui/icon'
import { cn } from '@/lib/cn'

// ---------------------------------------------------------------------------
// IconList: a native <ul> where each item has a leading icon instead of a
// bullet — for benefit lists, feature checklists, "what you get" summaries.
// ---------------------------------------------------------------------------
//
// Replacing the marker with an icon means `list-style: none`, which silently
// drops list semantics in Safari/VoiceOver (the same gotcha List's `unstyled`
// variant and Collection document). So the <ul> carries an explicit
// `role="list"` to stay announced as a list — the fix
// `packages/core/src/reset.css` applies to raw `ul[role="list"]`.
//
// The leading glyph is DECORATIVE by default (aria-hidden — the item text
// already carries the meaning, so a screen reader should not announce a check
// bullet before every line). Pass `iconLabel` on an item only when the icon
// itself conveys something the text does not (a status glyph), which flips it
// to a MEANINGFUL `role="img"` with that accessible name.

/**
 * The default leading glyph, shared down to every item so each `IconListItem`
 * need not repeat it. A per-item `icon` prop overrides it.
 */
const IconListContext = React.createContext<IconName>('check')

export interface IconListProps extends React.HTMLAttributes<HTMLUListElement> {
  /**
   * Default leading glyph for every item (e.g. a `check` bullet for a benefits
   * list, `arrow-right` for next steps). A per-item `icon` prop overrides it.
   * @default "check"
   */
  icon?: IconName
}

/**
 * A native, semantic `<ul>` whose items lead with an `Icon` rather than a
 * list marker. Use it for benefit/feature checklists and "what you'll get"
 * summaries — not for a plain bullet list (use `List`) or a list of
 * interactive choices (use `RadioGroup`/`DropdownMenu`).
 *
 * The list keeps `role="list"` so it is still announced as a list after
 * `list-style` is removed. Leading icons are decorative by default; opt an
 * individual item's icon into being meaningful with `iconLabel`.
 */
export const IconList = React.forwardRef<HTMLUListElement, IconListProps>(function IconList(
  { className, icon = 'check', children, style, ...props },
  ref
) {
  return (
    <IconListContext.Provider value={icon}>
      <ul
        {...props}
        ref={ref}
        // See the file header: list-none needs an explicit role to keep list
        // semantics in Safari/VoiceOver.
        role="list"
        data-slot="icon-list"
        // paddingInlineStart:0 also clears the UA marker indent (logical, so it
        // is correct under dir="rtl" too).
        style={{ paddingInlineStart: 0, ...style }}
        className={cn(
          'm-0 flex min-w-0 list-none flex-col gap-2 text-sm leading-normal text-foreground',
          className
        )}
      >
        {children}
      </ul>
    </IconListContext.Provider>
  )
})

export interface IconListItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  /**
   * Leading glyph for this item, overriding the list's default `icon`. Use it
   * to mark one item differently (e.g. an `x` "not included" row among a set
   * of `check`s).
   */
  icon?: IconName
  /**
   * Accessible name for the leading icon, making it MEANINGFUL: it gets
   * `role="img"` and is announced. Provide it only when the icon conveys
   * information the item text does not (a status glyph like a red `x` for "not
   * available"). Omit it — the default — for a purely decorative bullet, which
   * is `aria-hidden` and skipped by screen readers so the text is not
   * prefixed by "image" on every line. Translation-ready: pass a localized
   * string.
   */
  iconLabel?: string
}

/**
 * One row of an `IconList`: a leading icon plus content. The icon is pinned to
 * the FIRST line of the content (via a line-height-tall centering box) and the
 * row is top-aligned, so a multi-line item wraps under its TEXT, never under
 * the icon.
 */
export const IconListItem = React.forwardRef<HTMLLIElement, IconListItemProps>(
  function IconListItem({ className, icon, iconLabel, children, ...props }, ref) {
    const defaultIcon = React.useContext(IconListContext)
    const resolvedIcon = icon ?? defaultIcon

    return (
      <li
        {...props}
        ref={ref}
        data-slot="icon-list-item"
        // items-start keeps the icon on the first line while text wraps beneath
        // itself; gap-2 is logical so the icon sits at the inline-start (right
        // side under dir="rtl") automatically.
        className={cn('flex items-start gap-2', className)}
      >
        <span
          data-slot="icon-list-icon"
          // h-[1.5em] == the leading-normal line box, so the icon optically
          // centers on the first text line and holds that spot as text wraps.
          // shrink-0 stops it collapsing beside a long wrapping label.
          className="flex h-[1.5em] shrink-0 items-center"
        >
          {/* Decorative unless the item supplies iconLabel — the Icon primitive
              handles aria-hidden vs role=img from the presence of a label.
              currentColor stroke keeps it visible in forced-colors mode. */}
          <Icon name={resolvedIcon} label={iconLabel} className="size-[1.25em]" />
        </span>
        <span data-slot="icon-list-content" className="min-w-0 flex-1 break-words">
          {children}
        </span>
      </li>
    )
  }
)
