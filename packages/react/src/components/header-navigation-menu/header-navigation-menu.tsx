// SPDX-License-Identifier: MIT

'use client'

import * as React from 'react'

import { useHeaderMenu } from '@/components/ui/header'
import { NavigationMenu, type NavigationMenuProps } from '@/components/ui/navigation-menu'
import { cn } from '@/lib/cn'

export interface HeaderNavigationMenuProps extends NavigationMenuProps {}

/**
 * A `NavigationMenu` wired into a `Header`'s mobile disclosure — the mega-menu
 * counterpart to `HeaderNav`. Drop it inside `<Header>` in place of `HeaderNav`
 * when top-level destinations need panels (grouped links, nested submenus);
 * compose the same `NavigationMenuList` / `NavigationMenuItem` /
 * `NavigationMenuTrigger` / `NavigationMenuContent` / `NavigationMenuViewport`
 * parts inside it.
 *
 * It reads the Header's disclosure state (via {@link useHeaderMenu}) so, below
 * the `md` breakpoint, the whole menu collapses behind the `HeaderMenuButton`
 * (the button's `aria-controls` points at this nav landmark by id) and shows
 * inline from `md` up. Nav content stays in the DOM the whole time — collapse
 * is the `hidden` utility, not unmounting — so screen-reader element lists and
 * find-in-page behave predictably. Outside a `Header` it renders a plain
 * `NavigationMenu` (never collapsed, no id).
 *
 * The mega-menu panels themselves are `NavigationMenu`'s: they open on click /
 * Enter / Space / arrow key (and hover-intent for pointers), Escape closes and
 * returns focus to the trigger, and they portal above the (optionally sticky)
 * header. This is React sugar over `useHeaderMenu`; the framework-agnostic path
 * composes `.cui-header` + `.cui-navigation-menu` markup directly.
 */
export function HeaderNavigationMenu({
  className,
  id,
  'aria-label': ariaLabel = 'Primary',
  children,
  ...props
}: HeaderNavigationMenuProps): React.JSX.Element {
  const menu = useHeaderMenu()
  return (
    <NavigationMenu
      {...props}
      id={id ?? menu.id}
      aria-label={ariaLabel}
      className={cn(
        // Mobile: a full-width disclosure panel with a block-start divider;
        // desktop: an inline row with no panel chrome. Collapse with the
        // `hidden` UTILITY (not the attribute) so `md:block` wins at md+ —
        // Tailwind Preflight's `[hidden]{display:none!important}` would beat it.
        // Mirrors HeaderNav so the two are interchangeable inside a Header.
        'w-full border-t border-border pt-1 pb-1 md:block md:w-auto md:border-t-0 md:pt-0 md:pb-0',
        menu.collapsed && 'hidden',
        className
      )}
    >
      {children}
    </NavigationMenu>
  )
}
