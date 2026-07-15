// SPDX-License-Identifier: MIT

'use client'

import * as React from "react";

import { FieldGroup } from "@/components/ui/field";
import { cn } from "@/lib/cn";

/**
 * The value of a memorable date: three independent string parts, each the
 * raw text of its sub-field. Empty strings mean "not yet entered". Month is
 * the 1-based month number as a string ("1"…"12"); day and year are the
 * digits the user typed. Kept as strings (not numbers) so a partially filled
 * date round-trips losslessly and a leading "0" is never dropped.
 */
export interface MemorableDateValue {
  month: string;
  day: string;
  year: string;
}

const EMPTY_VALUE: MemorableDateValue = { month: "", day: "", year: "" };

/** English month names, in order. Override via the `monthLabels` prop. */
export const DEFAULT_MONTH_LABELS: readonly string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Visible labels for the three sub-fields. Every string is translatable. */
export interface MemorableDateSubLabels {
  month?: string;
  day?: string;
  year?: string;
}

/**
 * Per-field `autocomplete` tokens. For a date of birth, pass
 * `{ month: "bday-month", day: "bday-day", year: "bday-year" }` so browsers
 * and assistive technology can identify each input's purpose
 * (WCAG 1.3.5 Identify Input Purpose). Left undefined for dates that have no
 * autofill meaning (a permit date, an incident date).
 */
export interface MemorableDateAutoComplete {
  month?: string;
  day?: string;
  year?: string;
}

// Shared skin for the three native controls. Token utilities only, logical
// properties only. A real border on every state keeps a boundary in
// forced-colors mode; the error state adds an inset ring on top of the
// border (2px total) so it never reads by color alone (WCAG 1.4.1).
// min-h-11 (2.75rem / 44px) meets the Commons minimum target size.
const controlBase = cn(
  "min-h-11 rounded-sm border border-border bg-background shadow-1",
  "text-base text-foreground",
  "transition-colors motion-reduce:transition-none",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  "disabled:cursor-not-allowed disabled:border-disabled-border disabled:bg-disabled disabled:text-disabled-foreground",
  "aria-invalid:border-error-border aria-invalid:ring-1 aria-invalid:ring-inset aria-invalid:ring-error-border",
);

/**
 * Chevron for the Month `<select>`. Matches the Select component exactly:
 * the native UA arrow is removed (`appearance-none` on the select) and this
 * inline SVG is overlaid at the logical inline end (auto-flips in RTL),
 * drawn with `currentColor` so it survives forced-colors mode. The select
 * reserves room with `pe-12` so the arrow never touches the border.
 * `pointer-events-none` lets clicks fall through to the native control.
 */
