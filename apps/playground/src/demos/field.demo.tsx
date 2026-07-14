// SPDX-License-Identifier: MIT

import * as React from 'react'

import { Checkbox, Field, FieldGroup, Input } from '@21stgov/commons-react'

export const title = 'Field'

export default function Demo(): React.JSX.Element {
  const [name, setName] = React.useState('')
  const nameError = name.trim() === '' ? 'Enter your full name' : undefined

  return (
    <div className="flex max-w-md flex-col gap-5">
      <section aria-labelledby="field-basics-heading" className="flex flex-col gap-105">
        <h3 id="field-basics-heading" className="text-sm font-semibold">
          Label, hint, required, disabled
        </h3>
        <div className="flex flex-col gap-3">
          <Field label="Email address" hint="We only use this to reply.">
            <Input autoComplete="email" />
          </Field>
          <Field label="Phone number" required>
            <Input autoComplete="tel" />
          </Field>
          <Field label="Case number" hint="Assigned automatically." disabled>
            <Input defaultValue="C-2026-0142" />
          </Field>
        </div>
      </section>

      <section aria-labelledby="field-error-heading" className="flex flex-col gap-105">
        <h3 id="field-error-heading" className="text-sm font-semibold">
          Live validation error (clear the input)
        </h3>
        <Field label="Full name" hint="As shown on your ID." required error={nameError}>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
          />
        </Field>
      </section>

      <section aria-labelledby="field-group-heading" className="flex flex-col gap-105">
        <h3 id="field-group-heading" className="text-sm font-semibold">
          FieldGroup (fieldset + legend)
        </h3>
        <div className="flex flex-col gap-3">
          <FieldGroup label="Contact preferences" hint="Select all that apply." required>
            <Checkbox name="contact" value="email" label="Email" />
            <Checkbox name="contact" value="phone" label="Phone" />
            <Checkbox name="contact" value="mail" label="Mail" />
          </FieldGroup>
          <FieldGroup label="Notification channels" error="Select at least one channel.">
            <Checkbox name="channel" value="sms" label="Text message" />
            <Checkbox name="channel" value="app" label="Mobile app" />
          </FieldGroup>
          <FieldGroup label="Archived options" disabled>
            <Checkbox name="archived" value="fax" label="Fax" />
          </FieldGroup>
        </div>
      </section>

      <section aria-labelledby="field-rtl-heading" className="flex flex-col gap-105">
        <h3 id="field-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl" className="flex flex-col gap-3">
          <Field
            label="الاسم الكامل"
            hint="كما هو موضح في الهوية."
            error="أدخل الاسم الكامل"
            required
            requiredLabel="مطلوب"
          >
            <Input />
          </Field>
          <FieldGroup label="طرق التواصل" hint="اختر كل ما ينطبق.">
            <Checkbox name="rtl-contact" value="email" label="البريد الإلكتروني" />
            <Checkbox name="rtl-contact" value="phone" label="الهاتف" />
          </FieldGroup>
        </div>
      </section>
    </div>
  )
}
