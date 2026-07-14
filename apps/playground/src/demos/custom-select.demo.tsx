// SPDX-License-Identifier: MIT

import { CustomSelect, type CustomSelectEntry, Field } from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Custom Select'

const PRIORITIES: CustomSelectEntry[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent (on hold)', disabled: true },
]

// Grouped options — the case native <optgroup> covers, here with themeable,
// keyboard-consistent rows.
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

function Dot({ className }: { className: string }): React.JSX.Element {
  return <span aria-hidden="true" className={`size-105 shrink-0 rounded-full ${className}`} />
}

// Rich rows: a decorative status dot beside a label that still carries the
// meaning for screen readers.
const STATUSES: CustomSelectEntry[] = [
  { value: 'open', label: 'Open', icon: <Dot className="bg-current text-info-foreground" /> },
  { value: 'progress', label: 'In progress', icon: <Dot className="bg-current text-warning-foreground" /> },
  { value: 'resolved', label: 'Resolved', icon: <Dot className="bg-current text-success-foreground" /> },
]

export default function Demo(): React.JSX.Element {
  const [priority, setPriority] = React.useState<string | null>('normal')

  return (
    <div className="flex max-w-md flex-col gap-5">
      <section aria-labelledby="cselect-field-heading">
        <h3 id="cselect-field-heading" className="text-sm font-semibold">
          In a Field
        </h3>
        <Field label="Request priority" hint="Sets how quickly the request is triaged.">
          <CustomSelect items={PRIORITIES} placeholder="Choose a priority" />
        </Field>
      </section>

      <section aria-labelledby="cselect-grouped-heading">
        <h3 id="cselect-grouped-heading" className="text-sm font-semibold">
          Grouped options
        </h3>
        <Field label="Department" required>
          <CustomSelect items={DEPARTMENTS} placeholder="Choose a department" />
        </Field>
      </section>

      <section aria-labelledby="cselect-rich-heading">
        <h3 id="cselect-rich-heading" className="text-sm font-semibold">
          Rich rows (icon + text)
        </h3>
        <Field label="Status">
          <CustomSelect items={STATUSES} defaultValue="open" />
        </Field>
      </section>

      <section aria-labelledby="cselect-controlled-heading">
        <h3 id="cselect-controlled-heading" className="text-sm font-semibold">
          Controlled + a disabled option
        </h3>
        <div className="flex flex-col gap-2">
          <Field label="Priority">
            <CustomSelect items={PRIORITIES} value={priority} onValueChange={setPriority} />
          </Field>
          <p className="text-sm text-muted-foreground">Selected: {priority ?? 'none'}</p>
        </div>
      </section>

      <section aria-labelledby="cselect-error-heading">
        <h3 id="cselect-error-heading" className="text-sm font-semibold">
          Error state
        </h3>
        <Field label="Department" error="Choose a department to continue.">
          <CustomSelect items={DEPARTMENTS} placeholder="Choose a department" />
        </Field>
      </section>

      <section aria-labelledby="cselect-disabled-heading">
        <h3 id="cselect-disabled-heading" className="text-sm font-semibold">
          Disabled
        </h3>
        <Field label="Priority (disabled)">
          <CustomSelect items={PRIORITIES} defaultValue="high" disabled />
        </Field>
      </section>

      <section aria-labelledby="cselect-rtl-heading">
        <h3 id="cselect-rtl-heading" className="text-sm font-semibold">
          RTL (chevron flips to the inline end)
        </h3>
        <div dir="rtl" lang="ar">
          <Field label="المدينة">
            <CustomSelect
              items={[
                { value: 'cairo', label: 'القاهرة' },
                { value: 'giza', label: 'الجيزة' },
                { value: 'alex', label: 'الإسكندرية' },
              ]}
              placeholder="اختر مدينة"
            />
          </Field>
        </div>
      </section>
    </div>
  )
}
