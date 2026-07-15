// SPDX-License-Identifier: MIT

'use client'

import { Meter as BaseMeter } from '@base-ui/react/meter'
import { cva } from 'class-variance-authority'
import * as React from 'react'

import { AmbientDirection } from '@/lib/ambient-direction'
import { cn } from '@/lib/cn'

// Minimal ambient typing so the dev-only guard compiles without
// @types/node. Bundlers statically replace `process.env.NODE_ENV`.
declare const process: { env: { NODE_ENV?: string | undefined } } | undefined

export type MeterTone = 'default' | 'success' | 'warning' | 'error'

export interface MeterThreshold {
  /**
   * The upper bound of this segment, in `value` units (NOT a percentage).
   * Segments are evaluated in ascending `max` order; the active segment is
   * the first whose `max` is greater than or equal to the current value (the
   * last segment also catches any value above every `max`).
   */
  max: number
  /**
   * Non-color name for the segment (e.g. "Low", "Optimal", "High"). Always
   * rendered as visible text next to the value so a color-coded meter never
   * relies on color alone to convey which segment is active (WCAG 1.4.1) —
   * required whenever `thresholds` is used.
   */
  label: string
  /**
   * Visual tone for the indicator fill while this segment is active.
   * @default 'default'
   */
  tone?: MeterTone
}

// Tone fill for the indicator. `bg-primary` is a strong action fill that
// already contrasts with the track; the state tones use their tint background
// PLUS the matching `*-border` token — the same `bg-* / border-*-border`
// pairing Badge and Alert use, which is contrast-validated (`state-*-border`
// vs `state-*-bg` >= 3:1 in every theme). The border gives the tinted fill a
// visible, contrast-safe edge against the track instead of a near-invisible
// tint-on-tint boundary.
// The tone fill is a cva (not a runtime lookup) so the generator can emit it:
// each tone becomes a `.cui-meter-indicator--<tone>` modifier the rewrite
// attaches per active segment. The default fill stays in its OWN variant (NOT
// folded into the base) — folding it in would leave `bg-primary` on every
// indicator, so the rewrite's signature match would tag success/warning/error
// meters as `--default` too.
export const meterIndicatorVariants = cva(
  ['h-full rounded-sm border forced-colors:border-[CanvasText]', 'transition-[width] motion-reduce:transition-none'],
  {
    variants: {
      tone: {
        default: 'bg-primary border-transparent',
        success: 'bg-success border-success-border',
        warning: 'bg-warning border-warning-border',
        error: 'bg-error border-error-border',
      },
    },
    defaultVariants: { tone: 'default' },
  }
)

// The segment name renders as a tone CHIP, using the exact same validated
// trio as Badge/Alert: the tone's tint background, its `*-foreground` text
// token ON that background, and its `*-border`. That pairing is
// contrast-validated (`state-*-text` on `state-*-bg` clears the text bar in
// light/dark, and 7:1 in high-contrast) — so the colored label always sits on
// its own guaranteed background instead of relying on tone-colored text laid
// over the page background (an un-validated pairing).
// Same story as the indicator: a cva (not a lookup) so each tone emits a
// `.cui-meter-segment-label--<tone>` modifier the rewrite can attach; the
// default tone lives in its own variant, not the base.
export const meterSegmentLabelVariants = cva(
  [
    'inline-flex items-center rounded-full border px-105 py-0 text-xs font-medium leading-snug',
    'forced-colors:border-[CanvasText]',
  ],
  {
    variants: {
      tone: {
        default: 'border-border bg-muted text-foreground',
        success: 'border-success-border bg-success text-success-foreground',
        warning: 'border-warning-border bg-warning text-warning-foreground',
        error: 'border-error-border bg-error text-error-foreground',
      },
    },
    defaultVariants: { tone: 'default' },
  }
)

