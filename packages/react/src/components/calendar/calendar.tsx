// SPDX-License-Identifier: MIT
// Calendar wraps react-day-picker; the token-styling approach (drive
// react-day-picker's `classNames` map with utility classes, swap the
// navigation Chevron for an inline SVG) is adapted from shadcn/ui
// (https://github.com/shadcn-ui/ui).
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

'use client'

import * as React from 'react'
import {
  DayPicker,
  getDefaultClassNames,
  type ChevronProps,
  type DayButtonProps,
  type DayPickerProps,
  type Matcher,
} from 'react-day-picker'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/cn'

/**
 * Props for {@link Calendar}. Extends react-day-picker's `DayPickerProps`
 * (a discriminated union over `mode`: `"single" | "multiple" | "range"`),
 * so `mode`, `selected`, `onSelect`, `month`, `disabled`, `dir`, `locale`,
 * `numberOfMonths`, and every other DayPicker prop pass straight through.
 *
 * We add two convenience bounds, {@link CalendarProps.min} and
 * {@link CalendarProps.max}, that both constrain month navigation
 * (`startMonth` / `endMonth`) and disable out-of-range days.
 */
export type CalendarProps = DayPickerProps & {
  /**
   * Earliest selectable date. Days before it are disabled and month
   * navigation will not page earlier than its month. Merged with any
   * `disabled` matcher you pass.
   */
  min?: Date
  /**
   * Latest selectable date. Days after it are disabled and month
   * navigation will not page later than its month. Merged with any
   * `disabled` matcher you pass.
   */
  max?: Date
}

/**
 * Inline navigation chevron. Rendered with `currentColor` so it stays
 * visible in forced-colors mode, and mirrored in RTL via `rtl:-scale-x-100`
 * so "previous" always points toward earlier months regardless of writing
 * direction.
 */
function CalendarChevron({
  className,
  orientation = 'left',
  size = 20,
  disabled,
}: ChevronProps): React.JSX.Element {
  const paths: Record<NonNullable<ChevronProps['orientation']>, string> = {
    left: 'm15 18-6-6 6-6',
    right: 'm9 18 6-6-6-6',
    up: 'm6 15 6-6 6 6',
    down: 'm6 9 6 6 6-6',
  }
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      data-disabled={disabled || undefined}
      className={cn('rtl:-scale-x-100', className)}
    >
      <path
        d={paths[orientation]}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Day button that focuses without scrolling. react-day-picker's default
 * DayButton calls `.focus()` with no options when a day becomes focused;
 * inside a portalled popover (the DatePicker) that scroll-into-view yanks a
 * long page back to the top on open. Focusing with `preventScroll` keeps the
 * roving focus and keyboard navigation intact without moving the viewport.
 */
function CalendarDayButton({
  day: _day,
  modifiers,
  ...buttonProps
}: DayButtonProps): React.JSX.Element {
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) {
      ref.current?.focus({ preventScroll: true })
    }
  }, [modifiers.focused])
  return <button ref={ref} {...buttonProps} />
}

/** Root element wrapper that stamps the Commons `data-slot`. */
function CalendarRoot({
  className,
  rootRef,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  rootRef?: React.Ref<HTMLDivElement>
}): React.JSX.Element {
  return <div ref={rootRef} data-slot="calendar" className={className} {...props} />
}

function toMatcherArray(matcher: Matcher | Matcher[] | undefined): Matcher[] {
  if (matcher === undefined) {
    return []
  }
  return Array.isArray(matcher) ? matcher : [matcher]
}

/**
 * A styled, accessible month grid built on react-day-picker's `DayPicker`.
 *
 * react-day-picker supplies the interaction and semantics — a `role="grid"`
 * month table, roving tabindex (exactly one day is tab-focusable), arrow-key
 * navigation (Left/Right by day and flipped under `dir="rtl"`, Up/Down by
 * week, Home/End to week ends, PageUp/PageDown by month, add Shift for a
 * year), `aria-selected` on selected days, and a localized `aria-label` per
 * day. Commons adds token styling, 44px day targets, an inline navigation
 * chevron, and a non-color selected state (background fill + a subtle inset
 * ring, on top of `aria-selected`).
 *
 * Selection `mode` (`"single"`, `"multiple"`, `"range"`), `dir`, and
 * `locale` (month/weekday names come from the date-fns locale) all pass
 * through.
 */
