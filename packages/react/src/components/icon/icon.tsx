// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/cn'

// ---------------------------------------------------------------------------
// Curated starter set
// ---------------------------------------------------------------------------
//
// Every glyph is drawn on a 16×16 grid to match the inline SVGs already in the
// codebase (combo-box, pagination, badge): `viewBox="0 0 16 16"`, `fill="none"`,
// `stroke="currentColor"`, `strokeWidth="1.5"`, round caps and joins. The paint
// attributes live once on the wrapping `<svg>`, so each glyph body is just the
// geometry — a shared, on-grid house style rather than 23 one-off SVGs.
//
// currentColor (never a hardcoded fill) means an icon inherits the surrounding
// text color and survives Windows High Contrast / forced-colors mode, where a
// background-image icon would vanish.

interface Glyph {
  /** The path/shape geometry; inherits paint from the wrapping `<svg>`. */
  body: React.ReactNode
  /**
   * Points along the reading direction, so it must mirror in RTL. Chevrons and
   * arrows reverse; a magnifier or clock does not. When true the Icon adds
   * `rtl:-scale-x-100` unless the caller overrides with `flip`.
   */
  directional?: boolean
}

// A zero-length subpath (`h.01`) rendered with a round linecap paints a dot —
// used for the "i" tittle and the exclamation point below.
const glyphs = {
  'chevron-down': { body: <path d="m4 6 4 4 4-4" /> },
  'chevron-up': { body: <path d="m4 10 4-4 4 4" /> },
  'chevron-left': { body: <path d="M10 3.5 5.5 8l4.5 4.5" />, directional: true },
  'chevron-right': { body: <path d="m6 3.5 4.5 4.5L6 12.5" />, directional: true },
  'chevron-updown': {
    body: (
      <>
        <path d="m5 6.5 3-2.5 3 2.5" />
        <path d="m5 9.5 3 2.5 3-2.5" />
      </>
    ),
  },
  check: { body: <path d="m3.5 8.5 3 3 6-7" /> },
  x: { body: <path d="m4 4 8 8M12 4l-8 8" /> },
  // Alias of `x`, for readable call sites (`<Icon name="close" />`).
  close: { body: <path d="m4 4 8 8M12 4l-8 8" /> },
  plus: { body: <path d="M8 3.5v9M3.5 8h9" /> },
  minus: { body: <path d="M3.5 8h9" /> },
  'arrow-right': { body: <path d="M2.5 8h10M9 4.5 12.5 8 9 11.5" />, directional: true },
  search: {
    body: (
      <>
        <circle cx="7" cy="7" r="3.75" />
        <path d="m12.5 12.5-2.6-2.6" />
      </>
    ),
  },
  menu: { body: <path d="M3 4.5h10M3 8h10M3 11.5h10" /> },
  'external-link': {
    body: (
      <>
        <path d="M9 3.5h3.5V7" />
        <path d="M12.5 3.5 7.5 8.5" />
        <path d="M11 9v2.5A1.5 1.5 0 0 1 9.5 13h-5A1.5 1.5 0 0 1 3 11.5v-5A1.5 1.5 0 0 1 4.5 5H7" />
      </>
    ),
    directional: true,
  },
  download: {
    body: (
      <>
        <path d="M8 2.5v7.5M5 7l3 3 3-3" />
        <path d="M3 13h10" />
      </>
    ),
  },
  info: {
    body: (
      <>
        <circle cx="8" cy="8" r="5.5" />
        <path d="M8 7.5v3.5" />
        <path d="M8 5.25h.01" />
      </>
    ),
  },
  'alert-triangle': {
    body: (
      <>
        <path d="M6.98 3.3 1.6 12.6a1.2 1.2 0 0 0 1.02 1.8h10.76a1.2 1.2 0 0 0 1.02-1.8L9.02 3.3a1.2 1.2 0 0 0-2.04 0z" />
        <path d="M8 6.5v3" />
        <path d="M8 11.5h.01" />
      </>
    ),
  },
  calendar: {
    body: (
      <>
        <rect x="2.5" y="3.5" width="11" height="10" rx="1.25" />
        <path d="M2.5 6.5h11" />
        <path d="M5.5 2v3M10.5 2v3" />
      </>
    ),
  },
  clock: {
    body: (
      <>
        <circle cx="8" cy="8" r="5.5" />
        <path d="M8 4.75V8l2.25 1.5" />
      </>
    ),
  },
  user: {
    body: (
      <>
        <circle cx="8" cy="5.5" r="2.5" />
        <path d="M3.5 13.25a4.5 4.5 0 0 1 9 0" />
      </>
    ),
  },
  mail: {
    body: (
      <>
        <rect x="2.5" y="4" width="11" height="8" rx="1.25" />
        <path d="m3.25 4.75 4.02 3.2a1.2 1.2 0 0 0 1.46 0l4.02-3.2" />
      </>
    ),
  },
  phone: {
    body: (
      <path d="M4 2.75h2.5l1.25 3-1.5 1a7.5 7.5 0 0 0 3 3l1-1.5 3 1.25V13a1 1 0 0 1-1 1A10.25 10.25 0 0 1 3 3.75a1 1 0 0 1 1-1z" />
    ),
  },
  'map-pin': {
    body: (
      <>
        <path d="M13 6.75c0 3.5-5 7.5-5 7.5s-5-4-5-7.5a5 5 0 0 1 10 0z" />
        <circle cx="8" cy="6.75" r="1.75" />
      </>
    ),
  },
  globe: {
    body: (
      <>
        <circle cx="8" cy="8" r="5.5" />
        <path d="M2.5 8h11" />
        <path d="M8 2.5c1.6 1.6 2.5 3.6 2.5 5.5S9.6 11.9 8 13.5C6.4 11.9 5.5 9.9 5.5 8S6.4 4.1 8 2.5z" />
      </>
    ),
  },
} satisfies Record<string, Glyph>

