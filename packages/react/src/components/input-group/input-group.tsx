// SPDX-License-Identifier: MIT

import * as React from 'react'

import { Button } from '@/components/ui/button'
import { useFieldControl } from '@/components/ui/context'
import { Input, inputVariants, type InputProps } from '@/components/ui/input'
import { cn } from '@/lib/cn'

// Minimal ambient typing so the dev-only guard compiles without
// @types/node. Bundlers statically replace `process.env.NODE_ENV`.
declare const process: { env: { NODE_ENV?: string | undefined } } | undefined

// The visual control box wrapping prefix + input + suffix + actions as ONE
// bordered field. It reuses `inputVariants` so the border, background,
// forced-colors boundary, error tokens (data-invalid), and disabled tokens
// (data-disabled) match the bare Input exactly.
//
// Focus ring — the whole group shows ONE ring, and only when the text input
// itself is focused:
//   - `focus-within:outline-0` cancels the `focus-within` ring that
//     `inputVariants` bakes in, so a focused ACTION BUTTON does not light up
//     the whole group (the button keeps its own focus-visible ring).
//   - `has-[[data-slot=input]:focus]:outline-*` re-adds the ring, scoped to
//     the input, so tabbing into the text field rings the entire control.
const groupBoxClasses = [
  'flex items-stretch p-0 gap-0',
  // Strip the inner input's own box from the WRAPPER (a descendant rule the
  // generator can emit), not inline on the <Input> — an inline reset is
  // stripped in the framework-agnostic rewrite, leaving the inner `.cui-input`
  // border + fill drawing over the prefix/suffix addons.
  '[&_input]:rounded-none [&_input]:border-0 [&_input]:bg-transparent [&_input]:shadow-none',
  // …including the invalid/disabled states, whose own `.cui-input[aria-invalid]`
  // border is more specific than the plain descendant reset. The group wrapper
  // carries the error/disabled treatment instead.
  '[&_input]:aria-invalid:border-0 [&_input]:aria-invalid:ring-0 [&_input]:disabled:border-0 [&_input]:disabled:bg-transparent',
  // Cancel the inherited focus-within ring, then scope one ring to the input.
  'focus-within:outline-0',
  // Re-add the single ring, scoped to the input. The reset above and this
  // re-add both set outline-width under a matching state; left at equal
  // specificity, which one wins is decided by CSS source order, and that order
  // differs between build tools — some emit NO ring at all. Stacking
  // `focus-within:` in front of the `has-[input:focus]` width rule gives it an
  // extra pseudo-class, so it deterministically outweighs the plain
  // `focus-within:outline-0` reset whenever the input is focused (both are true
  // then). It still narrows to input-focus, so a focused ACTION button gets no
  // group ring. `outline-offset-2` keeps the ring at a positive offset OUTSIDE
  // the box, so it never draws over the prefix/value — a "https://" prefix
  // stays fully visible when focused.
  'focus-within:has-[[data-slot=input]:focus]:outline-2 has-[[data-slot=input]:focus]:outline-offset-2 has-[[data-slot=input]:focus]:outline-ring',
].join(' ')

// The inner Input, stripped of its own box so the GROUP owns the border,
// background, focus ring, and state styling. State attributes still land on
// the real <input> (that is where AT reads aria-invalid / disabled), but their
// visual treatment is neutralized here and re-applied on the wrapper.
const innerInputClasses = [
  'min-h-11 flex-1',
  'rounded-none border-0 bg-transparent shadow-none',
  'focus-within:outline-0',
  'aria-invalid:border-0 aria-invalid:ring-0',
  'disabled:border-0 disabled:bg-transparent disabled:shadow-none',
].join(' ')

// Decorative text/icon addon: non-editable, non-interactive, vertically
// centered, and select-none so a drag never selects "$" instead of the value.
// aria-hidden by default because a repeated symbol pollutes the accessible
// name; a MEANINGFUL unit is surfaced separately via `prefixLabel` /
// `suffixLabel` (a visually-hidden description linked with aria-describedby).
const addonClasses =
  'flex shrink-0 select-none items-center text-muted-foreground [&_svg]:size-2 [&_svg]:shrink-0'

