// SPDX-License-Identifier: MIT

import { ComboBox, type ComboBoxItem, Field } from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Combo Box'

// All 50 states — a combo box earns its keep on a genuinely long list,
// and it lets the natural "new" search actually find matches.
const US_STATES: ComboBoxItem[] = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
]

const CITY_SERVICES: ComboBoxItem[] = [
  { value: 'trash', label: 'Trash & recycling pickup' },
  { value: 'permits', label: 'Building permits' },
  { value: 'parking', label: 'Parking tickets' },
  { value: 'water', label: 'Water & sewer billing' },
  { value: 'potholes', label: 'Report a pothole' },
  { value: 'transit', label: 'Public transit (temporarily unavailable)', disabled: true },
]

export default function Demo(): React.JSX.Element {
  const [service, setService] = React.useState<string | null>('permits')

  return (
    <div className="flex max-w-md flex-col gap-5">
      <section aria-labelledby="combo-basic-heading">
        <h3 id="combo-basic-heading" className="text-sm font-semibold">
          Filter a long list (US states)
        </h3>
        <ComboBox
          aria-label="US state"
          items={US_STATES}
          placeholder="Search states"
        />
      </section>

      <section aria-labelledby="combo-controlled-heading">
        <h3 id="combo-controlled-heading" className="text-sm font-semibold">
          Controlled + a disabled option
        </h3>
        <ComboBox
          aria-label="City service"
          items={CITY_SERVICES}
          value={service}
          onValueChange={setService}
          placeholder="Find a service"
        />
        <p className="mt-1 text-sm text-muted-foreground">
          Selected: {service ?? 'none'}
        </p>
      </section>

      <section aria-labelledby="combo-field-heading">
        <h3 id="combo-field-heading" className="text-sm font-semibold">
          In a Field
        </h3>
        <div className="flex flex-col gap-2">
          <Field
            label="Home state"
            hint="Start typing to filter the list."
            required
          >
            <ComboBox items={US_STATES} placeholder="Search states" />
          </Field>
          <Field label="Home state" error="Choose a state to continue.">
            <ComboBox items={US_STATES} placeholder="Search states" />
          </Field>
        </div>
      </section>

      <section aria-labelledby="combo-disabled-heading">
        <h3 id="combo-disabled-heading" className="text-sm font-semibold">
          Disabled
        </h3>
        <ComboBox
          aria-label="Disabled example"
          items={US_STATES}
          defaultValue="CA"
          disabled
        />
      </section>

      <section aria-labelledby="combo-rtl-heading">
        <h3 id="combo-rtl-heading" className="text-sm font-semibold">
          RTL (chevron and clear flip to the inline end)
        </h3>
        <div dir="rtl" lang="ar">
          <ComboBox
            aria-label="المدينة"
            items={[
              { value: 'cairo', label: 'القاهرة' },
              { value: 'giza', label: 'الجيزة' },
              { value: 'alex', label: 'الإسكندرية' },
              { value: 'luxor', label: 'الأقصر' },
            ]}
            placeholder="ابحث عن مدينة"
          />
        </div>
      </section>
    </div>
  )
}
