// SPDX-License-Identifier: MIT

import { FieldGroup, NumberField } from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Number Field'

function ControlledExample(): React.JSX.Element {
  const [tickets, setTickets] = React.useState<number | null>(2)
  return (
    <div className="flex max-w-xs flex-col gap-2">
      <NumberField label="Tickets" min={0} max={8} value={tickets} onValueChange={setTickets} />
      <p className="text-sm text-muted-foreground">
        You selected {tickets ?? 0} ticket{tickets === 1 ? '' : 's'}.
      </p>
    </div>
  )
}

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex max-w-md flex-col gap-5">
      <section aria-labelledby="number-field-quantity-heading">
        <h3 id="number-field-quantity-heading" className="text-sm font-semibold">
          Quantity (controlled)
        </h3>
        <ControlledExample />
      </section>

      <section aria-labelledby="number-field-currency-heading">
        <h3 id="number-field-currency-heading" className="text-sm font-semibold">
          Currency
        </h3>
        <NumberField
          label="Payment amount"
          description="Amount in U.S. dollars."
          defaultValue={49.5}
          min={0}
          step={0.5}
          format={{ style: 'currency', currency: 'USD' }}
        />
      </section>

      <section aria-labelledby="number-field-bounds-heading">
        <h3 id="number-field-bounds-heading" className="text-sm font-semibold">
          Min, max, and large step
        </h3>
        <NumberField
          label="Speed limit (mph)"
          description="Steps by 5; Shift+Arrow steps by 25."
          min={5}
          max={75}
          step={5}
          largeStep={25}
          defaultValue={25}
        />
      </section>

      <section aria-labelledby="number-field-disabled-heading">
        <h3 id="number-field-disabled-heading" className="text-sm font-semibold">
          Disabled
        </h3>
        <NumberField label="Locked quantity" defaultValue={4} disabled />
      </section>

      <section aria-labelledby="number-field-field-heading">
        <h3 id="number-field-field-heading" className="text-sm font-semibold">
          Field-wired
        </h3>
        <FieldGroup label="Household size" hint="Count everyone who lives with you.">
          <NumberField label="Adults" min={0} defaultValue={1} />
          <NumberField label="Children" min={0} defaultValue={0} />
        </FieldGroup>
      </section>

      <section aria-labelledby="number-field-rtl-heading">
        <h3 id="number-field-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl">
          <NumberField label="الكمية" description="أدخل رقمًا" defaultValue={2} min={0} />
        </div>
      </section>
    </div>
  )
}
