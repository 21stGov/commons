// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { useFieldControl } from '@/components/ui/context'
import { Link } from '@/components/ui/link'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/cn'

// Minimal ambient typing so the dev-only guard compiles without
// @types/node. Bundlers statically replace `process.env.NODE_ENV`.
declare const process: { env: { NODE_ENV?: string | undefined } } | undefined

/**
 * A language the site is available in.
 *
 * The whole point of an accessible language selector is that **each language
 * is named in its OWN language (its endonym)** — `Español`, not "Spanish";
 * `Tiếng Việt`, not "Vietnamese". A person who only reads Vietnamese must be
 * able to recognise their language, and a translated name defeats that.
 */
export interface Language {
  /**
   * BCP-47 language tag (`en`, `es`, `vi`, `zh`, `ar`, `ru`, …). Drives the
   * `lang` attribute on the option/link (so assistive tech switches
   * pronunciation), the `hreflang` on the link variant, and the value passed
   * to `onLanguageChange`.
   */
  code: string
  /**
   * The language's name written IN THAT LANGUAGE (the endonym), e.g.
   * `English`, `Español`, `Tiếng Việt`, `中文`, `العربية`, `Русский`. Never
   * translate it into the current page language.
   */
  label: string
  /**
   * Optional URL to this site in this language. When present the item renders
   * as a real `<a>` (with `hreflang`), so it works without JavaScript and can
   * be opened in a new tab. Omit it for single-page apps that swap language
   * in place — the item renders as a button and only fires
   * `onLanguageChange`.
   */
  href?: string
}

// Item styling shared by the toggle's links and buttons. Underlined (link-ness
// / affordance is never color-only, WCAG 1.4.1), 44px minimum target, and a
// visible focus ring. The active language is marked non-color-only: heavier
// weight PLUS aria-current, so it stays distinguishable in forced-colors mode
// where the text color is overridden.
export const languageSelectorItemVariants = cva(
  [
    'inline-flex min-h-11 items-center justify-center gap-1 px-2 text-sm',
    'underline underline-offset-2',
    'transition-colors motion-reduce:transition-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    'disabled:cursor-not-allowed disabled:text-disabled-foreground disabled:no-underline',
    'aria-disabled:cursor-not-allowed aria-disabled:text-disabled-foreground aria-disabled:no-underline',
  ],
  {
    variants: {
      active: {
        true: 'font-semibold text-foreground',
        false: 'font-normal text-link hover:text-link-hover',
      },
    },
    defaultVariants: {
      active: false,
    },
  }
)

type ToggleVariant = 'auto' | 'toggle' | 'dropdown'

export interface LanguageSelectorProps
  extends
    Omit<React.HTMLAttributes<HTMLElement>, 'onChange'>,
    VariantProps<typeof languageSelectorItemVariants> {
  /**
   * The languages the site is offered in, each named by its endonym. Order is
   * preserved. Two or fewer render as an inline toggle by default; three or
   * more render as a dropdown (override with `variant`).
   */
  languages: Language[]
  /** The currently active language `code`. Marks that item `aria-current`. */
  value?: string
  /**
   * Fired with the chosen language `code`. The component itself does NOT
   * navigate or set the document language — routing/state is the consumer's
   * job (per the link's `href`, a client router, or a cookie). This keeps the
   * control reusable across SSR sites and SPAs.
   */
  onLanguageChange?: (code: string) => void
  /**
   * Presentation. `auto` (default) picks a toggle for ≤2 languages and a
   * dropdown for 3+. USWDS guidance: place the selector consistently in the
   * site header/utility nav on every page and every language.
   */
  variant?: ToggleVariant
  /**
   * Accessible name for the control, and the visible text beside the globe.
   * Default `"Select language"`. Because a text label in one language may not
   * be understood by a speaker of another, the universal globe icon always
   * accompanies it.
   */
  label?: string
  /**
   * Visually hide the text label (the globe icon stays). The accessible name
   * is preserved. Use in tight headers where the globe alone is the
   * affordance.
   */
  hideLabel?: boolean
  /** Disable the whole control. Inherited from a surrounding `<Field>`. */
  disabled?: boolean
}

