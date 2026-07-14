// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it } from 'vitest'

import { Field, FieldGroup } from '@/components/field'
import { useFieldControl } from '@/components/field/context'
import { axeCheck } from '../../../test/setup.js'

/**
 * Minimal control that follows the Field contract: it spreads
 * `useFieldControl()` onto a native input, exactly like the real form
 * controls do.
 */
function TextControl(props: React.InputHTMLAttributes<HTMLInputElement>): React.JSX.Element {
  const field = useFieldControl()
  return <input type="text" {...field} {...props} />
}

describe('Field label association', () => {
  it('associates the label with the control via htmlFor/id', () => {
    render(
      <Field label="Email address">
        <TextControl />
      </Field>
    )

    const input = screen.getByLabelText('Email address')
    expect(input.tagName).toBe('INPUT')
    const label = screen.getByText('Email address')
    expect(label.tagName).toBe('LABEL')
    expect(label).toHaveAttribute('for', input.id)
  })

  it('uses an explicit id when provided', () => {
    render(
      <Field label="Email address" id="email">
        <TextControl />
      </Field>
    )

    expect(screen.getByLabelText('Email address')).toHaveAttribute('id', 'email')
  })

  it('sets data-slot markers on its parts', () => {
    const { container } = render(
      <Field label="Name" hint="Legal name" error="Enter your name">
        <TextControl />
      </Field>
    )

    expect(container.querySelector('[data-slot="field"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="field-label"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="field-hint"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="field-error"]')).toBeInTheDocument()
  })
})

