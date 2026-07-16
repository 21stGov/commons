// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

'use client'

import { NavigationMenu as BaseNav } from '@base-ui/react/navigation-menu'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { ChevronDownIcon } from '@/components/ui/icon'
import { Link, type LinkProps } from '@/components/ui/link'
import { AmbientDirection } from '@/lib/ambient-direction'
import { cn } from '@/lib/cn'

/** Which side of the trigger row the panel opens on (logical sides supported). */
export type NavigationMenuSide =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'inline-start'
  | 'inline-end'

/** How the panel aligns to the active trigger along the chosen side. */
export type NavigationMenuAlign = 'start' | 'center' | 'end'

export interface NavigationMenuProps
  extends Omit<React.ComponentPropsWithoutRef<'nav'>, 'dir' | 'defaultValue' | 'onChange'> {
  /**
   * Accessible name for the navigation landmark. The root renders a real
   * `<nav>`, so it should be named — especially when a page has more than one
   * nav (e.g. a footer nav). Translation-ready: pass a localized string, or
   * point `aria-labelledby` at a visible heading instead.
   */
  'aria-label'?: string
  /** Id(s) of the element(s) labelling the navigation landmark. */
  'aria-labelledby'?: string
  /**
   * Controlled value of the item whose panel is open (matches an
   * `NavigationMenuItem` `value`). `null` closes the menu. Leave unset for
   * uncontrolled usage.
   */
  value?: string | null
  /** Initial open item for uncontrolled usage. @default null */
  defaultValue?: string | null
  /** Called with the value of the item that opened, or `null` when all close. */
  onValueChange?: (value: string | null) => void
  /**
   * Hover-intent delay before a panel opens, in milliseconds. Pointer only —
   * keyboard and touch open immediately. @default 50
   */
  delay?: number
  /** Delay before a panel closes after the pointer leaves, in ms. @default 50 */
  closeDelay?: number
  /**
   * Layout of the trigger row. `horizontal` is a top navigation bar;
   * `vertical` is a stacked side nav. Also decides which arrow key opens a
   * panel (Down for horizontal, inline-end arrow for vertical).
   * @default "horizontal"
   */
  orientation?: 'horizontal' | 'vertical'
  children?: React.ReactNode
}

/**
 * Root of a site navigation menu — a bar of top-level destinations, some of
 * which open a disclosure/mega-menu panel of grouped links. Built on Base UI's
 * Navigation Menu, which implements the APG disclosure-navigation contract: a
 * panel opens on click/Enter/Space or the orientation's arrow key (and on
 * hover-intent for pointers, never hover-only — every panel is reachable by
 * keyboard and touch), Escape closes the open panel and returns focus to its
 * trigger, and focus moves out of the bar with Tab.
 *
 * The root renders the `<nav>` landmark itself, so give it an `aria-label`
 * (or `aria-labelledby`). This is site navigation between pages — use it, not
 * a Dropdown Menu (which is a menu of application *actions*).
 */
export function NavigationMenu({
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  value,
  defaultValue,
  onValueChange,
  delay,
  closeDelay,
  orientation = 'horizontal',
  children,
  ...props
}: NavigationMenuProps): React.JSX.Element {
  const handleValueChange = React.useCallback(
    (next: string | null) => {
      onValueChange?.(next)
    },
    [onValueChange]
  )

  return (
    // AmbientDirection makes the menu (and its portalled panel, since React
    // context crosses portals) follow the DOM `dir` — global or a local
    // `dir="rtl"` — so logical sides flip and the panel anchors on the reading
    // side, like the native components; Base UI reads a provider, not the DOM.
    <AmbientDirection>
      <BaseNav.Root
        {...props}
        value={value as never}
        defaultValue={defaultValue as never}
        onValueChange={handleValueChange as never}
        delay={delay}
        closeDelay={closeDelay}
        orientation={orientation}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        data-slot="navigation-menu"
        className={cn('relative', className)}
      >
        {children}
      </BaseNav.Root>
    </AmbientDirection>
  )
}

