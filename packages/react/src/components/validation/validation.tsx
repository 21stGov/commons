// SPDX-License-Identifier: MIT

'use client'

import * as React from 'react'

import { cn } from '@/lib/cn'

/** A single requirement and whether it is currently satisfied. */
export interface ValidationCheck {
  /** The requirement text (e.g. "At least 8 characters"). */
  label: React.ReactNode
  /** Whether the requirement is currently met. */
  valid: boolean
}

/** Screen-reader status words appended to each item. Translation-ready. */
export interface ValidationStatusLabels {
  /** @default "met" */
  met: string
  /** @default "not met" */
  unmet: string
}

const DEFAULT_STATUS_LABELS: ValidationStatusLabels = {
  met: 'met',
  unmet: 'not met',
}

interface ValidationContextValue {
  statusLabels: ValidationStatusLabels
}

const ValidationContext = React.createContext<ValidationContextValue | null>(null)

export type ValidationHeadingLevel = 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

function MetIcon(): React.JSX.Element {
  // Filled check inside a circle — a distinct *shape*, not just a color, so
  // the met state survives forced-colors mode and color-blind users. Inline
  // SVG with currentColor (background-image icons vanish in forced colors).
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="size-2 shrink-0"
    >
      <circle cx="8" cy="8" r="7" />
      <path d="m4.75 8.25 2.1 2.1 4.4-4.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function UnmetIcon(): React.JSX.Element {
  // An open circle with a dash — visibly different in shape from the met
  // check, so met vs unmet never relies on color alone (WCAG 1.4.1).
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="size-2 shrink-0"
    >
      <circle cx="8" cy="8" r="7" />
      <path d="M5.25 8h5.5" strokeLinecap="round" />
    </svg>
  )
}

export interface ValidationItemProps {
  /** Whether this requirement is currently satisfied. */
  valid: boolean
  /**
   * Override the screen-reader status words for this item. Defaults to the
   * surrounding Validation's `statusLabels`, then to `met` / `not met`.
   */
  statusLabels?: ValidationStatusLabels
  /** The requirement text. */
  children: React.ReactNode
}

/**
 * One requirement row. Shows a non-color met/unmet indicator (a check vs an
 * open circle), the requirement text, and a visually-hidden status word so
 * screen reader users hear "met" / "not met" as the state flips.
 */
export function ValidationItem({
  valid,
  statusLabels,
  children,
}: ValidationItemProps): React.JSX.Element {
  const context = React.useContext(ValidationContext)
  const labels = statusLabels ?? context?.statusLabels ?? DEFAULT_STATUS_LABELS

  return (
    <li
      data-slot="validation-item"
      data-valid={valid || undefined}
      className={cn(
        'flex items-start gap-1 text-sm leading-snug',
        valid ? 'text-success-foreground' : 'text-muted-foreground'
      )}
    >
      {valid ? <MetIcon /> : <UnmetIcon />}
      <span>{children}</span>
      {/* Spelled-out, translatable state for assistive tech. The leading
          comma keeps the announcement unambiguous ("At least 8 characters,
          met") across accessible-name engines that trim whitespace. */}
      <span className="sr-only">, {valid ? labels.met : labels.unmet}</span>
    </li>
  )
}

export interface ValidationProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Accessible name for the requirements region, used as its `aria-label`
   * when no visible `heading` is rendered.
   * Translation-ready: pass a localized string.
   * @default "Requirements"
   */
  label?: string
  /**
   * Optional visible heading. When set it labels the region (via
   * `aria-labelledby`) instead of `label`.
   */
  heading?: React.ReactNode
  /**
   * Heading element to render when `heading` is set. Pick the level that
   * fits the page outline (no skipped levels).
   * @default "h3"
   */
  headingLevel?: ValidationHeadingLevel
  /**
   * The requirements as data. Alternatively pass `ValidationItem` children.
   * If both are given, `checks` wins.
   */
  checks?: ValidationCheck[]
  /** Screen-reader status words shared by every item. */
  statusLabels?: ValidationStatusLabels
  /** `ValidationItem` children (used when `checks` is not provided). */
  children?: React.ReactNode
}

/**
 * A live requirements checklist (USWDS "validation"): e.g. password rules
 * that tick off as the user types.
 *
 * Accessibility:
 * - The list is a polite live region (`aria-live="polite"`), so each item
 *   announces as it flips between met and unmet — without stealing focus.
 * - Every item pairs its color with a distinct *shape* (check vs open
 *   circle) and a visually-hidden status word, so state is never conveyed by
 *   color alone (WCAG 1.4.1) and survives forced-colors mode.
 * - The region carries a name via `heading` (`aria-labelledby`) or `label`
 *   (`aria-label`). Associate it with the input by giving it an `id` and
 *   adding that id to the input's `aria-describedby` (or render it inside a
 *   `Field`).
 */
export function Validation({
  label = 'Requirements',
  heading,
  headingLevel = 'h3',
  checks,
  statusLabels = DEFAULT_STATUS_LABELS,
  children,
  className,
  ...props
}: ValidationProps): React.JSX.Element {
  const generatedId = React.useId()
  const headingId = heading != null ? `${generatedId}-heading` : undefined
  const HeadingTag = headingLevel

  const contextValue = React.useMemo<ValidationContextValue>(
    () => ({ statusLabels }),
    [statusLabels]
  )

  return (
    <ValidationContext.Provider value={contextValue}>
      <div
        {...props}
        role="group"
        aria-live="polite"
        aria-label={headingId ? undefined : label}
        aria-labelledby={headingId}
        data-slot="validation"
        className={cn('flex flex-col gap-1', className)}
      >
        {heading != null ? (
          <HeadingTag
            id={headingId}
            data-slot="validation-heading"
            className="text-sm font-semibold leading-snug text-foreground"
          >
            {heading}
          </HeadingTag>
        ) : null}
        <ul role="list" data-slot="validation-list" className="flex flex-col gap-05">
          {checks
            ? checks.map((check, index) => (
                <ValidationItem key={index} valid={check.valid} statusLabels={statusLabels}>
                  {check.label}
                </ValidationItem>
              ))
            : children}
        </ul>
      </div>
    </ValidationContext.Provider>
  )
}