/** The name of a glyph in the curated starter set. */
export type IconName = keyof typeof glyphs

/** Every curated glyph name, e.g. to build a picker. */
export const iconNames = Object.keys(glyphs) as IconName[]

// ---------------------------------------------------------------------------
// Sizing
// ---------------------------------------------------------------------------

export const iconVariants = cva(
  // `1em` is the default so an icon scales with — and optically matches — the
  // adjacent text at any font size. `shrink-0` stops it collapsing in a flex
  // row (e.g. beside a wrapping label). `block` avoids the inline-SVG baseline
  // gap. For an arbitrary size, pass a `size-[…]` utility via `className`;
  // tailwind-merge lets it win over the variant.
  // `size-[1em]` (the `em` default) lives in the BASE, not only the size
  // variant: the framework-agnostic `.cui-icon` class must carry the default
  // size on its own (the generated demos render default-size icons as bare
  // `.cui-icon` with no `--em` modifier). Explicit size modifiers still win.
  ['inline-block shrink-0 size-[1em]'],
  {
    variants: {
      // rem sizes use the project's USWDS spacing scale, NOT stock Tailwind:
      // size-2 = 1rem (16px), size-205 = 1.25rem (20px), size-3 = 1.5rem
      // (24px), size-4 = 2rem (32px).
      size: {
        em: 'size-[1em]',
        xs: 'size-2',
        sm: 'size-205',
        md: 'size-3',
        lg: 'size-4',
      },
    },
    defaultVariants: {
      size: 'em',
    },
  }
)

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type SvgOwnProps = Omit<
  React.SVGProps<SVGSVGElement>,
  'children' | 'aria-label' | 'aria-labelledby' | 'role'
>

export interface IconProps extends SvgOwnProps, VariantProps<typeof iconVariants> {
  /** A glyph from the curated set. Omit it and pass `children` for a custom glyph. */
  name?: IconName
  /**
   * Custom glyph geometry for icons outside the curated set — raw `<path>` /
   * `<circle>` elements on the same 16×16 grid. Ignored when `name` is set.
   */
  children?: React.ReactNode
  /**
   * Accessible name. Providing it (or `title`) makes the icon *meaningful*:
   * it gets `role="img"` and is announced. Omit both to keep the icon
   * decorative (`aria-hidden`, removed from the accessibility tree) — the
   * default, because most icons sit beside text that already carries meaning.
   * Translation-ready: pass a localized string.
   */
  label?: string
  /**
   * A `<title>` rendered inside the SVG — a native tooltip and, like `label`,
   * an accessible name that flips the icon to meaningful. Use `label` unless
   * you specifically want the hover tooltip.
   */
  title?: string
  /**
   * Force the RTL mirror on or off. By default only inherently directional
   * glyphs (chevrons, arrows, external-link) flip in RTL; set `false` to pin a
   * chevron that should not flip, or `true` to flip a custom glyph.
   */
  flip?: boolean
}

