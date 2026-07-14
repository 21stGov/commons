// SPDX-License-Identifier: MIT

'use client'

import { DateRangePicker, type DateRangePickerValue, Field } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function DateRangePickerDemo(): React.JSX.Element {
  const [standalone, setStandalone] = React.useState<DateRangePickerValue | undefined>(undefined)

  return (
    <DemoStack>
      <DemoSection title="Standalone">
        <div className="max-w-xs">
          <DateRangePicker value={standalone} onValueChange={setStandalone} />
        </div>
      </DemoSection>

      <DemoSection title="Inside a Field">
        <div className="max-w-xs">
          <Field label="Stay dates" hint="Weekdays only.">
            <DateRangePicker disabled={[{ dayOfWeek: [0, 6] }]} />
          </Field>
        </div>
      </DemoSection>

      <DemoSection title="With a min / max window">
        <div className="max-w-xs">
          <DateRangePicker
            defaultValue={{ from: new Date(2024, 0, 12), to: new Date(2024, 0, 18) }}
            min={new Date(2024, 0, 8)}
            max={new Date(2024, 0, 26)}
            calendarProps={{ defaultMonth: new Date(2024, 0, 1) }}
          />
        </div>
      </DemoSection>

      <DemoSection title="Two months">
        <DateRangePicker
          defaultValue={{ from: new Date(2024, 0, 20), to: new Date(2024, 1, 4) }}
          calendarProps={{ defaultMonth: new Date(2024, 0, 1), numberOfMonths: 2 }}
        />
      </DemoSection>

      <DemoSection title="RTL">
        <div dir="rtl" lang="ar" className="max-w-xs">
          <DateRangePicker
            dir="rtl"
            triggerLabel="اختر نطاق التاريخ"
            placeholder="اختر نطاقًا"
            dialogLabel="اختر نطاقًا"
          />
        </div>
      </DemoSection>
    </DemoStack>
  )
}
