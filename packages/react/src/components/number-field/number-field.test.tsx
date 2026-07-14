// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { NumberField } from '@/components/number-field'
import { FieldProvider } from '@/components/field/context'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('NumberField accessibility (axe)', () => {
  it('default (empty) state is axe-clean', async () => {
    const { container } = render(<NumberField label="Quantity" />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('filled state is axe-clean', async () => {
    const { container } = render(<NumberField label="Quantity" defaultValue={3} />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('with description is axe-clean', async () => {
    const { container } = render(
      <NumberField label="Amount" description="Amount in U.S. dollars." format={{ style: 'currency', currency: 'USD' }} defaultValue={12} />
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('disabled state is axe-clean', async () => {
    const { container } = render(<NumberField label="Quantity" disabled defaultValue={2} />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('error state (inside FieldProvider) is axe-clean', async () => {
    const { container } = render(
      <>
        <p id="qty-error">Enter a value of at least 1.</p>
        <FieldProvider id="qty" hasError>
          <NumberField label="Quantity" />
        </FieldProvider>
      </>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('NumberField name, role, and steppers', () => {
  it('names the input with its visible label', () => {
    render(<NumberField label="Quantity" />)
    expect(screen.getByRole('textbox', { name: 'Quantity' })).toBeInTheDocument()
  })

  it('renders named increase and decrease stepper buttons', () => {
    render(<NumberField label="Quantity" />)
    expect(screen.getByRole('button', { name: 'Increase' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Decrease' })).toBeInTheDocument()
  })

  it('accepts localized stepper names', () => {
    render(<NumberField label="Cantidad" incrementLabel="Aumentar" decrementLabel="Disminuir" />)
    expect(screen.getByRole('button', { name: 'Aumentar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Disminuir' })).toBeInTheDocument()
  })

  it('keeps visible borders on the group and steppers (forced-colors safety)', () => {
    const { container } = render(<NumberField label="Quantity" />)
    expect(container.querySelector('[data-slot="number-field-group"]')?.className).toContain('border')
    expect(container.querySelector('[data-slot="number-field-decrement"]')?.className).toContain('border-e')
    expect(container.querySelector('[data-slot="number-field-increment"]')?.className).toContain('border-s')
  })
})

describe('NumberField stepping', () => {
  it('increments and decrements with the stepper buttons', async () => {
    const user = userEvent.setup()
    render(<NumberField label="Quantity" defaultValue={3} />)
    const input = screen.getByRole('textbox', { name: 'Quantity' }) as HTMLInputElement

    expect(input.value).toBe('3')
    await user.click(screen.getByRole('button', { name: 'Increase' }))
    expect(input.value).toBe('4')
    await user.click(screen.getByRole('button', { name: 'Decrease' }))
    expect(input.value).toBe('3')
  })

  it('steps with ArrowUp/ArrowDown while the input is focused', async () => {
    const user = userEvent.setup()
    render(<NumberField label="Quantity" defaultValue={5} step={2} />)
    const input = screen.getByRole('textbox', { name: 'Quantity' }) as HTMLInputElement

    await user.click(input)
    await user.keyboard('{ArrowUp}')
    expect(input.value).toBe('7')
    await user.keyboard('{ArrowDown}')
    expect(input.value).toBe('5')
  })

  it('disables the decrement stepper at the min boundary', () => {
    render(<NumberField label="Quantity" min={0} defaultValue={0} />)
    expect(screen.getByRole('button', { name: 'Decrease' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Increase' })).not.toBeDisabled()
  })

  it('disables the increment stepper at the max boundary', () => {
    render(<NumberField label="Quantity" max={10} defaultValue={10} />)
    expect(screen.getByRole('button', { name: 'Increase' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Decrease' })).not.toBeDisabled()
  })
})

describe('NumberField controlled and uncontrolled', () => {
  it('supports an uncontrolled defaultValue', async () => {
    const user = userEvent.setup()
    render(<NumberField label="Quantity" defaultValue={1} />)
    const input = screen.getByRole('textbox', { name: 'Quantity' }) as HTMLInputElement

    await user.click(screen.getByRole('button', { name: 'Increase' }))
    expect(input.value).toBe('2')
  })

  it('supports a controlled value via value + onValueChange', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    function Controlled(): React.JSX.Element {
      const [value, setValue] = React.useState<number | null>(2)
      return (
        <NumberField
          label="Quantity"
          value={value}
          onValueChange={(next) => {
            onValueChange(next)
            setValue(next)
          }}
        />
      )
    }

    render(<Controlled />)
    const input = screen.getByRole('textbox', { name: 'Quantity' }) as HTMLInputElement

    expect(input.value).toBe('2')
    await user.click(screen.getByRole('button', { name: 'Increase' }))
    expect(onValueChange).toHaveBeenCalled()
    expect(onValueChange.mock.calls[0][0]).toBe(3)
    expect(input.value).toBe('3')
  })
})

describe('NumberField dev guard', () => {
  it('warns in development when label is missing or empty', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // Deliberately violating the required-label contract for the guard test.
    render(<NumberField label={'' as unknown as string} />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('label'))
  })

  it('does not warn when a label is provided', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<NumberField label="Quantity" />)
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('NumberField Field wiring', () => {
  it('inherits describedby, invalid, required, and disabled from the Field contract', () => {
    render(
      <>
        <p id="qty-hint">Optional.</p>
        <p id="qty-error">Something is wrong.</p>
        <FieldProvider id="qty" hasHint hasError required disabled>
          <NumberField label="Quantity" />
        </FieldProvider>
      </>
    )

    const input = screen.getByRole('textbox', { name: 'Quantity' })
    // Keeps its OWN id (never the Field's) so the Field's <label htmlFor> does
    // not become a second label for the same input.
    expect(input).not.toHaveAttribute('id', 'qty')
    expect(input.id).not.toBe('')
    expect(input).toHaveAttribute('aria-describedby', 'qty-hint qty-error')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('required')
    expect(input).toBeDisabled()
  })

  it('merges its own description before the Field describedby ids', () => {
    render(
      <>
        <p id="qty-hint">Optional.</p>
        <FieldProvider id="qty" hasHint>
          <NumberField label="Quantity" description="Own description" />
        </FieldProvider>
      </>
    )

    const input = screen.getByRole('textbox', { name: 'Quantity' })
    const describedBy = input.getAttribute('aria-describedby') ?? ''
    const [descId, ...rest] = describedBy.split(' ')
    expect(document.getElementById(descId)).toHaveTextContent('Own description')
    expect(rest).toEqual(['qty-hint'])
  })

  it('links the description as an accessible description standalone', () => {
    render(<NumberField label="Quantity" description="Own description" />)
    const input = screen.getByRole('textbox', { name: 'Quantity' })
    expect(input.id).not.toBe('')
    expect(input).toHaveAccessibleDescription('Own description')
  })

  it('explicit disabled prop wins over the Field default', () => {
    render(
      <FieldProvider id="qty" disabled>
        <NumberField label="Quantity" disabled={false} />
      </FieldProvider>
    )
    expect(screen.getByRole('textbox', { name: 'Quantity' })).not.toBeDisabled()
  })
})

describe('NumberField RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <NumberField label="الكمية" description="أدخل رقمًا" defaultValue={2} />
      </div>
    )
    expect(screen.getByRole('textbox', { name: 'الكمية' })).toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})
