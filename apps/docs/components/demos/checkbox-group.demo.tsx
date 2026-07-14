// SPDX-License-Identifier: MIT

'use client'

import { Checkbox, CheckboxGroup, Field } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

const SERVICE_AREAS = [
  { value: 'parks', label: 'Parks and recreation' },
  { value: 'roads', label: 'Roads and transit', description: 'Snow plowing and street repair.' },
  { value: 'water', label: 'Water and sewer' },
  { value: 'waste', label: 'Waste and recycling' },
]

export default function CheckboxGroupDemo(): React.JSX.Element {
  const [areas, setAreas] = React.useState<string[]>(['roads'])

  return (
    <DemoStack>
      <DemoSection title="Filter list with select all">
        <CheckboxGroup
          label="Service areas"
          selectAll
          items={SERVICE_AREAS}
          value={areas}
          onValueChange={setAreas}
        />
        <p className="text-sm text-muted-foreground">
          {areas.length === 0 ? 'No areas selected.' : `Selected: ${areas.join(', ')}.`}
        </p>
      </DemoSection>

      <DemoSection title="Plain group (composed children)">
        <CheckboxGroup label="Notification channels" defaultValue={['email']}>
          {/* Commons Checkbox children auto-wire to the shared value by their `value`. */}
          <Checkbox value="email" label="Email" />
          <Checkbox value="sms" label="Text message" description="Standard rates may apply." />
          <Checkbox value="mail" label="Postal mail" />
        </CheckboxGroup>
      </DemoSection>

      <DemoSection title="In a Field with an error">
        <Field
          label="Accessibility accommodations"
          error="Select at least one accommodation, or choose “None.”"
        >
          <CheckboxGroup
            aria-label="Accessibility accommodations"
            items={[
              { value: 'captioning', label: 'Live captioning' },
              { value: 'asl', label: 'ASL interpreter' },
              { value: 'materials', label: 'Large-print materials' },
            ]}
          />
        </Field>
      </DemoSection>
    </DemoStack>
  )
}
