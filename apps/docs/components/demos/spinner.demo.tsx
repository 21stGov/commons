// SPDX-License-Identifier: MIT

'use client'

import { Button, Spinner } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function SpinnerDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Sizes">
        <div className="flex items-center gap-4">
          <Spinner size="sm" label="Loading (small)" />
          <Spinner size="md" label="Loading (medium)" />
          <Spinner size="lg" label="Loading (large)" />
        </div>
      </DemoSection>

      <DemoSection title="Inline with text (decorative)">
        <p className="flex items-center gap-2 text-sm">
          <Spinner size="sm" decorative />
          Saving your changes…
        </p>
      </DemoSection>

      <DemoSection title="Inside a button (decorative)">
        <Button aria-busy>
          <Spinner size="sm" decorative />
          Submitting…
        </Button>
      </DemoSection>
    </DemoStack>
  )
}
