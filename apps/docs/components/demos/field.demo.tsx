// SPDX-License-Identifier: MIT

'use client'

import { Checkbox, Field, FieldGroup, Input } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function FieldDemo(): React.JSX.Element {
  const [name, setName] = React.useState('')
  const nameError = name.trim() === '' ? 'Enter your full name' : undefined

  return (
    <DemoStack>
      <DemoSection title="Label, hint, required, disabled">
        <div className="flex max-w-md flex-col gap-3">
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
      </DemoSection>

      <DemoSection title="Live validation error (clear the input)">
        <div className="max-w-md">
          <Field label="Full name" hint="As shown on your ID." required error={nameError}>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
            />
          </Field>
        </div>
      </DemoSection>

      <DemoSection title="FieldGroup (fieldset + legend)">
        <FieldGroup label="Notification channels" error="Select at least one channel.">
          <Checkbox name="channel" value="sms" label="Text message" />
          <Checkbox name="channel" value="app" label="Mobile app" />
        </FieldGroup>
      </DemoSection>
    </DemoStack>
  )
}
