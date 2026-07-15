// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { Checkbox, type CheckboxProps } from '@/components/ui/checkbox'
import { FieldProvider, useFieldControl, useFieldLabelId } from '@/components/ui/context'
import { cn } from '@/lib/cn'

// Minimal ambient typing so the dev-only guard compiles without
// @types/node. Bundlers statically replace `process.env.NODE_ENV`.
declare const process: { env: { NODE_ENV?: string | undefined } } | undefined

export const checkboxGroupVariants = cva(
  // Native fieldset reset. Each Commons Checkbox paints its own boundary in
  // forced colors; the group itself is not interactive, so it needs no border.
  // gap-05 is the ONLY separation between option rows: every Checkbox row is a
  // fixed 44px (min-h-11) box that vertically centers its own content, so a
  // constant gap yields even rhythm whether or not a row carries a single-line
  // description (see checkbox.tsx "Row rhythm").
  ['m-0 flex min-w-0 flex-col gap-05 border-0 p-0 text-sm text-foreground']
)

/** A data-driven option for the `items` prop. */
export interface CheckboxGroupItem {
  /** Value contributed to the group's value array when this option is ticked. */
  value: string
  /**
   * Visible label. It is the option's accessible name AND the 44px pointer
   * target. Translation-ready — pass a localized node.
   */
  label: React.ReactNode
  /** Optional supporting text, linked to the option via `aria-describedby`. */
  description?: React.ReactNode
  /** Removes this single option from interaction and the select-all set. */
  disabled?: boolean
}

/** Config for the optional parent "select all" checkbox. */
export interface SelectAllConfig {
  /**
   * Accessible name for the parent control.
   * @default "Select all"
   */
  label?: React.ReactNode
  /** Optional supporting text linked via `aria-describedby`. */
  description?: React.ReactNode
}

export interface CheckboxGroupProps
  extends
    Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange' | 'defaultValue'>,
    VariantProps<typeof checkboxGroupVariants> {
  /**
   * Group label, rendered as a `<legend>` — the group's accessible name.
   * Optional so the group can sit inside a `<Field>`/`<FieldGroup>` that
   * provides the label instead; standalone groups without `label` must pass
   * `aria-label` or `aria-labelledby`.
   */
  label?: React.ReactNode
  /**
   * The ticked values (controlled). Pair with `onValueChange`. For an
   * uncontrolled group use `defaultValue` instead.
   */
  value?: string[]
  /** The initially-ticked values (uncontrolled). */
  defaultValue?: string[]
  /** Called with the next value array whenever an option (or select-all) toggles. */
  onValueChange?: (value: string[]) => void
  /**
   * Every value the select-all parent governs. Defaults to the union of the
   * `items` values and any composed `Checkbox` children's `value` props —
   * pass this only to override that inference.
   */
  allValues?: string[]
  /** Data-driven options. Rendered as Commons `Checkbox` rows, in order. */
  items?: CheckboxGroupItem[]
  /**
   * Shared `name` applied to every option's native input, so a form submits
   * one `name=value` pair per ticked box. Defaults to a generated id.
   */
  name?: string
  /**
   * Render a parent "select all" checkbox above the options. It is checked
   * when every (enabled) option is ticked, `indeterminate` ("mixed") when
   * some are, and unchecked when none are. Pass an object to customize its
   * label/description.
   */
  selectAll?: boolean | SelectAllConfig
  /** Composed Commons `Checkbox` children (each with a `value`) as an alternative to `items`. */
  children?: React.ReactNode
}

// Props read from / injected into composed <Checkbox> children.
type WiredChildProps = Pick<CheckboxProps, 'value' | 'checked' | 'disabled' | 'name' | 'onChange'>

function isWiredChild(node: React.ReactNode): node is React.ReactElement<WiredChildProps> {
  return React.isValidElement(node) && typeof (node.props as WiredChildProps).value === 'string'
}

