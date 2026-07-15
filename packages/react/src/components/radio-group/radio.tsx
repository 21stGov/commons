// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { RadioGroupContext } from '@/components/ui/radio-group'
import { cn } from '@/lib/cn'

// Minimal ambient typing so the dev-only guard compiles without
// @types/node. Bundlers statically replace `process.env.NODE_ENV`.
declare const process: { env: { NODE_ENV?: string | undefined } } | undefined

export const radioVariants = cva(['text-sm text-foreground'])

// Row rhythm — identical to Checkbox so option lists read the same:
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

// Native input styled with `accent-color` only — no appearance:none
// re-implementation. This is WHCM-safe: under `forced-colors: active`
// accent-color is ignored and the browser paints the native control with
// CSS System Colors, so the radio stays visible in Windows High Contrast
// Mode with zero extra work.
const inputClasses = [
  'size-3 shrink-0 accent-primary',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  'disabled:cursor-not-allowed',
].join(' ')

export interface RadioProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'children' | 'size'>,
    VariantProps<typeof radioVariants> {
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
}

/**
 * Native `input[type="radio"]` for use inside `<RadioGroup>`, which
 * supplies the shared `name` (single selection and arrow-key navigation
 * are native browser behavior). A `name` prop overrides the group's.
 */
export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { className, label, description, id: idProp, ...props },
  ref
) {
  const group = React.useContext(RadioGroupContext)
  const generatedId = React.useId()
  const inputId = idProp ?? generatedId
  const labelId = `${inputId}-label`
  const descriptionId = description != null ? `${inputId}-description` : undefined

  const warnedRef = React.useRef(false)

  // Dev-only guard: a radio must have a visible label (WCAG 4.1.2 —
  // the label is also the pointer target).
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
        '[commons] <Radio> requires a `label`. The label is the ' +
          'accessible name and the 44px pointer target.'
      )
      return
    }
    // A radio without a shared `name` is silently broken: multiple options
    // stay checkable and native arrow-key navigation never engages.
    if (group == null && props.name == null) {
      warnedRef.current = true
      console.warn(
        '[commons] <Radio> has no shared `name`. Wrap the options in a ' +
          '<RadioGroup> (recommended) or give every radio in the group ' +
          'the same `name` prop — otherwise single selection and ' +
          'arrow-key navigation do not work.'
      )
    }
  }, [label, group, props.name])

  const describedBy =
    [descriptionId, props['aria-describedby']].filter(Boolean).join(' ') || undefined

  const name = props.name ?? group?.name
  const required = props.required ?? group?.required

  return (
    <div data-slot="radio" className={cn(radioVariants(), className)}>
      <label data-slot="radio-label" className={labelClasses}>
        <span data-slot="radio-row" className={rowClasses}>
          <span data-slot="radio-control-box" className={controlBoxClasses}>
            <input
              {...props}
              ref={ref}
              id={inputId}
              type="radio"
              name={name}
              required={required}
              aria-labelledby={labelId}
              aria-describedby={describedBy}
              data-slot="radio-control"
              className={inputClasses}
            />
          </span>
          {/* gap-0: the line-height alone spaces a label from its own
              description, keeping the pair visually one unit; separation
              BETWEEN options comes from the group gap. */}
          <span className="flex min-w-0 flex-1 flex-col gap-0">
            <span
              id={labelId}
              data-slot="radio-label-text"
              className="block break-words leading-snug"
            >
              {label}
            </span>
            {description != null ? (
              <span
                id={descriptionId}
                data-slot="radio-description"
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
