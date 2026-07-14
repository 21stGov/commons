// SPDX-License-Identifier: MIT

import * as React from 'react'

import { Field, InputGroup, InputGroupButton } from '@21stgov/commons-react'

export const title = 'Input group'

function ClearableExample(): React.JSX.Element {
  const [value, setValue] = React.useState('Springfield')
  return (
    <Field label="City">
      <InputGroup
        value={value}
        onChange={(event) => setValue(event.target.value)}
        actions={
          value !== '' ? (
            <InputGroupButton aria-label="Clear city" onClick={() => setValue('')}>
              x
            </InputGroupButton>
          ) : null
        }
      />
    </Field>
  )
}

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="input-group-addons-heading">
        <h3 id="input-group-addons-heading" className="text-sm font-semibold">
          Text addons
        </h3>
        <div className="flex flex-col gap-3">
          <Field label="Amount">
            <InputGroup
              prefix="$"
              prefixLabel="Amount in US dollars"
              inputMode="decimal"
              placeholder="0.00"
            />
          </Field>
          <Field label="Weight">
            <InputGroup suffix="lbs" suffixLabel="Weight in pounds" inputMode="decimal" />
          </Field>
        </div>
      </section>

      <section aria-labelledby="input-group-actions-heading">
        <h3 id="input-group-actions-heading" className="text-sm font-semibold">
          Trailing action
        </h3>
        <ClearableExample />
      </section>

      <section aria-labelledby="input-group-error-heading">
        <h3 id="input-group-error-heading" className="text-sm font-semibold">
          Validation
        </h3>
        <Field label="Amount" error="Enter an amount of at least $1.00.">
          <InputGroup prefix="$" prefixLabel="Amount in US dollars" defaultValue="0" />
        </Field>
      </section>

      <section aria-labelledby="input-group-rtl-heading">
        <h3 id="input-group-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl">
          <Field label="المبلغ">
            <InputGroup prefix="$" prefixLabel="المبلغ بالدولار الأمريكي" suffix="USD" />
          </Field>
        </div>
      </section>
    </div>
  )
}
