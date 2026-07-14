// SPDX-License-Identifier: MIT

'use client'

import { SummaryBox } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function SummaryBoxDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="What you'll need">
        <SummaryBox heading="What you'll need">
          <ul>
            <li>A valid, government-issued photo ID</li>
            <li>Proof of residency dated within the last 90 days</li>
            <li>Your application or case number</li>
            <li>
              A completed <a href="/forms/w9">W-9 form</a>
            </li>
          </ul>
        </SummaryBox>
      </DemoSection>
    </DemoStack>
  )
}
