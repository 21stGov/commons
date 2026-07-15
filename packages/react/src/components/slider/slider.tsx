// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

'use client'

import { Slider as BaseSlider } from '@base-ui/react/slider'
import { cva } from 'class-variance-authority'
import * as React from 'react'

import { useFieldControl } from '@/components/ui/context'
import { inputVariants } from '@/components/ui/input'
import { AmbientDirection } from '@/lib/ambient-direction'
import { cn } from '@/lib/cn'

// Minimal ambient typing so the dev-only guard compiles without
// @types/node. Bundlers statically replace `process.env.NODE_ENV`.
declare const process: { env: { NODE_ENV?: string | undefined } } | undefined

export const sliderVariants = cva(['flex flex-col gap-1 text-sm text-foreground'])

// The interactive row. min-h-11 (2.75rem = 44px) makes the whole track a
// 44px pointer target for track-press even though the visual track is thin,
// meeting the project minimum target size (WCAG 2.5.5). `relative` anchors
// the absolutely-positioned thumbs and ticks; the track spans its full
// width so thumb inset percentages map to the pressable area.
const controlClasses = 'relative flex min-h-11 w-full touch-none select-none items-center'

// The visual rail. A real border on every state keeps a visible boundary in
// forced-colors mode (where bg tokens collapse to system colors). Thin so the
// filled indicator and thumb read as the value carriers, not the rail itself.
const trackClasses = [
  'relative h-1 w-full rounded-full border border-border-strong bg-muted',
  'data-[disabled]:border-disabled-border data-[disabled]:bg-disabled',
].join(' ')

// The filled portion. This is the PRIMARY non-color value cue: its inline-end
// edge sits under the thumb, so the *length* of the fill conveys the value
// even when its color is overridden in forced-colors mode. `start-0` +
// logical sizing means Base UI's inset positioning mirrors automatically in
// RTL (the fill grows from the inline-start edge in both directions).
const indicatorClasses = [
  'absolute inset-block-0 start-0 rounded-full bg-primary',
  'data-[disabled]:bg-disabled-foreground',
].join(' ')

// The thumb. The hit area is a transparent 44px box (size-11) so dragging and
// tapping meet the minimum target size even though the visible dot is ~20px.
// Base UI centers the box on the value point via an absolute translate that is
// already RTL-aware, so no manual mirror is needed here.
const thumbClasses = 'group absolute flex size-11 items-center justify-center'

// The visible dot inside the thumb box. Position (not color) is the value cue;
// a 2px border keeps it distinct from the rail in forced-colors mode. The
// focus ring hugs the dot via `group-has-[:focus-visible]` because the real
// focus target is the visually-hidden <input type="range"> nested in the box.
const thumbDotClasses = [
  'pointer-events-none block size-205 rounded-full border-2 border-primary bg-background shadow-1',
  'data-[dragging]:ring-2 data-[dragging]:ring-ring data-[dragging]:ring-offset-1',
  'group-data-[disabled]:border-disabled-border group-data-[disabled]:bg-disabled',
  'group-has-[:focus-visible]:outline-2 group-has-[:focus-visible]:outline-offset-2 group-has-[:focus-visible]:outline-ring',
].join(' ')

/** Round a raw number to the slider step and clamp it into [min, max]. */
function snapToStep(value: number, min: number, max: number, step: number): number {
  const snapped = Math.round((value - min) / step) * step + min
  const rounded = Number(snapped.toFixed(6))
  return Math.min(max, Math.max(min, rounded))
}

/**
 * A visually-hidden reference target for `aria-labelledby`. Screen readers
 * resolve the text of referenced nodes even when they are hidden from view,
 * so each range thumb can be named "{label}, {Minimum|Maximum}" without
 * showing duplicate text.
 */
function HiddenLabel({ id, children }: { id: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <span id={id} className="sr-only">
      {children}
    </span>
  )
}

/** Visible, non-color required marker with a spelled-out label for AT. */
function RequiredIndicator({ requiredLabel }: { requiredLabel: string }): React.JSX.Element {
  return (
    <>
      <span aria-hidden="true" className="ps-05 text-error-foreground">
        *
      </span>
      <span className="sr-only">, {requiredLabel}</span>
    </>
  )
}

type SliderValue = number | number[]

