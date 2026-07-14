// SPDX-License-Identifier: MIT

'use client'

import { FieldGroup, NumberField } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function NumberFieldDemo(): React.JSX.Element {
  const [tickets, setTickets] = React.useState<number | null>(2)

  return (
    <DemoStack>
      <DemoSection title="Quantity (controlled)">
        <div className="flex max-w-xs flex-col gap-2">
          <NumberField
            label="Tickets"
            min={0}
            max={8}
            value={tickets}
            onValueChange={setTickets}
          />
          <p className="text-sm text-muted-foreground">
            You selected {tickets ?? 0} ticket{tickets === 1 ? '' : 's'}.
          </p>
        </div>
      </DemoSection>

      <DemoSection title="Currency (locale-aware format)">
        <div className="max-w-xs">
          <NumberField
            label="Payment amount"
            description="Amount in U.S. dollars."
            defaultValue={49.5}
            min={0}
            step={0.5}
            format={{ style: 'currency', currency: 'USD' }}
          />
        </div>
      </DemoSection>

      <DemoSection title="Min, max, and large step">
        <div className="max-w-xs">
          <NumberField
            label="Speed limit (mph)"
            description="Steps by 5; Shift+Arrow steps by 25."
            min={5}
            max={75}
            step={5}
            largeStep={25}
            defaultValue={25}
          />
        </div>
      </DemoSection>

      <DemoSection title="Disabled">
        <div className="max-w-xs">
          <NumberField label="Locked quantity" defaultValue={4} disabled />
        </div>
      </DemoSection>

      <DemoSection title="Field-wired (FieldGroup shares a hint and disables together)">
        <div className="max-w-xs">
          <FieldGroup label="Household size" hint="Count everyone who lives with you.">
            <NumberField label="Adults" min={0} defaultValue={1} />
            <NumberField label="Children" min={0} defaultValue={0} />
          </FieldGroup>
        </div>
      </DemoSection>
    </DemoStack>
  )
}
