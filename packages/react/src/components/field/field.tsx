// SPDX-License-Identifier: MIT

// Visual form-field wrappers. The wiring contract (FieldProvider /
// useFieldControl) lives in `@/components/field/context` — this file only
// renders the label / hint / error chrome and delegates all id + aria
// plumbing to that contract.

import * as React from 'react'

import { FieldProvider } from '@/components/ui/context'
import { cn } from '@/lib/cn'

/** Shared visual strings + messaging props for Field and FieldGroup. */
interface FieldMessagingProps {
  /** Hint text rendered below the label and linked via `aria-describedby`. */
  hint?: React.ReactNode
  /**
   * Error message. When present the field is in an error state: the message
   * (icon + text) is announced via a polite live region and linked via
   * `aria-describedby`, and the control receives `aria-invalid`.
   */
  error?: React.ReactNode
  /** Marks the control as required and shows the required indicator. */
  required?: boolean
  /** Disables the control (and dims the field chrome). */
  disabled?: boolean
  /**
   * Visually hidden text announced after the label when `required` is set.
   * Translation-ready: pass a localized string.
   * @default "required"
   */
  requiredLabel?: string
}

function hasContent(node: React.ReactNode): boolean {
  return node !== null && node !== undefined && node !== false && node !== ''
}

function RequiredIndicator({ requiredLabel }: { requiredLabel: string }): React.JSX.Element {
  return (
    <>
      {/* Visible non-color indicator; hidden from AT in favor of the
          spelled-out, translatable label below. The leading comma keeps
          the accessible name unambiguous ("Name, required") across
          accessible-name engines that trim inline whitespace. */}
      <span aria-hidden="true" className="ps-05 text-error-foreground">
        *
      </span>
      <span className="sr-only">, {requiredLabel}</span>
    </>
  )
}