export interface SliderProps {
  /**
   * Visible label. Required: it is the accessible name of the slider (single
   * thumb) or the shared prefix of each thumb's name (range). Translation-ready
   * — pass a localized node.
   */
  label: React.ReactNode
  /**
   * Optional supporting text, linked via `aria-describedby` and kept out of
   * the accessible name.
   */
  description?: React.ReactNode
  /**
   * Controlled value. Pass a `number` for a single thumb or a two-item
   * `[start, end]` array for a range. The array vs. number shape is what
   * selects single vs. range mode.
   */
  value?: SliderValue
  /** Initial value for uncontrolled usage (number or `[start, end]`). */
  defaultValue?: SliderValue
  /** Fired with the new value (number or `[start, end]`) as it changes. */
  onValueChange?: (value: SliderValue) => void
  /** Fired once when a change is committed (drag end / key release). */
  onValueCommitted?: (value: SliderValue) => void
  /** Minimum allowed value. @default 0 */
  min?: number
  /** Maximum allowed value. @default 100 */
  max?: number
  /** Step increment; values snap to multiples of this. @default 1 */
  step?: number
  /** Step used for Page Up / Page Down and Shift+Arrow. @default 10 */
  largeStep?: number
  /**
   * Show discrete tick marks. `true` renders a tick at every step; an array
   * renders ticks at the given values. Decorative (aria-hidden) — the value is
   * still conveyed by the fill length, thumb position, and readout.
   */
  ticks?: boolean | number[]
  /**
   * Render a linked exact-value number input beside the slider (one per
   * thumb). Sliders are hard to operate precisely for users with motor or
   * vision differences, so USWDS guidance recommends offering a typed
   * alternative that stays in sync. @default false
   */
  valueInput?: boolean
  /** Whether to show the live value readout next to the label. @default true */
  showValue?: boolean
  /**
   * Accessible name for the first (start) range thumb, appended after the
   * label. Translation-ready. @default "Minimum"
   */
  minLabel?: string
  /**
   * Accessible name for the second (end) range thumb, appended after the
   * label. Translation-ready. @default "Maximum"
   */
  maxLabel?: string
  /**
   * Visible label for the single-thumb exact-value input. Translation-ready.
   * @default "Exact value"
   */
  valueInputLabel?: string
  /**
   * Visually-hidden word announced after the label when `required`.
   * Translation-ready. @default "required"
   */
  requiredLabel?: string
  /** Format applied to the readout and each thumb's `aria-valuetext`. */
  format?: Intl.NumberFormatOptions
  /** The control's id (usually supplied by a surrounding `<Field>`). */
  id?: string
  /** Form field name for the hidden range input(s) submitted with a form. */
  name?: string
  /** Id(s) of elements describing the control (hint, error). */
  'aria-describedby'?: string
  /** Marks the control invalid; adds the error styling. */
  'aria-invalid'?: boolean | 'true' | 'false'
  /** Show the required indicator (value is inherited from a `<Field>`). */
  required?: boolean
  /** Disable the whole control. */
  disabled?: boolean
  /** Class for the outer wrapper. */
  className?: string
}

/**
 * A range input built on Base UI's Slider. One API covers a single thumb
 * (`value` is a `number`) and a two-thumb range (`value` is `[start, end]`).
 * Each thumb is a real `role="slider"` (a nested `<input type="range">`) with
 * `aria-valuemin/max/now` and full APG keyboard support: Arrow keys step,
 * Shift+Arrow / Page Up / Page Down move by `largeStep`, Home / End jump to
 * the bounds.
 *
 * Accessibility highlights:
 * - **Non-color value cues:** the filled indicator length AND the thumb
 *   position both convey the value, so it survives forced-colors mode; the
 *   rail, fill, and thumb all keep visible borders.
 * - **44px targets:** the pressable track row and each thumb hit area are
 *   44px tall even though the visual rail and dot are smaller.
 * - **Exact input:** set `valueInput` to add a linked number field per thumb
 *   for users who cannot operate a slider precisely (USWDS guidance).
 *
 * Inside a `<Field>` it inherits `id`, `aria-describedby`, `aria-invalid`,
 * `required`, and `disabled`; explicit props win.
 */
