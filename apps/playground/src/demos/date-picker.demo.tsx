// SPDX-License-Identifier: MIT

import { DatePicker, Field } from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Date picker'

export default function Demo(): React.JSX.Element {
  const [standalone, setStandalone] = React.useState<Date | undefined>(undefined)
  const [inField, setInField] = React.useState<Date | undefined>(undefined)

  return (
    <div className="flex max-w-md flex-col gap-8">
      <section aria-labelledby="dp-standalone-heading">
        <h3 id="dp-standalone-heading" className="mb-2 text-sm font-semibold">
          Standalone
        </h3>
        <DatePicker value={standalone} onValueChange={setStandalone} />
        <p className="mt-2 text-sm text-muted-foreground">
          Selected: {standalone ? standalone.toLocaleDateString() : 'none'}
        </p>
      </section>

      <section aria-labelledby="dp-field-heading">
        <h3 id="dp-field-heading" className="mb-2 text-sm font-semibold">
          Inside a Field
        </h3>
        <Field label="Appointment date" hint="Weekdays only, within the next two months." required>
          <DatePicker
            value={inField}
            onValueChange={setInField}
            disabled={[{ dayOfWeek: [0, 6] }]}
          />
        </Field>
      </section>

      <section aria-labelledby="dp-bounds-heading">
        <h3 id="dp-bounds-heading" className="mb-2 text-sm font-semibold">
          With min / max window
        </h3>
        <DatePicker
          defaultValue={new Date(2024, 0, 15)}
          min={new Date(2024, 0, 8)}
          max={new Date(2024, 0, 26)}
          calendarProps={{ defaultMonth: new Date(2024, 0, 1) }}
        />
      </section>

      <section aria-labelledby="dp-rtl-heading" dir="rtl" lang="ar">
        <h3 id="dp-rtl-heading" className="mb-2 text-sm font-semibold">
          RTL
        </h3>
        <DatePicker
          dir="rtl"
          triggerLabel="اختر التاريخ"
          placeholder="اختر تاريخًا"
          dialogLabel="اختر تاريخًا"
        />
      </section>
    </div>
  )
}
