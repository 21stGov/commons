// SPDX-License-Identifier: MIT

import * as React from 'react'

import { Checkbox, CheckboxGroup, Field } from '@21stgov/commons-react'

export const title = 'Checkbox Group'

const SERVICE_AREAS = [
  { value: 'parks', label: 'Parks and recreation' },
  { value: 'roads', label: 'Roads and transit', description: 'Snow plowing and street repair.' },
  { value: 'water', label: 'Water and sewer' },
  { value: 'waste', label: 'Waste and recycling' },
]

function FilterExample(): React.JSX.Element {
  const [areas, setAreas] = React.useState<string[]>(['roads'])
  return (
    <div className="flex flex-col gap-2">
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
    </div>
  )
}

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="cbg-filter-heading">
        <h3 id="cbg-filter-heading" className="text-sm font-semibold">
          Filter list with select all
        </h3>
        <FilterExample />
      </section>

      <section aria-labelledby="cbg-plain-heading">
        <h3 id="cbg-plain-heading" className="text-sm font-semibold">
          Plain group (composed children)
        </h3>
        <CheckboxGroup label="Notification channels" defaultValue={['email']}>
          <Checkbox value="email" label="Email" />
          <Checkbox value="sms" label="Text message" description="Standard rates may apply." />
          <Checkbox value="mail" label="Postal mail" />
        </CheckboxGroup>
      </section>

      <section aria-labelledby="cbg-error-heading">
        <h3 id="cbg-error-heading" className="text-sm font-semibold">
          In a Field with an error
        </h3>
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
      </section>

      <section aria-labelledby="cbg-disabled-heading">
        <h3 id="cbg-disabled-heading" className="text-sm font-semibold">
          Disabled group
        </h3>
        <CheckboxGroup
          label="Pickup services (unavailable)"
          disabled
          selectAll
          defaultValue={['bulk']}
          items={[
            { value: 'bulk', label: 'Bulk item pickup' },
            { value: 'yard', label: 'Yard waste pickup' },
          ]}
        />
      </section>

      <section aria-labelledby="cbg-rtl-heading">
        <h3 id="cbg-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl" className="flex flex-col gap-2">
          <CheckboxGroup
            label="مناطق الخدمة"
            selectAll
            items={[
              { value: 'parks', label: 'الحدائق' },
              { value: 'roads', label: 'الطرق' },
              { value: 'water', label: 'المياه' },
            ]}
          />
        </div>
      </section>
    </div>
  )
}
