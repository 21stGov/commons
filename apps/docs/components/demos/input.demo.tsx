// SPDX-License-Identifier: MIT

'use client'

import { Field, Input, Textarea } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function InputDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Input in a Field">
        <div className="flex max-w-md flex-col gap-3">
          <Field label="City" hint="The city you live in.">
            <Input autoComplete="address-level2" />
          </Field>
          <Field label="Full name" error="Enter your full name." required>
            <Input autoComplete="name" />
          </Field>
          <Field label="Case number" hint="Assigned automatically." disabled>
            <Input mono defaultValue="C-2026-0142" />
          </Field>
        </div>
      </DemoSection>

      <DemoSection title="Prefix and suffix (decorative, single tab stop)">
        <div className="flex max-w-md flex-col gap-3">
          <Field label="Amount in dollars" hint="Whole dollars only.">
            <Input inputMode="numeric" prefix="$" suffix="USD" />
          </Field>
        </div>
      </DemoSection>

      <DemoSection title="Textarea (block-axis resize)">
        <div className="max-w-md">
          <Field label="What happened?" hint="Describe the issue in your own words.">
            <Textarea />
          </Field>
        </div>
      </DemoSection>
    </DemoStack>
  )
}
