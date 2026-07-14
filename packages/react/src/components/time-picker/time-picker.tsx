// SPDX-License-Identifier: MIT

import * as React from 'react'

import { ComboBox, type ComboBoxItem, type ComboBoxProps } from '@/components/ui/combo-box'
import { cn } from '@/lib/cn'

/**
 * Which clock the visible option labels use. The stored value is always a
 * 24-hour `"HH:mm"` string regardless of this setting — only the display
 * changes.
 *
 * - `12` → "1:00 PM" (`Intl` `h12`)
 * - `24` → "13:00" (`Intl` `h23`)
 */
export type TimePickerHourCycle = 12 | 24

/** Clamp a raw minutes-from-midnight count into the valid `0…1439` range. */
function clampMinutes(minutes: number): number {
  if (!Number.isFinite(minutes)) return 0
  return Math.min(1439, Math.max(0, Math.trunc(minutes)))
}

/**
 * Parse a 24-hour `"HH:mm"` string into minutes from midnight. Forgiving:
 * accepts `"9:5"` as well as `"09:05"`, and clamps out-of-range input rather
 * than throwing, so a bad prop degrades to a usable list instead of a crash.
 */
export function parseTimeToMinutes(value: string): number {
  const match = /^\s*(\d{1,2}):(\d{1,2})\s*$/.exec(value)
  if (!match) return 0
  const hours = Number(match[1])
  const mins = Number(match[2])
  return clampMinutes(hours * 60 + mins)
}

/** Format minutes from midnight as a 24-hour `"HH:mm"` value string. */
export function minutesToValue(minutes: number): string {
  const total = clampMinutes(minutes)
  const hours = Math.floor(total / 60)
  const mins = total % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

/**
 * Human-readable label for a time, via `Intl.DateTimeFormat` so it localizes
 * (digits, separators, AM/PM order). Recent ICU inserts a narrow no-break
 * space before AM/PM; we normalize it to a plain space so typed filtering
 * ("2:30 pm") and visual matching stay predictable.
 */
function formatTimeLabel(
  minutes: number,
  hourCycle: TimePickerHourCycle,
  locale: string | undefined
): string {
  const total = clampMinutes(minutes)
  const reference = new Date(2000, 0, 1, Math.floor(total / 60), total % 60)
  const options: Intl.DateTimeFormatOptions =
    hourCycle === 24
      ? { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }
      : { hour: 'numeric', minute: '2-digit', hourCycle: 'h12' }
  return new Intl.DateTimeFormat(locale, options)
    .format(reference)
    .replace(/[\u202f\u00a0]/g, " ")
}

/**
 * Build the option list between `startTime` and `endTime` (inclusive) at
 * `step`-minute intervals. Each option's `value` is a 24-hour `"HH:mm"`
 * string; its `label` is the localized display form.
 */
export function generateTimeOptions(
  startTime: string,
  endTime: string,
  step: number,
  hourCycle: TimePickerHourCycle,
  locale: string | undefined
): ComboBoxItem[] {
  const start = parseTimeToMinutes(startTime)
  const end = parseTimeToMinutes(endTime)
  const stride = Number.isFinite(step) && step > 0 ? Math.trunc(step) : 30

  const options: ComboBoxItem[] = []
  for (let minutes = start; minutes <= end; minutes += stride) {
    options.push({
      value: minutesToValue(minutes),
      label: formatTimeLabel(minutes, hourCycle, locale),
    })
  }
  return options
}

/**
 * Forgiving default filter: matches the query against both the visible label
 * ("2:30 PM") and the underlying 24-hour value ("14:30"), so a user can type
 * either form and still narrow the list. Case-insensitive contains match.
 */
function defaultTimeFilter(item: ComboBoxItem, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (needle === '') return true
  return item.label.toLowerCase().includes(needle) || item.value.includes(needle)
}

export interface TimePickerProps extends Omit<ComboBoxProps, 'items'> {
  /**
   * Earliest time offered, as a 24-hour `"HH:mm"` string.
   * @default "00:00"
   */
  startTime?: string
  /**
   * Latest time offered, as a 24-hour `"HH:mm"` string.
   * @default "23:30"
   */
  endTime?: string
  /**
   * Interval between offered times, in minutes.
   * @default 30
   */
  step?: number
  /**
   * Clock used for the visible labels (12- or 24-hour). The stored value is
   * always 24-hour `"HH:mm"`.
   * @default 12
   */
  hourCycle?: TimePickerHourCycle
  /**
   * BCP-47 locale for `Intl` label formatting. Omit to use the runtime
   * default; pass one for deterministic output.
   */
  locale?: string
}

/**
 * A filterable time-of-day picker: a specialized {@link ComboBox} whose
 * options are generated times (every 30 minutes by default). Users can scan
 * and select, or type to filter ("2:30" or "14:30"). The value is a 24-hour
 * `"HH:mm"` string; labels display in 12- or 24-hour form via `hourCycle`.
 *
 * It inherits the combobox keyboard contract (Down/Up move, Enter selects,
 * Escape closes then clears, typing filters) and all Field wiring from
 * ComboBox — inside a `<Field>` it adopts `id`, `aria-describedby`,
 * `aria-invalid`, `required`, and `disabled`. Standalone, give it a name via
 * `<label htmlFor>` or `aria-label`.
 */
export function TimePicker({
  startTime = '00:00',
  endTime = '23:30',
  step = 30,
  hourCycle = 12,
  locale,
  className,
  filter,
  ...comboProps
}: TimePickerProps): React.JSX.Element {
  const items = React.useMemo(
    () => generateTimeOptions(startTime, endTime, step, hourCycle, locale),
    [startTime, endTime, step, hourCycle, locale]
  )

  return (
    <span data-slot="time-picker" className={cn('block', className)}>
      <ComboBox items={items} filter={filter ?? defaultTimeFilter} {...comboProps} />
    </span>
  )
}
