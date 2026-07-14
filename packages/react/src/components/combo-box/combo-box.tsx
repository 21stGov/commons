// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { Combobox as BaseCombobox } from '@base-ui/react/combobox'
import { cva } from 'class-variance-authority'
import * as React from 'react'

import { useFieldControl } from '@/components/ui/context'
import { inputVariants } from '@/components/ui/input'
import { AmbientDirection } from '@/lib/ambient-direction'
import { cn } from '@/lib/cn'

/**
 * A single option in the list. `value` is the stable form value; `label`
 * is what the user sees, reads back, and filters against. Mark rare
 * unavailable choices `disabled` (kept visible so the list stays
 * predictable — WCAG 3.2.4 consistent identification).
 */
export interface ComboBoxItem {
  value: string
  label: string
  disabled?: boolean
}

/**
 * The filtered popup surface. A `min-block-size:0` + `overflow-y-auto`
 * pair so a long option list scrolls inside a capped box instead of
 * pushing off-screen; capped to the anchor-relative available height so
 * it stays usable at 400% zoom / reflow. A real border on every state
 * keeps a visible boundary in forced-colors mode.
 */
export const comboBoxPopupVariants = cva([
  'w-[var(--anchor-width)] min-w-[12rem] rounded-sm border border-border',
  'bg-background p-1 text-foreground shadow-3',
  '[max-block-size:min(20rem,var(--available-height))] overflow-y-auto overscroll-contain',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  // Motion: fade + slight scale via Base UI transition states, disabled
  // for reduced-motion users. Easing token from the Tailwind bridge.
  'motion-safe:transition-[opacity,scale] motion-safe:duration-150 motion-safe:ease-standard',
  'motion-safe:data-starting-style:opacity-0 motion-safe:data-starting-style:scale-95',
  'motion-safe:data-ending-style:opacity-0 motion-safe:data-ending-style:scale-95',
])

/**
 * One option row. Highlight (keyboard/pointer) is never color alone
 * (WCAG 1.4.1): `data-highlighted` adds a muted fill *and* bumps the
 * weight to `font-medium`. Selection is signalled by the check indicator
 * plus `aria-selected`, so it stays distinguishable from the highlight.
 */
export const comboBoxItemVariants = cva([
  'flex min-h-11 cursor-default select-none items-center gap-2 rounded-sm px-2 text-sm text-foreground',
  'outline-none',
  'data-highlighted:bg-muted data-highlighted:font-medium',
  'data-disabled:pointer-events-none data-disabled:text-disabled-foreground',
])

function ChevronIcon(): React.JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="size-2 shrink-0">
      <path
        d="m4 6 4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ClearIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="size-2 shrink-0"
    >
      <path d="m4 4 8 8M12 4l-8 8" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon(): React.JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="size-2 shrink-0">
      <path
        d="m3.5 8.5 3 3 6-7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// A 44px overlay affordance tucked into the input's inline-end padding.
// A transparent border keeps a boundary in forced-colors mode; the icon
// uses currentColor so it survives there too.
const affordanceClasses = cn(
  'inline-flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center rounded-sm',
  'border border-transparent bg-transparent text-muted-foreground',
  'transition-colors motion-reduce:transition-none hover:bg-muted hover:text-foreground',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
)

