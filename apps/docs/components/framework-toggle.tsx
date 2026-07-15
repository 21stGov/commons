// SPDX-License-Identifier: MIT

'use client'

import * as React from 'react'

import { type Framework, useFramework } from '@/components/use-framework'

const OPTIONS: { value: Framework; label: string; hint: string }[] = [
  { value: 'react', label: 'React', hint: 'Install with the CLI; use the React components.' },
  { value: 'html', label: 'HTML', hint: 'Use commons.css + commons-js in any stack.' },
]

/**
 * Page-wide React ⇄ HTML preference control. Sits near the top of each
 * component page; flipping it reshapes the demo, its code, and the
 * Installation / Usage sections for the reader's stack.
 */
export function FrameworkToggle(): React.JSX.Element {
  const [framework, setFramework] = useFramework()
  return (
    <div
      className="docs-framework-toggle not-prose"
      role="group"
      aria-label="Documentation for framework"
    >
      <span className="docs-framework-toggle-label" aria-hidden="true">
        Show for
      </span>
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={framework === option.value}
          title={option.hint}
          onClick={() => setFramework(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
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
  only: Framework
  children: React.ReactNode
}): React.JSX.Element {
  return <div data-framework-only={only}>{children}</div>
}
