// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/cn'

/*
 * Site header. Composes HeaderTitle (home link), HeaderNav / HeaderNavLink
 * (primary navigation) and HeaderMenuButton (mobile disclosure).
 *
 * The mobile menu is a DISCLOSURE, not a dialog (same precedent as
 * GovBanner): a native <button> with aria-expanded / aria-controls toggling
 * the `hidden` attribute on the nav. The nav content always stays in the
 * DOM, so screen-reader element lists and find-in-page behave predictably,
 * and no focus trap is needed.
 *
 * The skip link is deliberately NOT part of this component: pages place the
 * core-provided `.cui-skip-link` anchor before the Header (it must be the
 * first focusable element on the page, ahead of GovBanner and Header).
 */

export const headerVariants = cva(
  // The header is a page-level banner landmark. The block-end border gives
  // it a visible boundary in forced-colors mode. (Tailwind's border-b sets
  // border-bottom, which equals border-block-end in every horizontal
  // writing mode — the logical-properties rule targets the inline axis,
  // which this never touches.)
  ['border-b border-border bg-background text-foreground']
)

interface HeaderContextValue {
  expanded: boolean
  setExpanded: (next: boolean) => void
  navId: string
  menuButtonRef: React.RefObject<HTMLButtonElement | null>
}

const HeaderContext = React.createContext<HeaderContextValue | null>(null)

function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ;(ref as React.MutableRefObject<T | null>).current = node
      }
    }
  }
}

export interface HeaderProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof headerVariants> {
  /**
   * Controlled expanded state of the mobile menu. When set, the Header
   * never changes the state itself — pair with `onMenuExpandedChange`.
   */
  menuExpanded?: boolean
  /**
   * Initial expanded state of the mobile menu (uncontrolled).
   * @default false
   */
  defaultMenuExpanded?: boolean
  /** Called with the next state whenever the menu is toggled. */
  onMenuExpandedChange?: (expanded: boolean) => void
}

/**
 * Site header landmark (`<header>` → `banner` role at the page level).
 * Children compose: `HeaderTitle`, `HeaderMenuButton`, `HeaderNav`.
 *
 * Below the `md` breakpoint the nav collapses behind `HeaderMenuButton`;
 * Escape anywhere inside the header closes the open menu and returns focus
 * to the button.
 */
export const Header = React.forwardRef<HTMLElement, HeaderProps>(function Header(
  {
    className,
    menuExpanded,
    defaultMenuExpanded = false,
    onMenuExpandedChange,
    onKeyDown,
    children,
    ...props
  },
  ref
) {
  const [uncontrolledExpanded, setUncontrolledExpanded] = React.useState(defaultMenuExpanded)
  const expanded = menuExpanded ?? uncontrolledExpanded
  const navId = React.useId()
  const menuButtonRef = React.useRef<HTMLButtonElement | null>(null)

  const setExpanded = React.useCallback(
    (next: boolean) => {
      if (menuExpanded === undefined) {
        setUncontrolledExpanded(next)
      }
      onMenuExpandedChange?.(next)
    },
    [menuExpanded, onMenuExpandedChange]
  )

  const contextValue = React.useMemo<HeaderContextValue>(
    () => ({ expanded, setExpanded, navId, menuButtonRef }),
    [expanded, setExpanded, navId]
  )

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>): void => {
    onKeyDown?.(event)
    if (event.defaultPrevented) {
      return
    }
    // Disclosure contract: Escape closes the open menu and returns focus to
    // the button that opened it. At `md:` and up the nav is always visible
    // (CSS overrides the hidden attribute), so collapsing there is inert.
    if (event.key === 'Escape' && expanded) {
      setExpanded(false)
      menuButtonRef.current?.focus()
    }
  }

  return (
    <header
      {...props}
      ref={ref}
      data-slot="header"
      onKeyDown={handleKeyDown}
      className={cn(headerVariants(), className)}
    >
      <HeaderContext.Provider value={contextValue}>
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-2 px-2 py-1">
          {children}
        </div>
      </HeaderContext.Provider>
    </header>
  )
})

export interface HeaderTitleProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Site name, rendered as the home link's text. */
  title: string
  /**
   * Home destination of the title link.
   * @default "/"
   */
  href?: string
  /**
   * Optional logo slot rendered before the title (an `<img>` with alt text,
   * or a decorative inline SVG with `aria-hidden`). Sized by the consumer.
   */
  logo?: React.ReactNode
}

/**
 * The site identity: a single home link (`<a>`) holding an optional logo
 * and the site name.
 *
 * Underline note (WCAG 1.4.1): Commons underlines links in body text, where
 * color alone would have to carry link-ness. The site title is a standalone
 * identity link inside the banner landmark — a universal convention users
 * identify by position, not color — so it is exempt from the always-underline
 * rule. Hover and focus still add explicit affordances (underline + ring).
 */
export const HeaderTitle = React.forwardRef<HTMLAnchorElement, HeaderTitleProps>(
  function HeaderTitle({ className, title, href = '/', logo, ...props }, ref) {
    return (
      <a
        {...props}
        ref={ref}
        href={href}
        data-slot="header-title"
        className={cn(
          'flex min-h-11 items-center gap-105 text-lg font-semibold text-foreground',
          // no-underline: Commons underlines links by default; this identity
          // link opts out and restores the underline on hover only.
          'no-underline underline-offset-2 hover:underline',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          className
        )}
      >
        {logo}
        {title}
      </a>
    )
  }
)

export interface HeaderNavProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Accessible label of the `<nav>` landmark. Translation-ready: pass a
   * localized string. A native `aria-label` prop wins if both are set.
   * @default "Primary"
   */
  ariaLabel?: string
}