export interface ComboBoxProps {
  /** The options users filter and choose from. */
  items: readonly ComboBoxItem[]
  /** Controlled selected value (the chosen item's `value`, or `null`). */
  value?: string | null
  /** Initial value for uncontrolled usage. */
  defaultValue?: string | null
  /** Called with the newly selected `value`, or `null` when cleared. */
  onValueChange?: (value: string | null) => void
  /**
   * Placeholder shown in the empty input. Translation-ready — pass a
   * localized string. Prefer a real `<Field label>` for the accessible
   * name; a placeholder is not a label.
   */
  placeholder?: string
  /**
   * Text shown when no option matches the query.
   * Translation-ready. @default "No results"
   */
  noResultsText?: string
  /**
   * Accessible name for the open/close chevron button.
   * Translation-ready. @default "Show options"
   */
  triggerLabel?: string
  /**
   * Accessible name for the clear button.
   * Translation-ready. @default "Clear selection"
   */
  clearLabel?: string
  /**
   * Render a clear button once a value is chosen (Escape also clears).
   * @default true
   */
  showClear?: boolean
  /**
   * Highlight the first matching option automatically while filtering, so
   * Enter selects it. Off by default so nothing is chosen implicitly.
   * @default false
   */
  autoHighlight?: boolean
  /** The control's id (usually supplied by a surrounding `<Field>`). */
  id?: string
  /** Form field name for the hidden input submitted with the form. */
  name?: string
  /** Accessible name when there is no associated `<label>`. */
  'aria-label'?: string
  /** Id(s) of elements labelling the control. */
  'aria-labelledby'?: string
  /** Id(s) of elements describing the control (hint, error). */
  'aria-describedby'?: string
  /** Marks the control invalid; adds the error ring. */
  'aria-invalid'?: boolean | 'true' | 'false'
  /** Require a choice before the owning form submits. */
  required?: boolean
  /** Disable the whole control. */
  disabled?: boolean
  /** Class for the outer control wrapper (e.g. width utilities). */
  className?: string
  /** Class merged onto the text input. */
  inputClassName?: string
  /** Class merged onto the popup surface. */
  popupClassName?: string
  /**
   * Escape hatch: replace the default contains filter. Return `true` to
   * keep an item for the current query. Receives the item value object,
   * the query, and a stringifier. Passing `null` disables filtering.
   */
  filter?:
    | null
    | ((item: ComboBoxItem, query: string, itemToString?: (item: ComboBoxItem) => string) => boolean)
}

/**
 * A filterable single-select built on Base UI's Combobox — the type-ahead
 * upgrade to `<Select>`. The input carries `role="combobox"` with
 * `aria-expanded`, `aria-controls`, and `aria-activedescendant`; the popup
 * is a `listbox` of `option`s. Typing filters case-insensitively
 * (contains match); Down/Up move, Enter selects, Escape closes then
 * clears. Styled to match Input/Select and portalled so it escapes
 * overflow.
 *
 * Inside a `<Field>` it inherits `id`, `aria-describedby`, `aria-invalid`,
 * `required`, and `disabled`; explicit props win. Standalone, give it an
 * accessible name via `<label htmlFor>` or `aria-label`.
 */
