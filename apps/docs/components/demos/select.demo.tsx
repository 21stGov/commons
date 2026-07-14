// SPDX-License-Identifier: MIT

'use client'

import { Field, Select } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function SelectDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="In a Field">
        <div className="flex max-w-md flex-col gap-3">
          <Field label="Department" hint="Which office should handle this?">
            <Select placeholder="Choose a department">
              <option value="public-works">Public Works</option>
              <option value="parks">Parks and Recreation</option>
              <option value="clerk">City Clerk</option>
            </Select>
          </Field>
        </div>
      </DemoSection>

      <DemoSection title="States">
        <div className="flex max-w-md flex-col gap-2">
          <Select aria-label="Placeholder example" placeholder="Choose an option">
            <option value="a">Option A</option>
            <option value="b">Option B</option>
          </Select>
          <Select aria-label="Disabled example" defaultValue="b" disabled>
            <option value="a">Option A</option>
            <option value="b">Option B</option>
          </Select>
          <Select aria-label="Grouped options" defaultValue="carrot">
            <optgroup label="Fruit">
              <option value="apple">Apple</option>
              <option value="banana">Banana</option>
            </optgroup>
            <optgroup label="Vegetables">
              <option value="carrot">Carrot</option>
              <option value="daikon">Daikon</option>
            </optgroup>
          </Select>
        </div>
      </DemoSection>
    </DemoStack>
  )
}
