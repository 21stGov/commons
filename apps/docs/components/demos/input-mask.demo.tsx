// SPDX-License-Identifier: MIT

'use client'

import { Field, InputMask } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function InputMaskDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Presets in a Field (format announced via the hint)">
        <div className="flex max-w-md flex-col gap-3">
          <Field label="Phone number" hint="Format: (555) 555-5555.">
            <InputMask mask="phone" />
          </Field>
          <Field label="Social Security number" hint="Format: 555-55-5555.">
            <InputMask mask="ssn" mono secure />
          </Field>
          <Field label="Date of birth" hint="Format: MM/DD/YYYY.">
            <InputMask mask="date" />
          </Field>
        </div>
      </DemoSection>

      <DemoSection title="Error state (the field can always be corrected)">
        <div className="max-w-md">
          <Field
            label="Phone number"
            hint="Format: (555) 555-5555."
            error="Enter a 10-digit phone number."
            required
          >
            <InputMask mask="phone" />
          </Field>
        </div>
      </DemoSection>
    </DemoStack>
  )
}
