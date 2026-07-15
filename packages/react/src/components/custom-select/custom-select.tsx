// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

'use client'

import { Select as BaseSelect } from '@base-ui/react/select'
import { cva } from 'class-variance-authority'
import * as React from 'react'

import { useFieldControl, useFieldLabelId } from '@/components/ui/context'
import { inputVariants } from '@/components/ui/input'
import { AmbientDirection } from '@/lib/ambient-direction'
import { cn } from '@/lib/cn'

/**
 * A single option in the list. `value` is the stable form value; `label`
 * is what the user sees and reads back (and the typeahead target). Mark
 * rare unavailable choices `disabled` (kept visible so the list stays
 * predictable — WCAG 3.2.4 consistent identification). An optional `icon`
 * renders alongside the label for richer rows the native `<select>` can't
 * draw — it is decorative (`aria-hidden`), so keep the meaning in `label`.
 */
export interface CustomSelectOption {
  value: string
  label: string
  disabled?: boolean
  icon?: React.ReactNode
}

/**
 * A labelled cluster of options. Renders a `role="group"` with an
 * associated `GroupLabel`, so screen readers announce the section name
 * (e.g. "Northeast") as the user arrows into its options.
 */
export interface CustomSelectOptionGroup {
  label: string
  items: readonly CustomSelectOption[]
}

/** An entry in the `items` list: either a lone option or a labelled group. */
export type CustomSelectEntry = CustomSelectOption | CustomSelectOptionGroup

function isGroup(entry: CustomSelectEntry): entry is CustomSelectOptionGroup {
  return 'items' in entry
}

/**
 * The listbox surface. A capped `max-block-size` + `overflow-y-auto` pair
 * so a long list scrolls inside a bounded box instead of pushing
 * off-screen; capped to the anchor-relative available height so it stays
 * usable at 400% zoom / reflow. A real border on every state keeps a
 * visible boundary in forced-colors mode.
 */
