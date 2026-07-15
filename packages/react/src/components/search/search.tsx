// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

'use client'

import { Autocomplete } from '@base-ui/react/autocomplete'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Input, inputVariants } from '@/components/ui/input'
import { AmbientDirection } from '@/lib/ambient-direction'
import { cn } from '@/lib/cn'

/**
 * The `<form role="search">` landmark itself. Only layout/width lives here; the
 * bordered field is styled by `inputVariants` + `groupBoxClasses` below.
 * `width="auto"` shrinks the form to its content for a compact header search;
 * `width="full"` (default) fills its container for a page/hero search.
 */
export const searchVariants = cva('block', {
  variants: {
    width: {
      full: 'w-full',
      auto: 'inline-block w-auto',
    },
  },
  defaultVariants: {
    width: 'full',
  },
})

// One bordered box wrapping the leading icon + input + clear + submit so they
// read as a SINGLE control. It reuses `inputVariants` (border, background,
// forced-colors boundary, error tokens via data-invalid, disabled tokens via
// data-disabled) exactly like the Input adornment group.
//
// Focus ring — the whole group shows ONE ring, and only when the text input is
// focused:
//   - `focus-within:outline-0` cancels the ring `inputVariants` bakes in, so a
//     focused submit/clear BUTTON does not light up the entire group (each
//     button keeps its own focus-visible ring).
//   - `has-[[data-slot=input]:focus]:outline-*` re-adds the ring, scoped to the
//     input, so tabbing into the text field rings the whole control.
const groupBoxClasses = cn(
  'flex items-stretch gap-0 p-0',
  'focus-within:outline-0',
  'has-[[data-slot=input]:focus]:outline-2 has-[[data-slot=input]:focus]:outline-offset-2 has-[[data-slot=input]:focus]:outline-ring'
)

// The text input, stripped of its own box so the GROUP owns the border,
// background, focus ring, and state styling. State attributes still land on the
// real <input> (that is where assistive tech reads aria-invalid / disabled),
// but their visual treatment is neutralized here and re-applied on the wrapper.
// `-webkit-search-cancel-button` is hidden because we render our own Clear
// control (a single, keyboard-reachable, 44px target instead of the tiny,
// inconsistent native affordance).
const bareInputClasses = cn(
  'min-h-11 w-full min-w-0 flex-1 self-stretch ps-1',
  'rounded-none border-0 bg-transparent p-0 shadow-none',
  'text-base text-foreground placeholder:text-muted-foreground',
  'outline-none focus-within:outline-0 focus-visible:outline-0',
  'aria-invalid:border-0 aria-invalid:ring-0',
  'disabled:cursor-not-allowed disabled:border-0 disabled:bg-transparent disabled:shadow-none',
  '[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none'
)

// Leading magnifier: decorative (aria-hidden by default via <Icon>), never
// interactive, so the whole field stays one target. currentColor keeps it
// visible in forced-colors mode.
const leadingIconClasses =
  'flex shrink-0 select-none items-center ps-105 pe-05 text-muted-foreground'

// The filtered suggestions surface. Capped and scrollable so a long list stays
// usable at 400% zoom / reflow; a real border keeps a boundary in forced-colors
// mode. Mirrors the Combo Box popup so autocomplete search matches Select/Combo.
const popupClasses = cn(
  'w-[var(--anchor-width)] min-w-[12rem] rounded-sm border border-border',
  'bg-background p-1 text-foreground shadow-3',
  '[max-block-size:min(20rem,var(--available-height))] overflow-y-auto overscroll-contain',
  'motion-safe:transition-[opacity,scale] motion-safe:duration-150 motion-safe:ease-standard',
  'motion-safe:data-starting-style:opacity-0 motion-safe:data-starting-style:scale-95',
  'motion-safe:data-ending-style:opacity-0 motion-safe:data-ending-style:scale-95'
)

// One suggestion row. Highlight (keyboard/pointer) is never color alone
// (WCAG 1.4.1): `data-highlighted` adds a muted fill AND bumps to font-medium.
const itemClasses = cn(
  'flex min-h-11 cursor-default select-none items-center gap-2 rounded-sm px-2 text-sm text-foreground',
  'outline-none data-highlighted:bg-muted data-highlighted:font-medium'
)

