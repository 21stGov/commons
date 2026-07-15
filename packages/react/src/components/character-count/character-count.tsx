// SPDX-License-Identifier: MIT

'use client'

import * as React from 'react'

import { cn } from '@/lib/cn'

/**
 * Fill a message template with the current counts. Supported tokens:
 * `{remaining}`, `{over}`, `{count}`, and `{max}`.
 */
function formatMessage(
  template: string,
  values: { remaining: number; over: number; count: number; max: number }
): string {
  return template
    .replace(/\{remaining\}/g, String(values.remaining))
    .replace(/\{over\}/g, String(values.over))
    .replace(/\{count\}/g, String(values.count))
    .replace(/\{max\}/g, String(values.max))
}

/** Props a CharacterCount injects onto its wrapped control. */
interface WrappedControlProps {
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
  value?: string | number | readonly string[]
  defaultValue?: string | number | readonly string[]
  'aria-describedby'?: string
  'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling'
  maxLength?: number
}

export interface CharacterCountProps {
  /**
   * The soft character limit. By default this is *not* enforced on the
   * native control (see `enforce`): USWDS keeps the limit soft so users are
   * never cut off mid-word — the count guides while server-side validation
   * decides. `maxLength` is only used to compute the remaining/over counts.
   */
  maxLength: number
  /**
   * Exactly one Input or Textarea to wrap. CharacterCount clones it to
   * observe changes, link the count message via `aria-describedby`, and set
   * `aria-invalid` when over the limit. The child keeps its own `onChange`,
   * `value`/`defaultValue`, and any explicit `aria-*` props.
   */
  children: React.ReactElement<WrappedControlProps>
  /**
   * Controlled current text. Provide this when the parent owns the control's
   * value; the count derives from it. Omit for the uncontrolled case, where
   * the count tracks the control's own `onChange`.
   */
  value?: string
  /** Initial text for the uncontrolled case (seeds the first count). */
  defaultValue?: string
  /** Notified with the new text on every change (uncontrolled convenience). */
  onValueChange?: (value: string) => void
  /**
   * Message shown (and announced) while at or under the limit.
   * Tokens: `{remaining}`, `{count}`, `{max}`.
   * @default "{remaining} characters left"
   */
  messageTemplate?: string
  /**
   * Message shown (and announced) once over the limit.
   * Tokens: `{over}`, `{count}`, `{max}`.
   * @default "{over} characters over limit"
   */
  overMessageTemplate?: string
  /**
   * Debounce, in milliseconds, before the count is re-announced to screen
   * readers. The visible text updates on every keystroke; the polite live
   * region only updates after the user pauses, so assistive tech is not
   * flooded with an announcement per character.
   * @default 1000
   */
  announceDelay?: number
  /**
   * Enforce `maxLength` as the native `maxlength` attribute (a hard limit
   * that blocks further typing). Off by default so the limit stays soft.
   */
  enforce?: boolean
  /** Id for the count message element (defaults to a generated id). */
  id?: string
  /** Class name for the wrapper element. */
  className?: string
}

/**
 * Wraps an Input or Textarea with a live remaining-character count.
 *
 * Accessibility:
 * - The visible count updates on every keystroke but is *not* itself a live
 *   region, so it never announces per character.
 * - A separate visually-hidden `aria-live="polite"` region re-announces the
 *   count only after the user pauses (`announceDelay`), matching how screen
 *   reader users expect count feedback without being flooded.
 * - The wrapped control references the visible count via `aria-describedby`,
 *   so focusing the control reads the current count once.
 * - Over the limit the message switches to the error token *and* the control
 *   gets `aria-invalid` (a non-color indicator: the control's error ring),
 *   so the error state is never signalled by color alone (WCAG 1.4.1).
 */
export function CharacterCount({
  maxLength,
  children,
  value,
  defaultValue,
  onValueChange,
  messageTemplate = '{remaining} characters left',
  overMessageTemplate = '{over} characters over limit',
  announceDelay = 1000,
  enforce = false,
  id: idProp,
  className,
}: CharacterCountProps): React.JSX.Element {
  const child = React.Children.only(children)

  const controlled = value !== undefined
  const [internalValue, setInternalValue] = React.useState<string>(() =>
    String(defaultValue ?? child.props.value ?? child.props.defaultValue ?? '')
  )
  const currentValue = controlled ? value : internalValue

  const generatedId = React.useId()
  const messageId = idProp ?? `${generatedId}-count`

  const count = currentValue.length
  const remaining = maxLength - count
  const over = count - maxLength
  const isOver = count > maxLength

  const message = isOver
    ? formatMessage(overMessageTemplate, { remaining, over, count, max: maxLength })
    : formatMessage(messageTemplate, { remaining, over, count, max: maxLength })

  // Debounced announcement: the effect re-runs on every keystroke and its
  // cleanup cancels the pending timeout, so the live region text only
  // settles once the user stops typing for `announceDelay` ms.
  const [announced, setAnnounced] = React.useState(message)
  React.useEffect(() => {
    const timer = setTimeout(() => setAnnounced(message), announceDelay)
    return () => clearTimeout(timer)
  }, [message, announceDelay])

  const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (
    event
  ) => {
    if (!controlled) {
      setInternalValue(event.target.value)
    }
    child.props.onChange?.(event)
    onValueChange?.(event.target.value)
  }

  const childDescribedBy = child.props['aria-describedby']
  const describedBy = [childDescribedBy, messageId].filter(Boolean).join(' ')

  const clonedChild = React.cloneElement(child, {
    onChange: handleChange,
    'aria-describedby': describedBy,
    // Force invalid when over the limit; otherwise leave the child's own
    // value (explicit prop, or the Field context it resolves internally)
    // untouched by passing undefined.
    'aria-invalid': isOver ? true : child.props['aria-invalid'],
    ...(enforce ? { maxLength } : null),
  })

  return (
    <div data-slot="character-count" className={cn('flex flex-col gap-1', className)}>
      {clonedChild}
      <span
        id={messageId}
        data-slot="character-count-message"
        data-invalid={isOver || undefined}
        className={cn(
          'text-sm leading-snug',
          isOver ? 'font-semibold text-error-foreground' : 'text-muted-foreground'
        )}
      >
        {message}
      </span>
      {/* Debounced polite announcement, kept out of the visual flow. Always
          present in the DOM so the first change is reliably announced. */}
      <span data-slot="character-count-status" aria-live="polite" className="sr-only">
        {announced}
      </span>
    </div>
  )
}
