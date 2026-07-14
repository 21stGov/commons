// SPDX-License-Identifier: MIT

'use client'

import {
  Field,
  Form,
  Input,
  useFormFieldError,
  type FormErrors,
} from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

/** A Field whose error is pulled from the surrounding Form. */
function EmailField(): React.JSX.Element {
  return (
    <Field
      label="Email address"
      hint="We use this to send your permit confirmation."
      error={useFormFieldError('email')}
    >
      <Input type="email" name="email" autoComplete="email" />
    </Field>
  )
}

function NameField(): React.JSX.Element {
  return (
    <Field label="Full name" error={useFormFieldError('fullName')}>
      <Input name="fullName" autoComplete="name" />
    </Field>
  )
}

const submitClasses =
  'inline-flex min-h-11 items-center justify-center self-start rounded-sm bg-primary px-105 text-sm font-medium text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'

/** Client validation: check the fields on submit and set field errors. */
function ClientValidationExample(): React.JSX.Element {
  const [errors, setErrors] = React.useState<FormErrors | undefined>(undefined)

  return (
    <Form
      aria-label="Request a building permit"
      errors={errors}
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const next: FormErrors = {}
        if (!String(data.get('fullName') ?? '').trim()) {
          next.fullName = 'Enter your full name.'
        }
        const email = String(data.get('email') ?? '').trim()
        if (!email.includes('@')) {
          next.email = 'Enter a valid email address, like name@example.gov.'
        }
        setErrors(Object.keys(next).length ? next : undefined)
      }}
    >
      <NameField />
      <EmailField />
      <button type="submit" className={submitClasses}>
        Submit request
      </button>
    </Form>
  )
}

/** Server-error example: an error routed to a specific field by name. */
function ServerErrorExample(): React.JSX.Element {
  return (
    <Form
      aria-label="Account details"
      focusOnError={false}
      errors={{ email: 'That email is already registered. Try signing in instead.' }}
    >
      <NameField />
      <EmailField />
      <button type="submit" className={submitClasses}>
        Create account
      </button>
    </Form>
  )
}

export default function FormDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Client validation on submit">
        <ClientValidationExample />
      </DemoSection>

      <DemoSection title="Server error routed to a field">
        <ServerErrorExample />
      </DemoSection>
    </DemoStack>
  )
}