describe('Field aria-describedby composition', () => {
  it('references the hint id when only a hint is rendered', () => {
    render(
      <Field label="Name" id="name" hint="As shown on your ID">
        <TextControl />
      </Field>
    )

    const input = screen.getByLabelText('Name')
    expect(input).toHaveAttribute('aria-describedby', 'name-hint')
    expect(screen.getByText('As shown on your ID')).toHaveAttribute('id', 'name-hint')
  })

  it('references the error id when only an error is rendered', () => {
    render(
      <Field label="Name" id="name" error="Enter your name">
        <TextControl />
      </Field>
    )

    const input = screen.getByLabelText('Name')
    expect(input).toHaveAttribute('aria-describedby', 'name-error')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('orders hint before error when both are rendered', () => {
    render(
      <Field label="Name" id="name" hint="As shown on your ID" error="Enter your name">
        <TextControl />
      </Field>
    )

    expect(screen.getByLabelText('Name')).toHaveAttribute(
      'aria-describedby',
      'name-hint name-error'
    )
  })

  it('sets no aria-describedby without hint or error', () => {
    render(
      <Field label="Name">
        <TextControl />
      </Field>
    )

    const input = screen.getByLabelText('Name')
    expect(input).not.toHaveAttribute('aria-describedby')
    expect(input).not.toHaveAttribute('aria-invalid')
  })
})

describe('Field required accessibility', () => {
  it('marks the control required and appends the visually hidden label', () => {
    render(
      <Field label="Name" required>
        <TextControl />
      </Field>
    )

    const input = screen.getByRole('textbox', { name: 'Name, required' })
    expect(input).toBeRequired()
  })

  it('hides the visible asterisk from assistive technology', () => {
    render(
      <Field label="Name" required>
        <TextControl />
      </Field>
    )

    const asterisk = screen.getByText('*')
    expect(asterisk).toHaveAttribute('aria-hidden', 'true')
  })

  it('accepts a translated requiredLabel', () => {
    render(
      <Field label="Nombre" required requiredLabel="obligatorio">
        <TextControl />
      </Field>
    )

    expect(screen.getByRole('textbox', { name: 'Nombre, obligatorio' })).toBeRequired()
  })

  it('does not render a required indicator by default', () => {
    render(
      <Field label="Name">
        <TextControl />
      </Field>
    )

    expect(screen.queryByText('*')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Name' })).not.toBeRequired()
  })
})

describe('Field disabled state', () => {
  it('disables the control through the context', () => {
    render(
      <Field label="Name" disabled>
        <TextControl />
      </Field>
    )

    expect(screen.getByLabelText('Name')).toBeDisabled()
  })

  it('keeps the control enabled and unreachable states off by default', async () => {
    const user = userEvent.setup()
    render(
      <Field label="Name">
        <TextControl />
      </Field>
    )

    const input = screen.getByLabelText('Name')
    expect(input).toBeEnabled()
    await user.tab()
    expect(input).toHaveFocus()
    await user.keyboard('Ada')
    expect(input).toHaveValue('Ada')
  })

  it('removes a disabled control from the tab order', async () => {
    const user = userEvent.setup()
    render(
      <Field label="Name" disabled>
        <TextControl />
      </Field>
    )

    await user.tab()
    expect(screen.getByLabelText('Name')).not.toHaveFocus()
  })
})

describe('Field error live region', () => {
  it('renders the polite live container before any error content exists', () => {
    const { container, rerender } = render(
      <Field label="Name" id="name">
        <TextControl />
      </Field>
    )

    const region = container.querySelector('[data-slot="field-error-region"]')
    expect(region).toBeInTheDocument()
    expect(region).toHaveAttribute('aria-live', 'polite')
    expect(region).toBeEmptyDOMElement()

    // Text is swapped into the pre-existing container so it is announced.
    rerender(
      <Field label="Name" id="name" error="Enter your name">
        <TextControl />
      </Field>
    )

    const error = screen.getByText('Enter your name')
    expect(region).toContainElement(error)
    expect(container.querySelector('[data-slot="field-error"]')).toHaveAttribute('id', 'name-error')
  })

  it('pairs the error text with a non-color icon indicator', () => {
    const { container } = render(
      <Field label="Name" error="Enter your name">
        <TextControl />
      </Field>
    )

    const errorEl = container.querySelector('[data-slot="field-error"]')
    const iconWrapper = errorEl?.querySelector('[data-slot="field-error-icon"]')
    const icon = errorEl?.querySelector('svg')
    expect(iconWrapper).toHaveClass('h-[1.375em]', 'w-2', 'items-center')
    expect(icon).toBeTruthy()
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  it('clears aria-invalid and the error wiring when the error resolves', () => {
    const { rerender } = render(
      <Field label="Name" id="name" error="Enter your name">
        <TextControl />
      </Field>
    )

    rerender(
      <Field label="Name" id="name">
        <TextControl />
      </Field>
    )

    const input = screen.getByLabelText('Name')
    expect(input).not.toHaveAttribute('aria-invalid')
    expect(input).not.toHaveAttribute('aria-describedby')
    expect(screen.queryByText('Enter your name')).not.toBeInTheDocument()
  })
})

describe('FieldGroup', () => {
  function renderGroup(props: Partial<React.ComponentProps<typeof FieldGroup>> = {}) {
    return render(
      <FieldGroup label="Contact preferences" id="contact" {...props}>
        <label>
          <input type="checkbox" name="contact" value="email" /> Email
        </label>
        <label>
          <input type="checkbox" name="contact" value="phone" /> Phone
        </label>
      </FieldGroup>
    )
  }

  it('renders a fieldset with the legend as its accessible name', () => {
    renderGroup()

    const group = screen.getByRole('group', { name: 'Contact preferences' })
    expect(group.tagName).toBe('FIELDSET')
    expect(group).toHaveAttribute('data-slot', 'field-group')
  })

  it('wires hint then error into aria-describedby on the fieldset', () => {
    renderGroup({ hint: 'Select all that apply', error: 'Select at least one' })

    const group = screen.getByRole('group', { name: 'Contact preferences' })
    expect(group).toHaveAttribute('aria-describedby', 'contact-hint contact-error')
    expect(screen.getByText('Select all that apply')).toHaveAttribute('id', 'contact-hint')
    expect(screen.getByText('Select at least one').closest('p')).toHaveAttribute(
      'id',
      'contact-error'
    )
  })

  it('renders the live error container before content and swaps text in', () => {
    const { container, rerender } = render(
      <FieldGroup label="Contact preferences" id="contact">
        <label>
          <input type="checkbox" /> Email
        </label>
      </FieldGroup>
    )

    const region = container.querySelector('[data-slot="field-error-region"]')
    expect(region).toHaveAttribute('aria-live', 'polite')
    expect(region).toBeEmptyDOMElement()

    rerender(
      <FieldGroup label="Contact preferences" id="contact" error="Select at least one">
        <label>
          <input type="checkbox" /> Email
        </label>
      </FieldGroup>
    )

    expect(region).toContainElement(screen.getByText('Select at least one'))
  })

  it('shows the required indicator with a visually hidden label in the legend', () => {
    renderGroup({ required: true })

    expect(screen.getByRole('group', { name: 'Contact preferences, required' })).toBeInTheDocument()
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true')
  })

  it('disables every grouped control via the native fieldset attribute', () => {
    renderGroup({ disabled: true })

    expect(screen.getByRole('group', { name: 'Contact preferences' })).toBeDisabled()
    for (const checkbox of screen.getAllByRole('checkbox')) {
      expect(checkbox).toBeDisabled()
    }
  })

  it('supports keyboard interaction on grouped controls', async () => {
    const user = userEvent.setup()
    renderGroup()

    await user.tab()
    const [email] = screen.getAllByRole('checkbox')
    expect(email).toHaveFocus()
    await user.keyboard(' ')
    expect(email).toBeChecked()
  })
})

describe('Field accessibility (axe)', () => {
  const states: Array<[string, React.JSX.Element]> = [
    [
      'default',
      <Field key="default" label="Name">
        <TextControl />
      </Field>,
    ],
    [
      'with hint',
      <Field key="hint" label="Name" hint="As shown on your ID">
        <TextControl />
      </Field>,
    ],
    [
      'with error',
      <Field key="error" label="Name" error="Enter your name">
        <TextControl />
      </Field>,
    ],
    [
      'required',
      <Field key="required" label="Name" required>
        <TextControl />
      </Field>,
    ],
    [
      'disabled',
      <Field key="disabled" label="Name" disabled>
        <TextControl />
      </Field>,
    ],
    [
      'hint + error + required',
      <Field key="all" label="Name" hint="As shown on your ID" error="Enter your name" required>
        <TextControl />
      </Field>,
    ],
    [
      'group default',
      <FieldGroup key="group" label="Contact preferences">
        <label>
          <input type="checkbox" /> Email
        </label>
      </FieldGroup>,
    ],
    [
      'group with hint, error, required',
      <FieldGroup
        key="group-all"
        label="Contact preferences"
        hint="Select all that apply"
        error="Select at least one"
        required
      >
        <label>
          <input type="checkbox" /> Email
        </label>
      </FieldGroup>,
    ],
    [
      'group disabled',
      <FieldGroup key="group-disabled" label="Contact preferences" disabled>
        <label>
          <input type="checkbox" /> Email
        </label>
      </FieldGroup>,
    ],
  ]

  for (const [name, element] of states) {
    it(`${name} is axe-clean`, async () => {
      const { container } = render(element)
      expect(await axeCheck(container)).toHaveNoViolations()
    })
  }
})

describe('Field RTL', () => {
  it('Field renders and stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <Field
          label="الاسم"
          hint="كما هو موضح في الهوية"
          error="أدخل الاسم"
          required
          requiredLabel="مطلوب"
        >
          <TextControl />
        </Field>
      </div>
    )

    expect(screen.getByRole('textbox', { name: /الاسم/ })).toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('FieldGroup renders and stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <FieldGroup label="طرق التواصل" hint="اختر كل ما ينطبق">
          <label>
            <input type="checkbox" /> البريد الإلكتروني
          </label>
        </FieldGroup>
      </div>
    )

    expect(screen.getByRole('group', { name: 'طرق التواصل' })).toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})
