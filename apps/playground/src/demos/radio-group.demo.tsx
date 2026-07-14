// SPDX-License-Identifier: MIT

import * as React from 'react'

import { Radio, RadioGroup } from '@21stgov/commons-react'

export const title = 'Radio Group'

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="radio-group-heading">
        <h3 id="radio-group-heading" className="text-sm font-semibold">
          Radio group
        </h3>
        <RadioGroup label="Preferred contact method" required>
          <Radio label="Email" value="email" defaultChecked />
          <Radio label="Phone" value="phone" description="Weekdays, 8am to 5pm." />
          <Radio label="Mail" value="mail" />
          <Radio label="Fax" value="fax" disabled />
        </RadioGroup>
      </section>

      <section aria-labelledby="radio-disabled-heading">
        <h3 id="radio-disabled-heading" className="text-sm font-semibold">
          Disabled radio group
        </h3>
        <RadioGroup label="Pickup day (unavailable)" disabled>
          <Radio label="Monday" value="monday" defaultChecked />
          <Radio label="Thursday" value="thursday" />
        </RadioGroup>
      </section>

      <section aria-labelledby="radio-rtl-heading">
        <h3 id="radio-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl" className="flex flex-col gap-2">
          <RadioGroup label="طريقة التواصل المفضلة">
            <Radio label="البريد الإلكتروني" value="email" defaultChecked />
            <Radio label="الهاتف" value="phone" />
          </RadioGroup>
        </div>
      </section>
    </div>
  )
}
