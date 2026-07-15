// SPDX-License-Identifier: MIT

'use client'

import * as React from 'react'

import { type Framework as FrameworkValue, useFramework } from '@/components/use-framework'

/**
 * The global React ⇄ HTML docs preference as a native dropdown, styled to match
 * the theme selector it sits beside. Defaults to React; the choice persists and
 * reshapes every component page (demo, code, Installation / Usage).
 */
export function FrameworkSelect({ className }: { className?: string }): React.JSX.Element {
  const [framework, setFramework] = useFramework()
  return (
    <label className={['docs-framework-select', className].filter(Boolean).join(' ')}>
      <span className="sr-only">Show documentation for</span>
      <select
        value={framework}
        title="Show documentation for React or framework-agnostic HTML"
        onChange={(event) => setFramework(event.target.value === 'html' ? 'html' : 'react')}
      >
        <option value="react">React</option>
        <option value="html">HTML</option>
      </select>
    </label>
  )
}

/**
 * Renders its children only when the active framework matches `only`. Both
 * variants are emitted into the page and toggled with CSS keyed on
 * `:root[data-framework]` (see globals.css), so the swap is instant and
 * flash-free in the static export. `display: contents` keeps the wrapper out
 * of the prose flow so headings, spacing, and the table of contents are
 * unaffected.
 */
export function Framework({
  only,
  children,
}: {
  only: FrameworkValue
  children: React.ReactNode
}): React.JSX.Element {
  return <div data-framework-only={only}>{children}</div>
}
