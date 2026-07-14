// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/cn'

export const alertVariants = cva(
  // Base: static callout.
  // - `border`: a uniform border on every side (visible in forced-colors
  //   mode), using the variant's border-color token — equal width all around,
  //   never a thick inline-start accent.
  // - Meaning is never color-only: every variant pairs its state colors with
  //   a per-variant inline SVG icon (and usually a heading).
  // - rem-only font sizes; logical spacing utilities only.
  ['flex flex-wrap items-start gap-1 rounded-md border text-sm', '[&_a]:underline'],
  {
    variants: {
      variant: {
        info: 'border-info-border bg-info text-info-foreground',
        success: 'border-success-border bg-success text-success-foreground',
        warning: 'border-warning-border bg-warning text-warning-foreground',
        error: 'border-error-border bg-error text-error-foreground',
        emergency: 'border-emergency-border bg-emergency text-emergency-foreground',
      },
      // Slim: reduced padding and a smaller icon for tight layouts
      // (page-level notices, inside cards). Padding is uniform on every side.
      slim: {
        true: 'p-105',
        false: 'p-205',
      },
    },
    defaultVariants: {
      variant: 'info',
      slim: false,
    },
  }
)

export type AlertVariant = NonNullable<VariantProps<typeof alertVariants>['variant']>

export type AlertHeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

/**
 * Per-variant icons. All inline SVG (background-image icons vanish in
 * forced-colors mode), stroked with `currentColor` so they follow the
 * variant's text token, and `aria-hidden` — the variant's meaning must be
 * carried by the heading/body text, not announced icon names.
 */
const VARIANT_ICON_PATHS: Record<AlertVariant, React.JSX.Element> = {
  info: (
    <>
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 7.25v3.75" strokeLinecap="round" />
      <circle cx="8" cy="4.75" r="0.85" fill="currentColor" stroke="none" />
    </>
  ),
  success: (
    <>
      <circle cx="8" cy="8" r="6.5" />
      <path d="m4.9 8.3 2.1 2.1 4.1-4.4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  warning: (
    <>
      <path
        d="M7.13 2.5a1 1 0 0 1 1.74 0l5.63 9.99a1 1 0 0 1-.87 1.49H2.37a1 1 0 0 1-.87-1.49L7.13 2.5Z"
        strokeLinejoin="round"
      />
      <path d="M8 6.25v3" strokeLinecap="round" />
      <circle cx="8" cy="11.4" r="0.85" fill="currentColor" stroke="none" />
    </>
  ),
  error: (
    <>
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 4.5v4.25" strokeLinecap="round" />
      <circle cx="8" cy="11.25" r="0.85" fill="currentColor" stroke="none" />
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
  slim,
  hasHeading,
}: {
  variant: AlertVariant
  slim: boolean
  hasHeading: boolean
}): React.JSX.Element {
  return (
    // The wrapper is exactly one line-box of the adjacent first text block
    // (heading when present, body otherwise) and centers the icon inside
    // it, so the glyph aligns optically with the first line at every root
    // font size — including user font scaling.
    <span
      aria-hidden="true"
      data-slot="alert-icon"
      className={cn(
        'flex shrink-0 items-center self-start leading-snug',
        hasHeading && !slim ? 'text-md' : 'text-sm',
        'h-[calc(1em*1.375)]'
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={cn('shrink-0', slim ? 'size-2' : 'size-3')}
      >
        {VARIANT_ICON_PATHS[variant]}
      </svg>
    </span>
  )
}

function DismissIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="size-2 shrink-0"
    >
      <path d="m4 4 8 8M12 4l-8 8" strokeLinecap="round" />
    </svg>
  )
}

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  /**
   * Optional heading rendered above the body. Together with the variant
   * icon it provides the non-color redundancy WCAG 1.4.1 requires — prefer
   * a heading that states the meaning ("Submission failed"), especially on
   * `error` and `emergency` alerts.
   */
  heading?: React.ReactNode
  /**
   * Heading element to render. Pick the level that fits the page outline
   * (no skipped levels).
   * @default "h2"
   */
  headingLevel?: AlertHeadingLevel
  /**
   * Live-region behavior — opt-in, for alerts injected dynamically (e.g.
   * after form validation or an async result):
   * - `"polite"` renders `role="status"` (announced at the next pause);
   * - `"assertive"` renders `role="alert"` (announced immediately).
   *
   * Off by default: content present at page load must not be a live region,
   * and for injected content the container should already be in the DOM
   * before text is inserted for reliable announcement.
   */
  live?: 'polite' | 'assertive'
  /**
   * Render a dismiss button (44px minimum target). Dismissal is
   * consumer-owned: `onDismiss` fires and the consumer removes the node.
   */
  dismissible?: boolean
  /**
   * Accessible name for the dismiss button.
   * Translation-ready: pass a localized string.
   * @default "Dismiss"
   */
  dismissLabel?: string
  /**
   * Called when the dismiss button is activated (pointer, Enter, or Space —
   * it is a native button). The Alert does not remove itself or move focus:
   * only the consumer knows where focus should land once the node is gone.
   * If the dismiss button had focus when you remove the alert, move focus
   * to a stable nearby element (the alert's trigger, the next heading, or
   * the containing region) — otherwise it falls back to `<body>` and
   * keyboard/screen-reader users lose their place (WCAG 2.4.3).
   */
  onDismiss?: () => void
}

/**
 * Static callout that keeps a user's attention on important, often
 * time-sensitive information. Renders a plain `<div>` with no role by
 * default; opt into live-region semantics with `live` when injecting
 * alerts dynamically.
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  {
    className,
    variant,
    slim,
    heading,
    headingLevel = 'h2',
    live,
    dismissible = false,
    dismissLabel = 'Dismiss',
    onDismiss,
    role,
    children,
    ...props
  },
  ref
) {
  const resolvedVariant: AlertVariant = variant ?? 'info'
  const HeadingTag = headingLevel

  const resolvedRole = live === 'assertive' ? 'alert' : live === 'polite' ? 'status' : role

  return (
    <div
      {...props}
      ref={ref}
      role={resolvedRole}
      data-slot="alert"
      data-variant={resolvedVariant}
      className={cn(alertVariants({ variant, slim }), className)}
    >
      <div
        data-slot="alert-body"
        className={cn(
          'flex min-w-0 basis-48 grow items-start',
          slim ? 'gap-1' : 'gap-105'
        )}
      >
        <VariantIcon variant={resolvedVariant} slim={slim === true} hasHeading={heading != null} />
        <div className="flex min-w-0 flex-1 flex-col gap-05 leading-normal">
          {heading != null ? (
            <HeadingTag data-slot="alert-heading" className="text-md font-semibold leading-snug">
              {heading}
            </HeadingTag>
          ) : null}
          {children}
        </div>
      </div>
      {dismissible ? (
        <button
          type="button"
          data-slot="alert-dismiss"
          aria-label={dismissLabel}
          onClick={() => onDismiss?.()}
          className={cn(
            // 44px (2.75rem) minimum target; negative margins tuck the
            // large hit area into the alert's padding so the visual box
            // stays balanced without shrinking the target.
            'inline-flex min-h-11 min-w-11 shrink-0 cursor-pointer',
            'items-center justify-center self-start rounded-sm',
            '-mt-1 -me-1',
            'border border-transparent bg-transparent text-current',
            'transition-colors motion-reduce:transition-none',
            'hover:bg-background/40',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
          )}
        >
          <DismissIcon />
        </button>
      ) : null}
    </div>
  )
})