export type NavigationMenuListProps = React.ComponentPropsWithoutRef<'ul'>

/**
 * The row of top-level items. Renders a `<ul>` — a horizontal, wrapping row on
 * wide viewports; stack it (e.g. `flex-col`) via `className` for a side nav or
 * a small-screen layout.
 */
export const NavigationMenuList = React.forwardRef<HTMLUListElement, NavigationMenuListProps>(
  function NavigationMenuList({ className, ...props }, ref) {
    return (
      <BaseNav.List
        {...props}
        ref={ref}
        data-slot="navigation-menu-list"
        className={cn('flex flex-col md:flex-row md:flex-wrap md:items-center', className)}
      />
    )
  }
)

// True inside a mega-menu panel, false on the top-level bar. Lets a
// NavigationMenuLink pick its treatment automatically: bar items read as
// primary nav carried by the block-end border, while panel items read as
// navigation links (subtle color, underline on hover, no visited tint) rather
// than body links — both are inside the nav landmark.
const NavigationMenuPanelContext = React.createContext(false)

export interface NavigationMenuItemProps extends React.ComponentPropsWithoutRef<'li'> {
  /**
   * Stable identifier for this item, used to control which panel is open. A
   * unique id is generated when omitted.
   */
  value?: string
}

/**
 * One top-level entry. Renders a `<li>` that wraps either a
 * `NavigationMenuTrigger` + `NavigationMenuContent` pair (a panel) or a lone
 * `NavigationMenuLink` (a direct destination).
 */
export const NavigationMenuItem = React.forwardRef<HTMLLIElement, NavigationMenuItemProps>(
  function NavigationMenuItem({ className, value, ...props }, ref) {
    return (
      <BaseNav.Item
        {...props}
        ref={ref}
        value={value}
        data-slot="navigation-menu-item"
        className={cn('flex', className)}
      />
    )
  }
)

// The shared visual for a top-level bar entry — trigger OR direct link — so the
// two read as one row. It mirrors the Header nav-link contract: a 44px target,
// a block-end border that is transparent until the item is current/open, and an
// underline restored on hover. Current and open are signalled by border + weight
// (never color alone), so they survive forced-colors mode; the real border also
// paints a boundary there. `border-b` equals `border-block-end` in horizontal
// writing modes, so it never touches the inline axis the logical-props rule
// governs.
export const navigationMenuTriggerVariants = cva(
  [
    'flex min-h-11 w-full select-none items-center gap-1 border-b-2 bg-transparent px-105 text-sm text-foreground md:w-auto',
    // no-underline overrides the global "links are always underlined"
    // accessibility rule: a top-level bar item (whether it renders as a
    // <button> trigger or an <a>) is primary nav, not a body link. State is
    // carried by the block-end border ALONE — one line that never stacks with a
    // text underline. (Hover/open used to also add a text underline, which sat
    // just under the text, above the box-bottom border, and read as two faint
    // parallel lines; the border is the single affordance now.)
    'no-underline transition-colors motion-reduce:transition-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    // Open panel: non-color indicators (border tint + weight), so the active
    // trigger is distinguishable in forced-colors mode. No underline.
    'data-[popup-open]:border-border-strong data-[popup-open]:font-medium',
  ],
  {
    variants: {
      current: {
        // Current page: aria-current="page" plus non-color indicators — a 2px
        // block-end border and heavier weight (matches the Header contract).
        true: 'border-primary font-medium',
        // Resting: transparent border; hover tints it (the single hover
        // affordance, matching the open/current treatment) rather than adding a
        // text underline that would double up with the border on active items.
        false: 'border-transparent hover:border-border-strong',
      },
    },
    defaultVariants: {
      current: false,
    },
  }
)

