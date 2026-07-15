// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Link, type LinkProps } from '@/components/ui/link'
import { cn } from '@/lib/cn'

/*
 * Side navigation. Composes SidebarNav / SidebarSection / SidebarGroup /
 * SidebarItem into a nested list of links inside a labelled `<nav>` landmark,
 * plus SidebarTrigger for the small-screen disclosure.
 *
 * Responsive model (same precedent as Header / GovBanner): the mobile menu is
 * a DISCLOSURE, not a dialog. A native `<button>` with aria-expanded /
 * aria-controls toggles the `hidden` UTILITY CLASS on the nav; `md:block`
 * overrides it from the `md` breakpoint up, so the DESKTOP sidebar is a
 * PERSISTENT `<nav>` while the mobile one is disclosed.
 *
 * NB: this uses the `hidden` CLASS, not the `hidden` ATTRIBUTE. Tailwind v4
 * Preflight ships `[hidden]:where(:not([hidden="until-found"])) { display: none
 * !important }`, and a normal utility like `md:block` can never beat an
 * `!important` rule — so with the attribute the persistent nav would stay
 * `display:none` at `md+` (a blank dead spot, since the trigger is `md:hidden`).
 * The class carries no such important rule, so `md:block` wins as intended.
 *
 * The nav content always stays in the DOM, so no focus trap is needed. Escape
 * closes the open menu and returns focus to the trigger.
 *
 * The current page is marked with `aria-current="page"` plus TWO non-color
 * indicators — an inline-start accent bar (border-s, flips in RTL) and heavier
 * weight — so it survives Windows High Contrast / forced-colors mode where the
 * accent color is overridden.
 */

interface SidebarContextValue {
  expanded: boolean
  setExpanded: (next: boolean) => void
  navId: string
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

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

export const sidebarVariants = cva(['text-sm text-foreground'])

export interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof sidebarVariants> {
  /**
   * Controlled expanded state of the mobile menu. When set, the Sidebar never
   * changes the state itself — pair with `onMenuExpandedChange`.
   */
  menuExpanded?: boolean
  /**
   * Initial expanded state of the mobile menu (uncontrolled).
   * @default false
   */
  defaultMenuExpanded?: boolean
  /** Called with the next state whenever the mobile menu is toggled. */
  onMenuExpandedChange?: (expanded: boolean) => void
}

/**
 * Side-navigation root. Renders a neutral wrapper `<div>` and provides the
 * disclosure state to `SidebarTrigger` and `SidebarNav`. Below `md` the nav
 * collapses behind the trigger; from `md` up it is always visible (a persistent
 * rail). Escape anywhere inside the sidebar closes the open menu and returns
 * focus to the trigger.
 */
export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(function Sidebar(
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
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)

  const setExpanded = React.useCallback(
    (next: boolean) => {
      if (menuExpanded === undefined) {
        setUncontrolledExpanded(next)
      }
      onMenuExpandedChange?.(next)
    },
    [menuExpanded, onMenuExpandedChange]
  )

  const contextValue = React.useMemo<SidebarContextValue>(
    () => ({ expanded, setExpanded, navId, triggerRef }),
    [expanded, setExpanded, navId]
  )

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    onKeyDown?.(event)
    if (event.defaultPrevented) {
      return
    }
    // Disclosure contract: Escape closes the open menu and returns focus to the
    // trigger that opened it. At `md:` and up the nav is always visible (CSS
    // overrides the hidden attribute), so collapsing there is inert.
    if (event.key === 'Escape' && expanded) {
      setExpanded(false)
      triggerRef.current?.focus()
    }
  }

  return (
    <div
      {...props}
      ref={ref}
      data-slot="sidebar"
      onKeyDown={handleKeyDown}
      className={cn(sidebarVariants(), className)}
    >
      <SidebarContext.Provider value={contextValue}>{children}</SidebarContext.Provider>
    </div>
  )
})

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

export interface SidebarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visible text (and therefore accessible name) of the disclosure button.
   * Translation-ready: pass a localized string.
   * @default "Sections"
   */
  menuLabel?: string
}

/**
 * The small-screen menu disclosure button. Hidden from `md` up (where the nav
 * is always visible). A native `<button>` with `aria-expanded` / `aria-controls`
 * wired to the sibling `SidebarNav` — Enter and Space toggle for free. Carries
 * a visible text label (never icon-only) so its purpose is announced.
 */