export interface SearchProps
  extends VariantProps<typeof searchVariants>,
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      'prefix' | 'size' | 'type' | 'value' | 'defaultValue' | 'onChange' | 'width'
    > {
  /**
   * URL the form submits to. Set it for progressive enhancement — with an
   * `action` the browser performs a native GET/POST navigation so search works
   * with JavaScript disabled; `onSearch` still runs when JS is present. With no
   * `action`, submission is handled entirely in JS.
   */
  action?: string
  /** HTTP method for the native form submission. @default "get" */
  method?: 'get' | 'post'
  /**
   * Accessible name for the text input. Rendered as a real `<label>` that is
   * visually hidden by default (a search field beside a labelled submit button
   * rarely needs a visible caption). Translation-ready. @default "Search"
   */
  label?: React.ReactNode
  /**
   * Visible text of the submit button — and, when `iconSubmit` is set, its
   * accessible name. Translation-ready. @default "Search"
   */
  submitLabel?: string
  /**
   * Render the submit button as an icon-only magnifier (with `submitLabel` as
   * its accessible name) and drop the leading icon, for a compact header
   * search. @default false
   */
  iconSubmit?: boolean
  /**
   * Accessible name for the clear (×) button, shown once the field has text.
   * Translation-ready. @default "Clear search"
   */
  clearLabel?: string
  /**
   * Form field name submitted with the query, so the field works as a plain
   * GET form with no JavaScript. @default "q"
   */
  name?: string
  /** Controlled query text. Pair with `onValueChange`. */
  value?: string
  /** Initial query for uncontrolled usage. */
  defaultValue?: string
  /** Called on every keystroke with the new query text. */
  onValueChange?: (value: string) => void
  /**
   * Called when the search is submitted (Enter, the submit button, or — in the
   * autocomplete variant — choosing a suggestion) with the current query.
   *
   * Progressive enhancement: if you also pass `action`, the browser performs
   * its native form submission (a real GET/POST navigation) so search works
   * with JavaScript disabled, and `onSearch` runs alongside it. With no
   * `action`, submission is handled entirely in JS and the default navigation
   * is prevented.
   */
  onSearch?: (query: string) => void
  /**
   * Suggestions that upgrade the plain form into an autocomplete combobox: the
   * input gains `role="combobox"` with `aria-expanded` / `aria-activedescendant`
   * over a `listbox`, arrow keys move a highlight, and a no-results message is
   * shown when nothing matches. Autocomplete is a strict ENHANCEMENT — with no
   * `suggestions` the field stays a simple, robust search form, and typing any
   * free-text query and submitting always works whether or not it matches a
   * suggestion.
   */
  suggestions?: readonly string[]
  /**
   * Message shown in the suggestions popup when the query matches nothing.
   * Only rendered in the autocomplete variant. Translation-ready.
   * @default "No suggestions"
   */
  noResultsText?: string
  /** Extra classes for the `<form>` landmark. */
  className?: string
  /** Extra classes for the bordered field box. */
  fieldClassName?: string
}

function useMergedRef<T>(
  external: React.Ref<T> | undefined,
  internal: React.MutableRefObject<T | null>
): (node: T | null) => void {
  return React.useCallback(
    (node: T | null) => {
      internal.current = node
      if (typeof external === 'function') {
        external(node)
      } else if (external) {
        ;(external as React.MutableRefObject<T | null>).current = node
      }
    },
    [external, internal]
  )
}

/**
 * A site-search landmark: a `<form role="search">` wrapping a labelled
 * `type="search"` input with a leading magnifier and a submit button, styled as
 * one bordered control (a single border and a single focus ring on the input,
 * exactly like the Input adornment group). A clear (×) button appears once the
 * field has text.
 *
 * It is keyboard- and no-JS-friendly by construction: the input has a real
 * (visually hidden) `<label>`, the submit button has an accessible name, Enter
 * submits, and — with an `action` — the form performs a native GET/POST so
 * search works with scripting disabled. `onSearch(query)` handles the scripted
 * path.
 *
 * Pass `suggestions` to upgrade to a Base UI Autocomplete combobox (a listbox
 * with `aria-activedescendant` highlight tracking and a no-results boundary).
 * That autocomplete is an ENHANCEMENT layered on top of the same form: the
 * plain, no-suggestions variant is a simple search form, and a free-text query
 * can always be submitted whether or not it matches a suggestion.
 *
 * Logical properties keep the magnifier at the inline-start and the submit at
 * the inline-end, mirroring under `dir="rtl"`; the Base UI combobox is wrapped
 * in `<AmbientDirection>` so its portalled popup flips too. A real border is
 * kept in every state so forced-colors mode always paints a boundary.
 */
