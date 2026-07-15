// SPDX-License-Identifier: MIT

'use client'

import * as React from 'react'

import { Input, type InputProps } from '@/components/ui/input'
import { cn } from '@/lib/cn'

/**
 * A mask template. `#` marks a user-entered digit; every other character is a
 * fixed separator inserted for the user (e.g. `"(###) ###-####"`).
 */
export type MaskTemplate = string

/** Built-in fixed-format masks. */
export type MaskPreset = 'phone' | 'ssn' | 'zip' | 'zipPlus4' | 'date'

interface PresetConfig {
  mask: MaskTemplate
  inputMode: NonNullable<InputProps['inputMode']>
  /** Example value shown as a placeholder guide (not a label). */
  placeholder: string
  autoComplete?: string
}

/**
 * Preset masks for common US fixed-format values. The mask is a formatting
 * guide only — real validation must happen server-side.
 */
export const MASK_PRESETS: Record<MaskPreset, PresetConfig> = {
  phone: {
    mask: '(###) ###-####',
    inputMode: 'tel',
    placeholder: '(555) 555-0100',
    autoComplete: 'tel-national',
  },
  ssn: {
    mask: '###-##-####',
    inputMode: 'numeric',
    placeholder: '555-55-5555',
  },
  zip: {
    mask: '#####',
    inputMode: 'numeric',
    placeholder: '55555',
    autoComplete: 'postal-code',
  },
  zipPlus4: {
    mask: '#####-####',
    inputMode: 'numeric',
    placeholder: '55555-5555',
    autoComplete: 'postal-code',
  },
  date: {
    mask: '##/##/####',
    inputMode: 'numeric',
    placeholder: 'MM/DD/YYYY',
  },
}

/** Resolve a preset name or raw template into a mask string + defaults. */
function resolveMask(mask: MaskPreset | MaskTemplate): PresetConfig {
  if (mask in MASK_PRESETS) {
    return MASK_PRESETS[mask as MaskPreset]
  }
  return { mask, inputMode: 'numeric', placeholder: mask }
}

/** Count of digit slots (`#`) in a mask. */
function digitSlots(mask: MaskTemplate): number {
  let count = 0
  for (const char of mask) {
    if (char === '#') count += 1
  }
  return count
}

/**
 * Apply a mask to a raw string. Extracts digits, caps them at the mask's
 * capacity, then walks the template emitting each digit and inserting a
 * separator only when a further digit follows.
 *
 * Emitting no trailing separators is what keeps editing forgiving: deleting
 * the last digit also drops the separators that led to it, so Backspace never
 * gets trapped on a separator and re-adds a character the user just removed.
 */
export function applyMask(raw: string, mask: MaskTemplate): string {
  const digits = raw.replace(/\D/g, '').slice(0, digitSlots(mask))
  if (digits.length === 0) return ''

  let out = ''
  let digitIndex = 0
  for (const char of mask) {
    if (digitIndex >= digits.length) break
    if (char === '#') {
      out += digits[digitIndex]
      digitIndex += 1
    } else {
      out += char
    }
  }
  return out
}

/**
 * Build an HTML `pattern` that matches a fully-completed value for the mask
 * (every `#` → a digit, separators escaped literally). It only constrains a
 * non-empty value on form submit; an empty optional field still passes.
 */
export function maskToPattern(mask: MaskTemplate): string {
  let pattern = ''
  for (const char of mask) {
    pattern += char === '#' ? '\\d' : char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
  return pattern
}

export interface InputMaskProps
  extends Omit<InputProps, 'value' | 'defaultValue' | 'onChange' | 'pattern' | 'maxLength'> {
  /**
   * A preset (`"phone"`, `"ssn"`, `"zip"`, `"zipPlus4"`, `"date"`) or a raw
   * template where `#` is a digit slot and other characters are separators
   * (e.g. `"###-###"`).
   */
  mask: MaskPreset | MaskTemplate
  /** Controlled value. Whatever you pass is re-masked before display. */
  value?: string
  /** Initial value for uncontrolled usage. */
  defaultValue?: string
  /**
   * Called after each edit. The event's `target.value` is the masked value;
   * the second argument passes it directly for convenience.
   */
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void
  /**
   * Insert separators as the user types. Forgiving either way — paste and
   * correction always work; turning this off still enforces `maxLength`,
   * `inputMode`, and `pattern`.
   * @default true
   */
  formatOnType?: boolean
  /**
   * Obscure the value as it is typed (for sensitive identifiers such as an
   * SSN). The control renders as a password field — every character shows as
   * a bullet, including the format separators — and a keyboard-operable
   * reveal toggle (eye icon) lets the user switch to plain text to check
   * their entry. Masking, paste, correction, and clearing all keep working on
   * the real value; only the on-screen rendering changes. Defaults
   * `autoComplete` to `"off"` so the value is not stored or suggested.
   * @default false
   */
  secure?: boolean
  /**
   * Accessible name for the reveal toggle while the value is hidden.
   * Translatable. @default "Show"
   */
  showLabel?: string
  /**
   * Accessible name for the reveal toggle while the value is shown.
   * Translatable. @default "Hide"
   */
  hideLabel?: string
}

/** Eye — shown on the reveal toggle while the value is hidden. */
function EyeIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-2 shrink-0"
    >
      <path d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6Z" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  )
}

