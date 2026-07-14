// SPDX-License-Identifier: MIT

'use client'

import { useTheme } from 'next-themes'
import * as React from 'react'

const options = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'high-contrast', label: 'High contrast' },
] as const

type ThemeValue = (typeof options)[number]['value']

/** Explicit native theme chooser including high contrast. */
export function ThemeSelect({ className }: { className?: string }): React.JSX.Element {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  const current = mounted ? (theme ?? 'system') : 'system'
  const currentIndex = options.findIndex((option) => option.value === current)
  const next = options[(currentIndex + 1) % options.length] ?? options[0]

  return (
    <>
      <label className={['docs-theme-select', className].filter(Boolean).join(' ')}>
        <span className="sr-only">Theme</span>
        <select value={current} onChange={(event) => setTheme(event.target.value)}>
          {options.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="docs-theme-cycle"
        aria-label={`Theme: ${labelFor(current)}. Use ${next.label}.`}
        title={`Theme: ${labelFor(current)}`}
        onClick={() => setTheme(next.value)}
      >
        <ThemeIcon theme={current as ThemeValue} />
      </button>
    </>
  )
}

function labelFor(value: string): string {
  return options.find((option) => option.value === value)?.label ?? 'System'
}

function ThemeIcon({ theme }: { theme: ThemeValue }): React.JSX.Element {
  if (theme === 'light') {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="3.25" stroke="currentColor" />
        <path
          d="M10 1.75v2M10 16.25v2M1.75 10h2M16.25 10h2M4.17 4.17l1.42 1.42M14.41 14.41l1.42 1.42M15.83 4.17l-1.42 1.42M5.59 14.41l-1.42 1.42"
          stroke="currentColor"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  if (theme === 'dark') {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
        <path
          d="M16.5 12.75A7 7 0 0 1 7.25 3.5 7 7 0 1 0 16.5 12.75Z"
          stroke="currentColor"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (theme === 'high-contrast') {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="currentColor" />
        <path d="M10 3a7 7 0 0 1 0 14V3Z" fill="currentColor" />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <rect x="2.5" y="3.5" width="15" height="10.5" rx="1.5" stroke="currentColor" />
      <path d="M7 17h6M10 14v3" stroke="currentColor" strokeLinecap="round" />
    </svg>
  )
}
