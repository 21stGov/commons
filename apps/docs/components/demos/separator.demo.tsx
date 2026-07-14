// SPDX-License-Identifier: MIT

'use client'

import { Separator } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function SeparatorDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Horizontal (role=separator)">
        <div className="max-w-prose">
          <p>Public records</p>
          <Separator />
          <p>Submit a request</p>
        </div>
      </DemoSection>

      <DemoSection title="Vertical, decorative">
        <div className="flex h-6 items-center gap-3">
          <a href="/about">About</a>
          <Separator orientation="vertical" decorative />
          <a href="/contact">Contact</a>
          <Separator orientation="vertical" decorative />
          <a href="/help">Help</a>
        </div>
      </DemoSection>
    </DemoStack>
  )
}
