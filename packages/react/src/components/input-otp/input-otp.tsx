// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

'use client'

import { OTPField } from '@base-ui/react/otp-field'
import { cva } from 'class-variance-authority'
import * as React from 'react'

import { useFieldControl } from '@/components/ui/context'
import { AmbientDirection } from '@/lib/ambient-direction'
import { cn } from '@/lib/cn'

// Minimal ambient typing so the dev-only guard compiles without
// @types/node. Bundlers statically replace `process.env.NODE_ENV`.
declare const process: { env: { NODE_ENV?: string | undefined } } | undefined

/**
 * A single OTP cell. Each cell is a real `<input>` so paste, autofill of an
 * SMS one-time-code, and every assistive technology keep working — nothing is
 * intercepted.
 *
 * - `size-11` (2.75rem / 44px) makes each cell a full 44px pointer target on
 *   both axes, so the cell row meets the Commons minimum target size.
 * - A real border on every state keeps a visible boundary in forced-colors
 *   mode, where background/fill colors are replaced by system colors.
 * - The ACTIVE cell (the one that holds keyboard focus) is signaled by a
 *   focus-visible ring PLUS a color-shifted border — never color alone —
 *   so the current position survives WHCM.
 * - A filled cell gets the stronger border token so entered vs. empty cells
 *   are distinguishable by border weight, not only by the character inside.
 * - Error state is never color alone: `aria-invalid` adds an inset ring on
 *   top of the border, so the boundary reads visibly thicker (2px) as well as
 *   changing color (WCAG 1.4.1).
 * - Digits render in Atkinson Hyperlegible Mono with lining tabular figures so
 *   users reading a code back compare characters cleanly.
 */
export const inputOTPVariants = cva([
  'size-11 rounded-sm border border-border bg-background text-center text-lg text-foreground shadow-1',
  'font-mono tabular-nums caret-primary',
  'transition-colors motion-reduce:transition-none',
  // The active cell: ring + border color, both, so WHCM keeps it distinct.
  'focus-visible:z-10 focus-visible:border-primary',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  // Filled cells carry the stronger boundary (non-color redundancy).
  'data-[filled]:border-border-strong',
  // Error: color + a thicker boundary (1px border + 1px inset ring).
  'aria-invalid:border-error-border aria-invalid:ring-1 aria-invalid:ring-inset aria-invalid:ring-error-border',
  // Disabled: dedicated disabled tokens (contrast-validated), not opacity.
  // Base UI marks a disabled slot with both the native `disabled` attribute
  // and `data-disabled`, so both selectors are covered.
  'disabled:cursor-not-allowed disabled:border-disabled-border disabled:bg-disabled disabled:text-disabled-foreground disabled:shadow-none',
  'data-disabled:cursor-not-allowed data-disabled:border-disabled-border data-disabled:bg-disabled data-disabled:text-disabled-foreground data-disabled:shadow-none',
])

type BaseRootProps = React.ComponentProps<typeof OTPField.Root>

export interface InputOTPProps
  extends Omit<BaseRootProps, 'render' | 'className' | 'length' | 'aria-labelledby'> {
  /**
   * Visible label for the whole code field. Required: it is the accessible
   * name of the group AND of every cell (each cell inherits it via
   * `aria-labelledby`), and there is no `aria-label` escape hatch on an OTP
   * field. Translation-ready — pass a localized node.
   */
  label: React.ReactNode
  /**
   * Optional supporting text (e.g. "We texted a 6-digit code to …"), linked
   * via `aria-describedby` on the group and every cell so it is announced when
   * a cell takes focus, and kept OUT of the accessible name.
   */
  description?: React.ReactNode
  /**
   * Number of cells. Default 6. Also drives paste clamping, completion
   * detection, and the hidden validation input's min/max length.
   * @default 6
   */
  length?: number
  /** Extra classes for the outer wrapper (label + cells + description). */
  className?: string
  /** Extra classes for each cell `<input>`. */
  cellClassName?: string
}

