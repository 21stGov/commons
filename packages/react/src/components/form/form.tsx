// SPDX-License-Identifier: MIT

'use client'

// The coordination layer above the per-field `field` component and the
// page-level `validation` error-summary. `Form` is a REAL, progressively
// enhanced `<form>` built on Base UI's Form: it keeps native `action` /
// `method` / `onSubmit` semantics (works without JS), consolidates
// server-side errors keyed by field name, routes each one to the matching
// field, and moves focus to the first error on a failed submit.
//
// Commons `Field` is a visual wrapper that takes an explicit `error` prop
// (it does NOT read a form context), so the bridge here is deliberately
// small: `Form` publishes the `errors` map through a React context, and a
// field pulls its own message with `useFormFieldError(name)` and hands it to
// `<Field error={...}>`. That keeps `field` and `form` decoupled — a single
// field needs no `Form` at all.

import { Form as BaseForm } from '@base-ui/react/form'
import * as React from 'react'

import { cn } from '@/lib/cn'

/**
 * Server-side (or otherwise external) validation errors, keyed by the
 * `name` attribute of the control they belong to. A value may be a single
 * message or several messages for one field. This is the exact shape Base
 * UI's Form consumes, so any Base UI `Field` controls used inside are routed
 * automatically; Commons `Field`s read the same map via `useFormFieldError`.
 */
export type FormErrors = Record<string, string | string[]>

interface FormErrorsContextValue {
  errors: FormErrors
}

const FormErrorsContext = React.createContext<FormErrorsContextValue | null>(null)
FormErrorsContext.displayName = 'CommonsFormErrorsContext'

/**
 * The full server-error map for the surrounding `Form` (or `{}` outside
 * one). Use it to compose a page-level error summary — e.g. feed the entries
 * into the Commons `validation` component or your own list of in-page links
 * to each errored field (WCAG 3.3.1 error identification).
 */
export function useFormErrors(): FormErrors {
  return React.useContext(FormErrorsContext)?.errors ?? EMPTY_ERRORS
}

const EMPTY_ERRORS: FormErrors = {}

/**
 * The server error for one field name, ready to hand to `<Field error>`.
 * Returns `undefined` when the field is currently valid (so `<Field>` shows
 * no error chrome). When a field has several messages, the first is
 * returned; read `useFormErrors()` if you need to render them all.
 *
 * ```tsx
 * function EmailField() {
 *   return (
 *     <Field label="Email" error={useFormFieldError('email')}>
 *       <Input type="email" name="email" />
 *     </Field>
 *   )
 * }
 * ```
 */
export function useFormFieldError(name: string): React.ReactNode {
  const errors = useFormErrors()
  const value = errors[name]
  if (value == null) {
    return undefined
  }
  return Array.isArray(value) ? value[0] : value
}

type BaseFormProps = React.ComponentProps<typeof BaseForm>

export interface FormProps
  extends Omit<BaseFormProps, 'render' | 'className' | 'errors'> {
  /**
   * Server-side validation errors keyed by control `name`. Each is routed to
   * the matching Commons `Field` (via `useFormFieldError`) and to any Base UI
   * `Field` controls, and — on the render that introduces a new set of
   * errored fields — focus moves to the first errored control in document
   * order (unless `focusOnError` is `false`).
   */
  errors?: FormErrors
  /**
   * Move focus to the first errored control when the set of errored fields
   * changes after submit. Turn this off when you render a page-level error
   * summary and prefer to move focus there yourself (a common government
   * pattern: focus the summary heading, list links to each field).
   * @default true
   */
  focusOnError?: boolean
  /** Extra classes for the `<form>` element. */
  className?: string
  children?: React.ReactNode
}

/** Merge a forwarded ref and an internal ref into one callback ref. */
function useMergedRef<T>(
  forwarded: React.Ref<T> | undefined,
  internal: React.MutableRefObject<T | null>
): React.RefCallback<T> {
  return React.useCallback(
    (node: T | null) => {
      internal.current = node
      if (typeof forwarded === 'function') {
        forwarded(node)
      } else if (forwarded) {
        ;(forwarded as React.MutableRefObject<T | null>).current = node
      }
    },
    [forwarded, internal]
  )
}

/**
 * A real, progressively enhanced `<form>` that coordinates multi-field
 * validation and surfaces server-side errors to the right controls. Built on
 * Base UI's Form.
 *
 * Accessibility:
 * - Native form semantics are preserved: standard `action` / `method` /
 *   `onSubmit` still work, so the form submits and the server can validate
 *   even without JavaScript. Server errors then come back through `errors`.
 * - Each server error is routed to its field, which renders it in a polite
 *   live region and sets `aria-invalid` on the control (Commons `Field` does
 *   this from `useFormFieldError`), so every error is both announced and
 *   programmatically associated (WCAG 3.3.1 error identification; pair the
 *   message text with a suggestion for 3.3.3).
 * - On a submit that returns errors, focus moves to the first errored control
 *   in document order so keyboard and screen-reader users are taken straight
 *   to the problem. For longer forms, render a page-level error summary
 *   (e.g. the Commons `validation` component fed from `useFormErrors()`),
 *   set `focusOnError={false}`, and move focus to the summary instead.
 *
 * Use `Form` to coordinate several fields and route server errors; a single
 * field needs no `Form` — the `field` component alone carries its own label,
 * hint, error live region, and `aria-invalid`.
 */
export const Form = React.forwardRef<HTMLFormElement, FormProps>(function Form(
  { className, errors, focusOnError = true, children, ...props },
  ref
) {
  const formRef = React.useRef<HTMLFormElement | null>(null)
  const mergedRef = useMergedRef(ref, formRef)

  const contextValue = React.useMemo<FormErrorsContextValue>(
    () => ({ errors: errors ?? EMPTY_ERRORS }),
    [errors]
  )

  // A stable signature of WHICH fields are errored, so the focus effect fires
  // when the error set changes (a submit round-trip) — not on every render
  // when a caller passes a fresh `errors` object identity.
  const errorSignature = errors ? Object.keys(errors).sort().join('|') : ''
  const firstRunRef = React.useRef(true)

  React.useEffect(() => {
    // Skip the initial mount: don't yank focus on a page that simply loaded
    // with server errors already present (that page should lead with an error
    // summary). Only move focus when the error set CHANGES after mount.
    if (firstRunRef.current) {
      firstRunRef.current = false
      return
    }
    if (!focusOnError || !errorSignature) {
      return
    }
    const form = formRef.current
    if (!form) {
      return
    }
    const errored = errors ?? EMPTY_ERRORS
    // Walk controls in document order and focus the first whose `name` is in
    // the error map, so focus lands on the visually-first problem regardless
    // of key order in `errors`.
    const controls = form.querySelectorAll<HTMLElement>('[name]')
    for (const control of controls) {
      const name = control.getAttribute('name')
      if (name && Object.prototype.hasOwnProperty.call(errored, name)) {
        control.focus()
        if (control instanceof HTMLInputElement) {
          control.select()
        }
        break
      }
    }
    // errorSignature is the intended dependency; `errors`/`focusOnError` are
    // read fresh inside and don't need to retrigger the effect on identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorSignature])

  return (
    <FormErrorsContext.Provider value={contextValue}>
      <BaseForm
        {...props}
        ref={mergedRef}
        errors={errors}
        data-slot="form"
        // A vertical stack with generous spacing BETWEEN questions so each
        // field (label + hint + error + control) reads as its own group.
        className={cn('flex flex-col gap-3', className)}
      >
        {children}
      </BaseForm>
    </FormErrorsContext.Provider>
  )
})