export function ComboBox({
  items,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  noResultsText = 'No results',
  triggerLabel = 'Show options',
  clearLabel = 'Clear selection',
  showClear = true,
  autoHighlight = false,
  id,
  name,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  required,
  disabled,
  className,
  inputClassName,
  popupClassName,
  filter,
}: ComboBoxProps): React.JSX.Element {
  const field = useFieldControl()

  // Explicit props win over Field-provided wiring.
  const mergedId = id ?? field.id
  const mergedDescribedBy = ariaDescribedBy ?? field['aria-describedby']
  const mergedInvalid = ariaInvalid ?? field['aria-invalid']
  const mergedRequired = required ?? field.required
  const mergedDisabled = disabled ?? field.disabled

  // The API speaks item `value` strings; Base UI selects the item object.
  // Resolve strings back to the very objects passed to each Item so the
  // default identity comparison matches.
  const findItem = React.useCallback(
    (v: string | null | undefined): ComboBoxItem | null =>
      v == null ? null : (items.find((item) => item.value === v) ?? null),
    [items]
  )

  const isControlled = value !== undefined
  const rootValue = isControlled ? findItem(value) : undefined
  const rootDefaultValue = defaultValue !== undefined ? findItem(defaultValue) : undefined

  const handleValueChange = React.useCallback(
    (next: ComboBoxItem | null) => {
      onValueChange?.(next?.value ?? null)
    },
    [onValueChange]
  )

  const isInvalid =
    mergedInvalid === true || mergedInvalid === 'true' ? true : undefined

  const controlReserve = showClear ? 'pe-[5.5rem]' : 'pe-12'

  return (
    // AmbientDirection makes the combobox (and its portalled popup, since React
    // context crosses portals) follow the DOM `dir` — global or a local
    // `dir="rtl"` — so logical positioning and the anchored list flip, like the
    // native components; Base UI reads a provider, not the DOM.
    <AmbientDirection>
      <BaseCombobox.Root<ComboBoxItem>
        items={items as ComboBoxItem[]}
        value={rootValue}
        defaultValue={rootDefaultValue}
        onValueChange={handleValueChange}
        id={mergedId}
        name={name}
        required={mergedRequired}
        disabled={mergedDisabled}
        autoHighlight={autoHighlight}
        isItemEqualToValue={(a, b) => a?.value === b?.value}
        itemToStringLabel={(item) => item?.label ?? ''}
        itemToStringValue={(item) => item?.value ?? ''}
        filter={filter as never}
      >
        <span data-slot="combo-box" className={cn('relative block', className)}>
          <BaseCombobox.Input
            data-slot="combo-box-input"
            placeholder={placeholder}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={mergedDescribedBy}
            aria-invalid={isInvalid}
            className={cn(inputVariants(), controlReserve, inputClassName)}
          />
          <span
            data-slot="combo-box-affordances"
            className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-1"
          >
            {showClear ? (
              <BaseCombobox.Clear
                data-slot="combo-box-clear"
                aria-label={clearLabel}
                className={cn('pointer-events-auto', affordanceClasses)}
              >
                <ClearIcon />
              </BaseCombobox.Clear>
            ) : null}
            <BaseCombobox.Trigger
              data-slot="combo-box-trigger"
              aria-label={triggerLabel}
              className={cn('pointer-events-auto', affordanceClasses)}
            >
              <ChevronIcon />
            </BaseCombobox.Trigger>
          </span>
        </span>

        <BaseCombobox.Portal>
          <BaseCombobox.Positioner
            data-slot="combo-box-positioner"
            sideOffset={4}
            className="z-50"
          >
            <BaseCombobox.Popup
              data-slot="combo-box-popup"
              className={cn(comboBoxPopupVariants(), popupClassName)}
            >
              <BaseCombobox.Empty
                data-slot="combo-box-empty"
                className="px-2 py-105 text-sm text-muted-foreground"
              >
                {noResultsText}
              </BaseCombobox.Empty>
              <BaseCombobox.List data-slot="combo-box-list">
                {(item: ComboBoxItem) => (
                  <BaseCombobox.Item
                    key={item.value}
                    value={item}
                    disabled={item.disabled}
                    data-slot="combo-box-item"
                    className={comboBoxItemVariants()}
                  >
                    <span className="grow truncate">{item.label}</span>
                    <BaseCombobox.ItemIndicator
                      data-slot="combo-box-item-indicator"
                      className="flex shrink-0 text-foreground"
                    >
                      <CheckIcon />
                    </BaseCombobox.ItemIndicator>
                  </BaseCombobox.Item>
                )}
              </BaseCombobox.List>
            </BaseCombobox.Popup>
          </BaseCombobox.Positioner>
        </BaseCombobox.Portal>
      </BaseCombobox.Root>
    </AmbientDirection>
  )
}

/**
 * The raw Base UI Combobox parts (`Root`, `Input`, `Trigger`, `Clear`,
 * `Positioner`, `Popup`, `List`, `Item`, `ItemIndicator`, `Empty`, …), for
 * composing a layout the items-driven `<ComboBox>` does not cover (grouped
 * options, custom rows, multi-select). Style with the exported
 * `comboBoxPopupVariants` / `comboBoxItemVariants` to stay on-token.
 */
export const ComboBoxPrimitive = BaseCombobox