export const SidebarTrigger = React.forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  function SidebarTrigger({ className, menuLabel = 'Sections', onClick, ...props }, ref) {
    const context = React.useContext(SidebarContext)

    return (
      <button
        type="button"
        {...props}
        ref={composeRefs(ref, context?.triggerRef)}
        data-slot="sidebar-trigger"
        aria-expanded={context?.expanded ?? false}
        aria-controls={context?.navId}
        onClick={(event) => {
          onClick?.(event)
          if (!event.defaultPrevented && context) {
            context.setExpanded(!context.expanded)
          }
        }}
        className={cn(
          // 44px minimum target; the real border doubles as the forced-colors
          // boundary. Hidden at md and up, where the nav is persistent.
          'inline-flex min-h-11 min-w-11 items-center justify-center gap-1',
          'rounded-md border border-border-strong px-105 text-sm font-medium',
          'transition-colors motion-reduce:transition-none hover:bg-muted',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
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

export interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Accessible label of the `<nav>` landmark. Required for a named landmark
   * (WCAG 2.4.1 / 1.3.1) — a page may hold several navs, and the name is how
   * assistive tech tells them apart. Translation-ready: pass a localized
   * string. A native `aria-label` / `aria-labelledby` prop wins if set.
   * @default "Sections"
   */
  ariaLabel?: string
}

/**
 * The navigation landmark. Renders a `<nav aria-label>` wrapping the root
 * `<ul>` of items, groups, and sections. Inside a `Sidebar` it collapses below
 * `md`: the `hidden` utility class is applied while the menu is closed (content
 * stays in the DOM, removed from the a11y tree via `display:none`), and
 * `md:block` overrides it so the nav is always visible on wider viewports — the
 * persistent desktop rail.
 */
export const SidebarNav = React.forwardRef<HTMLElement, SidebarNavProps>(function SidebarNav(
  { className, ariaLabel = 'Sections', id, children, ...props },
  ref
) {
  const context = React.useContext(SidebarContext)

  return (
    <nav
      {...props}
      ref={ref}
      id={id ?? context?.navId}
      data-slot="sidebar-nav"
      aria-label={props['aria-label'] ?? (props['aria-labelledby'] ? undefined : ariaLabel)}
      className={cn(
        // Mobile: full-width disclosed panel. Desktop: persistent rail. md:block
        // must stay — it is what overrides the `hidden` class at md and up.
        // Collapse uses the `hidden` CLASS (not the attribute): Tailwind v4
        // Preflight makes the `hidden` attribute `display:none !important`,
        // which `md:block` could never override — that is the blank-dead-spot
        // bug. `md:block` is ordered after `hidden`, so it wins from md up.
        'w-full md:block',
        context && !context.expanded && 'hidden',
        className
      )}
    >
      <ul data-slot="sidebar-list" className="m-0 flex list-none flex-col gap-0 p-0">
        {children}
      </ul>
    </nav>
  )
})

export interface SidebarSectionProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, 'title'> {
  /** Visible, non-interactive heading for the section. */
  label: React.ReactNode
  /**
   * Heading element for the section label — pick the level that fits the page
   * outline (no skipped levels). The nested list is named by this heading via
   * `aria-labelledby`.
   * @default "h2"
   */
  headingLevel?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

/**
 * A static, always-visible grouping: a section heading followed by its nested
 * list of items. Unlike `SidebarGroup` it does not collapse. The heading names
 * the nested `<ul>` (`aria-labelledby`), so screen-reader users hear which
 * section a list of links belongs to.
 */
export const SidebarSection = React.forwardRef<HTMLLIElement, SidebarSectionProps>(
  function SidebarSection({ className, label, headingLevel = 'h2', children, ...props }, ref) {
    const headingId = React.useId()
    const HeadingTag = headingLevel
    return (
      <li {...props} ref={ref} data-slot="sidebar-section" className={cn('list-none', className)}>
        <HeadingTag
          id={headingId}
          data-slot="sidebar-section-label"
          className="px-105 pb-05 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          {label}
        </HeadingTag>
        <ul
          aria-labelledby={headingId}
          data-slot="sidebar-section-list"
          className="m-0 flex list-none flex-col gap-0 p-0"
        >
          {children}
        </ul>
      </li>
    )
  }
)

export interface SidebarGroupProps {
  /** Visible label for the group's disclosure trigger. */
  label: React.ReactNode
  /**
   * Optional leading icon for the group label. Decorative — pass a Commons
   * `Icon` (aria-hidden by default) or any node; the visible label carries the
   * meaning.
   */
  icon?: React.ReactNode
  /** Open by default (uncontrolled). @default false */
  defaultOpen?: boolean
  /** Controlled open state. Pair with `onOpenChange`. */
  open?: boolean
  /** Called with the next open state whenever the group is toggled. */
  onOpenChange?: (open: boolean) => void
  /** Extra classes for the group's `<li>`. */
  className?: string
  /** The nested `SidebarItem`s revealed when the group is open. */
  children?: React.ReactNode
}

/**
 * An expandable sub-section built on the Commons `Collapsible`. The label is a
 * native disclosure `<button>` (Base UI wires `aria-expanded` / `aria-controls`
 * and Enter / Space toggle); its nested list of items lives in the collapsible
 * panel. Open state is conveyed by the chevron direction + `aria-expanded`,
 * never by color alone.
 */
export const SidebarGroup = React.forwardRef<HTMLLIElement, SidebarGroupProps>(
  function SidebarGroup(
    { label, icon, defaultOpen, open, onOpenChange, className, children },
    ref
  ) {
    return (
      <li ref={ref} data-slot="sidebar-group" className={cn('list-none', className)}>
        <Collapsible defaultOpen={defaultOpen} open={open} onOpenChange={onOpenChange}>
          <CollapsibleTrigger
            data-slot="sidebar-group-trigger"
            className={cn(
              // Full-width row spacing the label from the chevron. Overrides the
              // Collapsible's link styling so a group header reads as nav text:
              // foreground color, underline only on hover (nav landmark
              // exception to always-underline — see language-selector). 44px min
              // target is inherited from the Collapsible trigger.
              'flex w-full items-center justify-between gap-105 px-105',
              'text-foreground no-underline hover:underline'
            )}
          >
            <span className="inline-flex min-w-0 items-center gap-105">
              {icon != null ? (
                <span data-slot="sidebar-group-icon" className="flex shrink-0 items-center">
                  {icon}
                </span>
              ) : null}
              <span className="truncate">{label}</span>
            </span>
          </CollapsibleTrigger>
          <CollapsiblePanel data-slot="sidebar-group-panel">
            <ul
              data-slot="sidebar-group-list"
              className="m-0 flex list-none flex-col gap-0 p-0 ps-2"
            >
              {children}
            </ul>
          </CollapsiblePanel>
        </Collapsible>
      </li>
    )
  }
)

export const sidebarItemVariants = cva(
  [
    // Full-width nav row: 44px min target, a leading accent bar on the
    // inline-start edge (border-s — flips in RTL), and a flush inline-start
    // edge (rounded-none overrides the Link's rounded-sm so the bar sits on the
    // rail edge). The Commons Link keeps its mandatory underline (WCAG 1.4.1);
    // the focus ring comes from Link too.
    'flex min-h-11 w-full items-center gap-105 rounded-none border-s-2 pe-105 ps-105',
    // text-foreground explicitly: the item reuses the Commons Link but overrides
    // its data-slot, so the framework-agnostic `.cui-sidebar-item-link` loses
    // `.cui-link`'s color and falls back to the UA link blue. Nav items read as
    // foreground text (the underline still marks link-ness), not body links.
    'text-foreground',
    'transition-colors motion-reduce:transition-none',
  ],
  {
    variants: {
      current: {
        // Current page: aria-current="page" plus TWO non-color indicators — the
        // inline-start accent bar (border-primary) and heavier weight, with a
        // muted fill for extra emphasis. Stays distinguishable in forced-colors
        // mode where the accent color is overridden.
        true: 'border-primary bg-muted font-semibold',
        false: 'border-transparent',
      },
    },
    defaultVariants: {
      current: false,
    },
  }
)

export interface SidebarItemProps
  extends Omit<LinkProps, 'variant' | 'aria-current'>,
    Omit<VariantProps<typeof sidebarItemVariants>, 'current'> {
  /**
   * Optional leading icon. Decorative — pass a Commons `Icon` (aria-hidden by
   * default) or any node; the link text carries the meaning.
   */
  icon?: React.ReactNode
  /**
   * Marks this link as the current page: sets `aria-current="page"` and the
   * non-color current indicator (accent bar + weight).
   */
  current?: boolean
}

/**
 * One navigation link: a `<li>` wrapping a Commons `Link` (subtle variant, so
 * it inherits the rail's text color but keeps the mandatory underline). Set
 * `current` on the link for the page the user is on — it applies
 * `aria-current="page"` and a non-color indicator (inline-start accent bar +
 * heavier weight). An optional leading `icon` renders before the label.
 */
export const SidebarItem = React.forwardRef<HTMLAnchorElement, SidebarItemProps>(
  function SidebarItem({ className, icon, current = false, children, ...props }, ref) {
    return (
      <li data-slot="sidebar-item" className="flex list-none">
        <Link
          {...props}
          ref={ref}
          variant="subtle"
          data-slot="sidebar-item-link"
          aria-current={current ? 'page' : undefined}
          className={cn(sidebarItemVariants({ current }), className)}
        >
          {icon != null ? (
            <span data-slot="sidebar-item-icon" className="flex shrink-0 items-center">
              {icon}
            </span>
          ) : null}
          <span className="truncate">{children}</span>
        </Link>
      </li>
    )
  }
)
