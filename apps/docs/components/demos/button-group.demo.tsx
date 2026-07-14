// SPDX-License-Identifier: MIT

'use client'

import { Button, ButtonGroup } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

function ChevronIcon(): React.JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default function ButtonGroupDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Segmented (horizontal)">
        <ButtonGroup aria-label="Text formatting">
          <Button variant="outline">Bold</Button>
          <Button variant="outline">Italic</Button>
          <Button variant="outline">Underline</Button>
        </ButtonGroup>
      </DemoSection>

      <DemoSection title="Vertical">
        <ButtonGroup aria-label="View options" orientation="vertical">
          <Button variant="outline">List view</Button>
          <Button variant="outline">Grid view</Button>
          <Button variant="outline">Map view</Button>
        </ButtonGroup>
      </DemoSection>

      <DemoSection title="Split button">
        <ButtonGroup aria-label="Save options">
          <Button variant="primary">Save</Button>
          <Button variant="primary" aria-label="More save options">
            <ChevronIcon />
          </Button>
        </ButtonGroup>
      </DemoSection>
    </DemoStack>
  )
}
