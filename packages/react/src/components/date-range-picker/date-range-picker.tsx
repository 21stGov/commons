// SPDX-License-Identifier: MIT

import * as React from 'react'
import type { DateRange } from 'react-day-picker'

import { Calendar, type CalendarProps } from '@/components/ui/calendar'
import { useFieldControl, useFieldLabelId } from '@/components/ui/context'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/cn'

/** Locale object accepted by the underlying calendar (a date-fns locale). */
type DateRangePickerLocale = CalendarProps['locale']

/**
 * A selected date range. Structurally the same as react-day-picker's
 * `DateRange`: `from` is the start of the range and `to` its (inclusive) end.
 * `to` is absent while the user is mid-selection (start picked, end pending),
 * and the whole value is `undefined` when nothing is selected.
 */
export type DateRangePickerValue = { from?: Date; to?: Date }

// Input-styled trigger. Mirrors the Commons text-input skin (token
// utilities only, logical properties only): a real border in every state
// for forced-colors, an inset error ring so invalid is never color-only,
// dedicated disabled tokens, and a 44px minimum target.
const triggerClasses = cn(
  'flex min-h-11 w-full min-w-0 items-center justify-between gap-2 rounded-sm',
  'border border-border bg-background px-105 py-1 text-start text-base text-foreground shadow-1',
  'cursor-pointer transition-colors motion-reduce:transition-none hover:bg-muted',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  'aria-invalid:border-error-border aria-invalid:ring-1 aria-invalid:ring-inset aria-invalid:ring-error-border',
  'disabled:cursor-not-allowed disabled:border-disabled-border disabled:bg-disabled disabled:text-disabled-foreground disabled:shadow-none disabled:hover:bg-disabled',
  'forced-colors:border-[CanvasText]'
)

function CalendarIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0 text-muted-foreground"
    >
      <rect x="3" y="4.5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 9h18M8 3v3M16 3v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Normalize the public value into react-day-picker's `DateRange`. The calendar
 * needs a `from` key to be present (its `DateRange.from` is `Date | undefined`
 * but the key is required); a value with no start reads as no selection.
 */
function toDateRange(value: DateRangePickerValue | undefined): DateRange | undefined {
  if (!value || !value.from) {
    return undefined
  }
  return { from: value.from, to: value.to }
}

export interface DateRangePickerProps {
  /** Controlled selected range. Pair with `onValueChange`. */
  value?: DateRangePickerValue | undefined
  /** Initial selected range for uncontrolled usage. */
  defaultValue?: DateRangePickerValue | undefined
  /**
   * Called with the next range as the selection progresses: `{ from }` after
   * the start is picked, `{ from, to }` once the end completes it, or
   * `undefined` when cleared.
   */
  onValueChange?: (value: DateRangePickerValue | undefined) => void
  /** Earliest selectable date. Days before it are disabled. */
  min?: Date
  /** Latest selectable date. Days after it are disabled. */
  max?: Date
  /**
   * Extra disabled days, passed straight to the calendar (any
   * react-day-picker matcher: a Date, Date[], a `{ before }` / `{ after }`
   * range, a `{ dayOfWeek }` set, or a predicate).
   */
  disabled?: CalendarProps['disabled']
  /**
   * How the selected range is rendered in the trigger. An
   * `Intl.DateTimeFormatOptions` object; the two endpoints are joined with
   * `Intl.DateTimeFormat.prototype.formatRange`, which collapses shared parts
   * (e.g. "Jul 1 – 8, 2026") and is locale-aware with no extra dependency. A
   * partial range (start only) is formatted with plain `format`. For full
   * control pass {@link DateRangePickerProps.formatValue} instead.
   * @default { month: "short", day: "numeric", year: "numeric" }
   */
  format?: Intl.DateTimeFormatOptions
  /**
   * Full override of the trigger's formatted value. Wins over `format`.
   * Receives the selected range (`to` may be `undefined` mid-selection);
   * return the display string.
   */
  formatValue?: (value: DateRangePickerValue) => string
  /**
   * Text shown in the trigger when no range is selected.
   * @default "Select a date range"
   */
  placeholder?: string
  /**
   * Accessible label prefix for the trigger, used only when the picker is
   * not inside a `<Field>` (a Field's label names the trigger instead). The
   * accessible name always includes the current value, e.g.
   * "Choose date range, Jul 1 – 8, 2026".
   * @default "Choose date range"
   */
  triggerLabel?: string
  /**
   * Accessible name for the popover dialog that holds the calendar.
   * Translatable.
   * @default "Choose a date range"
   */
  dialogLabel?: string
  /**
   * date-fns locale for the calendar (month and weekday names) and, via its
   * `code`, for formatting the trigger value. Import from
   * `react-day-picker/locale`.
   */
  locale?: DateRangePickerLocale
  /** Text direction of the calendar. `"rtl"` flips arrow-key navigation. */
  dir?: 'ltr' | 'rtl'
  /**
   * Close the popover once the range is complete (both `from` and `to`
   * selected) and return focus to the trigger. Picking only the start keeps
   * the popover open so the user can pick the end.
   * @default true
   */
  closeOnSelect?: boolean
  /** Disable the whole control (also inherited from a surrounding Field). */
  disabledControl?: boolean
  /** Override the generated trigger id (also inherited from a Field). */
  id?: string
  /** Extra classes for the trigger button. */
  className?: string
  /** Extra props for the underlying `Calendar` (e.g. `numberOfMonths`). */
  calendarProps?: Omit<
    CalendarProps,
    | 'mode'
    | 'selected'
    | 'onSelect'
    | 'disabled'
    | 'min'
    | 'max'
    | 'dir'
    | 'locale'
    | 'month'
    | 'onMonthChange'
  >
}