export interface NavigationMenuTriggerProps
  extends React.ComponentPropsWithoutRef<'button'> {
  /**
   * Hide the trailing chevron. It is decorative (the accessible open/closed
   * state comes from `aria-expanded`), so removing it is purely visual.
   * @default false
   */
  hideChevron?: boolean
}

/**
 * The button that opens an item's panel. Renders a `<button>` with
 * `aria-expanded` and `aria-controls` wired to the shared panel by Base UI.
 * Opens on click, Enter, Space, or the orientation's arrow key (Down for a
 * horizontal bar), and on hover-intent for pointers. The trailing chevron
 * rotates on open and is decorative.
 */
export const NavigationMenuTrigger = React.forwardRef<HTMLButtonElement, NavigationMenuTriggerProps>(
  function NavigationMenuTrigger({ className, hideChevron = false, children, ...props }, ref) {
    return (
      <BaseNav.Trigger
        {...props}
        ref={ref}
        data-slot="navigation-menu-trigger"
        className={cn(navigationMenuTriggerVariants({ current: false }), className)}
      >
        <span className="grow truncate text-start">{children}</span>
        {hideChevron ? null : (
          <BaseNav.Icon
            data-slot="navigation-menu-trigger-icon"
            className="flex shrink-0 transition-transform duration-150 ease-standard data-[popup-open]:rotate-180 motion-reduce:transition-none"
          >
            <ChevronDownIcon />
          </BaseNav.Icon>
        )}
      </BaseNav.Trigger>
    )
  }
)

export interface NavigationMenuLinkProps
  extends Omit<LinkProps, 'ref'> {
  /**
   * Destination this link points to. Both placements read as navigation, not
   * body content. A link inside a mega-menu panel takes the subtle nav-link
   * treatment (inherits the panel text color, underline on hover, no visited
   * tint). A link on the top-level bar matches the triggers beside it (no
   * persistent underline, the block-end border carries hover and current/open,
   * shown by weight + border), so the bar reads as one consistent row.
   */
  href?: string
  /**
   * Marks this as the current page: sets `aria-current="page"` and adds a
   * non-color indicator (heavier weight), so it reads as current in
   * forced-colors mode too.
   */
  current?: boolean
  /**
   * Close the open panel when this link is activated. Useful for links inside
   * a panel so the menu dismisses on navigation. @default true
   */
  closeOnClick?: boolean
}

/**
 * A destination link. Reuses the Commons `Link` (so it inherits the mandatory
 * underline, focus ring, and visited color) while participating in Base UI's
 * keyboard/focus management inside the menu. Use it for a lone top-level item
 * or for links inside a panel. `current` sets `aria-current="page"` with a
 * non-color indicator.
 */
export const NavigationMenuLink = React.forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
  function NavigationMenuLink(
    { className, current = false, closeOnClick = true, children, ...props },
    ref
  ) {
    const insidePanel = React.useContext(NavigationMenuPanelContext)

    if (!insidePanel) {
      // Top-level bar link: share the trigger's visual so a plain destination
      // and a panel trigger read as the same kind of nav item. `Link`-specific
      // props (variant/external icon) do not apply to a bar item — the same as
      // a trigger — and are not valid DOM attributes, so strip them.
      const { variant: _variant, external: _external, externalLabel: _externalLabel, ...anchorProps } =
        props
      return (
        <BaseNav.Link
          active={current}
          closeOnClick={closeOnClick}
          render={
            <a
              {...anchorProps}
              ref={ref}
              data-slot="navigation-menu-link"
              // aria-current comes from Base UI's `active`; the trigger
              // variants add the non-color current/open cues (weight + border).
              className={cn(navigationMenuTriggerVariants({ current }), className)}
            >
              <span className="grow truncate text-start">{children}</span>
            </a>
          }
        />
      )
    }

    // Inside a panel: a navigation link, not body content. It sits in a
    // labelled nav landmark (the menu's <nav>), so it follows the Commons
    // nav-link convention rather than the body-link one — `subtle` inherits the
    // surrounding text color and drops the visited state (a purple "visited"
    // tint on primary nav reads as a bug, same call as the footer), and the
    // persistent underline gives way to an underline on hover only. Every panel
    // item is a link, so there is no body text to disambiguate from.
    return (
      <BaseNav.Link
        active={current}
        closeOnClick={closeOnClick}
        render={
          <Link
            {...props}
            ref={ref}
            variant="subtle"
            data-slot="navigation-menu-link"
            // aria-current comes from Base UI's `active`; the weight bump is the
            // non-color redundancy so the current link is not signalled by color
            // alone (WCAG 1.4.1 / forced-colors). `no-underline hover:underline`
            // overrides Link's always-underline base (cn → tailwind-merge, last
            // utility wins).
            className={cn(
              'flex min-h-11 flex-col justify-center no-underline hover:underline',
              current && 'font-medium',
              className
            )}
          >
            {children}
          </Link>
        }
      />
    )
  }
)

