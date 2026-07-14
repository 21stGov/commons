// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Checkbox } from '@/components/checkbox'
import { FieldProvider } from '@/components/field/context'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Checkbox accessibility (axe)', () => {
  it('default state is axe-clean', async () => {
    const { container } = render(<Checkbox label="Subscribe to updates" />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('checked state is axe-clean', async () => {
    const { container } = render(<Checkbox label="Subscribe to updates" defaultChecked />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('with description is axe-clean', async () => {
    const { container } = render(
      <Checkbox label="Subscribe to updates" description="We send at most one email per month." />
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('disabled state is axe-clean', async () => {
    const { container } = render(<Checkbox label="Subscribe to updates" disabled />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('indeterminate state is axe-clean', async () => {
    const { container } = render(<Checkbox label="Select all" indeterminate />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('required state is axe-clean', async () => {
    const { container } = render(<Checkbox label="Accept the terms" required />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('error state (inside FieldProvider) is axe-clean', async () => {
    const { container } = render(
      <>
        <p id="terms-error">You must accept the terms.</p>
        <FieldProvider id="terms" hasError>
          <Checkbox label="Accept the terms" />
        </FieldProvider>
      </>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Checkbox name, role, and value', () => {
  it('renders a native checkbox input named by its visible label', () => {
    render(<Checkbox label="Subscribe to updates" />)

    const checkbox = screen.getByRole('checkbox', {
      name: 'Subscribe to updates',
    })
    expect(checkbox).toBeInstanceOf(HTMLInputElement)
    expect(checkbox).toHaveAttribute('type', 'checkbox')
    expect(checkbox.closest("[data-slot='checkbox']")).not.toBeNull()
  })

  it('links the description via aria-describedby without polluting the name', () => {
    render(
      <Checkbox label="Subscribe to updates" description="We send at most one email per month." />
    )

    const checkbox = screen.getByRole('checkbox', {
      name: 'Subscribe to updates',
    })
    expect(checkbox).toHaveAccessibleDescription('We send at most one email per month.')
  })

  it('exposes the mixed state via the indeterminate IDL property', () => {
    const { container } = render(<Checkbox label="Select all" indeterminate />)
    expect(screen.getByRole('checkbox')).toBePartiallyChecked()
    expect(container.querySelector('[data-slot="checkbox-indeterminate-mark"]')).toHaveClass(
      'text-primary-foreground',
      'peer-indeterminate:visible'
    )
  })

  it('aligns the control to the first text line via a one-line control box', () => {
    const { container } = render(<Checkbox label="Updates" description="Once a week" />)
    // The label centers its content within the 44px target (flex-col
    // justify-center); the inner row top-aligns so the control rides in a
    // first-line box and stays optically on the first line of the label.
    expect(container.querySelector('[data-slot="checkbox-label"]')?.className).toContain(
      'justify-center'
    )
    expect(container.querySelector('[data-slot="checkbox-row"]')?.className).toContain(
      'items-start'
    )
    expect(container.querySelector('[data-slot="checkbox-control-box"]')?.className).toContain(
      'h-[1.375em]'
    )
  })

  it('clears the mixed state when indeterminate turns off', () => {
    const { rerender } = render(<Checkbox label="Select all" indeterminate />)
    expect(screen.getByRole('checkbox')).toBePartiallyChecked()

    rerender(<Checkbox label="Select all" indeterminate={false} />)
    expect(screen.getByRole('checkbox')).not.toBePartiallyChecked()
  })

  it('reflects checked / unchecked value', async () => {
    const user = userEvent.setup()
    render(<Checkbox label="Subscribe" />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
    await user.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('warns in development when label is missing or empty', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // Deliberately violating the required-label contract for the guard test.
    render(<Checkbox label={'' as unknown as string} />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('label'))
  })

  it('does not warn when a label is provided', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Checkbox label="Subscribe" />)
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('Checkbox Field wiring', () => {
  it('inherits id, describedby, invalid, required, and disabled from the Field contract', () => {
    render(
      <>
        <p id="news-hint">Optional.</p>
        <p id="news-error">Something is wrong.</p>
        <FieldProvider id="news" hasHint hasError required disabled>
          <Checkbox label="Subscribe" />
        </FieldProvider>
      </>
    )

    const checkbox = screen.getByRole('checkbox')
    // The checkbox keeps its OWN id (never the Field's): it renders its own
    // wrapping <label>, and adopting the Field id would associate the
    // Field's <label htmlFor> too — two label elements per control
    // (axe: form-field-multiple-labels) and double announcements.
    expect(checkbox).not.toHaveAttribute('id', 'news')
    expect(checkbox.id).not.toBe('')
    expect(checkbox).toHaveAttribute('aria-describedby', 'news-hint news-error')
    expect(checkbox).toHaveAttribute('aria-invalid', 'true')
    expect(checkbox).toBeRequired()
    expect(checkbox).toBeDisabled()
  })

  it('merges its own description before the Field describedby ids', () => {
    render(
      <>
        <p id="news-hint">Optional.</p>
        <FieldProvider id="news" hasHint>
          <Checkbox label="Subscribe" description="Own description" />
        </FieldProvider>
      </>
    )

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute(
      'aria-describedby',
      `${checkbox.id}-description news-hint`
    )
  })

  it('works standalone with a generated id outside any Field', () => {
    render(<Checkbox label="Subscribe" description="Own description" />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox.id).not.toBe('')
    expect(checkbox).toHaveAccessibleDescription('Own description')
  })
})

describe('Checkbox keyboard contract', () => {
  it('Tab moves focus to the checkbox', async () => {
    const user = userEvent.setup()
    render(<Checkbox label="Subscribe" />)

    await user.tab()
    expect(screen.getByRole('checkbox')).toHaveFocus()
  })

  it('Space toggles the checkbox on and off', async () => {
    const user = userEvent.setup()
    render(<Checkbox label="Subscribe" />)

    const checkbox = screen.getByRole('checkbox')
    await user.tab()
    await user.keyboard(' ')
    expect(checkbox).toBeChecked()

    await user.keyboard(' ')
    expect(checkbox).not.toBeChecked()
  })

  it('a disabled checkbox is removed from the tab order and cannot toggle', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Checkbox label="Subscribe" disabled onChange={onChange} />)

    await user.tab()
    expect(screen.getByRole('checkbox')).not.toHaveFocus()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('clicking the label text toggles the input (the label is the target)', async () => {
    const user = userEvent.setup()
    render(<Checkbox label="Subscribe" />)

    await user.click(screen.getByText('Subscribe'))
    expect(screen.getByRole('checkbox')).toBeChecked()
  })
})

describe('Checkbox RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <Checkbox label="اشترك في التحديثات" description="بريد واحد شهريًا" />
      </div>
    )

    expect(screen.getByRole('checkbox', { name: 'اشترك في التحديثات' })).toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})