export const Search = React.forwardRef<HTMLInputElement, SearchProps>(function Search(
  {
    label = 'Search',
    submitLabel = 'Search',
    iconSubmit = false,
    clearLabel = 'Clear search',
    name = 'q',
    value,
    defaultValue,
    onValueChange,
    onSearch,
    suggestions,
    noResultsText = 'No suggestions',
    width,
    className,
    fieldClassName,
    id: idProp,
    placeholder,
    disabled,
    required,
    action,
    method = 'get',
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...inputProps
  },
  ref
) {
  const generatedId = React.useId()
  const inputId = idProp ?? generatedId

  const isControlled = value !== undefined
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? '')
  const query = isControlled ? (value ?? '') : uncontrolled

  const setQuery = React.useCallback(
    (next: string) => {
      if (!isControlled) {
        setUncontrolled(next)
      }
      onValueChange?.(next)
    },
    [isControlled, onValueChange]
  )

  const innerRef = React.useRef<HTMLInputElement | null>(null)
  const setInputRef = useMergedRef(ref, innerRef)

  const hasText = query.length > 0
  const showClear = hasText && !disabled
  const invalid = ariaInvalid === true || ariaInvalid === 'true'
  const autocomplete = suggestions != null

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    onSearch?.(query)
    // With a server `action`, allow the native navigation (works without JS);
    // otherwise this is a scripted-only search, so cancel the no-op submit.
    if (action == null) {
      event.preventDefault()
    }
  }

  const handleClear = () => {
    setQuery('')
    innerRef.current?.focus()
  }

  // Clicking the padding or the decorative magnifier focuses the input instead
  // of swallowing the click — but never intercept a real interactive control.
  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.closest('button, a, input, textarea, select, [contenteditable="true"]')) {
      return
    }
    event.preventDefault()
    innerRef.current?.focus()
  }

  const describedBy = ariaDescribedBy
  const showLeadingIcon = !iconSubmit

  const leadingIcon = showLeadingIcon ? (
    <span aria-hidden="true" data-slot="search-icon" className={leadingIconClasses}>
      <Icon name="search" className="size-2" />
    </span>
  ) : null

  const clearButton = showClear ? (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleClear}
      data-slot="search-clear"
      aria-label={clearLabel}
      className="h-full min-w-11 shrink-0 rounded-none border-0 text-muted-foreground"
    >
      <Icon name="x" className="size-2" />
    </Button>
  ) : null

  const submitButton = (
    <Button
      type="submit"
      variant="primary"
      size="sm"
      disabled={disabled}
      data-slot="search-submit"
      aria-label={iconSubmit ? submitLabel : undefined}
      // rounded-e-sm conforms the trailing corners to the field's own radius
      // (no overflow-hidden, so the button keeps its full focus-visible ring).
      className="h-full shrink-0 rounded-none rounded-e-sm border-0"
    >
      {iconSubmit ? <Icon name="search" className="size-2" /> : submitLabel}
    </Button>
  )

  const label_ = (
    <label htmlFor={inputId} data-slot="search-label" className="sr-only">
      {label}
    </label>
  )

  if (autocomplete) {
    // AmbientDirection makes the combobox (and its portalled popup, since React
    // context crosses portals) follow the DOM `dir` like the native parts.
    return (
      <AmbientDirection>
        <Autocomplete.Root
          items={suggestions}
          value={query}
          onValueChange={(next) => setQuery(next)}
          disabled={disabled}
          submitOnItemClick
        >
          <form
            role="search"
            action={action}
            method={method}
            onSubmit={handleSubmit}
            data-slot="search"
            className={cn(searchVariants({ width }), className)}
          >
            {label_}
            <div
              data-slot="search-field"
              data-invalid={invalid || undefined}
              data-disabled={disabled || undefined}
              onMouseDown={handleMouseDown}
              className={cn(inputVariants(), groupBoxClasses, fieldClassName)}
            >
              {leadingIcon}
              <Autocomplete.Input
                {...inputProps}
                ref={setInputRef}
                id={inputId}
                name={name}
                type="search"
                enterKeyHint="search"
                autoComplete="off"
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                aria-describedby={describedBy}
                aria-invalid={invalid ? true : undefined}
                // Distinct slot: this bare inner control sits inside the search
                // box wrapper, so sharing `data-slot="input"` would emit a
                // border-zeroing `.cui-input` that clobbers standalone inputs.
                data-slot="input-control"
                className={bareInputClasses}
              />
              {clearButton}
              {submitButton}
            </div>

            <Autocomplete.Portal>
              <Autocomplete.Positioner sideOffset={4} className="z-50">
                <Autocomplete.Popup data-slot="search-popup" className={popupClasses}>
                  <Autocomplete.Empty
                    data-slot="search-empty"
                    className="px-2 py-105 text-sm text-muted-foreground"
                  >
                    {noResultsText}
                  </Autocomplete.Empty>
                  <Autocomplete.List data-slot="search-list">
                    {(item: string) => (
                      <Autocomplete.Item
                        key={item}
                        value={item}
                        data-slot="search-item"
                        className={itemClasses}
                      >
                        {item}
                      </Autocomplete.Item>
                    )}
                  </Autocomplete.List>
                </Autocomplete.Popup>
              </Autocomplete.Positioner>
            </Autocomplete.Portal>
          </form>
        </Autocomplete.Root>
      </AmbientDirection>
    )
  }

  // Plain variant: a simple, robust search form — no combobox, no popup.
  return (
    <form
      role="search"
      action={action}
      method={method}
      onSubmit={handleSubmit}
      data-slot="search"
      className={cn(searchVariants({ width }), className)}
    >
      {label_}
      <div
        data-slot="search-field"
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
        onMouseDown={handleMouseDown}
        className={cn(inputVariants(), groupBoxClasses, fieldClassName)}
      >
        {leadingIcon}
        <Input
          {...inputProps}
          ref={setInputRef}
          id={inputId}
          name={name}
          type="search"
          enterKeyHint="search"
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-describedby={describedBy}
          aria-invalid={invalid ? true : undefined}
          className={bareInputClasses}
        />
        {clearButton}
        {submitButton}
      </div>
    </form>
  )
})
