// SPDX-License-Identifier: MIT

import * as React from 'react'

import { Field, Input, Textarea } from '@21stgov/commons-react'

export const title = 'Input'

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex max-w-md flex-col gap-5">
      <section aria-labelledby="input-basics-heading">
        <h3 id="input-basics-heading" className="text-sm font-semibold">
          Input in a Field
        </h3>
        <div className="flex flex-col gap-3">
          <Field label="City" hint="The city you live in.">
            <Input autoComplete="address-level2" />
          </Field>
          <Field label="Email address" required>
            <Input type="email" autoComplete="email" />
          </Field>
          <Field label="Full name" error="Enter your full name." required>
            <Input autoComplete="name" />
          </Field>
          <Field label="Case number" hint="Assigned automatically." disabled>
            <Input mono defaultValue="C-2026-0142" />
          </Field>
        </div>
      </section>

      <section aria-labelledby="input-adornment-heading">
        <h3 id="input-adornment-heading" className="text-sm font-semibold">
          Prefix and suffix (decorative, single tab stop)
        </h3>
        <div className="flex flex-col gap-3">
          <Field label="Amount in dollars" hint="Whole dollars only.">
            <Input inputMode="numeric" prefix="$" suffix="USD" />
          </Field>
          <Field label="Weight in kilograms">
            <Input inputMode="decimal" suffix="kg" />
          </Field>
        </div>
      </section>

      <section aria-labelledby="input-standalone-heading">
        <h3 id="input-standalone-heading" className="text-sm font-semibold">
          Standalone (own label wiring)
        </h3>
        <Input aria-label="Search" type="search" placeholder="Search…" />
      </section>

      <section aria-labelledby="textarea-heading">
        <h3 id="textarea-heading" className="text-sm font-semibold">
          Textarea (3 rows, block-axis resize)
        </h3>
        <div className="flex flex-col gap-3">
          <Field label="What happened?" hint="Describe the issue in your own words.">
            <Textarea />
          </Field>
          <Field label="Additional notes" error="Enter your notes." required>
            <Textarea rows={5} />
          </Field>
          <Field label="Archived comments" disabled>
            <Textarea defaultValue="No further action required." />
          </Field>
        </div>
      </section>

      <section aria-labelledby="input-rtl-heading">
        <h3 id="input-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl" className="flex flex-col gap-3">
          <Field label="المدينة" hint="المدينة التي تعيش فيها.">
            <Input />
          </Field>
          <Field label="المبلغ بالدولار">
            <Input inputMode="numeric" prefix="$" />
          </Field>
          <Field label="ملاحظات إضافية" requiredLabel="مطلوب" required>
            <Textarea />
          </Field>
        </div>
      </section>
    </div>
  )
}
