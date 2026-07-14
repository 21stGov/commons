// SPDX-License-Identifier: MIT

'use client'

import { Checkbox, FieldGroup } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function CheckboxDemo(): React.JSX.Element {
  const [items, setItems] = React.useState([true, false, false])
  const checkedCount = items.filter(Boolean).length
  const allChecked = checkedCount === items.length
  const indeterminate = checkedCount > 0 && !allChecked

  return (
    <DemoStack>
      <DemoSection title="States">
        <div className="flex flex-col">
          <Checkbox label="Subscribe to city updates" />
          <Checkbox
            label="Get service alerts"
            description="Water, power, and road closures. At most one email per day."
            defaultChecked
          />
          <Checkbox label="Disabled option" disabled />
        </div>
      </DemoSection>

      <DemoSection title="Indeterminate (select all)">
        <div className="flex flex-col">
          <Checkbox
            label="Select all services"
            checked={allChecked}
            indeterminate={indeterminate}
            onChange={(event) => setItems(items.map(() => event.currentTarget.checked))}
          />
          <div className="ps-[2.25rem]">
            {['Trash pickup', 'Recycling', 'Yard waste'].map((label, index) => (
              <Checkbox
                key={label}
                label={label}
                checked={items[index]}
                onChange={(event) => {
                  const next = [...items]
                  next[index] = event.currentTarget.checked
                  setItems(next)
                }}
              />
            ))}
          </div>
        </div>
      </DemoSection>

      <DemoSection title="Grouped (fieldset + legend)">
        <FieldGroup label="Contact preferences" hint="Select all that apply.">
          <Checkbox name="contact" value="email" label="Email" />
          <Checkbox name="contact" value="phone" label="Phone" />
          <Checkbox name="contact" value="mail" label="Mail" />
        </FieldGroup>
      </DemoSection>
    </DemoStack>
  )
}