export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(function Slider(
  {
    label,
    description,
    value,
    defaultValue,
    onValueChange,
    onValueCommitted,
    min = 0,
    max = 100,
    step = 1,
    largeStep = 10,
    ticks = false,
    valueInput = false,
    showValue = true,
    minLabel = 'Minimum',
    maxLabel = 'Maximum',
    valueInputLabel = 'Exact value',
    requiredLabel = 'required',
    format,
    id: idProp,
    name,
    'aria-describedby': ariaDescribedByProp,
    'aria-invalid': ariaInvalidProp,
    required: requiredProp,
    disabled: disabledProp,
    className,
  },
  ref
) {
  const field = useFieldControl()
  const generatedId = React.useId()
  // Keep the control's OWN id (never the Field's): the slider owns two thumb
  // inputs, so it references the label via aria-labelledby rather than a
  // single <label htmlFor>. Adopting the Field id would collide with the
  // inputs and mislabel them.
  const baseId = idProp ?? generatedId
  const labelId = `${baseId}-label`
  const descriptionId = description != null ? `${baseId}-description` : undefined

  const disabled = disabledProp ?? field.disabled ?? false
  const required = requiredProp ?? field.required ?? false
  const ariaInvalid = ariaInvalidProp ?? field['aria-invalid']
  const invalid = ariaInvalid === true || ariaInvalid === 'true'

  const describedBy =
    [descriptionId, field['aria-describedby'], ariaDescribedByProp].filter(Boolean).join(' ') ||
    undefined

  // Range vs. single is chosen by the shape of the value/defaultValue.
  const isRange = Array.isArray(value) || Array.isArray(defaultValue)

  // Controllable state: the wrapper is the source of truth so the optional
  // number input(s) and the slider always agree. Base UI is driven as a
  // controlled component from `current`.
  const isControlled = value !== undefined
  const [uncontrolled, setUncontrolled] = React.useState<SliderValue>(
    () => defaultValue ?? (isRange ? [min, max] : min)
  )
  const current = isControlled ? (value as SliderValue) : uncontrolled

  const handleChange = React.useCallback(
    (next: SliderValue): void => {
      if (!isControlled) {
        setUncontrolled(next)
      }
      onValueChange?.(next)
    },
    [isControlled, onValueChange]
  )

  const warnedRef = React.useRef(false)
  // Dev-only guard: a slider must have a visible label (WCAG 4.1.2). The label
  // is the accessible name, so there is no aria-label escape hatch.
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
        '[commons] <Slider> requires a `label`. The label is the accessible ' +
          'name of the thumb(s).'
      )
    }
  }, [label])

  const currentArr = isRange ? (current as number[]) : [current as number]
  const minThumbId = `${baseId}-thumb-min`
  const maxThumbId = `${baseId}-thumb-max`

  // Tick positions as percentages along the track (logical inset mirrors in
  // RTL). Purely decorative — the readout and thumb carry the real meaning.
  const tickValues: number[] = React.useMemo(() => {
    if (ticks === false) {
      return []
    }
    if (Array.isArray(ticks)) {
      return ticks
    }
    const out: number[] = []
    for (let v = min; v <= max; v += step) {
      out.push(Number(v.toFixed(6)))
    }
    return out
  }, [ticks, min, max, step])

  const handleNumberInput = (index: number, raw: string): void => {
    const parsed = Number.parseFloat(raw)
    if (Number.isNaN(parsed)) {
      return
    }
    const snapped = snapToStep(parsed, min, max, step)
    if (!isRange) {
      handleChange(snapped)
      return
    }
    const nextArr = [...(currentArr as number[])]
    nextArr[index] = snapped
    // Keep the pair ordered so start never crosses end.
    if (index === 0) {
      nextArr[0] = Math.min(nextArr[0], nextArr[1])
    } else {
      nextArr[1] = Math.max(nextArr[1], nextArr[0])
    }
    handleChange(nextArr)
  }

  return (
    // AmbientDirection makes the slider follow the DOM `dir` (global or a local
    // `dir="rtl"`) because Base UI reads a provider, not the DOM — so the fill
    // grows and the thumbs translate from the inline-start edge in RTL, like
    // the native components.
    <AmbientDirection>
      <BaseSlider.Root
        // Cast: one wrapper API accepts number | number[]; Base UI's generic
        // is resolved at runtime by the value shape.
        value={current as never}
        onValueChange={(next) => handleChange(next as SliderValue)}
        onValueCommitted={
          onValueCommitted ? (next) => onValueCommitted(next as SliderValue) : undefined
        }
        min={min}
        max={max}
        step={step}
        largeStep={largeStep}
        disabled={disabled}
        name={name}
        format={format}
      >
        <div
          ref={ref}
          data-slot="slider"
          data-invalid={invalid || undefined}
          data-disabled={disabled || undefined}
          className={cn(sliderVariants(), className)}
        >
          <div data-slot="slider-header" className="flex items-baseline justify-between gap-2">
            <span
              id={labelId}
              data-slot="slider-label"
              className={cn(
                'font-medium leading-snug text-foreground',
                disabled && 'text-disabled-foreground'
              )}
            >
              {label}
              {required ? <RequiredIndicator requiredLabel={requiredLabel} /> : null}
            </span>
            {showValue ? (
              <BaseSlider.Value
                data-slot="slider-value"
                className={cn(
                  'shrink-0 tabular-nums text-muted-foreground',
                  disabled && 'text-disabled-foreground'
                )}
              >
                {(formatted) =>
                  formatted.length > 1 ? `${formatted[0]} – ${formatted[1]}` : formatted[0]
                }
              </BaseSlider.Value>
            ) : null}
          </div>

          {description != null ? (
            <span
              id={descriptionId}
              data-slot="slider-description"
              className={cn(
                'leading-snug text-muted-foreground',
                disabled && 'text-disabled-foreground'
              )}
            >
              {description}
            </span>
          ) : null}

          {/* Hidden per-thumb qualifiers for range mode, referenced by each
              thumb's aria-labelledby so the two thumbs get distinct names. */}
          {isRange ? (
            <>
              <HiddenLabel id={minThumbId}>{minLabel}</HiddenLabel>
              <HiddenLabel id={maxThumbId}>{maxLabel}</HiddenLabel>
            </>
          ) : null}

          <BaseSlider.Control data-slot="slider-control" className={controlClasses}>
            <BaseSlider.Track
              data-slot="slider-track"
              className={cn(trackClasses, invalid && 'border-error-border')}
            >
              <BaseSlider.Indicator data-slot="slider-indicator" className={indicatorClasses} />

              {tickValues.map((tickValue) => {
                const percent = ((tickValue - min) / (max - min)) * 100
                return (
                  <span
                    key={tickValue}
                    aria-hidden="true"
                    data-slot="slider-tick"
                    style={{ insetInlineStart: `${percent}%` }}
                    className="absolute inset-block-0 w-px -translate-x-1/2 rtl:translate-x-1/2 bg-border-strong"
                  />
                )
              })}

              {isRange ? (
                <>
                  <BaseSlider.Thumb
                    index={0}
                    data-slot="slider-thumb"
                    aria-labelledby={`${labelId} ${minThumbId}`}
                    aria-describedby={describedBy}
                    getAriaValueText={(formattedValue) => formattedValue}
                    className={thumbClasses}
                  >
                    <span aria-hidden="true" data-slot="slider-thumb-dot" className={thumbDotClasses} />
                  </BaseSlider.Thumb>
                  <BaseSlider.Thumb
                    index={1}
                    data-slot="slider-thumb"
                    aria-labelledby={`${labelId} ${maxThumbId}`}
                    aria-describedby={describedBy}
                    getAriaValueText={(formattedValue) => formattedValue}
                    className={thumbClasses}
                  >
                    <span aria-hidden="true" data-slot="slider-thumb-dot" className={thumbDotClasses} />
                  </BaseSlider.Thumb>
                </>
              ) : (
                <BaseSlider.Thumb
                  data-slot="slider-thumb"
                  aria-labelledby={labelId}
                  aria-describedby={describedBy}
                  getAriaValueText={(formattedValue) => formattedValue}
                  className={thumbClasses}
                >
                  <span aria-hidden="true" data-slot="slider-thumb-dot" className={thumbDotClasses} />
                </BaseSlider.Thumb>
              )}
            </BaseSlider.Track>
          </BaseSlider.Control>

          {valueInput ? (
            <div data-slot="slider-inputs" className="flex flex-wrap gap-2">
              {currentArr.map((thumbValue, index) => {
                const inputId = `${baseId}-input-${index}`
                const fieldLabel = isRange ? (index === 0 ? minLabel : maxLabel) : valueInputLabel
                return (
                  <div key={inputId} className="flex flex-col gap-05">
                    <label
                      htmlFor={inputId}
                      data-slot="slider-input-label"
                      className={cn(
                        'text-xs font-medium leading-snug text-foreground',
                        disabled && 'text-disabled-foreground'
                      )}
                    >
                      {fieldLabel}
                    </label>
                    <input
                      id={inputId}
                      type="number"
                      inputMode="numeric"
                      data-slot="slider-input"
                      min={index === 1 ? currentArr[0] : min}
                      max={index === 0 && isRange ? currentArr[1] : max}
                      step={step}
                      value={thumbValue}
                      disabled={disabled}
                      aria-invalid={invalid || undefined}
                      onChange={(event) => handleNumberInput(index, event.target.value)}
                      className={cn(inputVariants(), 'w-24 tabular-nums')}
                    />
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>
      </BaseSlider.Root>
    </AmbientDirection>
  )
})

/**
 * The raw Base UI Slider parts (`Root`, `Value`, `Control`, `Track`,
 * `Indicator`, `Thumb`), for composing a layout the props-driven `<Slider>`
 * does not cover (vertical orientation, custom marks, more than two thumbs).
 */
export const SliderPrimitive = BaseSlider
