// SPDX-License-Identifier: MIT

import { Field, Input, Validation } from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Validation'

export default function Demo(): React.JSX.Element {
  const [password, setPassword] = React.useState('')

  const checks = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'One uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'One number', valid: /[0-9]/.test(password) },
    { label: 'One symbol', valid: /[^A-Za-z0-9]/.test(password) },
  ]

  return (
    <div className="flex max-w-prose flex-col gap-6">
      <Field label="Create a password" id="new-password">
        <Input
          type="password"
          autoComplete="new-password"
          aria-describedby="password-rules"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </Field>
      <Validation id="password-rules" heading="Your password must have" checks={checks} />
    </div>
  )
}
