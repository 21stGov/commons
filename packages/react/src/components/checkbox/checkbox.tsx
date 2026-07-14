// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { useFieldControl } from '@/components/ui/context'
import { cn } from '@/lib/cn'

// Minimal ambient typing so the dev-only guard compiles without
// @types/node. Bundlers statically replace `process.env.NODE_ENV`.
declare const process: { env: { NODE_ENV?: string | undefined } } | undefined

export const checkboxVariants = cva(['text-sm text-foreground'])

// Row rhythm — the rule that keeps a list of options evenly spaced:
//
// The <label> IS the hit target: a min-h-11 (2.75rem = 44px) box. The
// control + text live in an inner row that is vertically CENTERED inside
// that box (flex-col justify-center). Centering — not block padding — is
// what keeps the rhythm even. One leading-snug line is 1.375em; at text-sm
// (1rem) that is 22px, so two lines are exactly 2.75rem = 44px. That means
// a label PLUS a single-line description is exactly 44px and still fits the
// target: a described row is the SAME height as a plain one, so the gap to
// the next option is identical whether or not a row carries one line of
// subtext. Extra height appears ONLY when the description wraps to 2+ lines
// (content > 44px), where the added height is genuinely needed.
const labelClasses = [
  'flex min-h-11 cursor-pointer flex-col justify-center',
  'has-[:disabled]:cursor-not-allowed has-[:disabled]:text-disabled-foreground',
].join(' ')

// The inner row: control beside the label/description block. items-start so
// the control stays optically aligned with the FIRST line of the label,
// never floating to the middle of a tall, wrapped row.
const rowClasses = 'flex items-start gap-105'

// First-line box: exactly one line of the adjacent label text, with the
// control centered inside — so the control aligns optically with the
// first line whether the text is one line, wrapped, or has a description.
const controlBoxClasses = 'flex h-[1.375em] shrink-0 items-center'

// The native input keeps all semantics and interaction while its visual box
// is token-driven. In forced-colors mode `appearance-auto` restores the
// platform checkbox and the decorative marks are hidden.
const inputClasses = [
  'peer size-3 shrink-0 appearance-none rounded-sm border border-border-strong bg-background',
  'checked:border-primary checked:bg-primary',
  '[&:indeterminate]:border-primary [&:indeterminate]:bg-primary',
  'aria-invalid:border-error-border',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  'disabled:cursor-not-allowed disabled:border-disabled-border disabled:bg-disabled',
  'forced-colors:appearance-auto',
].join(' ')

function Checkmark(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      data-slot="checkbox-checkmark"
      className="pointer-events-none invisible absolute inset-0 size-3 text-primary-foreground peer-checked:visible peer-indeterminate:invisible forced-colors:invisible"
    >
      <path
        d="m4.5 10 3.25 3.25 7.75-7.75"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IndeterminateMark(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      data-slot="checkbox-indeterminate-mark"
      className="pointer-events-none invisible absolute inset-0 size-3 text-primary-foreground peer-indeterminate:visible forced-colors:invisible"
    >
      <path d="M5 10h10" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
    </svg>
  )
}

export interface CheckboxProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'children' | 'size'>,
    VariantProps<typeof checkboxVariants> {
  /**
   * Visible label. Required: the label is the accessible name AND the
   * 44px pointer target. Translation-ready — pass a localized node.
   */
  label: React.ReactNode
  /**
   * Optional supporting text, announced via `aria-describedby` (it is
   * explicitly excluded from the accessible name via `aria-labelledby`).
   * It remains inside the padded label so the full option row is clickable.
   */
  description?: React.ReactNode
  /**
   * Show the native indeterminate ("mixed") state. Applied to the DOM
   * node via an effect because `indeterminate` is an IDL-only property.
   */
  indeterminate?: boolean
}

/**
 * Native `input[type="checkbox"]` with a padded label wrapper as the
 * pointer target. Inside a `<Field>` it inherits id, hint/error wiring,
 * `aria-invalid`, `required`, and `disabled` from the Field contract.
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, label, description, indeterminate = false, id: idProp, ...props },
  ref
) {
  const field = useFieldControl()
  const generatedId = React.useId()
  // Deliberately NOT field.id: a Checkbox always renders its own wrapping
  // <label>, so adopting the Field's id would associate the Field's
  // <label htmlFor> with the input too — two label elements per control
  // (axe: form-field-multiple-labels) and double announcements in some
  // screen readers. The Field still wires hint/error/state below; its
  // visible label acts as the question, the checkbox label as the answer.
  const inputId = idProp ?? generatedId
  const labelId = `${inputId}-label`
  const descriptionId = description != null ? `${inputId}-description` : undefined

  const innerRef = React.useRef<HTMLInputElement | null>(null)
  const warnedRef = React.useRef(false)

  React.useEffect(() => {
    const node = innerRef.current
    if (node) {
      node.indeterminate = indeterminate
    }
  }, [indeterminate])

  // Dev-only guard: a checkbox must have a visible label (WCAG 4.1.2 —
  // the label is also the pointer target, so there is no aria-label
  // escape hatch here).
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
        '[commons] <Checkbox> requires a `label`. The label is the ' +
          'accessible name and the 44px pointer target.'
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
    <div data-slot="checkbox" className={cn(checkboxVariants(), className)}>
      <label data-slot="checkbox-label" className={labelClasses}>
        <span data-slot="checkbox-row" className={rowClasses}>
          <span data-slot="checkbox-control-box" className={controlBoxClasses}>
            <span data-slot="checkbox-control" className="relative size-3 shrink-0">
              <input
                {...props}
                ref={(node) => {
                  innerRef.current = node
                  if (typeof ref === 'function') {
                    ref(node)
                  } else if (ref) {
                    ref.current = node
                  }
                }}
                id={inputId}
                type="checkbox"
                disabled={disabled}
                required={required}
                aria-invalid={invalid}
                aria-labelledby={labelId}
                aria-describedby={describedBy}
                data-slot="checkbox-input"
                className={inputClasses}
              />
              <Checkmark />
              <IndeterminateMark />
            </span>
          </span>
          {/* gap-0: line-height alone spaces the label from its own
              description so the pair reads as one unit (see radio.tsx). */}
          <span className="flex min-w-0 flex-1 flex-col gap-0">
            <span
              id={labelId}
              data-slot="checkbox-label-text"
              className="block break-words leading-snug"
            >
              {label}
            </span>
            {description != null ? (
              <span
                id={descriptionId}
                data-slot="checkbox-description"
                className="block break-words leading-snug text-muted-foreground"
              >
                {description}
              </span>
            ) : null}
          </span>
        </span>
      </label>
    </div>
  )
})