/** Sorted ascending; the active segment is the first whose `max` covers `value`. */
function resolveActiveThreshold(
  value: number,
  thresholds: MeterThreshold[] | undefined
): MeterThreshold | undefined {
  if (thresholds == null || thresholds.length === 0) {
    return undefined
  }
  const sorted = [...thresholds].sort((a, b) => a.max - b.max)
  return sorted.find((threshold) => value <= threshold.max) ?? sorted[sorted.length - 1]
}

type BaseRootProps = React.ComponentProps<typeof BaseMeter.Root>

export interface MeterProps
  extends Omit<BaseRootProps, 'render' | 'className' | 'children' | 'value' | 'min' | 'max'> {
  /**
   * The current measured value, in the same units as `min`/`max`. A Meter
   * always has a concrete value — unlike Progress, there is no
   * "indeterminate" meter, because a static measurement is either known
   * (show the gauge) or not yet known (don't render the gauge yet).
   */
  value: number
  /**
   * The minimum possible value of the range being measured.
   * @default 0
   */
  min?: number
  /**
   * The maximum possible value of the range being measured.
   * @default 100
   */
  max?: number
  /**
   * Visible label describing what is being measured (e.g. "Disk usage",
   * "Monthly budget used"). Rendered as the meter's accessible name. When
   * omitted, pass `aria-label` or `aria-labelledby` so the meter is still
   * named.
   */
  label?: React.ReactNode
  /**
   * Show the value as text next to the label. Pair the gauge with this text
   * so meaning never relies on fill color or fill length alone (WCAG 1.4.1).
   * @default false
   */
  showValue?: boolean
  /**
   * Template for the visible + announced value text. `{value}` is replaced
   * with the current value and `{max}` with the maximum.
   * @default "{value}%"
   */
  valueTemplate?: string
  /**
   * Threshold segments (e.g. low / optimal / high) that color-code ranges of
   * the gauge. Give segments in ascending `max` order. Each active segment's
   * `label` is always shown as text next to the value, and its boundary is
   * also marked with a visible tick in the track — color is never the only
   * cue, so the distinction survives forced-colors mode and color-blindness.
   */
  thresholds?: MeterThreshold[]
  /** Extra classes for the outer wrapper. */
  className?: string
}

/**
 * A labelled gauge for a static measured value within a known range — disk
 * usage, a budget spent, a score, a capacity. Built on Base UI Meter, which
 * renders `role="meter"` with `aria-valuenow` / `aria-valuemin` /
 * `aria-valuemax` / `aria-valuetext`.
 *
 * **Meter vs. Progress — this distinction is the whole reason both exist:**
 * - **Meter** (`role="meter"`) shows a *current measured level* of something
 *   that already has a value right now — "disk is 72% full", "$840 of your
 *   $1,000 budget is spent", "your score is 82". The value can go up or down
 *   and isn't tied to a task finishing.
 * - **Progress** (`role="progressbar"`) shows *advancement of a task toward
 *   completion over time* — an upload, an import, a multi-step wizard. It
 *   supports an indeterminate ("unknown duration") state; Meter does not,
 *   because a static measurement is always a known quantity when you choose
 *   to display it.
 *
 * Screen readers announce the two roles differently, so using the wrong one
 * misleads assistive-tech users about what the number means. If in doubt:
 * "is this number the position of an ongoing task, or a snapshot reading?" —
 * the former is Progress, the latter is Meter.
 */
