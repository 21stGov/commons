// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/cn'

export const footerVariants = cva(
  // The site footer is a page-level landmark strip. The top border marks the
  // block-start boundary (the block axis does not flip in RTL, so border-t is
  // the logical border-block-start in horizontal writing modes) and keeps the
  // footer visibly bounded in forced-colors mode. Theme tokens only.
  ['border-t border-border bg-muted text-sm text-foreground']
)

export const footerLinkVariants = cva(
  // Footer links are site navigation, not body content: ALWAYS underlined so
  // link-ness is never conveyed by color alone (WCAG 1.4.1), full link color
  // treatment, and a 44px (2.75rem) minimum pointer target (project default).
  // No visited state — a footer is a nav landmark, and a purple "visited"
  // treatment across a footer of internal links reads as broken, not helpful.
  [
    'inline-flex min-h-11 items-center rounded-sm underline underline-offset-2',
    'text-link hover:text-link-hover',
    'transition-colors motion-reduce:transition-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  ]
)

export interface FooterProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof footerVariants> {}

/**
 * Site footer landmark. Renders a native `<footer>` element, which exposes
 * the `contentinfo` role when it is a direct child of `<body>` (or of a
 * wrapper that is not an article/aside/main/nav/section landmark).
 * Compose with FooterNav, FooterSection, FooterLink, and FooterBottom.
 */
export const Footer = React.forwardRef<HTMLElement, FooterProps>(function Footer(
  { className, children, ...props },
  ref
) {
  return (
    <footer {...props} ref={ref} data-slot="footer" className={cn(footerVariants(), className)}>
      {children}
    </footer>
  )
})

export interface FooterNavProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Accessible label for the footer's `<nav>` landmark. Distinguishes it
   * from the site's primary navigation. Translation-ready.
   * @default "Footer"
   */
  ariaLabel?: string
}

/**
 * Navigation landmark holding the footer's link sections. Lays FooterSection
 * columns out with wrapping flex, so columns reflow to a single column at
 * narrow widths and 400% zoom (WCAG 1.4.10 reflow) without 2D scrolling.
 */
export const FooterNav = React.forwardRef<HTMLElement, FooterNavProps>(function FooterNav(
  { className, ariaLabel = 'Footer', children, ...props },
  ref
) {
  return (
    <nav
      {...props}
      ref={ref}
      data-slot="footer-nav"
      // Native aria-* passthrough wins (consistent with every other
      // component); the ariaLabel prop is the translated default.
      aria-label={props['aria-label'] ?? ariaLabel}
      className={cn('mx-auto flex w-full max-w-5xl flex-wrap gap-x-3 gap-y-2 px-2 py-3', className)}
    >
      {children}
    </nav>
  )
})

export type FooterHeadingLevel = 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export interface FooterSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visible heading of this link column. Translation-ready. */
  heading: string
  /**
   * Heading element to render, so the footer slots into the page's real
   * heading outline (no skipped levels).
   * @default "h2"
   */
  headingLevel?: FooterHeadingLevel
}

/**
 * One column of footer links: a visible heading plus a native `<ul>` list of
 * FooterLink items, so screen readers announce the number of links and can
 * jump between list items.
 */
export const FooterSection = React.forwardRef<HTMLDivElement, FooterSectionProps>(
  function FooterSection({ className, heading, headingLevel = 'h2', children, ...props }, ref) {
    const HeadingTag = headingLevel

    return (
      <div
        {...props}
        ref={ref}
        data-slot="footer-section"
        // min-w-0 (not a fixed min width) lets columns shrink at narrow
        // widths and enlarged text instead of forcing horizontal scroll.
        className={cn('min-w-0 flex-1 basis-40', className)}
      >
        <HeadingTag className="text-sm font-semibold">{heading}</HeadingTag>
        <ul
          role="list"
          // Prevent UA and prose-container indentation while retaining
          // explicit list semantics for Safari/VoiceOver.
          style={{ paddingInlineStart: 0 }}
          className="m-0 flex list-none flex-col p-0"
        >
          {children}
        </ul>
      </div>
    )
  }
)

export interface FooterLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof footerLinkVariants> {}

/**
 * One footer link. Renders a list item wrapping a native `<a>` — always
 * underlined per the Commons body-context link rule. Must be a child of
 * FooterSection (it supplies the `<ul>`). `className` and all other props
 * apply to the anchor.
 */
export const FooterLink = React.forwardRef<HTMLAnchorElement, FooterLinkProps>(
  function FooterLink({ className, children, ...props }, ref) {
    return (
      <li>
        <a
          {...props}
          ref={ref}
          data-slot="footer-link"
          className={cn(footerLinkVariants(), className)}
        >
          {children}
        </a>
      </li>
    )
  }
)

export interface FooterBottomProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Name of the government entity that owns the site, shown as the agency
   * line. Translation-ready (pass the localized official name).
   */
  agencyName?: string
}

/**
 * Bottom strip of the footer: the agency line plus contact slots (phone and
 * email links, social links, …) passed as children. Contact links should be
 * native anchors (`tel:` / `mailto:`) — FooterLink works here visually but
 * belongs inside FooterSection's list.
 */
export const FooterBottom = React.forwardRef<HTMLDivElement, FooterBottomProps>(
  function FooterBottom({ className, agencyName, children, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-slot="footer-bottom"
        className={cn('border-t border-border', className)}
      >
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-3 gap-y-1 px-2 py-2">
          {agencyName === undefined ? null : (
            <p data-slot="footer-agency" className="me-auto font-semibold">
              {agencyName}
            </p>
          )}
          {children}
        </div>
      </div>
    )
  }
)