export interface InputGroupProps extends Omit<InputProps, 'prefix' | 'suffix'> {
  /**
   * Leading addon at the inline-start (a unit, currency symbol, protocol, or
   * icon). Decorative and `aria-hidden`; it never steals the input's click
   * target. If the addon carries meaning, pass `prefixLabel` so it is
   * announced.
   */
  prefix?: React.ReactNode
  /**
   * Trailing addon at the inline-end (a unit like "lbs", a suffix like ".gov",
   * or an icon). Decorative and `aria-hidden`; pair with `suffixLabel` when it
   * is meaningful.
   */
  suffix?: React.ReactNode
  /**
   * Accessible description of a meaningful `prefix` (e.g. "Amount in US
   * dollars" for a "$"). Rendered visually-hidden and linked to the input via
   * `aria-describedby`, so screen-reader users learn what the symbol means
   * without the symbol polluting the field's name.
   */
  prefixLabel?: string
  /** Accessible description of a meaningful `suffix` (e.g. "Weight in pounds"). */
  suffixLabel?: string
  /**
   * Trailing interactive controls (a clear button, copy, a visibility toggle).
   * Unlike `prefix`/`suffix` these are NOT `aria-hidden`: use
   * `InputGroupButton` (or any `<button>`) with its own accessible name. They
   * sit at the inline-end and each fills the 44px group height as a target.
   */
  actions?: React.ReactNode
  /** Extra classes for the outer group box. */
  className?: string
}

/**
 * A single bordered control that composes the Commons `Input` with a prefix
 * and/or suffix — text addons (units, currency, protocol), leading/trailing
 * icons, and trailing action buttons.
 *
 * The whole group reads as one field: a single border wraps prefix + input +
 * suffix, and one focus ring appears when the text input is focused
 * (`:focus-within` scoped to the input, so a focused action button rings only
 * itself). Clicking anywhere on the padding or a decorative addon focuses the
 * input rather than swallowing the click.
 *
 * Inside a `<Field>` it inherits `id`, `aria-describedby`, `aria-invalid`,
 * `required`, and `disabled` — and `aria-invalid` styles the ENTIRE group
 * border with the error token, not just the inner input. Explicit props win.
 *
 * Logical properties keep prefix at the inline-start and suffix at the
 * inline-end, mirroring automatically under `dir="rtl"`. A real border is kept
 * in every state so forced-colors mode always paints a boundary.
 */
