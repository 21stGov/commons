// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Field } from '@/components/field'
import { Form, useFormErrors, useFormFieldError, type FormErrors } from '@/components/form'
import { Input } from '@/components/input'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

/** A Commons Field whose error is pulled from the surrounding Form context. */
function EmailField(): React.JSX.Element {
  return (
    <Field label="Email" error={useFormFieldError('email')}>
      <Input type="email" name="email" />
    </Field>
  )
}

function NameField(): React.JSX.Element {
  return (
    <Field label="Full name" error={useFormFieldError('fullName')}>
      <Input name="fullName" />
    </Field>
  )
}

/** Renders a summary list from the full error map (error-summary pattern). */
function ErrorSummary(): React.JSX.Element | null {
  const errors = useFormErrors()
  const names = Object.keys(errors)
  if (names.length === 0) {
    return null
  }
  return (
    <ul data-testid="summary">
      {names.map((name) => (
        <li key={name}>{String(errors[name])}</li>
      ))}
    </ul>
  )
}

describe('Form accessibility (axe)', () => {
  it('default (empty, two fields) is axe-clean', async () => {
    const { container } = render(
      <Form aria-label="Contact">
        <NameField />
        <EmailField />
        <button type="submit">Submit</button>
      </Form>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('with server errors routed to fields is axe-clean', async () => {
    const { container } = render(
      <Form aria-label="Contact" errors={{ email: 'Enter a valid email address.' }} focusOnError={false}>
        <NameField />
        <EmailField />
        <button type="submit">Submit</button>
      </Form>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('with an error summary is axe-clean', async () => {
    const { container } = render(
      <Form
        aria-label="Contact"
        errors={{ fullName: 'Enter your name.', email: 'Enter a valid email address.' }}
        focusOnError={false}
      >
        <ErrorSummary />
        <NameField />
        <EmailField />
        <button type="submit">Submit</button>
      </Form>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Form native / progressive-enhancement semantics', () => {
  it('renders a real <form> element carrying action and method', () => {
    const { container } = render(
      <Form action="/submit" method="post" aria-label="Contact">
        <EmailField />
      </Form>
    )
    const form = container.querySelector('form')
    expect(form).not.toBeNull()
    expect(form).toHaveAttribute('action', '/submit')
    expect(form).toHaveAttribute('method', 'post')
  })

  it('passes onSubmit through so callers own submission', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault())
    render(
      <Form onSubmit={onSubmit} aria-label="Contact">
        <EmailField />
        <button type="submit">Submit</button>
      </Form>
    )
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})

describe('Form server-error routing', () => {
  it('routes a server error to the matching Field message and sets aria-invalid', () => {
    render(
      <Form errors={{ email: 'Enter a valid email address.' }} focusOnError={false} aria-label="Contact">
        <NameField />
        <EmailField />
      </Form>
    )
    const email = screen.getByRole('textbox', { name: 'Email' })
    expect(email).toHaveAttribute('aria-invalid', 'true')
    expect(email).toHaveAccessibleDescription('Enter a valid email address.')
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()

    // A field with no error stays valid.
    const name = screen.getByRole('textbox', { name: 'Full name' })
    expect(name).not.toHaveAttribute('aria-invalid')
  })

  it('renders the first message when a field has several errors', () => {
    render(
      <Form errors={{ email: ['Enter a valid email address.', 'Domain not allowed.'] }} focusOnError={false} aria-label="Contact">
        <EmailField />
      </Form>
    )
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
    expect(screen.queryByText('Domain not allowed.')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('aria-invalid', 'true')
  })

  it('exposes the whole error map via useFormErrors for summaries', () => {
    render(
      <Form errors={{ fullName: 'Enter your name.', email: 'Enter a valid email address.' }} focusOnError={false} aria-label="Contact">
        <ErrorSummary />
        <NameField />
        <EmailField />
      </Form>
    )
    const summary = screen.getByTestId('summary')
    expect(summary).toHaveTextContent('Enter your name.')
    expect(summary).toHaveTextContent('Enter a valid email address.')
  })

  it('is standalone-safe: a Field using the hook outside a Form shows no error', () => {
    render(<EmailField />)
    const email = screen.getByRole('textbox', { name: 'Email' })
    expect(email).not.toHaveAttribute('aria-invalid')
  })
})

describe('Form focus management', () => {
  function SubmitHarness({
    focusOnError,
  }: {
    focusOnError?: boolean
  }): React.JSX.Element {
    const [errors, setErrors] = React.useState<FormErrors | undefined>(undefined)
    return (
      <Form
        aria-label="Contact"
        errors={errors}
        focusOnError={focusOnError}
        onSubmit={(event) => {
          event.preventDefault()
          setErrors({ email: 'Enter a valid email address.' })
        }}
      >
        <NameField />
        <EmailField />
        <button type="submit">Submit</button>
      </Form>
    )
  }

  it('moves focus to the first errored control when a submit returns errors', async () => {
    const user = userEvent.setup()
    render(<SubmitHarness />)
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveFocus()
  })

  it('does not steal focus when focusOnError is false', async () => {
    const user = userEvent.setup()
    render(<SubmitHarness focusOnError={false} />)
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    expect(screen.getByRole('textbox', { name: 'Email' })).not.toHaveFocus()
  })

  it('does not steal focus on the initial mount even with errors present', () => {
    render(
      <Form errors={{ email: 'Enter a valid email address.' }} aria-label="Contact">
        <EmailField />
      </Form>
    )
    expect(screen.getByRole('textbox', { name: 'Email' })).not.toHaveFocus()
  })
})
