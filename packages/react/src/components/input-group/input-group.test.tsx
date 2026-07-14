// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { InputGroup, InputGroupButton } from '@/components/input-group'
import { FieldProvider } from '@/components/field/context'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('InputGroup accessibility (axe)', () => {
  it('default state is axe-clean', async () => {
    const { container } = render(<InputGroup aria-label="Amount" prefix="$" />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('filled with a meaningful prefix/suffix is axe-clean', async () => {
    const { container } = render(
      <InputGroup
        aria-label="Weight"
        prefix="$"
        prefixLabel="Amount in US dollars"
        suffix="lbs"
        suffixLabel="Weight in pounds"
        defaultValue="42"
      />
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('with a trailing action button is axe-clean', async () => {
    const { container } = render(
      <InputGroup
        aria-label="Search"
        actions={<InputGroupButton aria-label="Clear">x</InputGroupButton>}
      />
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('disabled state is axe-clean', async () => {
    const { container } = render(<InputGroup aria-label="Amount" prefix="$" disabled />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('error state (inside FieldProvider) is axe-clean', async () => {
    const { container } = render(
      <>
        <label htmlFor="amount">Amount</label>
        <p id="amount-error">Enter a valid amount.</p>
        <FieldProvider id="amount" hasError>
          <InputGroup prefix="$" />
        </FieldProvider>
      </>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('InputGroup structure and addons', () => {
  it('renders a single text input (one tab stop for the value)', () => {
    render(<InputGroup aria-label="Amount" prefix="$" suffix="lbs" />)
    expect(screen.getByRole('textbox', { name: 'Amount' })).toBeInTheDocument()
  })

  it('accepts typed input and forwards value changes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<InputGroup aria-label="Amount" prefix="$" onChange={onChange} />)
    const input = screen.getByRole('textbox')
    await user.type(input, '123')
    expect(input).toHaveValue('123')
    expect(onChange).toHaveBeenCalled()
  })

  it('keeps decorative prefix/suffix out of the accessible name (aria-hidden)', () => {
    const { container } = render(<InputGroup aria-label="Amount" prefix="$" suffix="lbs" />)
    const prefix = container.querySelector('[data-slot="input-group-prefix"]')
    const suffix = container.querySelector('[data-slot="input-group-suffix"]')
    expect(prefix).toHaveAttribute('aria-hidden', 'true')
    expect(suffix).toHaveAttribute('aria-hidden', 'true')
    // The visible symbol never becomes the input's name.
    expect(screen.getByRole('textbox')).toHaveAccessibleName('Amount')
  })

  it('associates a meaningful unit via aria-describedby (prefixLabel/suffixLabel)', () => {
    render(
      <InputGroup
        aria-label="Amount"
        prefix="$"
        prefixLabel="Amount in US dollars"
        suffix="lbs"
        suffixLabel="Weight in pounds"
      />
    )
    const input = screen.getByRole('textbox')
    expect(input).toHaveAccessibleDescription('Amount in US dollars Weight in pounds')
  })
})

describe('InputGroup focus behavior', () => {
  it('clicking a decorative addon focuses the input, not the addon', async () => {
    const user = userEvent.setup()
    const { container } = render(<InputGroup aria-label="Amount" prefix="$" />)
    const prefix = container.querySelector('[data-slot="input-group-prefix"]') as HTMLElement
    await user.click(prefix)
    expect(screen.getByRole('textbox')).toHaveFocus()
  })

  it('scopes the group focus ring to the input (has-[input:focus]), not to actions', () => {
    const { container } = render(
      <InputGroup
        aria-label="Search"
        actions={<InputGroupButton aria-label="Clear">x</InputGroupButton>}
      />
    )
    const group = container.querySelector('[data-slot="input-group"]')
    // Inherited focus-within ring is cancelled; the ring is re-scoped to the input.
    expect(group?.className).toContain('focus-within:outline-0')
    expect(group?.className).toContain('has-[[data-slot=input]:focus]:outline-2')
  })

  it('renders a trailing action button as its own tab stop with an accessible name', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <InputGroup
        aria-label="Search"
        actions={
          <InputGroupButton aria-label="Clear search" onClick={onClick}>
            x
          </InputGroupButton>
        }
      />
    )
    const button = screen.getByRole('button', { name: 'Clear search' })

    await user.tab() // input
    expect(screen.getByRole('textbox')).toHaveFocus()
    await user.tab() // action button
    expect(button).toHaveFocus()

    await user.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('InputGroup Field wiring', () => {
  it('inherits id, describedby, invalid, required, and disabled from the Field', () => {
    render(
      <>
        <label htmlFor="amount">Amount</label>
        <p id="amount-hint">Optional.</p>
        <p id="amount-error">Something is wrong.</p>
        <FieldProvider id="amount" hasHint hasError required disabled>
          <InputGroup prefix="$" />
        </FieldProvider>
      </>
    )
    const input = screen.getByRole('textbox', { name: 'Amount' })
    expect(input).toHaveAttribute('id', 'amount')
    expect(input).toHaveAttribute('aria-describedby', 'amount-hint amount-error')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toBeRequired()
    expect(input).toBeDisabled()
  })

  it('styles the WHOLE group border on error via data-invalid, not just the input', () => {
    const { container } = render(
      <>
        <label htmlFor="amount">Amount</label>
        <p id="amount-error">Bad.</p>
        <FieldProvider id="amount" hasError>
          <InputGroup prefix="$" />
        </FieldProvider>
      </>
    )
    const group = container.querySelector('[data-slot="input-group"]')
    expect(group).toHaveAttribute('data-invalid')
    // The wrapper carries the error border/ring tokens (data-invalid variants).
    expect(group?.className).toContain('data-invalid:border-error-border')
  })

  it('marks the group disabled and blocks its actions', () => {
    const { container } = render(
      <>
        <label htmlFor="amount">Amount</label>
        <FieldProvider id="amount" disabled>
          <InputGroup prefix="$" actions={<InputGroupButton aria-label="Clear">x</InputGroupButton>} />
        </FieldProvider>
      </>
    )
    const group = container.querySelector('[data-slot="input-group"]')
    const actions = container.querySelector('[data-slot="input-group-actions"]')
    expect(group).toHaveAttribute('data-disabled')
    expect(actions?.className).toContain('pointer-events-none')
  })

  it('merges its own unit description before the Field describedby ids', () => {
    render(
      <>
        <label htmlFor="amount">Amount</label>
        <p id="amount-hint">Optional.</p>
        <FieldProvider id="amount" hasHint>
          <InputGroup prefix="$" prefixLabel="Amount in US dollars" />
        </FieldProvider>
      </>
    )
    const input = screen.getByRole('textbox')
    const describedBy = input.getAttribute('aria-describedby') ?? ''
    const ids = describedBy.split(' ')
    expect(document.getElementById(ids[0])).toHaveTextContent('Amount in US dollars')
    expect(ids).toContain('amount-hint')
  })
})

describe('InputGroup controlled and uncontrolled', () => {
  it('supports an uncontrolled defaultValue', () => {
    render(<InputGroup aria-label="Amount" prefix="$" defaultValue="10" />)
    expect(screen.getByRole('textbox')).toHaveValue('10')
  })

  it('supports a controlled value via value + onChange', async () => {
    const user = userEvent.setup()

    function Controlled(): React.JSX.Element {
      const [value, setValue] = React.useState('')
      return (
        <InputGroup
          aria-label="Amount"
          prefix="$"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      )
    }

    render(<Controlled />)
    const input = screen.getByRole('textbox')
    await user.type(input, '99')
    expect(input).toHaveValue('99')
  })
})

describe('InputGroup dev guard', () => {
  it('warns when the group has no accessible name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<InputGroup prefix="$" />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('accessible name'))
  })

  it('does not warn when an aria-label is provided', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<InputGroup aria-label="Amount" prefix="$" />)
    expect(warn).not.toHaveBeenCalled()
  })

  it('does not warn inside a Field', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <>
        <label htmlFor="amount">Amount</label>
        <FieldProvider id="amount">
          <InputGroup prefix="$" />
        </FieldProvider>
      </>
    )
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('InputGroup RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <InputGroup aria-label="المبلغ" prefix="$" prefixLabel="المبلغ بالدولار" />
      </div>
    )
    expect(screen.getByRole('textbox', { name: 'المبلغ' })).toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})