/** Eye with a slash — shown on the reveal toggle while the value is shown. */
function EyeOffIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-2 shrink-0"
    >
      <path d="M2.5 10s3-6 7.5-6c1.6 0 3 .5 4.2 1.2M17.5 10s-3 6-7.5 6c-1.6 0-3-.5-4.2-1.2" />
      <path d="M8.2 8.2a2.5 2.5 0 0 0 3.6 3.6" />
      <path d="m3 3 14 14" />
    </svg>
  )
}

/**
 * An Input that guides entry of a fixed-format value (phone, SSN, ZIP, date).
 * It sets `inputMode`, `pattern`, and `maxLength` for the mask and — by
 * default — inserts separators as the user types, without ever blocking a
 * valid keystroke, hijacking paste, or trapping the caret. The mask is a
 * client-side convenience; authoritative validation belongs on the server.
 *
 * Pass `secure` for sensitive identifiers (e.g. an SSN): the value renders as
 * bullets while still applying the mask, with a keyboard-operable reveal
 * toggle so users can check what they typed.
 *
 * Accessibility: the mask is never a substitute for a label. Describe the
 * expected format in the field's hint (linked via `aria-describedby`) — inside
 * a `<Field>` that wiring is automatic. The default placeholder is an example
 * value, a secondary cue only. The field can always be cleared and corrected.
 */
export const InputMask = React.forwardRef<HTMLInputElement, InputMaskProps>(function InputMask(
  {
    mask,
    value,
    defaultValue,
    onChange,
    formatOnType = true,
    secure = false,
    showLabel = 'Show',
    hideLabel = 'Hide',
    placeholder,
    inputMode,
    autoComplete,
    type,
    className,
    ...props
  },
  ref
) {
  const config = React.useMemo(() => resolveMask(mask), [mask])
  const maskString = config.mask
  const [revealed, setRevealed] = React.useState(false)

  const format = React.useCallback(
    (raw: string): string => (formatOnType ? applyMask(raw, maskString) : raw),
    [formatOnType, maskString]
  )

  const isControlled = value !== undefined
  const [internal, setInternal] = React.useState<string>(() =>
    format(defaultValue ?? '')
  )
  const display = isControlled ? format(value) : internal

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = format(event.target.value)
      // Reflect the masked value on the DOM node so uncontrolled consumers and
      // event listeners read the same string the field displays.
      event.target.value = formatted
      if (!isControlled) {
        setInternal(formatted)
      }
      onChange?.(formatted, event)
    },
    [format, isControlled, onChange]
  )

  // Props common to both the plain and the secure rendering. `ref` is passed
  // explicitly per branch (never spread) so React binds it as the ref.
  const inputProps = {
    ...props,
    value: display,
    onChange: handleChange,
    inputMode: inputMode ?? config.inputMode,
    pattern: maskToPattern(maskString),
    maxLength: maskString.length,
    placeholder: placeholder ?? config.placeholder,
  }

  if (secure) {
    return (
      <div data-slot="input-mask-secure" className="relative w-full">
        <Input
          {...inputProps}
          ref={ref}
          // type=password obscures every character (separators included);
          // the masked value underneath is unchanged, so paste, correction,
          // and clearing keep working. Toggling reveals it as plain text.
          type={revealed ? 'text' : 'password'}
          autoComplete={autoComplete ?? 'off'}
          // Reserve inline-end room so the value never runs under the toggle.
          className={cn('pe-12', className)}
        />
        <button
          type="button"
          data-slot="input-mask-reveal"
          onClick={() => setRevealed((shown) => !shown)}
          aria-pressed={revealed}
          aria-label={revealed ? hideLabel : showLabel}
          // 44px target, centered on the control's inline end (logical, so it
          // flips in RTL). Keyboard-operable as a native button.
          className={cn(
            'absolute end-0 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center',
            'text-muted-foreground',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          )}
        >
          {revealed ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    )
  }

  return (
    <Input
      {...inputProps}
      ref={ref}
      type={type}
      autoComplete={autoComplete ?? config.autoComplete}
      className={cn(className)}
    />
  )
})
