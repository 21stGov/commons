// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import * as React from "react";

import { useFieldControl } from "@/components/ui/context";
import { inputVariants } from "@/components/ui/input";
import { cn } from "@/lib/cn";

export type TextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * Multi-line text input. Renders a native `<textarea>` (3 rows by
 * default) that users can resize along the block axis
 * (`resize: block` — grows downward in horizontal writing modes,
 * direction-agnostic in vertical ones).
 *
 * Inside a `<Field>` it inherits `id`, `aria-describedby`,
 * `aria-invalid`, `required`, and `disabled` from the Field context via
 * `useFieldControl()`; explicit props always win. Standalone it renders
 * exactly what you pass.
 *
 * All native attributes pass through — set `autoComplete` (e.g.
 * `autoComplete="street-address"`) on any field that collects
 * information about the user (WCAG 1.3.5 Identify Input Purpose).
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      className,
      rows = 3,
      id: idProp,
      "aria-describedby": ariaDescribedByProp,
      "aria-invalid": ariaInvalidProp,
      required: requiredProp,
      disabled: disabledProp,
      ...props
    },
    ref,
  ) {
    const field = useFieldControl();

    // Field wiring: the surrounding Field provides defaults, explicit
    // props win.
    const id = idProp ?? field.id;
    const ariaDescribedBy = ariaDescribedByProp ?? field["aria-describedby"];
    const ariaInvalid = ariaInvalidProp ?? field["aria-invalid"];
    const required = requiredProp ?? field.required;
    const disabled = disabledProp ?? field.disabled;

    return (
      <textarea
        {...props}
        ref={ref}
        id={id}
        rows={rows}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        required={required}
        disabled={disabled}
        data-slot="textarea"
        className={cn(inputVariants(), "h-auto [resize:block]", className)}
      />
    );
  },
);