/**
 * Globe — the universal, language-agnostic indicator that this control
 * switches languages. Decorative (`aria-hidden`); the accessible name comes
 * from `label`. Sizes with the surrounding text (1em) so it scales with user
 * text enlargement. Non-directional, so it needs no RTL mirror.
 */
function GlobeIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      className="size-[1.15em] shrink-0"
    >
      <circle cx="8" cy="8" r="6.25" />
      <path d="M1.75 8h12.5" strokeLinecap="round" />
      <path
        d="M8 1.75c1.9 1.7 3 4.2 3 6.25s-1.1 4.55-3 6.25c-1.9-1.7-3-4.2-3-6.25s1.1-4.55 3-6.25Z"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * A site language switcher that keeps every choice in its own language and
 * announces it in the right language to assistive tech.
 *
 * Two presentations, one contract:
 * - **Toggle** (≤2 languages): inline links/buttons — the fastest path for a
 *   bilingual site (e.g. `English | Español`). Renders `<nav>` when the
 *   languages carry `href`s (a real set of navigation links) or a labelled
 *   `role="group"` of buttons for in-place switching.
 * - **Dropdown** (3+ languages): the Commons native `Select`, so keyboard,
 *   type-ahead, and the mobile platform picker come for free.
 *
 * Accessibility contract:
 * - Each option/link carries `lang` (and, for links, `hreflang`) set to its
 *   own tag, so a screen reader pronounces `Español` in Spanish and `中文` in
 *   Chinese instead of mangling it in the page language.
 * - The endonym text is rendered `dir="auto"`, so a right-to-left name
 *   (`العربية`) lays out correctly even on an otherwise left-to-right page,
 *   and the control as a whole is safe on RTL pages (logical properties only).
 * - The active language is signalled by weight + `aria-current`, never colour
 *   alone, and every state keeps a visible border for forced-colors mode.
 * - The control always has an accessible name (`label`, default
 *   `"Select language"`) plus a visible globe, since a text label alone may be
 *   in a language the reader does not know.
 *
 * Selecting a language calls `onLanguageChange(code)`; navigation is left to
 * the consumer (WCAG 3.2.2 — a language change should be a user-initiated,
 * clearly-labelled action, which this control is).
 */
