// SPDX-License-Identifier: MIT

import * as React from 'react'

import { Checkbox, FieldGroup } from '@21stgov/commons-react'

export const title = 'Checkbox'

function SelectAllExample(): React.JSX.Element {
  const [items, setItems] = React.useState([true, false, false])
  const checkedCount = items.filter(Boolean).length
  const allChecked = checkedCount === items.length
  const indeterminate = checkedCount > 0 && !allChecked

  return (
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
  )
}

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="checkbox-states-heading">
        <h3 id="checkbox-states-heading" className="text-sm font-semibold">
          Checkbox states
        </h3>
        <div className="flex flex-col">
          <Checkbox label="Subscribe to city updates" />
          <Checkbox
            label="Get service alerts"
            description="Water, power, and road closures. At most one email per day."
            defaultChecked
          />
          <Checkbox label="Disabled option" disabled />
          <Checkbox label="Disabled and checked" disabled defaultChecked />
        </div>
      </section>

      <section aria-labelledby="checkbox-indeterminate-heading">
        <h3 id="checkbox-indeterminate-heading" className="text-sm font-semibold">
          Indeterminate (select all)
        </h3>
        <SelectAllExample />
      </section>

      <section aria-labelledby="checkbox-field-heading">
        <h3 id="checkbox-field-heading" className="text-sm font-semibold">
          Checkboxes in a FieldGroup
        </h3>
        <FieldGroup
          label="Which topics interest you?"
          hint="Choose as many as you like."
          error="Choose at least one topic."
        >
          <Checkbox label="Parks and recreation" />
          <Checkbox label="Public meetings" />
          <Checkbox label="Road construction" />
        </FieldGroup>
      </section>

      <section aria-labelledby="checkbox-rtl-heading">
        <h3 id="checkbox-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl" className="flex flex-col gap-2">
          <Checkbox
            label="اشترك في تحديثات المدينة"
            description="بريد إلكتروني واحد شهريًا على الأكثر."
          />
        </div>
      </section>
    </div>
  )
}
