// SPDX-License-Identifier: MIT

'use client'

import { Field, Input, Validation } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function ValidationDemo(): React.JSX.Element {
  const [password, setPassword] = React.useState('')

  const checks = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'One uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'One number', valid: /[0-9]/.test(password) },
    { label: 'One symbol', valid: /[^A-Za-z0-9]/.test(password) },
  ]

  return (
    <DemoStack>
      <DemoSection title="Live password requirements (they tick off as you type)">
        <div className="flex max-w-md flex-col gap-3">
          <Field label="Create a password" id="docs-new-password">
            <Input
              type="password"
              autoComplete="new-password"
              aria-describedby="docs-password-rules"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
          <Validation id="docs-password-rules" heading="Your password must have" checks={checks} />
        </div>
      </DemoSection>
    </DemoStack>
  )
}
