// SPDX-License-Identifier: MIT

'use client'

import * as React from 'react'

import { Calendar, type CalendarProps } from '@/components/ui/calendar'
import { useFieldControl, useFieldLabelId } from '@/components/ui/context'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/cn'

/** Locale object accepted by the underlying calendar (a date-fns locale). */
type DatePickerLocale = CalendarProps['locale']

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

export interface DatePickerProps {
  /** Controlled selected date. Pair with `onValueChange`. */
  value?: Date | undefined
  /** Initial selected date for uncontrolled usage. */
  defaultValue?: Date | undefined
  /** Called with the next date (or `undefined` when cleared). */
  onValueChange?: (value: Date | undefined) => void
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
   * How the selected date is rendered in the trigger. An
   * `Intl.DateTimeFormatOptions` object formatted with `Intl.DateTimeFormat`
   * (locale-aware, no extra dependency). For full control pass
   * {@link DatePickerProps.formatValue} instead.
   * @default { dateStyle: "long" }
   */
  format?: Intl.DateTimeFormatOptions
  /**
   * Full override of the trigger's formatted value. Wins over `format`.
   * Receives the selected date; return the display string.
   */
  formatValue?: (value: Date) => string
  /**
   * Text shown in the trigger when no date is selected.
   * @default "Select a date"
   */
  placeholder?: string
  /**
   * Accessible label prefix for the trigger, used only when the picker is
   * not inside a `<Field>` (a Field's label names the trigger instead). The
   * accessible name always includes the current value, e.g.
   * "Choose date, January 19, 2000".
   * @default "Choose date"
   */
  triggerLabel?: string
  /**
   * Accessible name for the popover dialog that holds the calendar.
   * Translatable.
   * @default "Choose a date"
   */
  dialogLabel?: string
  /**
   * date-fns locale for the calendar (month and weekday names) and, via its
   * `code`, for formatting the trigger value. Import from
   * `react-day-picker/locale`.
   */
  locale?: DatePickerLocale
  /** Text direction of the calendar. `"rtl"` flips arrow-key navigation. */
  dir?: 'ltr' | 'rtl'
  /**
   * Close the popover after a day is selected and return focus to the
   * trigger.
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
 * A date field that opens a calendar. The trigger is an Input-styled
 * button that shows the formatted selected date (or a placeholder) and
 * carries `aria-haspopup="dialog"` + `aria-expanded`; the popover holds the
 * Commons `Calendar`. Composes the Commons `Popover`, `Calendar`, and
 * `Field` contract.
 *
 * Choosing a day updates the value and (by default) closes the popover and
 * returns focus to the trigger. The trigger's accessible name always
 * includes the current value.
 *
 * Use for browsing or choosing a date visually, or when selection depends
 * on availability. For a date the user already knows by heart (a date of
 * birth), prefer `MemorableDate` — typing month/day/year is faster and more
 * accessible than navigating a grid.
 */
export function DatePicker({
  value: valueProp,
  defaultValue,
  onValueChange,
  min,
  max,
  disabled,
  format = { dateStyle: 'long' },
  formatValue,
  placeholder = 'Select a date',
  triggerLabel = 'Choose date',
  dialogLabel = 'Choose a date',
  locale,
  dir,
  closeOnSelect = true,
  disabledControl,
  id: idProp,
  className,
  calendarProps,
}: DatePickerProps): React.JSX.Element {
  const field = useFieldControl()
  const fieldLabelId = useFieldLabelId()

  const id = idProp ?? field.id
  const ariaDescribedBy = field['aria-describedby']
  const ariaInvalid = field['aria-invalid']
  const isDisabled = disabledControl ?? field.disabled ?? false

  const [value, setValue] = useControllableState<Date | undefined>(
    valueProp,
    defaultValue,
    onValueChange
  )
  const [open, setOpen] = React.useState(false)

  const localeCode = (locale as { code?: string } | undefined)?.code
  const formatted = React.useMemo(() => {
    if (!value) {
      return undefined
    }
    if (formatValue) {
      return formatValue(value)
    }
    return new Intl.DateTimeFormat(localeCode, format).format(value)
  }, [value, formatValue, localeCode, format])

  // Accessible name: [context label] + [current value]. Inside a Field the
  // Field's own label supplies the context; standalone we render a
  // visually-hidden label so the name still reads "Choose date, <date>".
  const valueTextId = React.useId()
  const fallbackLabelId = React.useId()
  const labelledBy = [fieldLabelId ?? fallbackLabelId, valueTextId].join(' ')

  const handleSelect = (next: Date | undefined): void => {
    setValue(next)
    if (next && closeOnSelect) {
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            id={id}
            disabled={isDisabled}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
            aria-labelledby={labelledBy}
            data-slot="date-picker-trigger"
            data-empty={value ? undefined : ''}
            className={cn(triggerClasses, className)}
          >
            {fieldLabelId ? null : (
              <span id={fallbackLabelId} className="sr-only">
                {triggerLabel}
              </span>
            )}
            <span
              id={valueTextId}
              data-slot="date-picker-value"
              className={cn('truncate', value ? 'text-foreground' : 'text-muted-foreground')}
            >
              {formatted ?? placeholder}
            </span>
            <CalendarIcon />
          </button>
        }
      />
      {/*
        w-auto so the popover hugs the calendar's intrinsic width (a 7-column
        grid of 44px targets). The default popover caps at 20rem, which is
        narrower than that grid once padding is added — the trailing (Saturday)
        column then overflowed the box and the row looked off-center. Lift the
        cap to the calendar's own width, still guarded against the viewport so
        it never runs off small screens.
      */}
      <PopoverContent
        align="start"
        aria-label={dialogLabel}
        className="w-auto p-2 [max-inline-size:calc(100dvw-2rem)]"
      >
        <Calendar
          {...calendarProps}
          mode="single"
          selected={value}
          onSelect={handleSelect}
          min={min}
          max={max}
          disabled={disabled}
          dir={dir}
          locale={locale}
          defaultMonth={value ?? calendarProps?.defaultMonth}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
