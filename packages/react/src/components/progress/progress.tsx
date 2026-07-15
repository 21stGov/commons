// SPDX-License-Identifier: MIT

'use client'

import { Progress as BaseProgress } from '@base-ui/react/progress'
import * as React from 'react'

import { AmbientDirection } from '@/lib/ambient-direction'
import { cn } from '@/lib/cn'

// Minimal ambient typing so the dev-only guard compiles without
// @types/node. Bundlers statically replace `process.env.NODE_ENV`.
declare const process: { env: { NODE_ENV?: string | undefined } } | undefined

// Transform-only keyframe (no colors) for the indeterminate sweep. The
// animation is applied through a `motion-safe:` utility, so reduced-motion
// users never see it; the segment then falls back to a static state below.
const SWEEP_KEYFRAMES = `
@keyframes cui-progress-sweep {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(250%); }
}
`

export interface ProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  /**
   * Current progress, from `0` to `max`. Omit or pass `null` for an
   * indeterminate bar (the task is running but its completion is unknown).
   * @default null
   */
  value?: number | null
  /**
   * The value that represents 100% complete.
   * @default 100
   */
  max?: number
  /**
   * Visible label describing what is progressing (e.g. "Uploading files").
   * Rendered as the progress bar's accessible name. When omitted, pass
   * `aria-label` or `aria-labelledby` so the bar is still named.
   */
  label?: React.ReactNode
  /**
   * Show the value as text next to the label. Pair the bar with this text so
   * meaning never relies on the fill color alone (WCAG 1.4.1).
   * @default false
   */
  showValue?: boolean
  /**
   * Template for the visible + announced value text. `{value}` is replaced
   * with the current value and `{max}` with the maximum. Only used when the
   * bar is determinate.
   * @default "{value}%"
   */
  valueTemplate?: string
  /**
   * Text shown and announced while the bar is indeterminate. Carries the
   * "still working" meaning for reduced-motion users and screen readers.
   * Translation-ready: pass a localized string.
   * @default "In progress"
   */
  indeterminateLabel?: string
}

/**
 * A labelled progress bar for determinate task completion (uploads,
 * multi-step flows) and indeterminate waits. Built on Base UI Progress,
 * which renders `role="progressbar"` with `aria-valuenow` / `aria-valuemin`
 * / `aria-valuemax` / `aria-valuetext`. Indeterminate bars drop
 * `aria-valuenow` and set `aria-busy` instead of showing a fake position.
 */
export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  {
    className,
    value = null,
    max = 100,
    label,
    showValue = false,
    valueTemplate = '{value}%',
    indeterminateLabel = 'In progress',
    ...props
  },
  ref
) {
  const isIndeterminate = value == null

  const hasName =
    label != null ||
    props['aria-label'] != null ||
    props['aria-labelledby'] != null

  // Dev-only guard: a progress bar must have an accessible name (WCAG 4.1.2).
  const warnedRef = React.useRef(false)
  React.useEffect(() => {
    if (
      (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') ||
      warnedRef.current ||
      hasName
    ) {
      return
    }
    warnedRef.current = true
    console.warn(
      '[commons] <Progress> has no accessible name. Pass `label` (rendered ' +
        'visibly) or `aria-label` / `aria-labelledby`.'
    )
  }, [hasName])

  const valueText = isIndeterminate
    ? indeterminateLabel
    : valueTemplate.replace('{value}', String(value)).replace('{max}', String(max))

  return (
    // AmbientDirection makes the bar follow the DOM `dir` (global or a local
    // `dir="rtl"`) so the determinate fill grows from the inline-start edge
    // like the native components — Base UI reads a provider, not the DOM.
    <AmbientDirection>
      <BaseProgress.Root
        {...props}
        ref={ref}
        value={value}
        max={max}
        // Indeterminate bars expose "busy" semantics instead of a position:
        // Base UI already omits aria-valuenow; aria-busy makes intent explicit.
        aria-busy={isIndeterminate || undefined}
        getAriaValueText={() => valueText}
        data-slot="progress"
        className={cn('flex flex-col gap-1', className)}
      >
        {isIndeterminate ? <style>{SWEEP_KEYFRAMES}</style> : null}

        {label != null || showValue ? (
          <div className="flex items-baseline justify-between gap-2 text-sm leading-snug">
            {label != null ? (
              <BaseProgress.Label
                data-slot="progress-label"
                className="font-medium text-foreground"
              >
                {label}
              </BaseProgress.Label>
            ) : (
              <span aria-hidden="true" />
            )}
            {showValue ? (
              // aria-hidden: the value already reaches AT via aria-valuetext on
              // the progressbar; this span is the matching visual redundancy.
              <span
                aria-hidden="true"
                data-slot="progress-value"
                className="text-muted-foreground tabular-nums"
              >
                {valueText}
              </span>
            ) : null}
          </div>
        ) : null}

        <BaseProgress.Track
          data-slot="progress-track"
          className="relative h-2 w-full overflow-hidden rounded-sm border border-transparent bg-muted"
        >
          <BaseProgress.Indicator
            data-slot="progress-indicator"
            className={cn(
              'rounded-sm bg-primary',
              isIndeterminate
                ? [
                    // Sweeping segment: a 40%-wide bar that animates across the
                    // track. Reduced motion drops the animation and shows a
                    // static full-width muted fill (paired with the visible
                    // "In progress" text) — never a fake partial position.
                    'absolute [inset-block:0] start-0 w-2/5',
                    'motion-safe:[animation:cui-progress-sweep_1.4s_ease-in-out_infinite]',
                    'motion-reduce:w-full motion-reduce:bg-primary/40',
                  ]
                : // Determinate: Base UI sets the inline width from the value
                  // (inset-inline-start:0 → fills inline-start → end, RTL-safe).
                  'h-full',
            )}
          />
        </BaseProgress.Track>
      </BaseProgress.Root>
    </AmbientDirection>
  )
})
