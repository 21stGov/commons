// SPDX-License-Identifier: MIT

'use client'

import { DatePicker, Field } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function DatePickerDemo(): React.JSX.Element {
  const [standalone, setStandalone] = React.useState<Date | undefined>(undefined)

  return (
    <DemoStack>
      <DemoSection title="Standalone">
        <div className="max-w-xs">
          <DatePicker value={standalone} onValueChange={setStandalone} />
        </div>
      </DemoSection>

      <DemoSection title="Inside a Field">
        <div className="max-w-xs">
          <Field label="Appointment date" hint="Weekdays only.">
            <DatePicker disabled={[{ dayOfWeek: [0, 6] }]} />
          </Field>
        </div>
      </DemoSection>

      <DemoSection title="With a min / max window">
        <div className="max-w-xs">
          <DatePicker
            defaultValue={new Date(2024, 0, 15)}
            min={new Date(2024, 0, 8)}
            max={new Date(2024, 0, 26)}
            calendarProps={{ defaultMonth: new Date(2024, 0, 1) }}
          />
        </div>
      </DemoSection>

      <DemoSection title="RTL">
        <div dir="rtl" lang="ar" className="max-w-xs">
          <DatePicker
            dir="rtl"
            triggerLabel="اختر التاريخ"
            placeholder="اختر تاريخًا"
            dialogLabel="اختر تاريخًا"
          />
        </div>
      </DemoSection>
    </DemoStack>
  )
}