export interface NavigationMenuContentProps
  extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * Keep the panel markup in the DOM while it is closed. Ensures panel links
   * are present for server-side rendering / crawlers and find-in-page.
   * @default false
   */
  keepMounted?: boolean
}

/**
 * The panel revealed by a `NavigationMenuTrigger`. Its content is moved into
 * the shared `NavigationMenuViewport` when the item is active. Lay grouped
 * links out inside it (a grid of `NavigationMenuLink`s, optional group
 * headings and descriptions).
 */
export const NavigationMenuContent = React.forwardRef<HTMLDivElement, NavigationMenuContentProps>(
  function NavigationMenuContent({ className, keepMounted, children, ...props }, ref) {
    return (
      <BaseNav.Content
        {...props}
        ref={ref}
        keepMounted={keepMounted}
        data-slot="navigation-menu-content"
        className={cn('w-max max-w-[calc(100vw-2rem)] p-2', className)}
      >
        {/* Links rendered in here are body links (underlined); the flag tells
            NavigationMenuLink it is inside a panel, not on the top-level bar. */}
        <NavigationMenuPanelContext.Provider value={true}>
          {children}
        </NavigationMenuPanelContext.Provider>
      </BaseNav.Content>
    )
  }
)

export type NavigationMenuLinkGroupProps = React.ComponentPropsWithoutRef<'div'> & {
  /** Optional heading text for the group, wired as its accessible label. */
  label?: React.ReactNode
}

/**
 * An optional labelled cluster of panel links. Renders a `<div>` with a
 * heading (when `label` is set) linked via `aria-labelledby`, so a screen
 * reader announces the group name before its links.
 */
export const NavigationMenuLinkGroup = React.forwardRef<HTMLDivElement, NavigationMenuLinkGroupProps>(
  function NavigationMenuLinkGroup({ className, label, children, ...props }, ref) {
    const headingId = React.useId()
    return (
      <div
        {...props}
        ref={ref}
        role="group"
        data-slot="navigation-menu-link-group"
        aria-labelledby={label != null ? headingId : undefined}
        className={cn('flex min-w-[12rem] flex-col', className)}
      >
        {label != null ? (
          <p
            id={headingId}
            data-slot="navigation-menu-link-group-label"
            // No inline padding: the heading shares the exact inline-start edge
            // of the links listed under it (which have none), so the group
            // reads as a single left-aligned column instead of an inset title.
            className="py-05 text-sm font-semibold text-muted-foreground"
          >
            {label}
          </p>
        ) : null}
        {children}
      </div>
    )
  }
)

