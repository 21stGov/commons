// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { useFieldControl } from '@/components/ui/context'
import { cn } from '@/lib/cn'

export const selectVariants = cva(
  // Base: native <select> styled with theme tokens only.
  // - `appearance-none` removes the UA arrow; we draw our own inline-SVG
  //   chevron (currentColor, aria-hidden) so it survives forced-colors
  //   mode — background-image icons are removed there.
  // - The border stays on every state so forced-colors paints a boundary.
  // - `pe-12` reserves inline-end room for the chevron; logical properties
  //   only, so the layout mirrors automatically in RTL.
  [
    'w-full appearance-none rounded-sm border border-border',
    'bg-background text-foreground shadow-1 disabled:shadow-none',
    'pe-12 ps-2',
    'transition-colors motion-reduce:transition-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    'disabled:cursor-not-allowed disabled:border-disabled-border disabled:bg-disabled disabled:text-disabled-foreground',
    'aria-invalid:border-error-border aria-invalid:ring-1 aria-invalid:ring-inset aria-invalid:ring-error-border',
  ],
  {
    variants: {
      // Every size meets the 44px (2.75rem) Commons target-size default:
      // min-h-11 = 2.75rem, min-h-12 = 3rem, min-h-14 = 3.5rem.
      size: {
        sm: 'min-h-11 py-05 text-sm',
        md: 'min-h-12 py-1 text-sm',
        lg: 'min-h-14 py-105 text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

export interface SelectProps
  extends
    Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  /**
   * Rendered as a non-selectable first option (`disabled` + empty value)
   * shown until the user picks a real option.
   *
   * Trade-off (deliberate, matches the native platform): once a real
   * option is chosen the placeholder cannot be re-selected, and while it
   * is shown the select has no valid value — pair it with `required` so
   * form validation catches an untouched control. If users must be able
   * to return to "no choice", render a real "None" option instead.
   *
   * Translation-ready: pass a localized string.
   */
  placeholder?: string
  /**
   * The native `size` attribute (number of visible rows). The visual
   * size variant is `size`; this is the rarely-used HTML attribute.
   */
  htmlSize?: number
  /** Class applied to the positioning wrapper (e.g. width utilities). */
  wrapperClassName?: string
}

function Chevron(): React.JSX.Element {
  return (
    <span
      aria-hidden="true"
      // Overlaid in the same grid cell as the select, aligned to the
      // logical inline end (auto-flips in RTL). pointer-events-none so
      // clicks fall through to the native control. currentColor keeps it
      // visible in forced-colors mode.
      // `peer-disabled:` keeps it in step with the select's disabled text.
      data-slot="select-icon"
      className="pointer-events-none col-start-1 row-start-1 flex items-center justify-end pe-2 text-foreground peer-disabled:text-disabled-foreground"
    >
      <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="size-2 shrink-0">
        <path
          d="m4 6 4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

/**
 * Native `<select>` with a theme-token skin and a forced-colors-safe
 * chevron. Keyboard, screen-reader, and mobile behavior are the
 * platform's own — nothing is re-implemented. (An APG combobox with a
 * custom popup is a separate Phase 2 component.)
 *
 * Inside a `<Field>` the control wires itself to the field's label,
 * hint, and error via `useFieldControl()`; standalone it works unwrapped
 * (give it an accessible name via `<label htmlFor>` or `aria-label`).
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    className,
    wrapperClassName,
    size,
    htmlSize,
    placeholder,
    children,
    id,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    required,
    disabled,
    multiple,
    value,
    defaultValue,
    ...props
  },
  ref
) {
  const field = useFieldControl()

  // Explicit props win over Field-provided wiring.
  const mergedId = id ?? field.id
  const mergedDescribedBy = ariaDescribedBy ?? field['aria-describedby']
  const mergedInvalid = ariaInvalid ?? field['aria-invalid']
  const mergedRequired = required ?? field.required
  const mergedDisabled = disabled ?? field.disabled

  // React selects options via value/defaultValue, never a `selected`
  // attribute. When a placeholder is used and the consumer supplied no
  // value, default to the placeholder's empty value.
  const valueProps =
    value !== undefined
      ? { value }
      : {
          defaultValue: defaultValue ?? (placeholder !== undefined && !multiple ? '' : undefined),
        }

  return (
    <span data-slot="select-wrapper" className={cn('grid grid-cols-1', wrapperClassName)}>
      <select
        {...props}
        {...valueProps}
        ref={ref}
        id={mergedId}
        data-slot="select"
        size={htmlSize}
        multiple={multiple}
        aria-describedby={mergedDescribedBy}
        aria-invalid={mergedInvalid}
        required={mergedRequired}
        disabled={mergedDisabled}
        className={cn(selectVariants({ size }), 'peer col-start-1 row-start-1', className)}
      >
        {placeholder !== undefined && !multiple ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {children}
      </select>
      {/* A multiple/listbox select has no popup to hint at. */}
      {multiple ? null : <Chevron />}
    </span>
  )
})
