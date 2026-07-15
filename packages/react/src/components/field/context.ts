// SPDX-License-Identifier: MIT

'use client'

// Field contract-as-code. The visual <Field> wrapper (label, hint, error)
// lives in `field.tsx` (separate deliverable); this file is the wiring
// contract every form control consumes via `useFieldControl()`.

import * as React from "react";

/**
 * Values a Field wrapper provides to its control.
 * IDs are only present for parts the Field actually renders.
 */
export interface FieldContextValue {
  /** The id the control must use (the Field's label points at it). */
  id: string;
  /**
   * Id of the Field's rendered `<label>` element. Group controls whose
   * root is not labelable (e.g. a RadioGroup's `<fieldset>`) reference it
   * via `aria-labelledby` instead of relying on `htmlFor`.
   */
  labelId?: string;
  /** Present only when the Field renders a hint. */
  hintId?: string;
  /** Present only when the Field renders an error message. */
  errorId?: string;
  /** True when the Field is in an error state. */
  invalid?: boolean;
  /** True when the Field marks the control as required. */
  required?: boolean;
  /** True when the Field disables the control. */
  disabled?: boolean;
}

export const FieldContext = React.createContext<FieldContextValue | null>(
  null,
);
FieldContext.displayName = "FieldContext";

export interface FieldProviderProps {
  /** Override the generated control id (defaults to `React.useId()`). */
  id?: string;
  /** Set when the Field renders a visible label; derives `labelId` = `${id}-label`. */
  hasLabel?: boolean;
  /** Set when the Field renders a hint; derives `hintId` = `${id}-hint`. */
  hasHint?: boolean;
  /** Set when the Field renders an error; derives `errorId` = `${id}-error`. */
  hasError?: boolean;
  /** Error state; defaults to `hasError`. */
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * Provides the Field wiring contract to descendant controls.
 * Rendered by the visual <Field> component; safe to use directly in tests
 * or in custom field layouts.
 */
export function FieldProvider({
  id: idProp,
  hasLabel = false,
  hasHint = false,
  hasError = false,
  invalid,
  required,
  disabled,
  children,
}: FieldProviderProps): React.JSX.Element {
  const generatedId = React.useId();
  const id = idProp ?? generatedId;

  const value = React.useMemo<FieldContextValue>(
    () => ({
      id,
      labelId: hasLabel ? `${id}-label` : undefined,
      hintId: hasHint ? `${id}-hint` : undefined,
      errorId: hasError ? `${id}-error` : undefined,
      invalid: invalid ?? hasError,
      required,
      disabled,
    }),
    [id, hasLabel, hasHint, hasError, invalid, required, disabled],
  );

  return React.createElement(FieldContext.Provider, { value }, children);
}

/**
 * Props a form control spreads onto its native element.
 * Only keys that apply are present, so spreading never emits empty or
 * misleading attributes.
 */
export interface FieldControlProps {
  id?: string;
  /** Hint id first, then error id — only the ones actually rendered. */
  "aria-describedby"?: string;
  /** Present (true) only when the Field is in an error state. */
  "aria-invalid"?: true;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Returns the props a control must spread onto its native element to be
 * wired to the surrounding Field (id, aria-describedby, aria-invalid,
 * required, disabled). Standalone-safe: outside a FieldProvider it
 * returns `{}` so controls work unwrapped.
 */
/**
 * Id of the surrounding Field's `<label>` element, or `undefined` outside
 * a Field (or when the Field renders no label). For controls whose root
 * element is not labelable (fieldsets, groups): reference this via
 * `aria-labelledby`. Kept out of `useFieldControl()` so spreading control
 * props never leaks a non-DOM attribute.
 */
export function useFieldLabelId(): string | undefined {
  const context = React.useContext(FieldContext);
  return context?.labelId;
}

export function useFieldControl(): FieldControlProps {
  const context = React.useContext(FieldContext);

  return React.useMemo<FieldControlProps>(() => {
    if (!context) {
      return {};
    }

    const props: FieldControlProps = { id: context.id };

    const describedBy = [context.hintId, context.errorId]
      .filter(Boolean)
      .join(" ");
    if (describedBy) {
      props["aria-describedby"] = describedBy;
    }
    if (context.invalid) {
      props["aria-invalid"] = true;
    }
    if (context.required) {
      props.required = true;
    }
    if (context.disabled) {
      props.disabled = true;
    }

    return props;
  }, [context]);
}