/**
 * The single SVG wrapper every Commons icon flows through. It standardizes the
 * paint contract (16×16 grid, `currentColor` stroke — so icons inherit text
 * color and survive forced-colors mode), sizing (`1em` by default so they
 * scale with adjacent text), and — most importantly — the accessibility
 * contract:
 *
 * - **Decorative by default.** With no `label`/`title` the icon is
 *   `aria-hidden` and `focusable="false"`, so a screen reader skips it. This
 *   is the right default: an icon next to a visible text label would otherwise
 *   be announced twice.
 * - **Meaningful when named.** Pass `label` (or `title`) and the icon becomes
 *   `role="img"` with that accessible name — for the rare standalone icon that
 *   is the only thing conveying meaning (e.g. a status glyph with no text).
 *
 * Pick a glyph with `name` from the curated set, or pass custom `children`.
 */
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, children, label, title, flip, size, className, ...props },
  ref
) {
  // Typed as Glyph so `directional` (optional, absent on non-directional
  // glyphs' inferred literal type) is always readable.
  const glyph: Glyph | undefined = name != null ? glyphs[name] : undefined
  const isDirectional = flip ?? glyph?.directional ?? false
  // Meaningful when it carries its own name; otherwise decorative.
  const meaningful = label != null || title != null

  return (
    <svg
      {...props}
      ref={ref}
      data-slot="icon"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      // Meaningful: name it and expose it as an image. Decorative: hide it from
      // assistive tech and keep it out of the tab order (SVGs are focusable in
      // some browsers).
      role={meaningful ? 'img' : undefined}
      aria-label={meaningful ? label : undefined}
      aria-hidden={meaningful ? undefined : true}
      focusable="false"
      className={cn(iconVariants({ size }), isDirectional && 'rtl:-scale-x-100', className)}
    >
      {title != null ? <title>{title}</title> : null}
      {glyph != null ? glyph.body : children}
    </svg>
  )
})

// ---------------------------------------------------------------------------
// Named convenience components
// ---------------------------------------------------------------------------
//
// `<Icon name="search" />` and `<SearchIcon />` are equivalent; the named form
// is handy for JSX call sites and tree-shakes to the same output.

function createIcon(name: IconName, displayName: string) {
  const Component = React.forwardRef<SVGSVGElement, Omit<IconProps, 'name' | 'children'>>(
    function NamedIcon(props, ref) {
      return <Icon ref={ref} name={name} {...props} />
    }
  )
  Component.displayName = displayName
  return Component
}

export const ChevronDownIcon = createIcon('chevron-down', 'ChevronDownIcon')
export const ChevronUpIcon = createIcon('chevron-up', 'ChevronUpIcon')
export const ChevronLeftIcon = createIcon('chevron-left', 'ChevronLeftIcon')
export const ChevronRightIcon = createIcon('chevron-right', 'ChevronRightIcon')
export const ChevronUpDownIcon = createIcon('chevron-updown', 'ChevronUpDownIcon')
export const CheckIcon = createIcon('check', 'CheckIcon')
export const XIcon = createIcon('x', 'XIcon')
export const CloseIcon = createIcon('close', 'CloseIcon')
export const PlusIcon = createIcon('plus', 'PlusIcon')
export const MinusIcon = createIcon('minus', 'MinusIcon')
export const ArrowRightIcon = createIcon('arrow-right', 'ArrowRightIcon')
export const SearchIcon = createIcon('search', 'SearchIcon')
export const MenuIcon = createIcon('menu', 'MenuIcon')
export const ExternalLinkIcon = createIcon('external-link', 'ExternalLinkIcon')
export const DownloadIcon = createIcon('download', 'DownloadIcon')
export const InfoIcon = createIcon('info', 'InfoIcon')
export const AlertTriangleIcon = createIcon('alert-triangle', 'AlertTriangleIcon')
export const CalendarIcon = createIcon('calendar', 'CalendarIcon')
export const ClockIcon = createIcon('clock', 'ClockIcon')
export const UserIcon = createIcon('user', 'UserIcon')
export const MailIcon = createIcon('mail', 'MailIcon')
export const PhoneIcon = createIcon('phone', 'PhoneIcon')
export const MapPinIcon = createIcon('map-pin', 'MapPinIcon')
export const GlobeIcon = createIcon('globe', 'GlobeIcon')