function useControllableState<T>(
  controlled: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void
): [T, (next: T) => void] {
  const isControlled = controlled !== undefined
  const [uncontrolled, setUncontrolled] = React.useState<T>(defaultValue)
  const value = isControlled ? (controlled as T) : uncontrolled
  const setValue = React.useCallback(
    (next: T) => {
      if (!isControlled) {
        setUncontrolled(next)
      }
      onChange?.(next)
    },
    [isControlled, onChange]
  )
  return [value, setValue]
}

/**
 * A date-range field that opens a calendar. The trigger is an Input-styled
 * button that shows the formatted selected range (e.g. "Jul 1 – 8, 2026") or a
 * placeholder and carries `aria-haspopup="dialog"` + `aria-expanded`; the
 * popover holds the Commons `Calendar` in `range` selection mode. Composes the
 * Commons `Popover`, `Calendar`, and `Field` contract — the range sibling of
 * `DatePicker`.
 *
 * The user picks a start day, then an end day; the lighter continuous fill
 * between the endpoints is the calendar's own range treatment (a tint on the
 * cells, not the day buttons, so consecutive middle days join edge-to-edge).
 * Completing the range (by default) closes the popover and returns focus to
 * the trigger. The trigger's accessible name always includes the current
 * range, so the value is announced when focus returns.
 *
 * Use for choosing a span of dates visually — a reservation window, a report
 * period, an availability search. For a single date use `DatePicker`; for a
 * date the user knows by heart (a date of birth) use `MemorableDate`.
 */
