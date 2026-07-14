// SPDX-License-Identifier: MIT

'use client'

import { ComboBox, type ComboBoxItem, Field } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

const US_STATES: ComboBoxItem[] = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'NY', label: 'New York' },
  { value: 'TX', label: 'Texas' },
  { value: 'WA', label: 'Washington' },
]

export default function ComboBoxDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Filter a long list">
        <ComboBox aria-label="US state" items={US_STATES} placeholder="Search states" />
      </DemoSection>

      <DemoSection title="In a Field">
        <Field label="Home state" hint="Start typing to filter the list." required>
          <ComboBox items={US_STATES} placeholder="Search states" />
        </Field>
      </DemoSection>

      <DemoSection title="Disabled">
        <ComboBox
          aria-label="Disabled example"
          items={US_STATES}
          defaultValue="CA"
          disabled
        />
      </DemoSection>
    </DemoStack>
  )
}