export const navigationMenuPopupVariants = cva([
  // The visible surface. A real border on every state keeps a boundary in
  // forced-colors mode; the panel size animates between items via the
  // Base UI `--popup-width`/`--popup-height` vars, and height is capped to the
  // anchor-relative available space so a tall panel scrolls instead of running
  // off screen (usable at 400% zoom / reflow).
  'relative h-[var(--popup-height)] w-[var(--popup-width)] origin-[var(--transform-origin)]',
  'overflow-hidden rounded-md border border-border bg-background text-foreground shadow-3',
  '[max-block-size:var(--available-height)]',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  // Motion: fade + slight scale + size via Base UI transition states, disabled
  // for reduced-motion users. Easing token comes from the Tailwind bridge.
  'motion-safe:transition-[opacity,scale,width,height] motion-safe:duration-150 motion-safe:ease-standard',
  'motion-safe:data-[starting-style]:opacity-0 motion-safe:data-[starting-style]:scale-95',
  'motion-safe:data-[ending-style]:opacity-0 motion-safe:data-[ending-style]:scale-95',
])

export interface NavigationMenuViewportProps
  extends Omit<React.ComponentPropsWithoutRef<'nav'>, 'dir'> {
  /**
   * Accessible name for the panel's `<nav>` region (Base UI renders the popup
   * as a `<nav>`). Naming it keeps it distinct from the root landmark.
   * Translation-ready. @default "Submenu"
   */
  popupLabel?: string
  /** Which side of the trigger row to open on. @default "bottom" */
  side?: NavigationMenuSide
  /** Alignment along the chosen side. @default "start" */
  align?: NavigationMenuAlign
  /** Gap between the trigger row and the panel, in pixels. @default 6 */
  sideOffset?: number
  /** Shift along the alignment axis, in pixels. @default 0 */
  alignOffset?: number
  /** Keep the panel a fixed distance from the viewport edge, in pixels. @default 8 */
  collisionPadding?: number
  /** Portal container. Defaults to `document.body`. */
  container?: React.ComponentProps<typeof BaseNav.Portal>['container']
  /** Class merged onto the positioner (rarely needed). */
  positionerClassName?: string
  /** Class merged onto the clipping viewport (rarely needed). */
  viewportClassName?: string
}

/**
 * The floating panel surface: portal + positioner + popup + viewport. Place it
 * once, as a sibling of `NavigationMenuList`, inside `NavigationMenu`. Base UI
 * teleports the active item's `NavigationMenuContent` into the viewport,
 * supplies Escape-to-close with focus return to the trigger, and flips logical
 * sides in RTL and on collision. Commons adds the styling.
 */
export const NavigationMenuViewport = React.forwardRef<HTMLElement, NavigationMenuViewportProps>(
  function NavigationMenuViewport(
    {
      className,
      positionerClassName,
      viewportClassName,
      popupLabel = 'Submenu',
      side = 'bottom',
      align = 'start',
      sideOffset = 6,
      alignOffset = 0,
      collisionPadding = 8,
      container,
      ...props
    },
    ref
  ) {
    return (
      <BaseNav.Portal container={container}>
        <BaseNav.Positioner
          data-slot="navigation-menu-positioner"
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          collisionPadding={collisionPadding}
          className={cn('z-50 box-border', positionerClassName)}
        >
          <BaseNav.Popup
            {...props}
            ref={ref}
            aria-label={props['aria-label'] ?? popupLabel}
            data-slot="navigation-menu-popup"
            className={cn(navigationMenuPopupVariants(), className)}
          >
            <BaseNav.Viewport
              data-slot="navigation-menu-viewport"
              className={cn('relative size-full overflow-hidden', viewportClassName)}
            />
          </BaseNav.Popup>
        </BaseNav.Positioner>
      </BaseNav.Portal>
    )
  }
)

/**
 * The raw Base UI Navigation Menu parts (`Root`, `List`, `Item`, `Trigger`,
 * `Content`, `Link`, `Icon`, `Portal`, `Positioner`, `Popup`, `Viewport`,
 * `Arrow`, …), for layouts the composed API does not cover. Style with the
 * exported `navigationMenuPopupVariants` / `navigationMenuTriggerVariants` to
 * stay on-token.
 */
export const NavigationMenuPrimitive = BaseNav
