// SPDX-License-Identifier: MIT

import * as React from 'react'

import { Field, GovBanner, Link, Select } from '@21stgov/commons-react'

// ---------------------------------------------------------------------------
// Demo discovery
// ---------------------------------------------------------------------------

/** Shape every `./demos/*.demo.tsx` module must export. */
interface DemoModule {
  /** Section heading shown in the anchor nav and above the demo. */
  title: string
  /** The demo component itself. */
  default: React.ComponentType
}

const demoModules = import.meta.glob<DemoModule>('./demos/*.demo.tsx', {
  eager: true,
})

const demos = Object.entries(demoModules)
  .map(([path, mod]) => {
    const slug = path.replace('./demos/', '').replace('.demo.tsx', '')
    return { slug, title: mod.title ?? slug, Demo: mod.default }
  })
  .sort((a, b) => a.title.localeCompare(b.title, 'en'))

// ---------------------------------------------------------------------------
// Display preferences (theme / direction / text size)
// ---------------------------------------------------------------------------

interface PreferenceOption {
  value: string
  label: string
}

const THEME_OPTIONS: readonly PreferenceOption[] = [
  { value: 'auto', label: 'Auto (system)' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'high-contrast', label: 'High contrast' },
]

const DIRECTION_OPTIONS: readonly PreferenceOption[] = [
  { value: 'ltr', label: 'Left to right (LTR)' },
  { value: 'rtl', label: 'Right to left (RTL)' },
]

const FONT_SCALE_OPTIONS: readonly PreferenceOption[] = [
  { value: '100', label: '100% (default)' },
  { value: '125', label: '125%' },
  { value: '150', label: '150%' },
  { value: '200', label: '200%' },
]

function applyTheme(theme: string): void {
  const root = document.documentElement
  if (theme === 'auto') {
    // The token CSS keys its prefers-color-scheme / prefers-contrast
    // fallbacks on :root:not([data-theme]) — removing the attribute hands
    // control back to the operating system.
    root.removeAttribute('data-theme')
    root.style.removeProperty('color-scheme')
    return
  }
  root.setAttribute('data-theme', theme)
  // Keep native widgets (select popups, scrollbars) in step with the forced
  // theme. The high-contrast theme is black-on-white, i.e. a light scheme.
  root.style.colorScheme = theme === 'dark' ? 'dark' : 'light'
}

function applyDirection(direction: string): void {
  document.documentElement.dir = direction
}

function applyFontScale(scale: string): void {
  // Commons type is rem-only, so scaling the root font-size scales the whole
  // system — exactly what a user raising their browser font size gets.
  document.documentElement.style.fontSize = `${scale}%`
}

/**
 * A persisted display preference: applies `apply(value)` to the document on
 * mount and on every change, and round-trips the value through localStorage.
 */
function usePreference(
  key: string,
  options: readonly PreferenceOption[],
  fallback: string,
  apply: (value: string) => void
): [string, (next: string) => void] {
  const [value, setValue] = React.useState<string>(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored !== null && options.some((o) => o.value === stored) ? stored : fallback
    } catch {
      return fallback
    }
  })

  React.useEffect(() => {
    apply(value)
    try {
      window.localStorage.setItem(key, value)
    } catch {
      // Storage can be unavailable (e.g. private browsing); the preference
      // still applies for this session, it just will not persist.
    }
  }, [key, value, apply])

  return [value, setValue]
}

interface PreferenceSelectProps {
  label: string
  value: string
  options: readonly PreferenceOption[]
  onChange: (next: string) => void
}

function PreferenceSelect({
  label,
  value,
  options,
  onChange,
}: PreferenceSelectProps): React.JSX.Element {
  return (
    <Field label={label} className="min-w-0 basis-48 grow sm:grow-0">
      <Select size="sm" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </Field>
  )
}

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------

export default function App(): React.JSX.Element {
  const [theme, setTheme] = usePreference(
    'commons-playground:theme',
    THEME_OPTIONS,
    'auto',
    applyTheme
  )
  const [direction, setDirection] = usePreference(
    'commons-playground:direction',
    DIRECTION_OPTIONS,
    'ltr',
    applyDirection
  )
  const [fontScale, setFontScale] = usePreference(
    'commons-playground:font-scale',
    FONT_SCALE_OPTIONS,
    '100',
    applyFontScale
  )

  return (
    <>
      <a className="cui-skip-link" href="#main">
        Skip to main content
      </a>

      {/* Production position: the banner is the first landmark on the page,
          exactly where a real government site renders it. */}
      <GovBanner />

      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-2 py-2">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h1 className="text-xl font-bold">Commons playground</h1>
            <p className="text-sm text-muted-foreground">
              the accessibility-first design system by{' '}
              <Link href="https://commonsui.com" external>
                21st Gov
              </Link>
            </p>
          </div>

          <div role="group" aria-label="Display preferences" className="flex flex-wrap gap-2">
            <PreferenceSelect
              label="Theme"
              value={theme}
              options={THEME_OPTIONS}
              onChange={setTheme}
            />
            <PreferenceSelect
              label="Direction"
              value={direction}
              options={DIRECTION_OPTIONS}
              onChange={setDirection}
            />
            <PreferenceSelect
              label="Text size"
              value={fontScale}
              options={FONT_SCALE_OPTIONS}
              onChange={setFontScale}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-2 py-3 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start lg:gap-3">
        <nav aria-label="Components" className="flex flex-col gap-1 lg:sticky lg:top-2">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Components
          </h2>
          <ul className="flex flex-wrap gap-x-2 lg:flex-col lg:gap-x-0">
            {demos.map(({ slug, title }) => (
              <li key={slug}>
                <Link href={`#demo-${slug}`} className="flex min-h-11 items-center">
                  {title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* No DirectionProvider needed: every Commons Base UI component now
            self-detects the resolved DOM direction (via AmbientDirection), so
            they follow `applyDirection`'s `<html dir>` toggle standalone, just
            like the native components. */}
        <main id="main" tabIndex={-1} className="flex min-w-0 flex-col gap-3">
          {demos.map(({ slug, title, Demo }) => (
            <section
              key={slug}
              id={`demo-${slug}`}
              aria-labelledby={`demo-${slug}-heading`}
              className="flex scroll-mt-2 flex-col gap-2 rounded-lg border border-border p-2 sm:p-3"
            >
              <h2
                id={`demo-${slug}-heading`}
                className="border-b border-border pb-1 text-lg font-semibold"
              >
                {title}
              </h2>
              <Demo />
            </section>
          ))}
        </main>
      </div>

      <footer className="border-t border-border">
        <div className="mx-auto w-full max-w-6xl px-2 py-2 text-sm text-muted-foreground">
          <p>
            Built with Commons — MIT licensed. Try the theme, direction, and text-size controls
            above: every component follows along.
          </p>
        </div>
      </footer>
    </>
  )
}
