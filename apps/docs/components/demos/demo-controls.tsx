// SPDX-License-Identifier: MIT

'use client'

import * as React from 'react'

/** Reusable, accessible prop controls for live component examples. */
export function DemoControls({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <fieldset className="grid gap-2 rounded-md border border-border bg-muted p-2 sm:grid-cols-2">
      <legend className="px-1 text-sm font-semibold">Try the props</legend>
      {children}
    </fieldset>
  )
}

export function DemoTextControl({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}): React.JSX.Element {
  const id = React.useId()

  return (
    <label htmlFor={id} className="flex min-w-0 flex-col gap-1 text-sm font-medium">
      {label}
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        className="min-h-11 min-w-0 rounded-sm border border-border bg-background px-2 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />
    </label>
  )
}

export function DemoSelectControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: ReadonlyArray<{ label: string; value: T }>
  onChange: (value: T) => void
}): React.JSX.Element {
  const id = React.useId()

  return (
    <label htmlFor={id} className="flex min-w-0 flex-col gap-1 text-sm font-medium">
      {label}
      <span className="relative min-w-0">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.currentTarget.value as T)}
          className="min-h-11 w-full min-w-0 appearance-none rounded-sm border border-border bg-background ps-2 pe-6 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="pointer-events-none absolute end-2 top-1/2 size-2 -translate-y-1/2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m4 6 4 4 4-4" />
        </svg>
      </span>
    </label>
  )
}

export function DemoToggleControl({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}): React.JSX.Element {
  return (
    <label className="flex min-h-11 items-center gap-1 self-end rounded-sm px-1 text-sm font-medium">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.currentTarget.checked)}
        className="size-2 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />
      {label}
    </label>
  )
}
