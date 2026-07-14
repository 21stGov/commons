// SPDX-License-Identifier: MIT

import * as React from 'react'

import { Field, InputMask } from '@21stgov/commons-react'

export const title = 'Input Mask'

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex max-w-md flex-col gap-5">
      <section aria-labelledby="input-mask-presets-heading">
        <h3 id="input-mask-presets-heading" className="text-sm font-semibold">
          Presets in a Field (format announced via the hint)
        </h3>
        <div className="flex flex-col gap-3">
          <Field label="Phone number" hint="Format: (555) 555-5555.">
            <InputMask mask="phone" />
          </Field>
          <Field
            label="Social Security number"
            hint="Format: 555-55-5555. Do not share unless required."
          >
            <InputMask mask="ssn" mono secure />
          </Field>
          <Field label="Date of birth" hint="Format: MM/DD/YYYY.">
            <InputMask mask="date" />
          </Field>
        </div>
      </section>

      <section aria-labelledby="input-mask-zip-heading">
        <h3 id="input-mask-zip-heading" className="text-sm font-semibold">
          ZIP and ZIP+4
        </h3>
        <div className="flex flex-col gap-3">
          <Field label="ZIP code" hint="Format: 55555.">
            <InputMask mask="zip" />
          </Field>
          <Field label="ZIP+4" hint="Format: 55555-5555.">
            <InputMask mask="zipPlus4" />
          </Field>
        </div>
      </section>

      <section aria-labelledby="input-mask-error-heading">
        <h3 id="input-mask-error-heading" className="text-sm font-semibold">
          Error state (the field can always be corrected)
        </h3>
        <Field
          label="Phone number"
          hint="Format: (555) 555-5555."
          error="Enter a 10-digit phone number."
          required
        >
          <InputMask mask="phone" />
        </Field>
      </section>

      <section aria-labelledby="input-mask-rtl-heading">
        <h3 id="input-mask-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl">
          <Field label="رقم الهاتف" hint="التنسيق: (555) 555-5555.">
            <InputMask mask="phone" />
          </Field>
        </div>
      </section>
    </div>
  )
}