function ErrorIcon(): React.JSX.Element {
  // Inline SVG with currentColor so it stays visible in forced-colors mode
  // and provides a non-color error indicator alongside the text. The wrapper
  // is exactly one leading-snug line of the error text (1.375em), so the
  // glyph centers against the first line at every font size and scale.
  return (
    <span
      aria-hidden="true"
      data-slot="field-error-icon"
      className="flex h-[1.375em] w-2 shrink-0 items-center self-start"
    >
      {/* -translate-y-[0.05em]: line-box center sits ~1px below the text's
          cap-band center (measured against Atkinson metrics), so the round
          glyph gets a cap-band lift — overshoot then balances above the
          caps and below the baseline. strokeWidth 1.75 matches the optical
          weight of the font-medium message text. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        fill="none"
        className="w-full -translate-y-[0.05em]"
      >
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.75" />
        <path d="M8 4.5v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <circle cx="8" cy="11.25" r="1" fill="currentColor" />
      </svg>
    </span>
  )
}

interface ErrorRegionProps {
  errorId: string
  error?: React.ReactNode
}

/**
 * Polite live region for validation errors. The container is always in the
 * DOM (present before content, per the live-region contract) and the error
 * text is swapped in, so screen readers reliably announce changes.
 */
function ErrorRegion({ errorId, error }: ErrorRegionProps): React.JSX.Element {
  return (
    <div data-slot="field-error-region" aria-live="polite">
      {hasContent(error) ? (
        <p
          id={errorId}
          data-slot="field-error"
          className="flex gap-1 text-sm font-medium leading-snug text-error-foreground"
        >
          <ErrorIcon />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  )
}

interface HintProps {
  hintId: string
  hint?: React.ReactNode
  disabled?: boolean
}

function Hint({ hintId, hint, disabled }: HintProps): React.JSX.Element | null {
  if (!hasContent(hint)) {
    return null
  }
  return (
    <p
      id={hintId}
      data-slot="field-hint"
      className={cn(
        'text-sm leading-snug text-muted-foreground',
        disabled && 'text-disabled-foreground'
      )}
    >
      {hint}
    </p>
  )
}

export interface FieldProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'id'>, FieldMessagingProps {
  /** Visible label rendered in a `<label>` pointing at the control. */
  label: React.ReactNode
  /**
   * Id for the wrapped control (defaults to a generated id). The label's
   * `htmlFor`, the hint id (`${id}-hint`), and the error id (`${id}-error`)
   * all derive from it.
   */
  id?: string
  /** Exactly one form control that consumes `useFieldControl()`. */
  children: React.ReactNode
}

/**
 * Form-field wrapper: label, optional hint, and an error live region around
 * a single control. The control receives its id, `aria-describedby`
 * (hint first, then error), `aria-invalid`, `required`, and `disabled`
 * through the Field context — it must spread `useFieldControl()`.
 */
export const Field = React.forwardRef<HTMLDivElement, FieldProps>(function Field(
  {
    className,
    label,
    hint,
    error,
    required = false,
    disabled = false,
    requiredLabel = 'required',
    id: idProp,
    children,
    ...props
  },
  ref
) {
  const generatedId = React.useId()
  const id = idProp ?? generatedId
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const showHint = hasContent(hint)
  const showError = hasContent(error)

  return (
    <div
      {...props}
      ref={ref}
      data-slot="field"
      data-disabled={disabled ? '' : undefined}
      data-invalid={showError ? '' : undefined}
      // gap-1 (8px) keeps the label/hint/error cluster visually attached to
      // its control (proximity = parseability); page-level spacing BETWEEN
      // fields should be larger (gap-3+) so each question reads as a group.
      className={cn('flex flex-col gap-1', className)}
    >
      <div data-slot="field-messages" className="flex flex-col gap-05">
        <label
          id={`${id}-label`}
          htmlFor={id}
          data-slot="field-label"
          className={cn(
            'text-sm font-medium leading-snug text-foreground',
            disabled && 'text-disabled-foreground'
          )}
        >
          {label}
          {required ? <RequiredIndicator requiredLabel={requiredLabel} /> : null}
        </label>
        <Hint hintId={hintId} hint={hint} disabled={disabled} />
        <ErrorRegion errorId={errorId} error={error} />
      </div>
      <FieldProvider
        id={id}
        hasLabel
        hasHint={showHint}
        hasError={showError}
        required={required}
        disabled={disabled}
      >
        {children}
      </FieldProvider>
    </div>
  )
})

export interface FieldGroupProps
  extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, 'id'>, FieldMessagingProps {
  /** Group label rendered in the `<legend>`. */
  label: React.ReactNode
  /**
   * Base id for the group's hint (`${id}-hint`) and error (`${id}-error`)
   * ids (defaults to a generated id).
   */
  id?: string
  /** The grouped controls (e.g. checkboxes or radios with own labels). */
  children: React.ReactNode
}

/**
 * Fieldset + legend wrapper for checkbox/radio groups, with the same hint
 * and error wiring as Field. Hint and error are linked to the group via
 * `aria-describedby` on the `<fieldset>`; `disabled` uses the native
 * fieldset attribute so every control inside is disabled together.
 */
export const FieldGroup = React.forwardRef<HTMLFieldSetElement, FieldGroupProps>(
  function FieldGroup(
    {
      className,
      label,
      hint,
      error,
      required = false,
      disabled = false,
      requiredLabel = 'required',
      id: idProp,
      children,
      ...props
    },
    ref
  ) {
    const generatedId = React.useId()
    const id = idProp ?? generatedId
    const hintId = `${id}-hint`
    const errorId = `${id}-error`
    const showHint = hasContent(hint)
    const showError = hasContent(error)

    const describedBy =
      [showHint ? hintId : null, showError ? errorId : null].filter(Boolean).join(' ') || undefined

    return (
      <fieldset
        {...props}
        ref={ref}
        disabled={disabled || undefined}
        aria-describedby={describedBy}
        data-slot="field-group"
        data-disabled={disabled ? '' : undefined}
        data-invalid={showError ? '' : undefined}
        className={cn('flex min-w-0 flex-col gap-05 border-0 p-0', className)}
      >
        <legend
          data-slot="field-group-label"
          className={cn(
            'p-0 text-sm font-medium leading-snug text-foreground',
            disabled && 'text-disabled-foreground'
          )}
        >
          {label}
          {required ? <RequiredIndicator requiredLabel={requiredLabel} /> : null}
        </legend>
        <div data-slot="field-group-messages" className="flex flex-col gap-05">
          <Hint hintId={hintId} hint={hint} disabled={disabled} />
          <ErrorRegion errorId={errorId} error={error} />
        </div>
        <div
          data-slot="field-group-controls"
          className="flex flex-col gap-05 [padding-block-start:var(--cui-spacing-05)]"
        >
          {children}
        </div>
      </fieldset>
    )
  }
)
