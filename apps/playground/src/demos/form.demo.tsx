// SPDX-License-Identifier: MIT

import {
  Field,
  Form,
  Input,
  useFormFieldError,
  type FormErrors,
} from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Form'

const submitClasses =
  'inline-flex min-h-11 items-center justify-center self-start rounded-sm bg-primary px-105 text-sm font-medium text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'

function NameField(): React.JSX.Element {
  return (
    <Field label="Full name" error={useFormFieldError('fullName')}>
      <Input name="fullName" autoComplete="name" />
    </Field>
  )
}

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

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex max-w-md flex-col gap-6">
      <section aria-labelledby="form-client-heading">
        <h3 id="form-client-heading" className="mb-2 text-sm font-semibold">
          Client validation on submit
        </h3>
        <ClientValidationExample />
      </section>

      <section aria-labelledby="form-server-heading">
        <h3 id="form-server-heading" className="mb-2 text-sm font-semibold">
          Server error routed to a field
        </h3>
        <ServerErrorExample />
      </section>
    </div>
  )
}
