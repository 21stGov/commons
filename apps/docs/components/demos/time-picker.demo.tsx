// SPDX-License-Identifier: MIT

'use client'

import { Field, TimePicker } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function TimePickerDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Default (12-hour, every 30 minutes)">
        <div className="max-w-md">
          <TimePicker aria-label="Appointment time" placeholder="Select a time" />
        </div>
      </DemoSection>

      <DemoSection title="24-hour labels, business hours">
        <div className="max-w-md">
          <TimePicker
            aria-label="Meeting start"
            hourCycle={24}
            step={15}
            startTime="08:00"
            endTime="17:00"
            placeholder="Select a time"
          />
        </div>
      </DemoSection>

      <DemoSection title="Inside a Field">
        <div className="max-w-md">
          <Field label="Pickup time" hint="Type to filter, e.g. 2:30.">
            <TimePicker />
          </Field>
        </div>
      </DemoSection>
    </DemoStack>
  )
}