/**
 * Small controllable-state helper: controlled when `value` is supplied,
 * otherwise internal. `onValueChange` fires in both modes.
 */
function useControllableValue(
  value: string[] | undefined,
  defaultValue: string[] | undefined,
  onValueChange: ((value: string[]) => void) | undefined
): [string[], (next: string[]) => void] {
  const [uncontrolled, setUncontrolled] = React.useState<string[]>(defaultValue ?? [])
  const isControlled = value !== undefined
  const current = isControlled ? value : uncontrolled
  const setValue = React.useCallback(
    (next: string[]) => {
      if (!isControlled) {
        setUncontrolled(next)
      }
      onValueChange?.(next)
    },
    [isControlled, onValueChange]
  )
  return [current, setValue]
}

/**
 * Coordinates a set of related checkboxes that share one value ARRAY. It
 * renders a `<fieldset role="group">` whose `<legend>` (or a surrounding
 * Field's label) is the group's accessible name, and drives each option's
 * `checked` state from the shared value — mirroring Base UI's checkbox-group
 * `value` / `defaultValue` / `onValueChange` / `allValues` contract while
 * reusing the native Commons `Checkbox` for every row (so options keep their
 * 44px target, label/description alignment, and forced-colors treatment).
 *
 * The optional parent "select all" checkbox reflects the classic tri-state:
 * checked when all enabled options are ticked, `indeterminate` ("mixed") when
 * only some are, unchecked when none are — announced natively via the
 * checkbox's mixed state. It only toggles enabled options, preserving any
 * disabled-and-ticked selections.
 *
 * Inside a `<Field>` the group inherits its id, hint/error wiring
 * (`aria-describedby`), `aria-invalid`, and `disabled` from the Field
 * contract; disabling the fieldset natively disables every option at once.
 */
