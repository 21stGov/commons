// SPDX-License-Identifier: MIT

'use client'

import * as React from 'react'

import { FrameworkSelect } from '@/components/framework'
import { ThemeSelect } from '@/components/theme-select'

/**
 * The docs' global viewing preferences: the React ⇄ HTML framework selector
 * stacked above the theme selector. Slotted into fumadocs' `themeSwitch` so it
 * renders in the same place on desktop (sticky sidebar footer) and mobile (nav)
 * without per-page markup.
 */
export function DocsPreferences({ className }: { className?: string }): React.JSX.Element {
  return (
    <div className="docs-preferences">
      <FrameworkSelect />
      <ThemeSelect className={className} />
    </div>
  )
}
