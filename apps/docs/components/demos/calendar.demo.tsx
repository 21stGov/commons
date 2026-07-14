// SPDX-License-Identifier: MIT

'use client'

import { Calendar, type DateRange } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function CalendarDemo(): React.JSX.Element {
  const [single, setSingle] = React.useState<Date | undefined>(new Date(2024, 0, 15))
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: new Date(2024, 0, 8),
    to: new Date(2024, 0, 19),
  })

  return (
    <DemoStack>
      <DemoSection title="Single date">
        <Calendar
          mode="single"
          selected={single}
          onSelect={setSingle}
          defaultMonth={new Date(2024, 0, 1)}
        />
      </DemoSection>

      <DemoSection title="Date range">
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange}
          defaultMonth={new Date(2024, 0, 1)}
        />
      </DemoSection>

      <DemoSection title="RTL (arrow keys flip direction)">
        <div dir="rtl" lang="ar">
          <Calendar mode="single" dir="rtl" defaultMonth={new Date(2024, 0, 1)} />
        </div>
      </DemoSection>
    </DemoStack>
  )
}
