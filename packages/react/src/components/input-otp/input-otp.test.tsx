// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { InputOTP } from '@/components/input-otp'
import { FieldProvider } from '@/components/field/context'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('InputOTP accessibility (axe)', () => {
  it('default (empty) state is axe-clean', async () => {
    const { container } = render(<InputOTP label="Verification code" />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('filled / complete state is axe-clean', async () => {
    const { container } = render(<InputOTP label="Verification code" defaultValue="123456" />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('with description is axe-clean', async () => {
    const { container } = render(
      <InputOTP label="Verification code" description="We texted a 6-digit code to your phone." />
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('disabled state is axe-clean', async () => {
    const { container } = render(<InputOTP label="Verification code" disabled />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('error state (inside FieldProvider) is axe-clean', async () => {
    const { container } = render(
      <>
        <p id="otp-error">That code is incorrect.</p>
        <FieldProvider id="otp" hasError>
          <InputOTP label="Verification code" />
        </FieldProvider>
      </>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('alphanumeric mode is axe-clean', async () => {
    const { container } = render(
      <InputOTP label="Access code" validationType="alphanumeric" defaultValue="AB12CD" />
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('InputOTP name, role, and structure', () => {
  it('exposes a role=group named by its visible label', () => {
    render(<InputOTP label="Verification code" />)
    expect(screen.getByRole('group', { name: 'Verification code' })).toBeInTheDocument()
  })

  it('renders `length` cells (default 6), each named by the label', () => {
    render(<InputOTP label="Verification code" />)
    const cells = screen.getAllByRole('textbox', { name: 'Verification code' })
    expect(cells).toHaveLength(6)
  })

  it('honors a custom length', () => {
    render(<InputOTP label="PIN" length={4} />)
    expect(screen.getAllByRole('textbox')).toHaveLength(4)
  })

  it('sets one-time-code autofill on the first cell', () => {
    render(<InputOTP label="Verification code" />)
    const [first] = screen.getAllByRole('textbox')
    expect(first).toHaveAttribute('autocomplete', 'one-time-code')
  })

  it('signals filled cells with a stronger border (not color alone)', () => {
    const { container } = render(<InputOTP label="Verification code" defaultValue="1" />)
    const cell = container.querySelector('[data-slot="input-otp-cell"]')
    expect(cell?.className).toContain('data-[filled]:border-border-strong')
    // Every cell keeps a border so forced-colors mode paints a boundary.
    expect(cell?.className).toContain('border')
  })
})

describe('InputOTP keyboard contract', () => {
  it('typing a character fills the cell and advances focus', async () => {
    const user = userEvent.setup()
    render(<InputOTP label="Verification code" />)
    const cells = screen.getAllByRole('textbox')

    await user.click(cells[0])
    await user.keyboard('1')
    expect(cells[0]).toHaveValue('1')
    expect(cells[1]).toHaveFocus()
  })

  it('Backspace clears the current cell and retreats to the previous', async () => {
    const user = userEvent.setup()
    render(<InputOTP label="Verification code" defaultValue="12" />)
    const cells = screen.getAllByRole('textbox')

    cells[1].focus()
    await user.keyboard('{Backspace}')
    expect(cells[1]).toHaveValue('')
    expect(cells[0]).toHaveFocus()
  })

  it('Arrow keys move focus between cells', async () => {
    const user = userEvent.setup()
    // A partially-filled field so the second cell is reachable (Base UI keeps
    // focus within the filled range plus the next empty cell).
    render(<InputOTP label="Verification code" defaultValue="12" />)
    const cells = screen.getAllByRole('textbox')

    await user.click(cells[0])
    await user.keyboard('{ArrowRight}')
    expect(cells[1]).toHaveFocus()
    await user.keyboard('{ArrowLeft}')
    expect(cells[0]).toHaveFocus()
  })
})

describe('InputOTP paste and completion', () => {
  it('pasting a full code fills every cell and reports the value', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<InputOTP label="Verification code" onValueChange={onValueChange} />)
    const cells = screen.getAllByRole('textbox')

    await user.click(cells[0])
    await user.paste('123456')

    expect(onValueChange).toHaveBeenCalledWith('123456', expect.anything())
    expect(cells.map((c) => (c as HTMLInputElement).value).join('')).toBe('123456')
  })

  it('fires onValueComplete when all cells are filled', async () => {
    const user = userEvent.setup()
    const onValueComplete = vi.fn()
    render(<InputOTP label="Verification code" onValueComplete={onValueComplete} />)
    const cells = screen.getAllByRole('textbox')

    await user.click(cells[0])
    await user.paste('123456')

    expect(onValueComplete).toHaveBeenCalledWith('123456', expect.anything())
  })
})

describe('InputOTP validation modes', () => {
  it('numeric mode (default) rejects non-digits', async () => {
    const user = userEvent.setup()
    render(<InputOTP label="Verification code" />)
    const cells = screen.getAllByRole('textbox')

    await user.click(cells[0])
    await user.keyboard('a')
    expect(cells[0]).toHaveValue('')
    // inputMode drives the mobile keyboard.
    expect(cells[0]).toHaveAttribute('inputmode', 'numeric')
  })

  it('alphanumeric mode accepts letters and uses a text keyboard', async () => {
    const user = userEvent.setup()
    render(<InputOTP label="Access code" validationType="alphanumeric" />)
    const cells = screen.getAllByRole('textbox')

    await user.click(cells[0])
    await user.keyboard('a')
    expect(cells[0]).toHaveValue('a')
    expect(cells[0]).toHaveAttribute('inputmode', 'text')
  })
})

describe('InputOTP controlled and uncontrolled', () => {
  it('supports an uncontrolled defaultValue', () => {
    render(<InputOTP label="Verification code" defaultValue="123" />)
    const values = screen.getAllByRole('textbox').map((c) => (c as HTMLInputElement).value)
    expect(values.slice(0, 3).join('')).toBe('123')
  })

  it('supports a controlled value via value + onValueChange', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    function Controlled(): React.JSX.Element {
      const [code, setCode] = React.useState('')
      return (
        <InputOTP
          label="Verification code"
          value={code}
          onValueChange={(next, details) => {
            onValueChange(next, details)
            setCode(next)
          }}
        />
      )
    }

    render(<Controlled />)
    const cells = screen.getAllByRole('textbox')
    await user.click(cells[0])
    await user.keyboard('7')
    expect(onValueChange).toHaveBeenCalledWith('7', expect.anything())
    expect(cells[0]).toHaveValue('7')
  })
})

describe('InputOTP dev guard', () => {
  it('warns in development when label is missing or empty', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // Deliberately violating the required-label contract for the guard test.
    render(<InputOTP label={'' as unknown as string} />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('label'))
  })

  it('does not warn when a label is provided', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<InputOTP label="Verification code" />)
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('InputOTP Field wiring', () => {
  it('inherits describedby, invalid, required, and disabled from the Field contract', () => {
    render(
      <>
        <p id="otp-hint">Check your text messages.</p>
        <p id="otp-error">Something is wrong.</p>
        <FieldProvider id="otp" hasHint hasError required disabled>
          <InputOTP label="Verification code" />
        </FieldProvider>
      </>
    )

    const cells = screen.getAllByRole('textbox')
    const first = cells[0]
    // Keeps its OWN id (never the Field's) so the Field's <label htmlFor> does
    // not become a second label for the first cell.
    expect(first).not.toHaveAttribute('id', 'otp')
    expect(first.id).not.toBe('')
    expect(first).toHaveAttribute('aria-describedby', 'otp-hint otp-error')
    expect(first).toHaveAttribute('aria-invalid', 'true')
    expect(first).toHaveAttribute('required')
    expect(first).toHaveAttribute('disabled')
  })

  it('merges its own description before the Field describedby ids', () => {
    render(
      <>
        <p id="otp-hint">Optional.</p>
        <FieldProvider id="otp" hasHint>
          <InputOTP label="Verification code" description="Own description" />
        </FieldProvider>
      </>
    )

    const first = screen.getAllByRole('textbox')[0]
    const describedBy = first.getAttribute('aria-describedby') ?? ''
    const [descId, ...rest] = describedBy.split(' ')
    expect(document.getElementById(descId)).toHaveTextContent('Own description')
    expect(rest).toEqual(['otp-hint'])
  })

  it('works standalone with a generated id outside any Field', () => {
    render(<InputOTP label="Verification code" description="Own description" />)
    const first = screen.getAllByRole('textbox')[0]
    expect(first.id).not.toBe('')
  })
})

describe('InputOTP RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <InputOTP label="رمز التحقق" description="أدخل الرمز المكوّن من ٦ أرقام" />
      </div>
    )
    expect(screen.getByRole('group', { name: 'رمز التحقق' })).toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})
