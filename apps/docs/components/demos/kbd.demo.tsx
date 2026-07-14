// SPDX-License-Identifier: MIT

'use client'

import { Kbd, KbdGroup } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function KbdDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Single keys">
        <div className="flex flex-wrap items-center gap-2">
          <Kbd>K</Kbd>
          <Kbd>Enter</Kbd>
          <Kbd token="esc" />
          <Kbd token="tab" />
          <Kbd size="sm">F5</Kbd>
        </div>
      </DemoSection>

      <DemoSection title="A shortcut, adaptive to the visitor's platform">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground">Open quick switcher</span>
            <KbdGroup keys={['mod', 'K']} />
          </div>
          <p className="text-sm text-muted-foreground">
            Renders ⌘K on macOS and Ctrl+K everywhere else — token="mod" adapts automatically,
            and both the glyph and the announced name (e.g. "Command K") change with it.
          </p>
        </div>
      </DemoSection>

      <DemoSection title="Composed manually, with a custom separator">
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground">Move to next field</span>
          <KbdGroup separator="then" aria-label="Shift then Tab">
            <Kbd token="shift" />
            <Kbd token="tab" />
          </KbdGroup>
        </div>
      </DemoSection>

      <DemoSection title="Platform-specific keys">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground">Mac Command key, always literal</span>
            <Kbd token="cmd" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground">Option / Alt</span>
            <Kbd token="alt" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground">Delete / Backspace</span>
            <Kbd token="backspace" />
          </div>
        </div>
      </DemoSection>
    </DemoStack>
  )
}
