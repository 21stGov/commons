// SPDX-License-Identifier: MIT

'use client'

import { Toggle } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

function BoldIcon(): React.JSX.Element {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M4.5 2.5h4a3 3 0 0 1 1.7 5.46A3.25 3.25 0 0 1 9 13.5H4.5V2.5Zm2 2v2.5H8a1.25 1.25 0 0 0 0-2.5H6.5Zm0 4.5V11H9a1.25 1.25 0 0 0 0-2.5H6.5Z" />
    </svg>
  )
}

export default function ToggleDemo(): React.JSX.Element {
  const [pinned, setPinned] = React.useState(false)

  return (
    <DemoStack>
      <DemoSection title="States">
        <div className="flex flex-wrap items-center gap-2">
          <Toggle>Show map</Toggle>
          <Toggle defaultPressed>Show map (on)</Toggle>
          <Toggle disabled>Disabled</Toggle>
          <Toggle disabled defaultPressed>
            Disabled and on
          </Toggle>
        </div>
      </DemoSection>

      <DemoSection title="Variants">
        <div className="flex flex-wrap items-center gap-2">
          <Toggle variant="outline">Outline</Toggle>
          <Toggle variant="outline" defaultPressed>
            Outline (on)
          </Toggle>
          <Toggle variant="ghost">Ghost</Toggle>
          <Toggle variant="ghost" defaultPressed>
            Ghost (on)
          </Toggle>
        </div>
      </DemoSection>

      <DemoSection title="Icon-only (accessible name + tooltip)">
        <Toggle variant="ghost" aria-label="Bold" title="Bold">
          <BoldIcon />
        </Toggle>
      </DemoSection>

      <DemoSection title="Controlled">
        <div className="flex flex-col gap-2">
          <Toggle pressed={pinned} onPressedChange={setPinned}>
            Pin to top
          </Toggle>
          <p className="text-sm text-muted-foreground">
            This item is {pinned ? 'pinned' : 'not pinned'}.
          </p>
        </div>
      </DemoSection>
    </DemoStack>
  )
}
