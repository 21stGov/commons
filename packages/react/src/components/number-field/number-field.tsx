// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

'use client'

import { NumberField as BaseNumberField } from '@base-ui/react/number-field'
import * as React from 'react'

import { useFieldControl } from '@/components/ui/context'
import { Icon } from '@/components/ui/icon'
import { inputVariants } from '@/components/ui/input'
import { AmbientDirection } from '@/lib/ambient-direction'
import { cn } from '@/lib/cn'

// Minimal ambient typing so the dev-only guard compiles without
// @types/node. Bundlers statically replace `process.env.NODE_ENV`.
declare const process: { env: { NODE_ENV?: string | undefined } } | undefined

// The group is the visible text box: it reuses `inputVariants` so the border,
// radius, focus ring, and error/disabled tokens match Input and Select exactly.
// `p-0` drops the input padding so the stepper buttons reach the box edge, and
// `overflow-hidden` clips their corners to the box radius. `focus-within`
// (inherited from inputVariants) lights the ring when the inner input is
// focused. `data-invalid` / `data-disabled` mirror the control's state onto the
// wrapper exactly as the Input adornment group does.
const groupClasses = cn(
  inputVariants(),
  'flex items-stretch p-0 overflow-hidden'
)

// The native input, stripped of its own box so the group owns the chrome. It
// stays the only text-focusable element (single tab stop besides the two
// steppers). `tabular-nums` aligns digits column-for-column — numbers users
// read back and compare (amounts, counts) line up. Text color is inherited so
// the group's disabled token cascades in.
const inputClasses = cn(
  'w-full min-w-0 flex-1 self-stretch border-0 bg-transparent px-105 py-1',
  'text-base text-inherit tabular-nums placeholder:text-muted-foreground',
  'text-center outline-none disabled:cursor-not-allowed'
)

// A stepper button. Base UI's Increment/Decrement render real `<button>`s and
// wire press-and-hold auto-repeat, so we style them to the Commons Button
// ghost tokens rather than nesting a Button inside (which would double the
// element). 44px square (w-11 = 2.75rem, self-stretch fills the 44px row) meets
// the Commons target-size default. A logical inline border separates each
// stepper from the input and keeps a visible boundary in forced-colors mode.
// Base disables a stepper at the min/max bound; both `disabled:` (native attr)
// and `data-disabled:` cover that so the non-color disabled tokens always show.
const stepperClasses = cn(
  'inline-flex w-11 shrink-0 items-center justify-center self-stretch',
  'border-0 bg-transparent text-foreground',
  'cursor-pointer transition-colors motion-reduce:transition-none',
  'hover:bg-muted active:bg-muted',
  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
  'disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground',
  'data-disabled:cursor-not-allowed data-disabled:bg-disabled data-disabled:text-disabled-foreground',
  '[&_svg]:size-2 [&_svg]:shrink-0'
)

type BaseRootProps = React.ComponentProps<typeof BaseNumberField.Root>

export interface NumberFieldProps
  extends Omit<BaseRootProps, 'render' | 'className' | 'aria-labelledby'> {
  /**
   * Visible label. Required: it is the accessible name of the input (linked
   * with `htmlFor`) and gives sighted users the field's purpose. Translation-
   * ready — pass a localized node.
   */
  label: React.ReactNode
  /**
   * Optional supporting text, linked via `aria-describedby` (kept out of the
   * accessible name). Repeat any unit that only appears as a `format` suffix
   * here so it reaches assistive tech.
   */
  description?: React.ReactNode
  /**
   * Accessible name for the decrement stepper. Translation-ready.
   * @default "Decrease"
   */
  decrementLabel?: string
  /**
   * Accessible name for the increment stepper. Translation-ready.
   * @default "Increase"
   */
  incrementLabel?: string
  /**
   * Enable scrub-on-drag: press-and-drag the label horizontally to change the
   * value (a pointer-only affordance). Keyboard and the steppers remain the
   * primary, accessible controls, so this never becomes the only path.
   * @default false
   */
  scrub?: boolean
  /** Extra classes for the outer wrapper. */
  className?: string
}

