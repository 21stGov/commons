// SPDX-License-Identifier: MIT

'use client'

import * as React from 'react'

import { useHeaderMenu } from '@/components/ui/header'
import { ChevronDownIcon } from '@/components/ui/icon'
import { Link } from '@/components/ui/link'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuLinkGroup,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/cn'

/** A direct top-level destination. */
export interface HeaderNavLinkItem {
  label: string
  href: string
  /** Marks the current page: adds `aria-current` and a non-color (weight) cue. */
  current?: boolean
}

/** A headed column of links inside a panel. */
export interface HeaderNavGroup {
  heading: string
  links: readonly HeaderNavLinkItem[]
}

/** A top-level item that opens a panel of grouped links. */
export interface HeaderNavPanel {
  label: string
  groups: readonly HeaderNavGroup[]
}

/** One top-level nav entry: a direct link, or a panel of grouped links. */
export type HeaderNavItem = HeaderNavLinkItem | HeaderNavPanel

function isPanel(item: HeaderNavItem): item is HeaderNavPanel {
  return 'groups' in item
}

export interface HeaderNavigationMenuProps {
  /** Top-level navigation. Each item is a direct link or a grouped panel. */
  items: readonly HeaderNavItem[]
  /**
   * Overrides the nav landmark id the `HeaderMenuButton` controls. Defaults to
   * the id from the enclosing `Header`.
   */
  id?: string
  /** Accessible name for the navigation landmark. @default "Primary" */
  'aria-label'?: string
  /** Class merged onto the desktop menu bar's wrapper. */
  className?: string
}

/**
 * The Header's primary navigation, driven by a single `items` array so one
 * source of nav data renders two presentations:
 *
 * - **`md` and up** — a `NavigationMenu` mega-menu: panels float above the
 *   (optionally sticky) header, open on click / Enter / Space / arrow key (and
 *   hover-intent for pointers), Escape closes and returns focus to the trigger.
 * - **below `md`** — an inline accordion built from native `<details>`: tapping
 *   a section expands its links in place and pushes the page down (no floating
 *   overlay, which reads as an afterthought on a phone). The whole nav collapses
 *   behind the `HeaderMenuButton` (its `aria-controls` points here by id).
 *
 * Each breakpoint's tree is `display`-toggled, so only one is ever in the
 * accessibility tree — screen readers announce a single "Primary" landmark.
 * `<details>` gives the accordion its keyboard and disclosure semantics for
 * free (Enter / Space toggle, `open` is real HTML state), so collapsed links
 * stay in the DOM for find-in-page. Drop it inside `<Header>` in place of
 * `HeaderNav` when top-level destinations need grouped panels; outside a Header
 * the accordion simply never collapses.
 *
 * Every part carries a `data-slot`, so the framework-agnostic path gets the
 * same presentation as generated `.cui-header-navigation-menu-*` classes.
 */
export function HeaderNavigationMenu({
  items,
  id,
  'aria-label': ariaLabel = 'Primary',
  className,
}: HeaderNavigationMenuProps): React.JSX.Element {
  const menu = useHeaderMenu()
  const navId = id ?? menu.id
  // Group the accordion's <details> so only one section is open at a time
  // (browsers without exclusive-accordion support just allow several open).
  const panelGroupName = navId ? `${navId}-panel` : undefined

  return (
    <>
      {/* Desktop: the floating mega-menu (md+ only). */}
      <div data-slot="header-navigation-menu-desktop" className={cn('hidden md:block', className)}>
        <NavigationMenu aria-label={ariaLabel}>
          <NavigationMenuList className="md:gap-x-1">
            {items.map((item) =>
              isPanel(item) ? (
                <NavigationMenuItem key={item.label} value={item.label}>
                  <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="flex flex-col gap-2 md:flex-row md:gap-6">
                      {item.groups.map((group) => (
                        <NavigationMenuLinkGroup key={group.heading} label={group.heading}>
                          {group.links.map((link) => (
                            <NavigationMenuLink
                              key={`${link.href}:${link.label}`}
                              href={link.href}
                              current={link.current}
                            >
                              {link.label}
                            </NavigationMenuLink>
                          ))}
                        </NavigationMenuLinkGroup>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : (
                <NavigationMenuItem key={item.label}>
                  <NavigationMenuLink href={item.href} current={item.current}>
                    {item.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )
            )}
          </NavigationMenuList>
          <NavigationMenuViewport />
        </NavigationMenu>
      </div>

      {/* Mobile: an inline <details> accordion (below md), collapsing with the
          header disclosure. */}
      <nav
        id={navId}
        aria-label={ariaLabel}
        data-slot="header-navigation-menu-accordion"
        className={cn('w-full border-t border-border md:hidden', menu.collapsed && 'hidden')}
      >
        <ul
          data-slot="header-navigation-menu-accordion-list"
          className="m-0 flex list-none flex-col divide-y divide-border p-0"
        >
          {items.map((item) =>
            isPanel(item) ? (
              <li key={item.label}>
                <details
                  name={panelGroupName}
                  data-slot="header-navigation-menu-panel"
                  className="group/panel"
                >
                  <summary
                    data-slot="header-navigation-menu-panel-summary"
                    className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 py-1 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {item.label}
                    <span
                      data-slot="header-navigation-menu-panel-icon"
                      className="inline-flex shrink-0 text-muted-foreground transition-transform group-open/panel:rotate-180 motion-reduce:transition-none"
                    >
                      <ChevronDownIcon aria-hidden="true" />
                    </span>
                  </summary>
                  <div
                    data-slot="header-navigation-menu-panel-content"
                    className="flex flex-col gap-2 pb-2 ps-2"
                  >
                    {item.groups.map((group) => (
                      <div
                        key={group.heading}
                        data-slot="header-navigation-menu-group"
                        className="flex flex-col"
                      >
                        <p
                          data-slot="header-navigation-menu-group-heading"
                          className="pb-05 text-xs font-semibold uppercase text-muted-foreground"
                        >
                          {group.heading}
                        </p>
                        <ul
                          data-slot="header-navigation-menu-group-list"
                          className="m-0 flex list-none flex-col p-0"
                        >
                          {group.links.map((link) => (
                            <li key={`${link.href}:${link.label}`}>
                              <Link
                                href={link.href}
                                data-slot="header-navigation-menu-group-link"
                                aria-current={link.current ? 'page' : undefined}
                                className={cn(
                                  'flex min-h-11 items-center text-sm text-foreground no-underline hover:underline',
                                  link.current && 'font-semibold'
                                )}
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </details>
              </li>
            ) : (
              <li key={item.label}>
                <Link
                  href={item.href}
                  data-slot="header-navigation-menu-accordion-link"
                  aria-current={item.current ? 'page' : undefined}
                  className={cn(
                    'flex min-h-11 items-center py-1 text-sm text-foreground no-underline hover:underline',
                    item.current ? 'font-semibold' : 'font-medium'
                  )}
                >
                  {item.label}
                </Link>
              </li>
            )
          )}
        </ul>
      </nav>
    </>
  )
}