export const InputGroup = React.forwardRef<HTMLInputElement, InputGroupProps>(
  function InputGroup(
    {
      className,
      prefix,
      suffix,
      prefixLabel,
      suffixLabel,
      actions,
      id: idProp,
      'aria-describedby': ariaDescribedByProp,
      'aria-invalid': ariaInvalidProp,
      required: requiredProp,
      disabled: disabledProp,
      ...inputProps
    },
    ref
  ) {
    const field = useFieldControl()
    const reactId = React.useId()

    // Field wiring resolved once, then passed EXPLICITLY to the inner Input so
    // the wrapper and the input never diverge. Explicit props win over Field.
    const id = idProp ?? field.id
    const ariaInvalid = ariaInvalidProp ?? field['aria-invalid']
    const required = requiredProp ?? field.required
    const disabled = disabledProp ?? field.disabled
    const invalid = ariaInvalid === true || ariaInvalid === 'true'

    const prefixLabelId = prefixLabel != null ? `${reactId}-prefix-label` : undefined
    const suffixLabelId = suffixLabel != null ? `${reactId}-suffix-label` : undefined

    // Meaningful-addon descriptions come first, then the Field's / explicit
    // describedby, so a screen reader hears the unit alongside the hint/error.
    const describedBy =
      [prefixLabelId, suffixLabelId, ariaDescribedByProp ?? field['aria-describedby']]
        .filter(Boolean)
        .join(' ') || undefined

    const innerRef = React.useRef<HTMLInputElement | null>(null)
    const setRefs = React.useCallback(
      (node: HTMLInputElement | null) => {
        innerRef.current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      },
      [ref]
    )

    const hasLeading = prefix != null
    const hasTrailing = suffix != null || actions != null

    // Clicking the group's padding or a decorative addon focuses the input
    // instead of swallowing the click — but never intercept a real interactive
    // control (button/link/input). preventDefault keeps the caret/selection
    // from being lost as focus moves.
    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement
      if (target.closest('button, a, input, textarea, select, [contenteditable="true"]')) {
        return
      }
      event.preventDefault()
      innerRef.current?.focus()
    }

    const warnedRef = React.useRef(false)
    // Dev-only guard: the input needs an accessible name (WCAG 4.1.2). It comes
    // from a surrounding Field's label, an explicit aria-label/aria-labelledby,
    // or an external <label for>. A decorative prefix/suffix is NOT a name.
    React.useEffect(() => {
      if (
        (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') ||
        warnedRef.current
      ) {
        return
      }
      const node = innerRef.current
      if (!node) {
        return
      }
      const hasName =
        Boolean(field.id) ||
        node.hasAttribute('aria-label') ||
        node.hasAttribute('aria-labelledby') ||
        (node.id !== '' && document.querySelector(`label[for="${node.id}"]`) != null)
      if (!hasName) {
        warnedRef.current = true
        console.warn(
          '[commons] <InputGroup> has no accessible name. Wrap it in a <Field>, ' +
            'or set `aria-label` / `aria-labelledby` on it. A decorative prefix ' +
            'or suffix is not an accessible name.'
        )
      }
    })

    return (
      <div
        data-slot="input-group"
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
        onMouseDown={handleMouseDown}
        className={cn(inputVariants(), groupBoxClasses, className)}
      >
        {hasLeading ? (
          <span
            aria-hidden="true"
            data-slot="input-group-prefix"
            // Extra inline-start clearance so the prefix (e.g. a "https://"
            // protocol) sits comfortably away from the box's inline-start edge
            // and never reads as crowded by the focus ring.
            className={cn(addonClasses, 'ps-2')}
          >
            {prefix}
          </span>
        ) : null}

        <Input
          {...inputProps}
          ref={setRefs}
          id={id}
          aria-describedby={describedBy}
          aria-invalid={ariaInvalid}
          required={required}
          disabled={disabled}
          className={innerInputClasses}
        />

        {suffix != null ? (
          <span
            aria-hidden="true"
            data-slot="input-group-suffix"
            className={cn(addonClasses, 'pe-105')}
          >
            {suffix}
          </span>
        ) : null}

        {actions != null ? (
          <span
            data-slot="input-group-actions"
            className={cn(
              'flex shrink-0 items-stretch',
              disabled && 'pointer-events-none'
            )}
          >
            {actions}
          </span>
        ) : null}

        {prefixLabel != null ? (
          <span id={prefixLabelId} className="sr-only">
            {prefixLabel}
          </span>
        ) : null}
        {suffixLabel != null ? (
          <span id={suffixLabelId} className="sr-only">
            {suffixLabel}
          </span>
        ) : null}
      </div>
    )
  }
)

export type InputGroupButtonProps = React.ComponentProps<typeof Button>

/**
 * A trailing action button sized for the group: it fills the 44px group height
 * and is at least 44px wide, meeting the Commons minimum target size. Built on
 * the Commons `Button` (ghost by default) so it inherits the accessible-name
 * dev guard — icon-only actions MUST set `aria-label` (e.g. "Clear",
 * "Copy", "Show password"). `border-0 rounded-none` lets it blend into the
 * group's own border while keeping its own focus-visible ring.
 */
export const InputGroupButton = React.forwardRef<HTMLButtonElement, InputGroupButtonProps>(
  function InputGroupButton({ className, variant = 'ghost', size = 'sm', ...props }, ref) {
    return (
      <Button
        {...props}
        ref={ref}
        variant={variant}
        size={size}
        data-slot="input-group-action"
        className={cn('h-full min-w-11 shrink-0 rounded-none border-0', className)}
      />
    )
  }
)
