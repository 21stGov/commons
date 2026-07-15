// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

'use client'

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { useFieldControl, useFieldLabelId } from "@/components/ui/context";
import { cn } from "@/lib/cn";

// Minimal ambient typing so the dev-only guard compiles without
// @types/node. Bundlers statically replace `process.env.NODE_ENV`.
declare const process:
  | { env: { NODE_ENV?: string | undefined } }
  | undefined;

/**
 * Wiring a `<Radio>` receives from its surrounding `<RadioGroup>`:
 * the shared native `name` (so the browser provides single-selection and
 * arrow-key navigation) and the group's `required` state.
 */
export interface RadioGroupContextValue {
  name: string;
  required?: boolean;
}

export const RadioGroupContext =
  React.createContext<RadioGroupContextValue | null>(null);
RadioGroupContext.displayName = "RadioGroupContext";

export const radioGroupVariants = cva(
  // Native fieldset reset. Radios paint their own boundaries in forced
  // colors; the group itself is not interactive, so no border is needed.
  // gap-05 is the ONLY separation between option rows: each Radio row is a
  // fixed 44px (min-h-11) box that vertically centers its own content, so a
  // constant gap yields even rhythm whether or not a row carries a
  // single-line description (see radio.tsx "Row rhythm").
  ["m-0 flex min-w-0 flex-col gap-05 border-0 p-0 text-sm text-foreground"],
);

export interface RadioGroupProps
  extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "name">,
    VariantProps<typeof radioGroupVariants> {
  /**
   * Group label, rendered as a `<legend>`. Optional so the group can sit
   * inside a Field/FieldGroup that provides the label instead; standalone
   * groups without `label` must pass `aria-label` or `aria-labelledby`.
   */
  label?: React.ReactNode;
  /**
   * Shared `name` for every `<Radio>` inside. Defaults to a generated
   * unique id, so separate groups never collide.
   */
  name?: string;
  /** Marks every radio in the group as required (native validation). */
  required?: boolean;
}

/**
 * Groups native radio inputs under a `fieldset[role="radiogroup"]`.
 * Selection and arrow-key navigation are the browser's native radio
 * behavior — no ARIA re-implementation. Inside a `<Field>` it inherits
 * id, hint/error wiring, `aria-invalid`, `required`, and `disabled`.
 */
export const RadioGroup = React.forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  function RadioGroup(
    {
      className,
      label,
      name: nameProp,
      required: requiredProp,
      id: idProp,
      children,
      ...props
    },
    ref,
  ) {
    const field = useFieldControl();
    const fieldLabelId = useFieldLabelId();
    const generatedId = React.useId();
    const generatedName = React.useId();
    const groupId = idProp ?? field.id ?? generatedId;
    const name = nameProp ?? generatedName;
    const legendId = label != null ? `${groupId}-legend` : undefined;

    const warnedRef = React.useRef(false);

    // Dev-only guard: a radiogroup must have an accessible name
    // (WCAG 4.1.2) — a legend via `label`, or aria-label(ledby).
    React.useEffect(() => {
      if (
        (typeof process !== "undefined" &&
          process.env.NODE_ENV === "production") ||
        warnedRef.current
      ) {
        return;
      }
      const hasName =
        label != null ||
        props["aria-label"] != null ||
        props["aria-labelledby"] != null ||
        fieldLabelId != null;
      if (!hasName) {
        warnedRef.current = true;
        console.warn(
          "[commons] <RadioGroup> has no accessible name. Pass `label` " +
            "(renders a <legend>), wrap it in a <Field label=...>, or " +
            "pass `aria-label`/`aria-labelledby`.",
        );
      }
    }, [label, props, fieldLabelId]);

    const describedBy =
      [field["aria-describedby"], props["aria-describedby"]]
        .filter(Boolean)
        .join(" ") || undefined;

    const disabled = props.disabled ?? field.disabled;
    const required = requiredProp ?? field.required;
    const invalid = props["aria-invalid"] ?? field["aria-invalid"];

    const contextValue = React.useMemo<RadioGroupContextValue>(
      () => ({ name, required }),
      [name, required],
    );

    return (
      <fieldset
        {...props}
        ref={ref}
        id={groupId}
        // `radiogroup` is an allowed role for <fieldset> (ARIA in HTML).
        // Disabling the fieldset natively disables every radio inside.
        role="radiogroup"
        data-slot="radio-group"
        disabled={disabled}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        // Name resolution: own <legend> first, then an explicit
        // aria-labelledby, then the surrounding Field's label element —
        // a fieldset is not labelable, so `htmlFor` cannot name it.
        aria-labelledby={
          label != null
            ? legendId
            : (props["aria-labelledby"] ?? fieldLabelId)
        }
        className={cn(radioGroupVariants(), className)}
      >
        {label != null ? (
          <legend
            id={legendId}
            data-slot="radio-group-label"
            className="mb-05 p-0 font-medium"
          >
            {label}
          </legend>
        ) : null}
        <RadioGroupContext.Provider value={contextValue}>
          {children}
        </RadioGroupContext.Provider>
      </fieldset>
    );
  },
);