/**
 * Primary navigation landmark. Children are `HeaderNavLink` items, rendered
 * in a `<ul>` — vertical below `md`, horizontal from `md` up.
 *
 * Inside a Header, the nav collapses below `md`: the `hidden` attribute is
 * set while the menu is closed (content stays in the DOM), and `md:block`
 * overrides it so the nav is always visible on wider viewports.
 */
export const HeaderNav = React.forwardRef<HTMLElement, HeaderNavProps>(function HeaderNav(
  { className, ariaLabel = 'Primary', id, children, ...props },
  ref
) {
  const context = React.useContext(HeaderContext)

  return (
    <nav
      {...props}
      ref={ref}
      id={id ?? context?.navId}
      data-slot="header-nav"
      aria-label={props['aria-label'] ?? ariaLabel}
      className={cn(
        // Mobile expanded panel: full width, separated by a block-start
        // border; desktop: inline row, no panel chrome. Collapse with the
        // `hidden` UTILITY (not the `hidden` attribute): Tailwind Preflight's
        // `[hidden]{display:none!important}` would beat `md:block`, hiding the
        // nav at md+ too. `hidden md:block` lets md:block win at md and up.
        'w-full border-t border-border pt-1 pb-1 md:block md:w-auto md:border-t-0 md:pt-0 md:pb-0',
        context && !context.expanded && 'hidden',
        className
      )}
    >
      <ul className="flex flex-col md:flex-row md:flex-wrap md:items-center md:gap-x-1">
        {children}
      </ul>
    </nav>
  )
})

export const headerNavLinkVariants = cva(
  /*
   * Nav links are the documented exception to the always-underline link
   * rule (see docs/accessibility.md): WCAG 1.4.1 forbids conveying
   * link-ness by COLOR ALONE, which applies to links inside body text.
   * Links grouped in a labelled nav landmark are identified by structure
   * and convention rather than color, so the resting state may omit the
   * underline PROVIDED the other affordances are explicit — which they are
   * here: hover restores the underline, focus shows the 2px ring, and the
   * current page is marked by aria-current plus two non-color indicators
   * (2px block-end border + font weight).
   */
  [
    'flex min-h-11 w-full items-center gap-1 border-b-2 px-105 text-sm text-foreground',
    // no-underline: Commons underlines links by default; nav links opt out
    // (the border-b-2 + weight carry current-state) and underline on hover only.
    'no-underline underline-offset-2 transition-colors hover:underline motion-reduce:transition-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    'md:w-auto',
  ],
  {
    variants: {
      current: {
        // Current page: aria-current="page" plus non-color indicators —
        // a 2px block-end border (border-bottom == border-block-end in
        // horizontal writing modes) and heavier weight.
        true: 'border-primary font-medium',
        false: 'border-transparent',
      },
    },
    defaultVariants: {
      current: false,
    },
  }
)

export interface HeaderNavLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    Omit<VariantProps<typeof headerNavLinkVariants>, 'current'> {
  /** Marks the link as the current page: `aria-current="page"` + indicator. */
  current?: boolean
}

/**
 * One primary-nav item: a `<li>` wrapping a native `<a>`. `current` sets
 * `aria-current="page"` with a non-color visual indicator.
 */
export const HeaderNavLink = React.forwardRef<HTMLAnchorElement, HeaderNavLinkProps>(
  function HeaderNavLink({ className, current = false, ...props }, ref) {
    return (
      <li className="flex">
        <a
          {...props}
          ref={ref}
          data-slot="header-nav-link"
          aria-current={current ? 'page' : undefined}
          className={cn(headerNavLinkVariants({ current }), className)}
        />
      </li>
    )
  }
)

/** Hamburger / close glyph. Decorative; `currentColor` only — forced-colors safe. */
function MenuIcon({ expanded }: { expanded: boolean }): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="size-2 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    >
      {expanded ? (
        <>
          <path d="m3.5 3.5 9 9" />
          <path d="m12.5 3.5-9 9" />
        </>
      ) : (
        <>
          <path d="M2.5 4.5h11" />
          <path d="M2.5 8h11" />
          <path d="M2.5 11.5h11" />
        </>
      )}
    </svg>
  )
}

export interface HeaderMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visible text (and therefore accessible name) of the disclosure button.
   * Translation-ready: pass a localized string.
   * @default "Menu"
   */
  menuLabel?: string
}

/**
 * The mobile menu disclosure button. Hidden from `md` up (where the nav is
 * always visible). Native `<button>` with `aria-expanded` / `aria-controls`
 * wired to the sibling `HeaderNav` — Enter and Space toggle for free.
 */
export const HeaderMenuButton = React.forwardRef<HTMLButtonElement, HeaderMenuButtonProps>(
  function HeaderMenuButton({ className, menuLabel = 'Menu', onClick, ...props }, ref) {
    const context = React.useContext(HeaderContext)

    return (
      <button
        type="button"
        {...props}
        ref={composeRefs(ref, context?.menuButtonRef)}
        data-slot="header-menu-button"
        aria-expanded={context?.expanded ?? false}
        aria-controls={context?.navId}
        onClick={(event) => {
          onClick?.(event)
          if (!event.defaultPrevented && context) {
            context.setExpanded(!context.expanded)
          }
        }}
        className={cn(
          // 44px minimum target; visible text label (no icon-only button).
          // The real border doubles as the forced-colors boundary.
          'inline-flex min-h-11 min-w-11 items-center justify-center gap-1',
          'rounded-md border border-border-strong px-105 text-sm font-medium',
          'hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          'md:hidden',
          className
        )}
      >
        <MenuIcon expanded={context?.expanded ?? false} />
        {menuLabel}
      </button>
    )
  }
)
