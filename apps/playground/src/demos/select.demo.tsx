// SPDX-License-Identifier: MIT

import * as React from 'react'

import { Field, Select } from '@21stgov/commons-react'

export const title = 'Select'

const sizes = ['sm', 'md', 'lg'] as const

function Fruits(): React.JSX.Element {
  return (
    <>
      <option value="apple">Apple</option>
      <option value="banana">Banana</option>
      <option value="cherry">Cherry</option>
      <option value="dragonfruit">Dragonfruit</option>
    </>
  )
}

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex max-w-md flex-col gap-5">
      <section aria-labelledby="select-sizes-heading">
        <h3 id="select-sizes-heading" className="text-sm font-semibold">
          Sizes
        </h3>
        <div className="flex flex-col gap-2">
          {sizes.map((size) => (
            <Select key={size} size={size} aria-label={`Fruit (${size})`} defaultValue="apple">
              <Fruits />
            </Select>
          ))}
        </div>
      </section>

      <section aria-labelledby="select-states-heading">
        <h3 id="select-states-heading" className="text-sm font-semibold">
          States
        </h3>
        <div className="flex flex-col gap-2">
          <Select aria-label="Placeholder example" placeholder="Choose a fruit">
            <Fruits />
          </Select>
          <Select aria-label="Disabled example" defaultValue="banana" disabled>
            <Fruits />
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
      </section>

      <section aria-labelledby="select-field-heading">
        <h3 id="select-field-heading" className="text-sm font-semibold">
          In a Field
        </h3>
        <div className="flex flex-col gap-2">
          <Field
            label="Favorite fruit"
            hint="Pick the one you would take to a desert island."
            required
          >
            <Select placeholder="Choose a fruit">
              <Fruits />
            </Select>
          </Field>
          <Field label="Favorite fruit" error="Choose a fruit to continue.">
            <Select placeholder="Choose a fruit">
              <Fruits />
            </Select>
          </Field>
        </div>
      </section>

      <section aria-labelledby="select-rtl-heading">
        <h3 id="select-rtl-heading" className="text-sm font-semibold">
          RTL (chevron flips to the inline end)
        </h3>
        <div dir="rtl" lang="ar">
          <Select aria-label="فاكهة" defaultValue="apple">
            <option value="apple">تفاح</option>
            <option value="banana">موز</option>
            <option value="cherry">كرز</option>
          </Select>
        </div>
      </section>
    </div>
  )
}