export function Calendar({
  className,
  classNames,
  components,
  showOutsideDays = true,
  min,
  max,
  disabled,
  startMonth,
  endMonth,
  ...props
}: CalendarProps): React.JSX.Element {
  const defaults = getDefaultClassNames()

  const mergedDisabled: Matcher[] = [
    ...toMatcherArray(disabled),
    ...(min ? [{ before: min } as Matcher] : []),
    ...(max ? [{ after: max } as Matcher] : []),
  ]

  // Every day cell (the <td>, role="gridcell") carries the selection-state
  // and day-flag classes; the button inside it is targeted with `&>button`
  // so the visual treatment lands on the 44px target.
  const dayCellFocus =
    'focus-within:relative focus-within:z-10 [&>button]:focus-visible:outline-2 [&>button]:focus-visible:outline-offset-2 [&>button]:focus-visible:outline-ring'

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      disabled={mergedDisabled.length > 0 ? mergedDisabled : undefined}
      startMonth={startMonth ?? min}
      endMonth={endMonth ?? max}
      className={cn('w-fit text-foreground', className)}
      components={{
        Chevron: CalendarChevron,
        Root: CalendarRoot,
        DayButton: CalendarDayButton,
        ...components,
      }}
      classNames={{
        root: cn('relative', defaults.root),
        months: cn('relative flex flex-col gap-4 sm:flex-row', defaults.months),
        month: cn('flex flex-col gap-4', defaults.month),
        month_caption: cn(
          // Centered title with inline padding so the absolutely-positioned
          // nav buttons never overlap the label.
          'flex min-h-11 items-center justify-center px-11',
          defaults.month_caption
        ),
        caption_label: cn('text-sm font-semibold text-foreground', defaults.caption_label),
        nav: cn(
          // inset-x-0 (inline: both sides 0, symmetric so RTL-neutral) +
          // top-0 spans the caption row so justify-between pushes prev to
          // the inline-start edge and next to the inline-end edge. NB: there
          // is no `inset-inline-0`/`inset-block-start-0` Tailwind utility —
          // using one silently drops the inset (the toast/positioning trap).
          'absolute inset-x-0 top-0 flex items-center justify-between',
          defaults.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          'size-11 shrink-0 p-0 aria-disabled:pointer-events-none aria-disabled:opacity-50',
          defaults.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          'size-11 shrink-0 p-0 aria-disabled:pointer-events-none aria-disabled:opacity-50',
          defaults.button_next
        ),
        month_grid: cn('w-full border-collapse', defaults.month_grid),
        weekdays: cn(defaults.weekdays),
        weekday: cn('size-11 pb-1 text-xs font-normal text-muted-foreground', defaults.weekday),
        week: cn(defaults.week),
        week_number_header: cn(
          'size-11 text-xs font-normal text-muted-foreground',
          defaults.week_number_header
        ),
        week_number: cn('text-xs font-normal text-muted-foreground', defaults.week_number),
        day: cn(
          'p-0 text-center align-middle',
          dayCellFocus,
          // The inner button: the 44px target.
          '[&>button]:mx-auto [&>button]:flex [&>button]:size-11 [&>button]:items-center [&>button]:justify-center',
          '[&>button]:rounded-sm [&>button]:text-sm [&>button]:text-foreground',
          '[&>button]:transition-colors [&>button]:motion-reduce:transition-none',
          '[&>button]:hover:bg-muted',
          '[&>button]:cursor-pointer',
          defaults.day
        ),
        today: cn(
          // Today: ring + weight, never color alone.
          '[&>button]:font-semibold [&>button]:ring-1 [&>button]:ring-inset [&>button]:ring-border-strong',
          defaults.today
        ),
        selected: cn(
          // Selected: background fill + subtle inset ring, on top of the
          // aria-selected the grid already sets — a shape cue, not color-only.
          '[&>button]:bg-primary [&>button]:font-semibold [&>button]:text-primary-foreground',
          '[&>button]:ring-1 [&>button]:ring-inset [&>button]:ring-primary-foreground',
          '[&>button]:hover:bg-primary-hover',
          defaults.selected
        ),
        outside: cn('[&>button]:text-muted-foreground', defaults.outside),
        disabled: cn(
          // Disabled days read as non-interactive by more than the
          // strikethrough: a subtle filled surface sits behind them, held on
          // hover (never the day's hover highlight).
          '[&>button]:cursor-not-allowed [&>button]:bg-disabled [&>button]:text-disabled-foreground [&>button]:line-through',
          '[&>button]:hover:bg-disabled',
          defaults.disabled
        ),
        hidden: cn('invisible', defaults.hidden),
        range_start: cn(
          '[&>button]:rounded-e-none [&>button]:bg-primary [&>button]:font-semibold [&>button]:text-primary-foreground',
          '[&>button]:ring-1 [&>button]:ring-inset [&>button]:ring-primary-foreground [&>button]:hover:bg-primary-hover',
          defaults.range_start
        ),
        range_end: cn(
          '[&>button]:rounded-s-none [&>button]:bg-primary [&>button]:font-semibold [&>button]:text-primary-foreground',
          '[&>button]:ring-1 [&>button]:ring-inset [&>button]:ring-primary-foreground [&>button]:hover:bg-primary-hover',
          defaults.range_end
        ),
        range_middle: cn(
          // The days between the endpoints. The lighter fill lives on the
          // cell (the <td>), not the inner 44px button, so consecutive
          // middle days join edge-to-edge into one continuous band instead of
          // reading as separate chips with white gaps between them.
          'bg-info text-info-foreground',
          // Middle days are also `selected`, so react-day-picker layers the
          // solid `selected` pill treatment on their button too. Neutralize
          // it: the cell carries data-selected, so this compound selector
          // outranks `selected`'s plain `[&>button]:` rules regardless of
          // stylesheet order — the button goes flat and transparent, letting
          // the cell band show through. Text stays info-foreground for
          // contrast on the tint.
          '[&[data-selected]>button]:rounded-none [&[data-selected]>button]:bg-transparent',
          '[&[data-selected]>button]:font-normal [&[data-selected]>button]:text-info-foreground',
          '[&[data-selected]>button]:shadow-none [&[data-selected]>button]:ring-0',
          '[&[data-selected]>button]:hover:bg-transparent',
          defaults.range_middle
        ),
        ...classNames,
      }}
      {...props}
    />
  )
}