export const LanguageSelector = React.forwardRef<HTMLElement, LanguageSelectorProps>(
  function LanguageSelector(
    {
      className,
      languages,
      value,
      onLanguageChange,
      variant = 'auto',
      label = 'Select language',
      hideLabel = false,
      disabled: disabledProp,
      id: idProp,
      ...props
    },
    ref
  ) {
    const field = useFieldControl()
    const generatedId = React.useId()
    const selectId = idProp ?? generatedId

    // Explicit prop wins over the surrounding Field's wiring.
    const disabled = disabledProp ?? field.disabled
    const describedBy = field['aria-describedby']
    const invalid = field['aria-invalid']

    const warnedRef = React.useRef(false)
    // Dev-only guard: a language selector with no languages, or a language
    // missing its code/endonym, is a broken control (no accessible name /
    // pronunciation). Warn loudly in development only.
    React.useEffect(() => {
      if (
        (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') ||
        warnedRef.current
      ) {
        return
      }
      if (languages.length === 0) {
        warnedRef.current = true
        console.warn('[commons] <LanguageSelector> requires at least one language.')
        return
      }
      const broken = languages.find(
        (l) => !l.code || !l.label || l.label.trim() === ''
      )
      if (broken) {
        warnedRef.current = true
        console.warn(
          '[commons] <LanguageSelector> languages must each have a `code` and a ' +
            '`label` (the endonym — the language name in its own language).'
        )
      }
    }, [languages])

    const resolved: 'toggle' | 'dropdown' =
      variant === 'auto' ? (languages.length <= 2 ? 'toggle' : 'dropdown') : variant

    if (resolved === 'dropdown') {
      return (
        <div
          {...props}
          ref={ref as React.Ref<HTMLDivElement>}
          data-slot="language-selector"
          data-variant="dropdown"
          className={cn('flex flex-col gap-1', className)}
        >
          {/* Visible globe + label. htmlFor makes the visible label a click
              target for the select; aria-label (same string) is the belt-and-
              suspenders accessible name the brief calls for, and matches the
              visible text so WCAG 2.5.3 (label in name) holds. */}
          <label
            htmlFor={selectId}
            data-slot="language-selector-label"
            className="inline-flex items-center gap-1 text-sm font-medium text-foreground"
          >
            <GlobeIcon />
            <span className={hideLabel ? 'sr-only' : undefined}>{label}</span>
          </label>
          <Select
            id={selectId}
            aria-label={label}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            disabled={disabled}
            value={value}
            data-slot="language-selector-select"
            onChange={(event) => onLanguageChange?.(event.currentTarget.value)}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code} lang={lang.code}>
                {lang.label}
              </option>
            ))}
          </Select>
        </div>
      )
    }

    // Toggle variant. Links when any language carries an href (a real set of
    // navigation links → <nav>), otherwise buttons for in-place switching
    // (→ labelled role="group").
    const hasLinks = languages.some((lang) => lang.href !== undefined)
    const Container = hasLinks ? 'nav' : 'div'

    const items = languages.map((lang) => {
      const active = value !== undefined && lang.code === value
      const itemClass = languageSelectorItemVariants({ active })
      // dir="auto" lets a right-to-left endonym (العربية) render correctly on
      // an LTR page and vice-versa, without forcing a direction on the label.
      const text = (
        <span dir="auto" lang={lang.code}>
          {lang.label}
        </span>
      )

      if (lang.href !== undefined && !disabled) {
        return (
          <li key={lang.code} role="listitem">
            <Link
              href={lang.href}
              hrefLang={lang.code}
              lang={lang.code}
              variant="subtle"
              data-slot="language-selector-item"
              aria-current={active ? 'true' : undefined}
              className={itemClass}
              onClick={() => onLanguageChange?.(lang.code)}
            >
              {text}
            </Link>
          </li>
        )
      }

      return (
        <li key={lang.code} role="listitem">
          <button
            type="button"
            lang={lang.code}
            data-slot="language-selector-item"
            aria-current={active ? 'true' : undefined}
            disabled={disabled}
            className={itemClass}
            onClick={() => onLanguageChange?.(lang.code)}
          >
            {text}
          </button>
        </li>
      )
    })

    return (
      <Container
        {...props}
        ref={ref as React.Ref<HTMLDivElement & HTMLElement>}
        data-slot="language-selector"
        data-variant="toggle"
        // A labelled landmark/group so screen-reader users can find and
        // understand the control. Border keeps it visible in forced-colors.
        role={hasLinks ? undefined : 'group'}
        aria-label={label}
        className={cn(
          'inline-flex items-stretch rounded-sm border border-border text-foreground',
          className
        )}
      >
        {/* Visible globe. Decorative: the group's aria-label names the
            control. A text label would repeat inside the toggle, so the
            universal globe is the affordance here. */}
        <span
          data-slot="language-selector-globe"
          aria-hidden="true"
          className="flex items-center ps-2 pe-1 text-muted-foreground"
        >
          <GlobeIcon />
        </span>
        {/* Divider between items is a logical inline-start border so it mirrors
            in RTL automatically. */}
        <ul
          role="list"
          data-slot="language-selector-list"
          className="flex items-stretch [&>li+li]:border-s [&>li+li]:border-border"
        >
          {items}
        </ul>
      </Container>
    )
  }
)
