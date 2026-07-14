// SPDX-License-Identifier: MIT

'use client'

import { CustomSelect, type CustomSelectEntry, Field } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

const PRIORITIES: CustomSelectEntry[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent (on hold)', disabled: true },
]

// Options grouped under labelled sections — the case the native <select>'s
// <optgroup> handles but without themeable, icon-bearing rows.
const DEPARTMENTS: CustomSelectEntry[] = [
  {
    label: 'Public works',
    items: [
      { value: 'streets', label: 'Streets & paving' },
      { value: 'water', label: 'Water & sewer' },
      { value: 'sanitation', label: 'Sanitation' },
    ],
  },
  {
    label: 'Community',
    items: [
      { value: 'parks', label: 'Parks & recreation' },
      { value: 'library', label: 'Library' },
      { value: 'permits', label: 'Permits & licensing' },
    ],
  },
]

// A small status dot proves rich rows render — the label still carries the
// meaning for screen readers (the dot is decorative / aria-hidden).
function Dot({ className }: { className: string }): React.JSX.Element {
  return <span aria-hidden="true" className={`size-105 shrink-0 rounded-full ${className}`} />
}

const STATUSES: CustomSelectEntry[] = [
  { value: 'open', label: 'Open', icon: <Dot className="bg-current text-info-foreground" /> },
  { value: 'progress', label: 'In progress', icon: <Dot className="bg-current text-warning-foreground" /> },
  { value: 'resolved', label: 'Resolved', icon: <Dot className="bg-current text-success-foreground" /> },
]

function ControlledExample(): React.JSX.Element {
  const [value, setValue] = React.useState<string | null>('normal')
  return (
    <div className="flex flex-col gap-2">
      <Field label="Priority">
        <CustomSelect items={PRIORITIES} value={value} onValueChange={setValue} />
      </Field>
      <p className="text-sm text-muted-foreground">Selected: {value ?? 'none'}</p>
    </div>
  )
}

export default function CustomSelectDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="In a Field">
        <Field label="Request priority" hint="Sets how quickly the request is triaged.">
          <CustomSelect items={PRIORITIES} placeholder="Choose a priority" />
        </Field>
      </DemoSection>

      <DemoSection title="Grouped options">
        <Field label="Department" required>
          <CustomSelect items={DEPARTMENTS} placeholder="Choose a department" />
        </Field>
      </DemoSection>

      <DemoSection title="Rich rows (icon + text)">
        <Field label="Status">
          <CustomSelect items={STATUSES} defaultValue="open" />
        </Field>
      </DemoSection>

      <DemoSection title="Controlled">
        <ControlledExample />
      </DemoSection>

      <DemoSection title="Disabled">
        <Field label="Priority (disabled)">
          <CustomSelect items={PRIORITIES} defaultValue="high" disabled />
        </Field>
      </DemoSection>
    </DemoStack>
  )
}