/**
 * A numeric input with increment/decrement steppers built on Base UI's Number
 * Field. Locale-aware: pass `format` (an `Intl.NumberFormatOptions`) for
 * currency, percent, or unit display, and `min`/`max`/`step`/`largeStep` to
 * bound and quantize stepping.
 *
 * Accessibility contract:
 * - The visible `label` is the accessible name via a native `htmlFor`
 *   association — no `aria-label` escape hatch, so the field is always
 *   self-describing on screen and to assistive tech (WCAG 3.3.2, 4.1.2).
 * - Base UI renders a text input (not `role="spinbutton"`) carrying
 *   `aria-roledescription="Number field"`, which lets locale formatting
 *   (currency symbols, grouping separators) live in the field while typing
 *   stays forgiving. Keyboard stepping is wired on the input:
 *   ArrowUp/ArrowDown step by `step`; Shift+Arrow steps by `largeStep`;
 *   Alt+Arrow steps by `smallStep`; Home/End jump to `min`/`max` (when set).
 * - The two steppers are real buttons with required accessible names
 *   ("Increase"/"Decrease"), 44px targets, and Base disables them at the
 *   min/max bound.
 * - Forced-colors safe: the group and each stepper keep visible borders in
 *   every state, and disabled/invalid are conveyed by tokens + border weight,
 *   never color alone.
 *
 * Inside a `<Field>` it inherits hint/error wiring (`aria-describedby`),
 * `aria-invalid`, `required`, and `disabled`; explicit props always win. It
 * keeps its OWN input id (never the Field's) because it renders its own
 * `<label htmlFor>` — adopting the Field id would let the Field's own `<label>`
 * become a second label for the same input (axe: form-field-multiple-labels).
 */
export const NumberField = React.forwardRef<HTMLDivElement, NumberFieldProps>(function NumberField(
  {
    className,
    label,
    description,
    decrementLabel = 'Decrease',
    incrementLabel = 'Increase',
    scrub = false,
    id: idProp,
    disabled: disabledProp,
    required: requiredProp,
    ...props
  },
  ref
) {
  const field = useFieldControl()
  const generatedId = React.useId()
  const inputId = idProp ?? generatedId
  const descriptionId = description != null ? `${inputId}-description` : undefined

  const warnedRef = React.useRef(false)

  // Dev-only guard: a number field must have a visible label (WCAG 3.3.2 /
  // 4.1.2). The label is the accessible name; there is no aria-label escape.
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
        '[commons] <NumberField> requires a `label`. The label is the ' +
          'accessible name of the input.'
      )
    }
  }, [label])

  // Field wiring: explicit props win, then the surrounding Field's defaults.
  const disabled = disabledProp ?? field.disabled
  const required = requiredProp ?? field.required
  const invalid = field['aria-invalid']

  // The input's own description first, then the Field's hint/error ids.
  const describedBy =
    [descriptionId, field['aria-describedby']].filter(Boolean).join(' ') || undefined

  const labelNode = (
    <span data-slot="number-field-label-text" className="block break-words leading-snug">
      {label}
    </span>
  )

  return (
    <div data-slot="number-field" className={cn('flex flex-col gap-1', className)}>
      {/* AmbientDirection makes the field follow the DOM `dir` so scrubbing,
          stepping, and the split stepper layout mirror in RTL like the native
          components. */}
      <AmbientDirection>
        <BaseNumberField.Root
          {...props}
          ref={ref}
          id={inputId}
          disabled={disabled}
          required={required}
          data-slot="number-field-root"
        >
          {scrub ? (
            // ScrubArea renders the label itself (via `render`) so the visible
            // text stays the drag handle AND the `htmlFor` target. `touch-none`
            // keeps a touch drag from scrolling the page. The virtual cursor
            // shows scrub direction during pointer lock.
            <BaseNumberField.ScrubArea
              data-slot="number-field-scrub-area"
              render={
                <label
                  htmlFor={inputId}
                  data-slot="number-field-label"
                  className="w-fit cursor-ew-resize touch-none select-none text-sm font-medium text-foreground"
                />
              }
            >
              {labelNode}
              <BaseNumberField.ScrubAreaCursor data-slot="number-field-scrub-cursor" />
            </BaseNumberField.ScrubArea>
          ) : (
            <label
              htmlFor={inputId}
              data-slot="number-field-label"
              className="w-fit text-sm font-medium text-foreground"
            >
              {labelNode}
            </label>
          )}

          {/* items-stretch so both steppers fill the 44px group height. In RTL
              the flex row reverses with `dir`, moving Decrease to the visual
              start and Increase to the visual end automatically. */}
          <BaseNumberField.Group data-slot="number-field-group" className={groupClasses}>
            <BaseNumberField.Decrement
              aria-label={decrementLabel}
              data-slot="number-field-decrement"
              // Logical inline-end border: separator between the start stepper
              // and the input, mirrored automatically in RTL.
              className={cn(stepperClasses, 'border-e border-e-border')}
            >
              <Icon name="minus" />
            </BaseNumberField.Decrement>

            <BaseNumberField.Input
              data-slot="number-field-input"
              aria-describedby={describedBy}
              aria-invalid={invalid}
              className={inputClasses}
            />

            <BaseNumberField.Increment
              aria-label={incrementLabel}
              data-slot="number-field-increment"
              className={cn(stepperClasses, 'border-s border-s-border')}
            >
              <Icon name="plus" />
            </BaseNumberField.Increment>
          </BaseNumberField.Group>

          {description != null ? (
            <span
              id={descriptionId}
              data-slot="number-field-description"
              className="block break-words text-sm leading-snug text-muted-foreground"
            >
              {description}
            </span>
          ) : null}
        </BaseNumberField.Root>
      </AmbientDirection>
    </div>
  )
})
