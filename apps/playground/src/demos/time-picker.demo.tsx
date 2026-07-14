// SPDX-License-Identifier: MIT

import * as React from 'react'

import { Field, TimePicker } from '@21stgov/commons-react'

export const title = 'Time Picker'

export default function Demo(): React.JSX.Element {
  const [value, setValue] = React.useState<string | null>('09:30')

  return (
    <div className="flex max-w-md flex-col gap-5">
      <section aria-labelledby="time-picker-default-heading">
        <h3 id="time-picker-default-heading" className="text-sm font-semibold">
          Default (12-hour, every 30 minutes)
        </h3>
        <TimePicker
          aria-label="Appointment time"
          value={value}
          onValueChange={setValue}
          placeholder="Select a time"
        />
        <p className="mt-1 text-sm text-muted-foreground">
          Stored value: {value ?? '—'}
        </p>
      </section>

      <section aria-labelledby="time-picker-24h-heading">
        <h3 id="time-picker-24h-heading" className="text-sm font-semibold">
          24-hour labels, 15-minute steps, business hours
        </h3>
        <TimePicker
          aria-label="Meeting start"
          hourCycle={24}
          step={15}
          startTime="08:00"
          endTime="17:00"
          placeholder="Select a time"
        />
      </section>

      <section aria-labelledby="time-picker-field-heading">
        <h3 id="time-picker-field-heading" className="text-sm font-semibold">
          Inside a Field
        </h3>
        <div className="flex flex-col gap-3">
          <Field label="Pickup time" hint="Type to filter, e.g. 2:30.">
            <TimePicker />
          </Field>
          <Field label="Drop-off time" error="Choose a time." required>
            <TimePicker />
          </Field>
        </div>
      </section>

      <section aria-labelledby="time-picker-rtl-heading">
        <h3 id="time-picker-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl">
          <Field label="وقت الموعد">
            <TimePicker locale="ar" startTime="09:00" endTime="17:00" />
          </Field>
        </div>
      </section>
    </div>
  )
}
