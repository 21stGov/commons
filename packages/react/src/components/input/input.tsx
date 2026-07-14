// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { cva } from 'class-variance-authority'
import * as React from 'react'

import { useFieldControl } from '@/components/ui/context'
import { cn } from '@/lib/cn'

/**
 * Shared text-box styles for Input, the Input adornment group, and
 * Textarea.
 *
 * - min-h-11 (2.75rem / 44px) meets the Commons minimum target size.
 * - A real border on every state keeps a visible boundary in
 *   forced-colors mode.
 * - Error state is never color alone: `aria-invalid` / `data-invalid`
 *   adds an inset ring on top of the border, so the border reads
 *   visibly thicker (2px total) as well as changing color.
 * - Focus ring uses `focus-within` so the same classes work on the
 *   bare control and on the adornment wrapper.
 */
export const inputVariants = cva([
  // border-border (not -strong): the default border token is contrast-
  // validated >= 3:1 against both page backgrounds (WCAG 1.4.11), and the
  // lighter boundary + softer radius keep the control modern, not heavy.
  'w-full min-w-0 rounded-sm border border-border bg-background shadow-1 disabled:shadow-none data-disabled:shadow-none',
  // Vertical padding is split 9px/7px (from a symmetric 8px) to optically
  // center the value: Atkinson Hyperlegible Next has top-heavy metrics
  // (ascent 13 vs descent 4 at 1em), so line-box-centered text without
  // descenders — most field values — sits ~1px above true center. rem units
  // keep the nudge proportional under text resize.
  'min-h-11 px-105 pt-[0.5625rem] pb-[0.4375rem] text-base text-foreground',
  'placeholder:text-muted-foreground',
  'transition-colors motion-reduce:transition-none',
  'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring',
  // Error: color + thicker border (1px border + 1px inset ring), never
  // color alone (WCAG 1.4.1). `aria-invalid:` styles the bare control;
  // `data-invalid:` styles the adornment wrapper.
  'aria-invalid:border-error-border aria-invalid:ring-1 aria-invalid:ring-inset aria-invalid:ring-error-border',
  'data-invalid:border-error-border data-invalid:ring-1 data-invalid:ring-inset data-invalid:ring-error-border',
  // Disabled: dedicated disabled tokens (contrast-validated pair), not
  // opacity, so the text keeps a predictable contrast ratio.
  'disabled:cursor-not-allowed disabled:border-disabled-border disabled:bg-disabled disabled:text-disabled-foreground',
  'data-disabled:cursor-not-allowed data-disabled:border-disabled-border data-disabled:bg-disabled data-disabled:text-disabled-foreground',
])

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  /**
   * Render the value in Atkinson Hyperlegible Mono with lining tabular
   * digits — for identifiers users read back and compare digit by digit:
   * SSNs, case numbers, parcel IDs, confirmation codes. Pair with the
   * matching `inputMode`/`autoComplete` attributes.
   */
  mono?: boolean
  /**
   * Decorative visual slot rendered before the value (e.g. "$", an
   * icon). It is `aria-hidden` and must stay non-interactive so the
   * whole control remains a single tab stop. Because assistive
   * technology does not announce it, repeat its meaning in the field's
   * label or hint (e.g. "Amount in dollars").
   */
  prefix?: React.ReactNode
  /**
   * Decorative visual slot rendered after the value (e.g. "kg", ".gov").
   * Same rules as `prefix`: aria-hidden, non-interactive, meaning
   * repeated in the label or hint.
   */
  suffix?: React.ReactNode
}

const adornmentClasses =
  'flex select-none items-center text-muted-foreground [&_svg]:size-2 [&_svg]:shrink-0'

/**
 * Single-line text input. Renders a native `<input>`.
 *
 * Inside a `<Field>` it inherits `id`, `aria-describedby`,
 * `aria-invalid`, `required`, and `disabled` from the Field context via
 * `useFieldControl()`; explicit props always win. Standalone it renders
 * exactly what you pass.
 *
 * All native attributes pass through — in particular set `autoComplete`
 * (e.g. `autoComplete="name"`, `"email"`, `"street-address"`) on any
 * field that collects information about the user, so browsers and
 * assistive technology can identify the input's purpose (WCAG 1.3.5
 * Identify Input Purpose).
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    prefix,
    suffix,
    mono = false,
    id: idProp,
    'aria-describedby': ariaDescribedByProp,
    'aria-invalid': ariaInvalidProp,
    required: requiredProp,
    disabled: disabledProp,
    ...props
  },
  ref
) {
  const field = useFieldControl()

  // Field wiring: the surrounding Field provides defaults, explicit
  // props win.
  const id = idProp ?? field.id
  const ariaDescribedBy = ariaDescribedByProp ?? field['aria-describedby']
  const ariaInvalid = ariaInvalidProp ?? field['aria-invalid']
  const required = requiredProp ?? field.required
  const disabled = disabledProp ?? field.disabled

  const invalid = ariaInvalid === true || ariaInvalid === 'true'
  const hasAdornment = prefix != null || suffix != null

  if (!hasAdornment) {
    return (
      <input
        {...props}
        ref={ref}
        id={id}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        required={required}
        disabled={disabled}
        data-slot="input"
        className={cn(inputVariants(), mono && 'font-mono tabular-nums tracking-wide', className)}
      />
    )
  }

  // Adornment group: the wrapper carries the box styles and the
  // decorative slots; the native input inside stays the only
  // focusable element (single tab stop). State styling hooks
  // (data-invalid / data-disabled) mirror the control's state onto
  // the wrapper.
  return (
    <div
      data-slot="input-group"
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      className={cn(inputVariants(), 'flex items-center gap-1', className)}
    >
      {prefix != null ? (
        <span aria-hidden="true" data-slot="input-prefix" className={adornmentClasses}>
          {prefix}
        </span>
      ) : null}
      <input
        {...props}
        ref={ref}
        id={id}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        required={required}
        disabled={disabled}
        // Distinct slot from the standalone input: the adornment wrapper
        // (`input-group`) carries the box, so this inner control is border-less
        // and transparent. Sharing `data-slot="input"` made the generator emit
        // a second `.cui-input { border-width: 0 }` that clobbered the bordered
        // standalone input everywhere.
        data-slot="input-control"
        className={cn(
          'w-full min-w-0 flex-1 self-stretch border-0 bg-transparent p-0',
          'text-base text-inherit placeholder:text-muted-foreground',
          'outline-none disabled:cursor-not-allowed',
          mono && 'font-mono tabular-nums tracking-wide'
        )}
      />
      {suffix != null ? (
        <span aria-hidden="true" data-slot="input-suffix" className={adornmentClasses}>
          {suffix}
        </span>
      ) : null}
    </div>
  )
})
