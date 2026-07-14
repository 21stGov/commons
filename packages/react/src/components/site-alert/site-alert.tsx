// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/cn'

export const siteAlertVariants = cva(
  // Base: a persistent, page-level/sitewide band (distinct from the inline
  // Alert and from field errors). It spans the full inline width of its
  // container so it reads as a top-of-page announcement.
  // - `border-b`: a bottom edge that survives forced-colors mode, where the
  //   background band would otherwise vanish. Logical `border-b` is a block
  //   edge, so it is direction-independent.
  // - Meaning is never color-only: every variant pairs its state colors with
  //   a per-variant inline SVG icon and (strongly recommended) a heading.
  // - rem-only font sizes; logical spacing utilities only.
  ['block w-full border-b text-sm', '[&_a]:underline'],
  {
    variants: {
      variant: {
        // Important, non-urgent sitewide information.
        info: 'border-info-border bg-info text-info-foreground',
        // Strongest state tokens — reserved for emergencies.
        emergency: 'border-emergency-border bg-emergency text-emergency-foreground',
      },
      // Slim: reduced block padding for tight layouts. Content stays text-sm.
      slim: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'info',
      slim: false,
    },
  }
)

export type SiteAlertVariant = NonNullable<VariantProps<typeof siteAlertVariants>['variant']>

export type SiteAlertHeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

/**
 * Per-variant icons. Inline SVG (background-image icons vanish in
 * forced-colors mode), stroked with `currentColor` so they follow the
 * variant's text token, and `aria-hidden` — the variant's meaning must be
 * carried by the heading/body text, not announced icon names.
 */
const VARIANT_ICON_PATHS: Record<SiteAlertVariant, React.JSX.Element> = {
  info: (
    <>
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 7.25v3.75" strokeLinecap="round" />
      <circle cx="8" cy="4.75" r="0.85" fill="currentColor" stroke="none" />
    </>
  ),
  emergency: (
    <>
      <path
        d="M5.31 1.5h5.38l3.81 3.81v5.38l-3.81 3.81H5.31L1.5 10.69V5.31L5.31 1.5Z"
        strokeLinejoin="round"
      />
      <path d="M8 4.5v4.25" strokeLinecap="round" />
      <circle cx="8" cy="11.25" r="0.85" fill="currentColor" stroke="none" />
    </>
  ),
}

function VariantIcon({
  variant,
  hasHeading,
}: {
  variant: SiteAlertVariant
  hasHeading: boolean
}): React.JSX.Element {
  return (
    // The wrapper is exactly one line-box of the adjacent first text block
    // (heading when present, body otherwise) and centers the icon inside it,
    // so the glyph aligns optically with the first line at every root font
    // size — including user font scaling.
    <span
      aria-hidden="true"
      data-slot="site-alert-icon"
      className={cn(
        'flex shrink-0 items-center self-start leading-snug',
        hasHeading ? 'text-md' : 'text-sm',
        'h-[calc(1em*1.375)]'
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="size-3 shrink-0"
      >
        {VARIANT_ICON_PATHS[variant]}
      </svg>
    </span>
  )
}

export interface SiteAlertProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof siteAlertVariants> {
  /**
   * Accessible name for the region landmark. Screen-reader users hear this
   * when they navigate to the band ("Site alert"), and it distinguishes one
   * banner from another when a page carries more than one.
   * Translation-ready: pass a localized string.
   * @default "Site alert"
   */
  label?: string
  /**
   * Optional heading rendered above the body. Together with the variant
   * icon it provides the non-color redundancy WCAG 1.4.1 requires — prefer
   * a heading that states the meaning ("Boil water notice"), especially on
   * `emergency` alerts.
   */
  heading?: React.ReactNode
  /**
   * Heading element to render. Pick the level that fits the page outline
   * (no skipped levels).
   * @default "h2"
   */
  headingLevel?: SiteAlertHeadingLevel
  /**
   * Live-region behavior — opt-in, for a band injected into an already-loaded
   * page (e.g. an emergency notice pushed after page load):
   * - `"polite"` renders `role="status"` (announced at the next pause);
   * - `"assertive"` renders `role="alert"` (announced immediately).
   *
   * Off by default: a site alert present at page load is a static region
   * landmark, not a live region. For injected content the container should
   * already be in the DOM before text is inserted for reliable announcement.
   */
  live?: 'polite' | 'assertive'
}

/**
 * Persistent, page-level band for sitewide emergencies or important service
 * notices — the kind of banner that sits at the top of every page. Distinct
 * from the inline {@link Alert} (a contextual callout in page content) and
 * from field-level validation. Renders a `<section>` region landmark named
 * by `label`; opt into live-region semantics with `live` only when injecting
 * the band dynamically.
 */
export const SiteAlert = React.forwardRef<HTMLElement, SiteAlertProps>(function SiteAlert(
  {
    className,
    variant,
    slim,
    label = 'Site alert',
    heading,
    headingLevel = 'h2',
    live,
    role,
    children,
    ...props
  },
  ref
) {
  const resolvedVariant: SiteAlertVariant = variant ?? 'info'
  const HeadingTag = headingLevel

  // A live band trades its region role for a live-region role so injected
  // emergencies are announced; a static band stays a named region landmark.
  const resolvedRole =
    live === 'assertive' ? 'alert' : live === 'polite' ? 'status' : (role ?? 'region')

  return (
    <section
      {...props}
      ref={ref}
      role={resolvedRole}
      aria-label={label}
      data-slot="site-alert"
      data-variant={resolvedVariant}
      className={cn(siteAlertVariants({ variant, slim }), className)}
    >
      <div
        data-slot="site-alert-body"
        className={cn(
          'mx-auto flex w-full max-w-measure-xl items-start',
          slim ? 'gap-1 p-105' : 'gap-105 p-205'
        )}
      >
        <VariantIcon variant={resolvedVariant} hasHeading={heading != null} />
        <div className="flex min-w-0 flex-1 flex-col gap-05 leading-normal">
          {heading != null ? (
            <HeadingTag data-slot="site-alert-heading" className="text-md font-semibold leading-snug">
              {heading}
            </HeadingTag>
          ) : null}
          {children}
        </div>
      </div>
    </section>
  )
})