export function DateRangePicker({
  value: valueProp,
  defaultValue,
  onValueChange,
  min,
  max,
  disabled,
  format = { month: 'short', day: 'numeric', year: 'numeric' },
  formatValue,
  placeholder = 'Select a date range',
  triggerLabel = 'Choose date range',
  dialogLabel = 'Choose a date range',
  locale,
  dir,
  closeOnSelect = true,
  disabledControl,
  id: idProp,
  className,
  calendarProps,
}: DateRangePickerProps): React.JSX.Element {
  const field = useFieldControl()
  const fieldLabelId = useFieldLabelId()

  const id = idProp ?? field.id
  const ariaDescribedBy = field['aria-describedby']
  const ariaInvalid = field['aria-invalid']
  const isDisabled = disabledControl ?? field.disabled ?? false

  const [value, setValue] = useControllableState<DateRangePickerValue | undefined>(
    valueProp,
    defaultValue,
    onValueChange
  )
  const [open, setOpen] = React.useState(false)

  // Count picks within the current open session so we can close on the pick
  // that COMPLETES the range rather than the one that starts it. react-day-
  // picker seeds `to` equal to `from` on the first click (a single-day range),
  // so "both from and to are set" cannot distinguish start from end — the
  // second pick is what completes it. Reset each time the popover opens.
  const selectionCountRef = React.useRef(0)

  const localeCode = (locale as { code?: string } | undefined)?.code
  const formatted = React.useMemo(() => {
    if (!value?.from) {
      return undefined
    }
    if (formatValue) {
      return formatValue(value)
    }
    const formatter = new Intl.DateTimeFormat(localeCode, format)
    // Complete range → formatRange collapses shared parts ("Jul 1 – 8, 2026").
    // Partial range (start only, end pending) → format the single start day.
    if (value.to) {
      return formatter.formatRange(value.from, value.to)
    }
    return formatter.format(value.from)
  }, [value, formatValue, localeCode, format])

  // Accessible name: [context label] + [current value]. Inside a Field the
  // Field's own label supplies the context; standalone we render a
  // visually-hidden label so the name still reads "Choose date range, <range>".
  const valueTextId = React.useId()
  const fallbackLabelId = React.useId()
  const labelledBy = [fieldLabelId ?? fallbackLabelId, valueTextId].join(' ')

  const selected = toDateRange(value)

  const handleOpenChange = (nextOpen: boolean): void => {
    if (nextOpen) {
      selectionCountRef.current = 0
    }
    setOpen(nextOpen)
  }

  const handleSelect = (next: DateRange | undefined): void => {
    setValue(next ?? undefined)
    if (!next) {
      // Cleared (e.g. clicking the lone start day again): restart the pair so
      // the next two picks form a fresh range.
      selectionCountRef.current = 0
      return
    }
    selectionCountRef.current += 1
    // First pick sets the start, second pick completes the range. Close on the
    // completing pick so the start pick keeps the popover open for the end.
    if (selectionCountRef.current >= 2 && closeOnSelect) {
      setOpen(false)
    }
  }

  // See the cast note at the render site: range mode's numeric min/max collide,
  // at the type level only, with the Commons Calendar's Date min/max bounds.
  const rangeCalendarProps = {
    ...calendarProps,
    mode: 'range',
    selected,
    onSelect: handleSelect,
    min,
    max,
    disabled,
    dir,
    locale,
    defaultMonth: value?.from ?? calendarProps?.defaultMonth,
    autoFocus: true,
  } as unknown as CalendarProps

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <button
            type="button"
            id={id}
            disabled={isDisabled}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
            aria-labelledby={labelledBy}
            data-slot="date-range-picker-trigger"
            data-empty={value?.from ? undefined : ''}
            className={cn(triggerClasses, className)}
          >
            {fieldLabelId ? null : (
              <span id={fallbackLabelId} className="sr-only">
                {triggerLabel}
              </span>
            )}
            <span
              id={valueTextId}
              data-slot="date-range-picker-value"
              className={cn('truncate', value?.from ? 'text-foreground' : 'text-muted-foreground')}
            >
              {formatted ?? placeholder}
            </span>
            <CalendarIcon />
          </button>
        }
      />
      {/*
        w-auto so the popover hugs the calendar's intrinsic width (a 7-column
        grid of 44px targets, wider still with numberOfMonths > 1). The default
        popover caps at 20rem, which is narrower than that grid once padding is
        added — the trailing (Saturday) column then overflowed the box. Lift the
        cap to the calendar's own width, still guarded against the viewport so
        it never runs off small screens.
      */}
      <PopoverContent
        align="start"
        aria-label={dialogLabel}
        className="w-auto p-2 [max-inline-size:calc(100dvw-2rem)]"
      >
        {/*
          Cast note: in `range` mode react-day-picker's props add numeric
          `min`/`max` (range-length limits) which, intersected with the Commons
          Calendar's convenience Date `min`/`max` bounds, collapse to the
          impossible `number & Date` at the type level only. The Calendar
          consumes `min`/`max` as Dates at runtime (mapping them to a disabled
          matcher plus startMonth/endMonth), so cast past the union artifact.
        */}
        <Calendar {...rangeCalendarProps} />
      </PopoverContent>
    </Popover>
  )
}
