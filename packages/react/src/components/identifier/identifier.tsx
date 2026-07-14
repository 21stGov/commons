// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/cn'

export const identifierVariants = cva(
  // The identifier is the organization-identity band below the footer.
  // Emphasis surface pair: the emphasis / on-emphasis tokens are
  // contrast-validated as a pair in every theme (light, dark,
  // high-contrast), so text on this dark band always meets WCAG 1.4.3.
  ['bg-emphasis text-sm text-emphasis-foreground']
)

export const identifierLinkVariants = cva(
  // Links on the dark band: ALWAYS underlined (WCAG 1.4.1 — on-emphasis
  // text is one color, so underlines are the only reliable link cue),
  // on-emphasis foreground for validated contrast, a thicker underline as a
  // non-color hover cue, and a 44px (2.75rem) minimum pointer target.
  [
    'inline-flex min-h-11 items-center rounded-sm underline underline-offset-2',
    'text-emphasis-foreground hover:decoration-2',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  ]
)

export interface IdentifierProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof identifierVariants> {
  /**
   * Accessible label for the identifier region (the `<section>` landmark).
   * Translation-ready.
   * @default "Agency identifier"
   */
  ariaLabel?: string
}

/**
 * The organization-identity band that sits below the site footer: who runs
 * the service, its policy and support links, and an optional local resource.
 * It borrows the clarity of the USWDS identifier without imposing federal
 * language, a `.gov` domain, or a federal destination.
 */
export const Identifier = React.forwardRef<HTMLElement, IdentifierProps>(function Identifier(
  { className, ariaLabel = 'Agency identifier', children, ...props },
  ref
) {
  return (
    <section
      {...props}
      ref={ref}
      data-slot="identifier"
      // Native aria-* passthrough wins (consistent with every other
      // component); the ariaLabel prop is the translated default.
      aria-label={props['aria-label'] ?? ariaLabel}
      className={cn(identifierVariants(), className)}
    >
      {children}
    </section>
  )
})

export interface IdentifierIdentityProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Name of the agency that runs the site. Interpolated into `officialText`
   * wherever `{agency}` appears (unless `parentAgency` is given).
   */
  agencyName: string
  /**
   * Parent agency, when the site is run on behalf of a larger entity. Takes
   * `agencyName`'s place in the `officialText` interpolation.
   */
  parentAgency?: string
  /** The site's domain, shown as the masthead (for example, "springfield.example"). */
  domain?: string
  /**
   * The ownership statement. The literal placeholder `{agency}` is
   * replaced with `parentAgency` when given, otherwise `agencyName`.
   * Translation-ready: pass a localized string.
   * @default "This website is operated by {agency}"
   */
  officialText?: string
}

/**
 * The identity block of the identifier: domain masthead plus the
 * ownership statement. Extra identity content
 * (an agency logo image, a link to the agency site) goes in children.
 */
export const IdentifierIdentity = React.forwardRef<HTMLDivElement, IdentifierIdentityProps>(
  function IdentifierIdentity(
    {
      className,
      agencyName,
      parentAgency,
      domain,
      officialText = 'This website is operated by {agency}',
      children,
      ...props
    },
    ref
  ) {
    const resolvedOfficialText = officialText.replace('{agency}', parentAgency ?? agencyName)

    return (
      <div
        {...props}
        ref={ref}
        data-slot="identifier-identity"
        className={cn('mx-auto flex w-full max-w-5xl flex-col gap-05 px-2 py-2', className)}
      >
        {domain === undefined ? null : (
          <p data-slot="identifier-domain" className="font-semibold">
            {domain}
          </p>
        )}
        <p data-slot="identifier-disclaimer">{resolvedOfficialText}</p>
        {children}
      </div>
    )
  }
)

export interface IdentifierLinksProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Accessible label for the policy-and-support-links `<nav>` landmark.
   * Translation-ready.
   * @default "Important links"
   */
  ariaLabel?: string
}

/**
 * Navigation landmark for locally appropriate links (About, Accessibility,
 * public records, Privacy, Contact, …). The consumer supplies the
 * links as IdentifierLink children; this renders the labelled `<nav>` and the
 * `<ul>` list around them.
 */
export const IdentifierLinks = React.forwardRef<HTMLElement, IdentifierLinksProps>(
  function IdentifierLinks({ className, ariaLabel = 'Important links', children, ...props }, ref) {
    return (
      <nav
        {...props}
        ref={ref}
        data-slot="identifier-links"
        aria-label={props['aria-label'] ?? ariaLabel}
        className={cn('mx-auto w-full max-w-5xl px-2 pb-1', className)}
      >
        <ul
          role="list"
          // Keep the first policy link flush with the domain and ownership
          // text even when the identifier is rendered inside rich prose.
          style={{ paddingInlineStart: 0 }}
          className="m-0 flex list-none flex-col items-start p-0"
        >
          {children}
        </ul>
      </nav>
    )
  }
)

export interface IdentifierLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof identifierLinkVariants> {}

/**
 * One policy or support link on the dark band. Renders a list item wrapping a native
 * `<a>` — underlined and in the validated on-emphasis foreground so it stays
 * visibly distinguishable. Must be a child of IdentifierLinks (it supplies
 * the `<ul>`). `className` and all other props apply to the anchor.
 */
export const IdentifierLink = React.forwardRef<HTMLAnchorElement, IdentifierLinkProps>(
  function IdentifierLink({ className, children, ...props }, ref) {
    return (
      <li>
        <a
          {...props}
          ref={ref}
          data-slot="identifier-link"
          className={cn(identifierLinkVariants(), className)}
        >
          {children}
        </a>
      </li>
    )
  }
)

export interface IdentifierResourceProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Short lead-in explaining the local resource. Translation-ready. */
  text: string
  /** Visible text for the resource link. Translation-ready. */
  linkText: string
  /** Local or external destination chosen by the site owner. */
  href: string
}

/**
 * Optional local help or service pointer at the end of the identifier. It has
 * no built-in federal destination: the site owner supplies every string and
 * the href, so a city, county, authority, or tribal government can point to
 * the resource its residents actually need.
 */
export const IdentifierResource = React.forwardRef<HTMLDivElement, IdentifierResourceProps>(
  function IdentifierResource(
    { className, text, linkText, href, children, ...props },
    ref
  ) {
    return (
      <div
        {...props}
        ref={ref}
        data-slot="identifier-resource"
        className={cn('mx-auto w-full max-w-5xl px-2 pb-2', className)}
      >
        <p className="flex flex-wrap items-center gap-x-1">
          {text}
          <a href={href} className={cn(identifierLinkVariants(), 'font-semibold')}>
            {linkText}
          </a>
        </p>
        {children}
      </div>
    )
  }
)
