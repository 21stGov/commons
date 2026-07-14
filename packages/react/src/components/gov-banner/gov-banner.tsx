// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/cn'

export const govBannerVariants = cva(
  // The banner is a page-level landmark strip. It keeps a bottom border so
  // it has a visible boundary in forced-colors mode, and uses only theme
  // tokens (no raw colors) so light / dark / high-contrast all work.
  ['border-b border-border bg-muted text-sm text-foreground']
)

export interface GovBannerProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof govBannerVariants> {
  /**
   * Name of the government entity that owns the site. Interpolated into
   * `bannerText` wherever `{entity}` appears.
   * @default "your local government"
   */
  entity?: string
  /**
   * Collapsed banner text. The literal placeholder `{entity}` is replaced
   * with the `entity` prop. Translation-ready: pass a localized string.
   * @default "An official website of {entity}"
   */
  bannerText?: string
  /**
   * Accessible label for the banner region (the `<section>` landmark).
   * @default "Official local government website"
   */
  ariaLabel?: string
  /**
   * Label of the native disclosure button that expands the explainer.
   * @default "How to verify this site"
   */
  actionText?: string
  /**
   * Visual mark shown before the collapsed banner text. Accepts an icon,
   * flag, seal image, or any other React node. Pass `null` to omit it.
   * Images that repeat the adjacent entity name should use an empty `alt`.
   * Keep this slot non-interactive so it does not interrupt the disclosure.
   * @default Commons civic-building icon
   */
  brandMark?: React.ReactNode
  /**
   * Visual shown beside the site-identity explainer. Pass `null` to omit it.
   * Keep this slot non-interactive.
   * @default Commons civic-building icon
   */
  identityIcon?: React.ReactNode
  /**
   * Visual shown beside the secure-connection explainer. Pass `null` to omit it.
   * Keep this slot non-interactive.
   * @default Commons shield-check icon
   */
  securityIcon?: React.ReactNode
  /**
   * Heading of the site-identity explainer column.
   * @default "Check who runs this website"
   */
  identityHeading?: string
  /**
   * Body of the site-identity explainer column. `{entity}` is replaced with
   * the `entity` prop.
   * @default "This website is managed by {entity}. Confirm the web address matches the one your government publishes before sharing personal information."
   */
  identityText?: string
  /**
   * Heading of the secure-connection explainer column.
   * @default "Your connection should be secure"
   */
  securityHeading?: string
  /**
   * Body of the secure-connection explainer column.
   * @default "Look for https:// and your browser's secure-connection indicator. Encryption protects information in transit, but it does not prove who operates a website."
   */
  securityText?: string
  /** @deprecated Use `identityHeading`. */
  domainHeading?: string
  /** @deprecated Use `identityText`. */
  domainText?: string
  /** @deprecated Use `securityHeading`. */
  httpsHeading?: string
  /** @deprecated Use `securityText`. */
  httpsText?: string
  /**
   * Render the explainer content expanded on first mount (uncontrolled).
   * @default false
   */
  defaultExpanded?: boolean
  /** Controlled expanded state. */
  expanded?: boolean
  /** Called whenever the disclosure requests an expanded-state change. */
  onExpandedChange?: (expanded: boolean) => void
}

/**
 * Civic-building glyph. Decorative (`aria-hidden`); drawn with `currentColor`
 * only so it stays visible in forced-colors mode and follows theme tokens.
 */
function CivicIcon({ className = 'size-2' }: { className?: string }): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn('shrink-0', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-5 9 5" />
      <path d="M5 10h14M4 20h16M6 17v-5M10 17v-5M14 17v-5M18 17v-5" />
    </svg>
  )
}

/**
 * Shield-check glyph for the secure-connection column. Decorative
 * (`aria-hidden`), `currentColor` only — forced-colors safe.
 */
function ShieldCheckIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4 shrink-0 self-start"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M12 3 20 6v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-3Z" />
      <path d="m8.5 12 2.25 2.25 4.75-5" />
    </svg>
  )
}

/** Chevron for the disclosure button. Decorative; mirrors expansion state. */
function ChevronIcon({ expanded }: { expanded: boolean }): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={cn(
        'size-2 shrink-0 transition-transform motion-reduce:transition-none',
        expanded && 'rotate-180'
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m4 6 4 4 4-4" />
    </svg>
  )
}

/**
 * Trust banner shown at the very top of a local government site.
 * Collapsed: civic glyph + one line of text + a native disclosure button.
 * Expanded: two explainer columns (site ownership + connection security).
 * The expanded content always stays in the DOM and is toggled with the
 * `hidden` attribute, so screen readers and find-in-page behave predictably.
 */