export const CheckboxGroup = React.forwardRef<HTMLFieldSetElement, CheckboxGroupProps>(
  function CheckboxGroup(
    {
      className,
      label,
      value: valueProp,
      defaultValue,
      onValueChange,
      allValues,
      items,
      name: nameProp,
      selectAll,
      disabled: disabledProp,
      id: idProp,
      children,
      ...props
    },
    ref
  ) {
    const field = useFieldControl()
    const fieldLabelId = useFieldLabelId()
    const generatedId = React.useId()
    const generatedName = React.useId()
    const groupId = idProp ?? field.id ?? generatedId
    const name = nameProp ?? generatedName
    const legendId = label != null ? `${groupId}-legend` : undefined

    const [currentValue, setValue] = useControllableValue(valueProp, defaultValue, onValueChange)

    const setItemChecked = React.useCallback(
      (itemValue: string, checked: boolean) => {
        setValue(
          checked
            ? Array.from(new Set([...currentValue, itemValue]))
            : currentValue.filter((v) => v !== itemValue)
        )
      },
      [currentValue, setValue]
    )

    const warnedRef = React.useRef(false)

    // Dev-only guard: a group must have an accessible name (WCAG 4.1.2) —
    // a legend via `label`, `aria-label(ledby)`, or a surrounding Field.
    React.useEffect(() => {
      if (
        (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') ||
        warnedRef.current
      ) {
        return
      }
      const hasName =
        label != null ||
        props['aria-label'] != null ||
        props['aria-labelledby'] != null ||
        fieldLabelId != null
      if (!hasName) {
        warnedRef.current = true
        console.warn(
          '[commons] <CheckboxGroup> has no accessible name. Pass `label` ' +
            '(renders a <legend>), wrap it in a <Field label=...>, or pass ' +
            '`aria-label`/`aria-labelledby`.'
        )
      }
    }, [label, props, fieldLabelId])

    const describedBy =
      [field['aria-describedby'], props['aria-describedby']].filter(Boolean).join(' ') || undefined

    const disabled = disabledProp ?? field.disabled
    const invalid = props['aria-invalid'] ?? field['aria-invalid']

    // Resolve the select-all set: explicit `allValues` wins; otherwise infer
    // from the enabled `items` and composed children. Disabled options are
    // excluded so select-all never flips a locked row.
    const childInfos = React.Children.toArray(children)
      .filter(isWiredChild)
      .map((child) => ({
        value: child.props.value as string,
        disabled: child.props.disabled === true,
      }))
    const enabledValues = allValues ?? [
      ...(items ?? []).filter((it) => !it.disabled).map((it) => it.value),
      ...childInfos.filter((ci) => !ci.disabled).map((ci) => ci.value),
    ]

    const allSelected =
      enabledValues.length > 0 && enabledValues.every((v) => currentValue.includes(v))
    const someSelected = enabledValues.some((v) => currentValue.includes(v))
    const indeterminate = someSelected && !allSelected

    const toggleSelectAll = React.useCallback(() => {
      setValue(
        allSelected
          ? currentValue.filter((v) => !enabledValues.includes(v))
          : Array.from(new Set([...currentValue, ...enabledValues]))
      )
    }, [allSelected, currentValue, enabledValues, setValue])

    const itemIds = (items ?? []).map((_, index) => `${groupId}-item-${index}`)
    const selectAllConfig: SelectAllConfig =
      typeof selectAll === 'object' && selectAll !== null ? selectAll : {}

    // Wire composed children by value: derive `checked` from the group value
    // and compose the existing onChange so a child's own handler still runs.
    const wiredChildren = React.Children.map(children, (child) => {
      if (!isWiredChild(child)) {
        return child
      }
      const childValue = child.props.value as string
      const childOnChange = child.props.onChange
      return React.cloneElement(child, {
        checked: currentValue.includes(childValue),
        name: child.props.name ?? name,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
          setItemChecked(childValue, event.currentTarget.checked)
          childOnChange?.(event)
        },
      })
    })

    return (
      <fieldset
        {...props}
        ref={ref}
        id={groupId}
        // A <fieldset> is implicitly role="group"; stated for clarity. Native
        // `disabled` on the fieldset disables every option inside at once.
        role="group"
        data-slot="checkbox-group"
        disabled={disabled || undefined}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        // Name resolution: own <legend> first, then an explicit
        // aria-labelledby, then the surrounding Field's label — a fieldset is
        // not labelable, so `htmlFor` cannot name it.
        aria-labelledby={label != null ? legendId : (props['aria-labelledby'] ?? fieldLabelId)}
        className={cn(checkboxGroupVariants(), className)}
      >
        {label != null ? (
          <legend id={legendId} data-slot="checkbox-group-label" className="mb-05 p-0 font-medium">
            {label}
          </legend>
        ) : null}
        {/* A neutral FieldProvider makes the GROUP (the fieldset) the single
            owner of the Field wiring: without it, every child Commons Checkbox
            would independently re-consume the surrounding Field and repeat its
            aria-invalid / aria-describedby on each option. Options are still
            disabled together via the native fieldset `disabled` above. */}
        <FieldProvider>
          {selectAll ? (
            <Checkbox
              data-slot="checkbox-group-select-all"
              label={selectAllConfig.label ?? 'Select all'}
              description={selectAllConfig.description}
              checked={allSelected}
              indeterminate={indeterminate}
              onChange={toggleSelectAll}
              aria-controls={itemIds.length > 0 ? itemIds.join(' ') : undefined}
            />
          ) : null}
          {(items ?? []).map((item, index) => (
            <Checkbox
              key={item.value}
              id={itemIds[index]}
              data-slot="checkbox-group-item"
              name={name}
              value={item.value}
              label={item.label}
              description={item.description}
              disabled={item.disabled}
              checked={currentValue.includes(item.value)}
              onChange={(event) => setItemChecked(item.value, event.currentTarget.checked)}
            />
          ))}
          {wiredChildren}
        </FieldProvider>
      </fieldset>
    )
  }
)
