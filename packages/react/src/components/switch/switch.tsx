// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { Switch as BaseSwitch } from '@base-ui/react/switch'
import { cva } from 'class-variance-authority'
import * as React from 'react'

import { useFieldControl } from '@/components/ui/context'
import { AmbientDirection } from '@/lib/ambient-direction'
import { cn } from '@/lib/cn'

// Minimal ambient typing so the dev-only guard compiles without
// @types/node. Bundlers statically replace `process.env.NODE_ENV`.
declare const process: { env: { NODE_ENV?: string | undefined } } | undefined

export const switchVariants = cva(['text-sm text-foreground'])

// The row is the pointer target: min-h-11 (2.75rem = 44px) with the control
// and label top-aligned so a wrapped label still reads correctly. Symmetric
// block padding vertically centers a single-line row inside the 44px minimum.
// 1.375em = one leading-snug line of the row's own text size.
const rowClasses = [
  'flex min-h-11 items-start gap-105',
  'py-[calc((2.75rem-1.375em)/2)]',
  'has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:text-disabled-foreground',
].join(' ')

// First-line box: exactly one line of the adjacent label text, with the
// track centered inside, so the switch aligns with the first line whether the
// text is one line, wrapped, or has a description.
const controlBoxClasses = 'flex h-[1.375em] shrink-0 items-center'

// The track. `group` lets the thumb track the checked state. Meaning is never
// color-only: the thumb POSITION (moved to the inline-end) is the primary
// on/off indicator, alongside role=switch + aria-checked. A visible border is
// kept in every state so forced-colors mode paints a boundary; because the
// checked fill is a system color there, position is what survives.
const trackClasses = [
  'group relative inline-flex w-5 shrink-0 cursor-pointer items-center rounded-full p-2px',
  'border border-border-strong bg-muted',
  'transition-colors motion-reduce:transition-none',
  'data-[checked]:border-primary data-[checked]:bg-primary',
  'aria-invalid:border-error-border',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  'data-[disabled]:cursor-not-allowed data-[disabled]:border-disabled-border data-[disabled]:bg-disabled',
].join(' ')

// The thumb. Position is the state indicator; it slides to the inline-end when
// checked. Physical translate has no logical form, so the RTL variant mirrors
// it. A transparent border becomes a visible outline in forced-colors mode so
// the thumb stays distinct from the track. Motion is gated behind motion-safe.
//
// Thumb color must CONTRAST the track in every theme AND state — a fixed
// surface color fails because the OFF/disabled track is itself a surface color
// (near-white in light/high-contrast, dark in dark mode) and a fixed white or
// dark thumb vanishes into it. So the thumb uses tokens that flip per theme:
//   OFF      → bg-foreground        (text color: dark on light themes, light on
//                                    dark) — stands out on the muted OFF track.
//   ON       → bg-primary-foreground (on-primary, i.e. white) — stands out on
//                                    the primary/blue ON track in every theme.
//   disabled → bg-disabled-foreground — muted but still ≠ the disabled track.
// The disabled rule is listed last so it wins over ON when a switch is both
// checked and disabled, mirroring how the track resolves data-disabled.
const thumbClasses = [
  'pointer-events-none block size-205 rounded-full bg-foreground shadow-1',
  'border border-transparent',
  'group-data-[checked]:bg-primary-foreground',
  'group-data-[disabled]:bg-disabled-foreground',
  // Travel = track width (40px) − thumb (20px) − the 3px start inset on each
  // side (1px border + 2px padding), i.e. 14px, so the ON thumb sits the same
  // 3px from the inline-end as the OFF thumb sits from the inline-start
  // (translate-x-2 = 16px left only 1px and read as "too far over").
  'translate-x-0 transition-transform motion-reduce:transition-none',
  'group-data-[checked]:translate-x-[0.875rem] rtl:group-data-[checked]:-translate-x-[0.875rem]',
].join(' ')

type BaseRootProps = React.ComponentProps<typeof BaseSwitch.Root>

export interface SwitchProps
  extends Omit<BaseRootProps, 'render' | 'className' | 'aria-labelledby'> {
  /**
   * Visible label. Required: the label is the accessible name AND part of the
   * pointer target (the 44px row). Translation-ready — pass a localized node.
   */
  label: React.ReactNode
  /**
   * Optional supporting text, linked via `aria-describedby` (kept out of the
   * accessible name). It stays inside the clickable row.
   */
  description?: React.ReactNode
  /** Extra classes for the outer row wrapper. */
  className?: string
}

/**
 * An immediate on/off setting built on Base UI's Switch. The root exposes
 * `role="switch"` with `aria-checked`, is keyboard-operable (Space toggles),
 * and is WHCM-safe because the thumb POSITION — not color alone — signals
 * state. Inside a `<Field>` it inherits id, hint/error wiring, `aria-invalid`,
 * `required`, and `disabled` from the Field contract.
 *
 * Use a Switch for a setting that takes effect immediately; use a Checkbox for
 * a selection or consent that is submitted with a form.
 */
export const Switch = React.forwardRef<HTMLElement, SwitchProps>(function Switch(
  { className, label, description, id: idProp, ...props },
  ref
) {
  const field = useFieldControl()
  const generatedId = React.useId()
  // Keep the control's OWN id (never the Field's): the Switch renders its own
  // htmlFor label, and adopting the Field id would associate the Field's
  // <label htmlFor> with the hidden input too — two labels per control
  // (axe: form-field-multiple-labels) and double announcements.
  const inputId = idProp ?? generatedId
  const labelId = `${inputId}-label`
  const descriptionId = description != null ? `${inputId}-description` : undefined

  const warnedRef = React.useRef(false)

  // Dev-only guard: a switch must have a visible label (WCAG 4.1.2 — the label
  // is also part of the pointer target, so there is no aria-label escape).
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
        '[commons] <Switch> requires a `label`. The label is the accessible ' +
          'name and part of the 44px pointer target.'
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
    <div data-slot="switch" className={cn(switchVariants(), rowClasses, className)}>
      <span data-slot="switch-control-box" className={controlBoxClasses}>
        {/* AmbientDirection makes the switch follow the DOM `dir` (global or a
            local `dir="rtl"`) so its thumb reads direction from Base UI's
            provider, matching the native components. */}
        <AmbientDirection>
          <BaseSwitch.Root
            {...props}
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={invalid}
            aria-labelledby={labelId}
            aria-describedby={describedBy}
            data-slot="switch-track"
            className={trackClasses}
          >
            <BaseSwitch.Thumb data-slot="switch-thumb" className={thumbClasses} />
          </BaseSwitch.Root>
        </AmbientDirection>
      </span>
      {/* gap-0: line-height alone spaces the label from its description so the
          pair reads as one unit. htmlFor toggles the switch when the text is
          clicked, making the label part of the target. */}
      <label
        htmlFor={inputId}
        data-slot="switch-label"
        className="flex min-w-0 flex-1 cursor-pointer flex-col gap-0"
      >
        <span
          id={labelId}
          data-slot="switch-label-text"
          className="block break-words leading-snug"
        >
          {label}
        </span>
        {description != null ? (
          <span
            id={descriptionId}
            data-slot="switch-description"
            className="block break-words leading-snug text-muted-foreground"
          >
            {description}
          </span>
        ) : null}
      </label>
    </div>
  )
})