/**
 * A one-time-passcode entry field built on Base UI's OTP Field. Renders a
 * labeled group of N single-character `<input>` cells.
 *
 * Accessibility contract:
 * - The container is `role="group"` named by the required visible `label`
 *   (via `aria-labelledby`); each cell also inherits that name, so a screen
 *   reader always announces which field the caret is in.
 * - Real inputs mean paste (fills every cell), SMS-code autofill
 *   (`autocomplete="one-time-code"` on the first cell, on by default), and all
 *   assistive tech keep working — the component intercepts none of them.
 * - Keyboard (provided by Base UI, direction-aware): typing a character
 *   advances to the next cell; Backspace clears the current cell and retreats;
 *   Arrow Left/Right move between cells; Home/ArrowUp jump to the first cell;
 *   End/ArrowDown jump to the last filled cell; Delete removes the current
 *   character.
 * - Non-color redundancy: the active cell shows a focus ring + border color,
 *   filled cells a stronger border, and errors a thicker inset ring — each
 *   survives Windows High Contrast / forced-colors mode.
 *
 * Inside a `<Field>` it inherits `aria-describedby`, `aria-invalid`,
 * `required`, and `disabled` from the Field contract; explicit props win. It
 * keeps its OWN id (never the Field's) so the Field's `<label htmlFor>` does
 * not become a second label for the first cell.
 *
 * Validation mode is chosen with `validationType` (Base UI): `'numeric'`
 * (default, `inputMode="numeric"`), `'alpha'`, `'alphanumeric'`
 * (`inputMode="text"`), or `'none'`. Use `mask` to obscure entered characters.
 */
export const InputOTP = React.forwardRef<HTMLDivElement, InputOTPProps>(function InputOTP(
  { className, cellClassName, label, description, length = 6, id: idProp, ...props },
  ref
) {
  const field = useFieldControl()
  const generatedId = React.useId()
  // Keep the control's OWN id (never the Field's): the first cell adopts this
  // id and the wrapper renders its own `<label htmlFor>` for it. Adopting the
  // Field id would let the Field's `<label htmlFor>` become a SECOND label for
  // the first cell (axe: form-field-multiple-labels) and double announcements.
  const inputId = idProp ?? generatedId
  const labelId = `${inputId}-label`
  const descriptionId = description != null ? `${inputId}-description` : undefined

  const warnedRef = React.useRef(false)

  // Dev-only guard: an OTP field must have a visible label (WCAG 4.1.2). The
  // label names the group and every cell — there is no aria-label escape.
  React.useEffect(() => {
    if (
      (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') ||
      warnedRef.current
    ) {
      return
    }
    const missing = label == null || (typeof label === 'string' && label.trim() === '')
    if (missing) {
      warnedRef.current = true
      console.warn(
        '[commons] <InputOTP> requires a `label`. The label is the accessible ' +
          'name of the group and of every cell.'
      )
    }
  }, [label])

  const describedBy =
    [descriptionId, field['aria-describedby'], props['aria-describedby']]
      .filter(Boolean)
      .join(' ') || undefined

  const disabled = props.disabled ?? field.disabled
  const required = props.required ?? field.required
  const invalid = props['aria-invalid'] ?? field['aria-invalid']

  return (
    <div data-slot="input-otp" className={cn('flex flex-col gap-1', className)}>
      {/* The label is associated with the FIRST cell via htmlFor; Base UI reads
          that native association and mirrors it onto the group and every cell
          as aria-labelledby — so the whole field shares one accessible name. */}
      <label
        id={labelId}
        htmlFor={inputId}
        data-slot="input-otp-label"
        className="block text-sm font-medium text-foreground"
      >
        {label}
      </label>
      {/* AmbientDirection makes the field follow the DOM `dir` (global or a
          local `dir="rtl"`) so Base UI's direction-aware keyboard (Arrow keys,
          Home/End) mirrors correctly, matching the native components. */}
      <AmbientDirection>
        <OTPField.Root
          {...props}
          ref={ref}
          id={inputId}
          length={length}
          disabled={disabled}
          required={required}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          data-slot="input-otp-group"
          className="flex items-center gap-2"
        >
          {Array.from({ length }, (_, index) => (
            <OTPField.Input
              // Index is a stable position key: cells never reorder.
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              data-slot="input-otp-cell"
              // aria-invalid/describedby live on each cell too (not just the
              // group) so they are announced while a cell holds focus.
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className={cn(inputOTPVariants(), cellClassName)}
            />
          ))}
        </OTPField.Root>
      </AmbientDirection>
      {description != null ? (
        <span
          id={descriptionId}
          data-slot="input-otp-description"
          className="block break-words text-sm leading-snug text-muted-foreground"
        >
          {description}
        </span>
      ) : null}
    </div>
  )
})