export const GovBanner = React.forwardRef<HTMLElement, GovBannerProps>(function GovBanner(
  {
    className,
    entity = 'your local government',
    bannerText = 'An official website of {entity}',
    ariaLabel = 'Official local government website',
    actionText = 'How to verify this site',
    brandMark = <CivicIcon />,
    identityIcon = <CivicIcon className="size-4" />,
    securityIcon = <ShieldCheckIcon />,
    identityHeading,
    identityText,
    securityHeading,
    securityText,
    domainHeading,
    domainText,
    httpsHeading,
    httpsText,
    defaultExpanded = false,
    expanded: expandedProp,
    onExpandedChange,
    children,
    ...props
  },
  ref
) {
  const [uncontrolledExpanded, setUncontrolledExpanded] = React.useState(defaultExpanded)
  const expanded = expandedProp ?? uncontrolledExpanded
  const contentId = React.useId()

  const interpolateEntity = (value: string): string => value.replaceAll('{entity}', entity)
  const resolvedBannerText = interpolateEntity(bannerText)
  const resolvedIdentityHeading = identityHeading ?? domainHeading ?? 'Check who runs this website'
  const resolvedIdentityText = interpolateEntity(
    identityText ??
      domainText ??
      'This website is managed by {entity}. Confirm the web address matches the one your government publishes before sharing personal information.'
  )
  const resolvedSecurityHeading =
    securityHeading ?? httpsHeading ?? 'Your connection should be secure'
  const resolvedSecurityText =
    securityText ??
    httpsText ??
    "Look for https:// and your browser's secure-connection indicator. Encryption protects information in transit, but it does not prove who operates a website."

  function toggleExpanded(): void {
    const nextExpanded = !expanded
    if (expandedProp === undefined) setUncontrolledExpanded(nextExpanded)
    onExpandedChange?.(nextExpanded)
  }

  return (
    <section
      {...props}
      ref={ref}
      data-slot="gov-banner"
      // Native aria-* passthrough wins (consistent with every other
      // component); the ariaLabel prop is the translated default.
      aria-label={props['aria-label'] ?? ariaLabel}
      className={cn(govBannerVariants(), className)}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-1 px-2">
        <div className="flex min-w-0 items-center gap-x-1 py-1">
          {brandMark !== null ? (
            <span
              data-slot="gov-banner-brand-mark"
              className="inline-flex size-3 shrink-0 items-center justify-center [&>img]:max-h-full [&>img]:max-w-full [&>img]:object-contain"
            >
              {brandMark}
            </span>
          ) : null}
          <p>{resolvedBannerText}</p>
        </div>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={toggleExpanded}
          className={cn(
            // 44px (2.75rem) minimum target; underlined per WCAG 1.4.1 so
            // the affordance is not conveyed by color alone.
            'inline-flex min-h-11 items-center gap-1 border border-transparent',
            'text-sm text-link underline hover:text-link-hover',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
          )}
        >
          {actionText}
          <ChevronIcon expanded={expanded} />
        </button>
      </div>
      <div id={contentId} hidden={!expanded}>
        <div className="mx-auto flex w-full max-w-5xl flex-wrap gap-3 px-2 py-2">
          <div data-slot="gov-banner-explainer" className="flex min-w-0 basis-64 flex-1 gap-105">
            {identityIcon !== null ? (
              <span
                data-slot="gov-banner-identity-icon"
                className="inline-flex size-4 shrink-0 items-start justify-center [&>img]:max-h-full [&>img]:max-w-full [&>img]:object-contain"
              >
                {identityIcon}
              </span>
            ) : null}
            <div className="min-w-0 max-w-prose">
              <p className="font-bold">{resolvedIdentityHeading}</p>
              <p className="text-muted-foreground">{resolvedIdentityText}</p>
            </div>
          </div>
          <div data-slot="gov-banner-explainer" className="flex min-w-0 basis-64 flex-1 gap-105">
            {securityIcon !== null ? (
              <span
                data-slot="gov-banner-security-icon"
                className="inline-flex size-4 shrink-0 items-start justify-center [&>img]:max-h-full [&>img]:max-w-full [&>img]:object-contain"
              >
                {securityIcon}
              </span>
            ) : null}
            <div className="min-w-0 max-w-prose">
              <p className="font-bold">{resolvedSecurityHeading}</p>
              <p className="text-muted-foreground">{resolvedSecurityText}</p>
            </div>
          </div>
        </div>
        {children}
      </div>
    </section>
  )
})