export const customSelectPopupVariants = cva([
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
 * `min-h-11` (2.75rem / 44px) meets the Commons target-size default.
 */
export const customSelectItemVariants = cva([
  'flex min-h-11 cursor-default select-none items-center gap-2 rounded-sm px-2 text-sm text-foreground',
  'outline-none',
  'data-highlighted:bg-muted data-highlighted:font-medium',
  'data-disabled:pointer-events-none data-disabled:text-disabled-foreground',
])

// The trigger looks like an Input/Select box but is a real button carrying
// role=combobox + aria-haspopup=listbox. `min-h-11` from inputVariants meets
// the 44px target; the value truncates and the chevron pins to the inline end.
const triggerClasses = cn(
  inputVariants(),
  'flex cursor-pointer items-center justify-between gap-2 text-start',
  'disabled:cursor-not-allowed'
)

// Section heading for a group of options. Not an option itself (role=group's
// label), so it is not focusable and uses muted, uppercased text.
const groupLabelClasses =
  'px-2 pb-05 pt-105 text-xs font-semibold uppercase tracking-wide text-muted-foreground'

function ChevronIcon(): React.JSX.Element {
  return (
    <span
      aria-hidden="true"
      data-slot="custom-select-icon"
      className="flex shrink-0 items-center text-foreground"
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

export interface CustomSelectProps {
  /** The options users choose from — lone options and/or labelled groups. */
  items: readonly CustomSelectEntry[]
  /** Controlled selected value (the chosen option's `value`, or `null`). */
  value?: string | null
  /** Initial value for uncontrolled usage. */
  defaultValue?: string | null
  /** Called with the newly selected `value`, or `null` when cleared. */
  onValueChange?: (value: string | null) => void
  /**
   * Text shown in the trigger until a value is chosen. Translation-ready —
   * pass a localized string. A placeholder is not a label; give the control
   * a real visible label via a surrounding `<Field>`.
   */
  placeholder?: string
  /**
   * Accessible name used only when the control is NOT inside a `<Field>`
   * (rendered visually hidden). Inside a Field the field's label supplies
   * the name. The current value is always appended, so the trigger reads
   * e.g. "District, Ward 3". Translation-ready. @default "Select an option"
   */
  triggerLabel?: string
  /** The control's id (usually supplied by a surrounding `<Field>`). */
  id?: string
  /** Form field name for the hidden input submitted with the form. */
  name?: string
  /** Marks the control invalid; adds the error ring. */
  'aria-invalid'?: boolean | 'true' | 'false'
  /** Require a choice before the owning form submits. */
  required?: boolean
  /** Disable the whole control. */
  disabled?: boolean
  /** Class for the trigger button (e.g. width utilities). */
  className?: string
  /** Class merged onto the popup surface. */
  popupClassName?: string
}

/**
 * A styled listbox-select built on Base UI's Select, for the cases the
 * native `<Select>` cannot cover: option groups, disabled options, and
 * rich rows (icon + text). The trigger is a `role="combobox"` button with
 * `aria-haspopup="listbox"`; the popup is a `listbox` of `option`s. It is
 * NOT filterable — reach for `<ComboBox>` when users need type-ahead over a
 * long list, and the native `<Select>` for ordinary short lists.
 *
 * Keyboard follows the APG listbox pattern (Base UI provides it): Up/Down
 * move, Home/End jump, printable characters type-ahead, Enter/Space select,
 * Escape closes. The selected option shows a check indicator plus
 * `aria-selected` (non-color redundancy), and the forced-colors-safe chevron
 * is drawn with `currentColor`.
 *
 * Inside a `<Field>` it inherits `id`, `aria-describedby`, `aria-invalid`,
 * `required`, and `disabled`; explicit props win. The accessible name always
 * includes the current value (Field label + value, or `triggerLabel` +
 * value when standalone). For a layout this convenience API doesn't cover
 * (custom rows, multi-select), compose `CustomSelectPrimitive` with the
 * exported `customSelectPopupVariants` / `customSelectItemVariants`.
 */
export function CustomSelect({
  items,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  triggerLabel = 'Select an option',
  id,
  name,
  'aria-invalid': ariaInvalid,
  required,
  disabled,
  className,
  popupClassName,
}: CustomSelectProps): React.JSX.Element {
  const field = useFieldControl()
  const fieldLabelId = useFieldLabelId()

  // Explicit props win over Field-provided wiring.
  const mergedId = id ?? field.id
  const mergedDescribedBy = field['aria-describedby']
  const mergedInvalid = ariaInvalid ?? field['aria-invalid']
  const mergedRequired = required ?? field.required
  const mergedDisabled = disabled ?? field.disabled

  const isInvalid = mergedInvalid === true || mergedInvalid === 'true' ? true : undefined

  // Flatten groups to a single option list: for value→label resolution in the
  // trigger, and to render the selected option's icon next to its label.
  const flatOptions = React.useMemo<CustomSelectOption[]>(() => {
    const out: CustomSelectOption[] = []
    for (const entry of items) {
      if (isGroup(entry)) {
        out.push(...entry.items)
      } else {
        out.push(entry)
      }
    }
    return out
  }, [items])

  const optionByValue = React.useMemo(() => {
    const map = new Map<string, CustomSelectOption>()
    for (const option of flatOptions) {
      map.set(option.value, option)
    }
    return map
  }, [flatOptions])

  // Base UI's `items` powers <Select.Value> label resolution.
  const rootItems = React.useMemo(
    () => flatOptions.map((option) => ({ label: option.label, value: option.value })),
    [flatOptions]
  )

  const isControlled = value !== undefined

  const handleValueChange = React.useCallback(
    (next: string | null) => {
      onValueChange?.(next ?? null)
    },
    [onValueChange]
  )

  // Accessible name = [context label] + [current value]. Inside a Field the
  // Field's own label supplies the context; standalone we render a
  // visually-hidden label so the name still reads "<label>, <value>". The
  // value span carries `valueTextId` so aria-labelledby appends it.
  const valueTextId = React.useId()
  const fallbackLabelId = React.useId()
  const labelledBy = [fieldLabelId ?? fallbackLabelId, valueTextId].join(' ')

  const renderOption = (option: CustomSelectOption): React.JSX.Element => (
    <BaseSelect.Item
      key={option.value}
      value={option.value}
      label={option.label}
      disabled={option.disabled}
      data-slot="custom-select-item"
      className={customSelectItemVariants()}
    >
      {option.icon != null ? (
        <span aria-hidden="true" className="flex shrink-0 items-center">
          {option.icon}
        </span>
      ) : null}
      <BaseSelect.ItemText data-slot="custom-select-item-text" className="grow truncate">
        {option.label}
      </BaseSelect.ItemText>
      <BaseSelect.ItemIndicator
        data-slot="custom-select-item-indicator"
        className="flex shrink-0 text-foreground"
      >
        <CheckIcon />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  )

  return (
    // AmbientDirection makes the select (and its portalled popup, since React
    // context crosses portals) follow the DOM `dir` — global or a local
    // `dir="rtl"` — so logical positioning and the anchored list flip, like the
    // native components; Base UI reads a provider, not the DOM.
    <AmbientDirection>
      <BaseSelect.Root<string>
        items={rootItems}
        value={isControlled ? value : undefined}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        id={mergedId}
        name={name}
        required={mergedRequired}
        disabled={mergedDisabled}
      >
        <BaseSelect.Trigger
          data-slot="custom-select-trigger"
          aria-labelledby={labelledBy}
          aria-describedby={mergedDescribedBy}
          aria-invalid={isInvalid}
          className={cn(triggerClasses, className)}
        >
          {fieldLabelId ? null : (
            <span id={fallbackLabelId} className="sr-only">
              {triggerLabel}
            </span>
          )}
          <BaseSelect.Value
            id={valueTextId}
            data-slot="custom-select-value"
            className="flex min-w-0 items-center gap-2"
          >
            {(selected: string | null) => {
              const option =
                selected != null && selected !== '' ? optionByValue.get(selected) : undefined
              if (!option) {
                return <span className="truncate text-muted-foreground">{placeholder}</span>
              }
              return (
                <>
                  {option.icon != null ? (
                    <span aria-hidden="true" className="flex shrink-0 items-center">
                      {option.icon}
                    </span>
                  ) : null}
                  <span className="truncate">{option.label}</span>
                </>
              )
            }}
          </BaseSelect.Value>
          <BaseSelect.Icon render={<ChevronIcon />} />
        </BaseSelect.Trigger>

        <BaseSelect.Portal>
          <BaseSelect.Positioner
            data-slot="custom-select-positioner"
            sideOffset={4}
            alignItemWithTrigger={false}
            className="z-50"
          >
            <BaseSelect.Popup
              data-slot="custom-select-popup"
              className={cn(customSelectPopupVariants(), popupClassName)}
            >
              <BaseSelect.List data-slot="custom-select-list">
                {items.map((entry, index) =>
                  isGroup(entry) ? (
                    <BaseSelect.Group
                      // Groups are static config; index keys are stable here.
                      key={`group-${index}`}
                      data-slot="custom-select-group"
                    >
                      <BaseSelect.GroupLabel
                        data-slot="custom-select-group-label"
                        className={groupLabelClasses}
                      >
                        {entry.label}
                      </BaseSelect.GroupLabel>
                      {entry.items.map(renderOption)}
                    </BaseSelect.Group>
                  ) : (
                    renderOption(entry)
                  )
                )}
              </BaseSelect.List>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
    </AmbientDirection>
  )
}

/**
 * The raw Base UI Select parts (`Root`, `Trigger`, `Value`, `Icon`,
 * `Portal`, `Positioner`, `Popup`, `List`, `Group`, `GroupLabel`, `Item`,
 * `ItemText`, `ItemIndicator`, …), for composing a layout the items-driven
 * `<CustomSelect>` does not cover (custom rows, multi-select, separators).
 * Style with the exported `customSelectPopupVariants` /
 * `customSelectItemVariants` to stay on-token.
 */
export const CustomSelectPrimitive = BaseSelect
