// SPDX-License-Identifier: MIT

'use client'

import { Progress } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function ProgressDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Determinate">
        <div className="flex flex-col gap-3">
          <Progress label="Uploading files" value={40} showValue />
          <Progress label="Processing records" value={72} showValue />
          <Progress label="Almost done" value={100} showValue />
        </div>
      </DemoSection>

      <DemoSection title="Custom max and template">
        <Progress
          label="Step"
          value={2}
          max={4}
          valueTemplate="Step {value} of {max}"
          showValue
        />
      </DemoSection>

      <DemoSection title="Indeterminate">
        <Progress label="Contacting server" value={null} showValue />
      </DemoSection>
    </DemoStack>
  )
}