function MonthSelectChevron(): React.JSX.Element {
  return (
    <span
      aria-hidden="true"
      data-slot="memorable-date-select-icon"
      className="pointer-events-none col-start-1 row-start-1 flex items-center justify-end pe-2 text-foreground peer-disabled:text-disabled-foreground"
    >
      <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="size-2 shrink-0">
        <path
          d="m4 6 4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export interface MemorableDateProps
  extends Omit<
    React.FieldsetHTMLAttributes<HTMLFieldSetElement>,
    "onChange" | "defaultValue"
  > {
  /**
   * The question the whole date answers (e.g. "Date of birth"), rendered as
   * the fieldset's `<legend>`. Translatable.
   */
  legend: React.ReactNode;
  /** Hint text below the legend, linked to the fieldset via aria-describedby. */
  hint?: React.ReactNode;
  /**
   * Error message. When present the group enters an error state: the message
   * is announced via a polite live region (icon + text) and linked to the
   * fieldset, and every sub-field shows the non-color error ring.
   */
  error?: React.ReactNode;
  /** Marks the date required (visible + screen-reader indicator on the legend). */
  required?: boolean;
  /** Disables all three sub-fields together (native fieldset `disabled`). */
  disabled?: boolean;
  /**
   * Visually hidden word announced after the legend when `required` is set.
   * @default "required"
   */
  requiredLabel?: string;
  /** Controlled value. Provide with `onChange` for a controlled component. */
  value?: MemorableDateValue;
  /** Initial value for the uncontrolled component. @default all empty */
  defaultValue?: MemorableDateValue;
  /** Called with the full next value whenever any sub-field changes. */
  onChange?: (value: MemorableDateValue) => void;
  /**
   * Base id. The three sub-fields derive `${id}-month`, `${id}-day`, and
   * `${id}-year`; the group hint/error derive `${id}-hint` / `${id}-error`.
   * Defaults to a generated id.
   */
  id?: string;
  /**
   * Base `name` for form submission. When set the sub-fields submit as
   * `${name}-month`, `${name}-day`, and `${name}-year`.
   */
  name?: string;
  /** The 12 month names, in order. @default English (DEFAULT_MONTH_LABELS) */
  monthLabels?: readonly string[];
  /**
   * First, non-selectable option of the month select, shown until a month is
   * chosen. Translatable. @default "- Select -"
   */
  monthPlaceholderLabel?: string;
  /** Visible labels for Month / Day / Year. Translatable. */
  subLabels?: MemorableDateSubLabels;
  /** Per-field autocomplete tokens (e.g. bday-month/day/year for a DOB). */
  autoComplete?: MemorableDateAutoComplete;
}

/**
 * A date entered as three separate fields — Month (a native `<select>`),
 * Day, and Year (native numeric text inputs) — grouped under a
 * `<fieldset>` + `<legend>`.
 *
 * This is the USWDS "memorable date" pattern: for a date the user already
 * knows (a birth date, an issue date) three plain fields are faster and more
 * accessible than a calendar date picker. Use a date picker only when the
 * user is choosing or browsing a date. Focus is never auto-advanced between
 * fields — that is a documented accessibility anti-pattern (it traps screen
 * reader and keyboard users and defeats correction).
 *
 * Hint and error are wired at the group (fieldset) level via
 * `aria-describedby`, reusing `FieldGroup`. Works controlled
 * (`value` + `onChange`) or uncontrolled (`defaultValue`).
 */
export const MemorableDate = React.forwardRef<
  HTMLFieldSetElement,
  MemorableDateProps
>(function MemorableDate(
  {
    legend,
    hint,
    error,
    required = false,
    disabled = false,
    requiredLabel,
    value: valueProp,
    defaultValue,
    onChange,
    id: idProp,
    name,
    monthLabels = DEFAULT_MONTH_LABELS,
    monthPlaceholderLabel = "- Select -",
    subLabels,
    autoComplete,
    className,
    ...props
  },
  ref,
) {
  const generatedId = React.useId();
  const baseId = idProp ?? generatedId;

  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = React.useState<MemorableDateValue>(
    defaultValue ?? EMPTY_VALUE,
  );
  const current = isControlled ? valueProp : internal;

  const update = React.useCallback(
    (part: Partial<MemorableDateValue>) => {
      const next = { ...current, ...part };
      if (!isControlled) {
        setInternal(next);
      }
      onChange?.(next);
    },
    [current, isControlled, onChange],
  );

  const invalid = error != null && error !== false && error !== "";

  const monthId = `${baseId}-month`;
  const dayId = `${baseId}-day`;
  const yearId = `${baseId}-year`;

  const labels = {
    month: subLabels?.month ?? "Month",
    day: subLabels?.day ?? "Day",
    year: subLabels?.year ?? "Year",
  };

  // aria-invalid mirrors the group error onto each control so the non-color
  // ring shows; the error *text* stays described once, at the group level.
  const invalidProp = invalid ? true : undefined;

  return (
    <FieldGroup
      {...props}
      ref={ref}
      id={baseId}
      label={legend}
      hint={hint}
      error={error}
      required={required}
      disabled={disabled}
      {...(requiredLabel !== undefined ? { requiredLabel } : {})}
      className={className}
    >
      {/* Sub-fields flow along the inline axis (start -> end), so they mirror
          in RTL automatically. flex-wrap keeps them usable at 320px / 400%. */}
      <div className="flex flex-wrap items-start gap-2">
        <div className="flex min-w-0 flex-col gap-05">
          <label
            htmlFor={monthId}
            data-slot="memorable-date-label"
            className={cn(
              "text-sm font-medium leading-snug text-foreground",
              disabled && "text-disabled-foreground",
            )}
          >
            {labels.month}
          </label>
          {/* grid overlay wrapper (matches Select): the native control and
              the chevron share one grid cell, so the arrow sits at the
              inline end with reserved `pe-12` room instead of touching the
              border. */}
          <span
            data-slot="memorable-date-month-wrapper"
            className="grid w-40 grid-cols-1"
          >
            <select
              id={monthId}
              name={name ? `${name}-month` : undefined}
              data-slot="memorable-date-month"
              aria-invalid={invalidProp}
              required={required || undefined}
              autoComplete={autoComplete?.month}
              value={current.month}
              onChange={(event) => update({ month: event.target.value })}
              className={cn(
                controlBase,
                "peer col-start-1 row-start-1 w-full appearance-none py-1 pe-12 ps-2",
              )}
            >
              <option value="" disabled={required}>
                {monthPlaceholderLabel}
              </option>
              {monthLabels.map((label, index) => (
                <option key={index} value={String(index + 1)}>
                  {label}
                </option>
              ))}
            </select>
            <MonthSelectChevron />
          </span>
        </div>

        <div className="flex min-w-0 flex-col gap-05">
          <label
            htmlFor={dayId}
            data-slot="memorable-date-label"
            className={cn(
              "text-sm font-medium leading-snug text-foreground",
              disabled && "text-disabled-foreground",
            )}
          >
            {labels.day}
          </label>
          <input
            id={dayId}
            name={name ? `${name}-day` : undefined}
            data-slot="memorable-date-day"
            // type="text" + inputMode="numeric" (not type="number"): no
            // spinner, no scroll-wheel value changes, and maxLength applies.
            // This is the USWDS memorable-date input contract.
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            aria-invalid={invalidProp}
            required={required || undefined}
            autoComplete={autoComplete?.day}
            value={current.day}
            onChange={(event) => update({ day: event.target.value })}
            className={cn(controlBase, "w-16 px-105 py-1")}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-05">
          <label
            htmlFor={yearId}
            data-slot="memorable-date-label"
            className={cn(
              "text-sm font-medium leading-snug text-foreground",
              disabled && "text-disabled-foreground",
            )}
          >
            {labels.year}
          </label>
          <input
            id={yearId}
            name={name ? `${name}-year` : undefined}
            data-slot="memorable-date-year"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            aria-invalid={invalidProp}
            required={required || undefined}
            autoComplete={autoComplete?.year}
            value={current.year}
            onChange={(event) => update({ year: event.target.value })}
            className={cn(controlBase, "w-24 px-105 py-1")}
          />
        </div>
      </div>
    </FieldGroup>
  );
});
