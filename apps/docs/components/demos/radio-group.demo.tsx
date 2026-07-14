// SPDX-License-Identifier: MIT

'use client'

import { Radio, RadioGroup } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function RadioGroupDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Radio group">
        <RadioGroup label="Preferred contact method" required>
          <Radio label="Email" value="email" defaultChecked />
          <Radio label="Phone" value="phone" description="Weekdays, 8am to 5pm." />
          <Radio label="Mail" value="mail" />
          <Radio label="Fax" value="fax" disabled />
        </RadioGroup>
      </DemoSection>

      <DemoSection title="Disabled group">
        <RadioGroup label="Pickup day (unavailable)" disabled>
          <Radio label="Monday" value="monday" defaultChecked />
          <Radio label="Thursday" value="thursday" />
        </RadioGroup>
      </DemoSection>

      <DemoSection title="RTL">
        <div dir="rtl">
          <RadioGroup label="طريقة التواصل المفضلة">
            <Radio label="البريد الإلكتروني" value="email" defaultChecked />
            <Radio label="الهاتف" value="phone" />
          </RadioGroup>
        </div>
      </DemoSection>
    </DemoStack>
  )
}