export const Meter = React.forwardRef<HTMLDivElement, MeterProps>(function Meter(
  {
    className,
    value,
    min = 0,
    max = 100,
    label,
    showValue = false,
    valueTemplate = '{value}%',
    thresholds,
    ...props
  },
  ref
) {
  const hasName =
    label != null ||
    props['aria-label'] != null ||
    props['aria-labelledby'] != null

  // Dev-only guard: a meter must have an accessible name (WCAG 4.1.2).
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
      '[commons] <Meter> has no accessible name. Pass `label` (rendered ' +
        'visibly) or `aria-label` / `aria-labelledby`.'
    )
  }, [hasName])

  const activeSegment = resolveActiveThreshold(value, thresholds)
  const tone: MeterTone = activeSegment?.tone ?? 'default'

  const valueText = valueTemplate.replace('{value}', String(value)).replace('{max}', String(max))

  // One tick per internal threshold boundary (the final segment's `max` is
  // the track's own end, so it needs no tick). Position is a percentage of
  // the value range, converted with the same min/max the indicator uses.
  const thresholdTicks =
    thresholds != null && thresholds.length > 1
      ? [...thresholds]
          .sort((a, b) => a.max - b.max)
          .slice(0, -1)
          .map((threshold) => ({
            key: threshold.max,
            percent: Math.min(100, Math.max(0, ((threshold.max - min) / (max - min)) * 100)),
          }))
      : []

  return (
    // AmbientDirection makes the gauge follow the DOM `dir` (global or a
    // local `dir="rtl"`) so the fill grows from the inline-start edge like
    // the native components — Base UI reads a provider, not the DOM.
    <AmbientDirection>
      <BaseMeter.Root
        {...props}
        ref={ref}
        value={value}
        min={min}
        max={max}
        getAriaValueText={() => valueText}
        data-slot="meter"
        className={cn('flex flex-col gap-1', className)}
      >
        {label != null || showValue || activeSegment != null ? (
          <div className="flex items-baseline justify-between gap-2 text-sm leading-snug">
            {label != null ? (
              <BaseMeter.Label data-slot="meter-label" className="font-medium text-foreground">
                {label}
              </BaseMeter.Label>
            ) : (
              <span aria-hidden="true" />
            )}
            <span className="flex items-center gap-105">
              {activeSegment != null ? (
                // Non-color cue #1: the segment name as a visible tone chip,
                // always shown alongside the tone (even if `showValue` is
                // false). The chip carries a real border (visible in
                // forced-colors mode) so the segment is legible without color.
                <span
                  data-slot="meter-segment-label"
                  className={meterSegmentLabelVariants({ tone })}
                >
                  {activeSegment.label}
                </span>
              ) : null}
              {showValue ? (
                // aria-hidden: the value already reaches AT via aria-valuetext
                // on the meter; this span is the matching visual redundancy.
                <span
                  aria-hidden="true"
                  data-slot="meter-value"
                  className="text-muted-foreground tabular-nums"
                >
                  {valueText}
                </span>
              ) : null}
            </span>
          </div>
        ) : null}

        <BaseMeter.Track
          data-slot="meter-track"
          className="relative h-2 w-full overflow-hidden rounded-sm border border-border bg-muted forced-colors:border-[CanvasText]"
        >
          <BaseMeter.Indicator
            data-slot="meter-indicator"
            // Determinate fill: Base UI sets the inline width from the value
            // and anchors it with inset-inline-start:0, so it grows inline-start
            // → end and mirrors automatically in RTL. The tone supplies the fill
            // + border color (a validated `*-border` for the state tones,
            // transparent for the strong `bg-primary` default) so the fill's
            // edge stays visible against the track — and in forced-colors mode,
            // where the track border and indicator background can otherwise
            // resolve to the same system color and hide how much is filled.
            className={meterIndicatorVariants({ tone })}
          />
          {/* Non-color cue #2: a tick at each threshold boundary. Rendered
              after the indicator so it stays visible on top of the fill. */}
          {thresholdTicks.map((tick) => (
            <span
              key={tick.key}
              aria-hidden="true"
              data-slot="meter-threshold-tick"
              className="absolute [inset-block:0] w-px bg-border-strong forced-colors:bg-[CanvasText]"
              style={{ insetInlineStart: `${tick.percent}%` }}
            />
          ))}
        </BaseMeter.Track>
      </BaseMeter.Root>
    </AmbientDirection>
  )
})
