// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Switch } from '@/components/switch'
import { FieldProvider } from '@/components/field/context'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Switch accessibility (axe)', () => {
  it('default (off) state is axe-clean', async () => {
    const { container } = render(<Switch label="Email notifications" />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('on state is axe-clean', async () => {
    const { container } = render(<Switch label="Email notifications" defaultChecked />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('with description is axe-clean', async () => {
    const { container } = render(
      <Switch label="Email notifications" description="Sends a daily digest at 8am." />
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('disabled state is axe-clean', async () => {
    const { container } = render(<Switch label="Email notifications" disabled />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('error state (inside FieldProvider) is axe-clean', async () => {
    const { container } = render(
      <>
        <p id="terms-error">This setting is required.</p>
        <FieldProvider id="terms" hasError>
          <Switch label="Enable feature" />
        </FieldProvider>
      </>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Switch name, role, and value', () => {
  it('exposes role=switch named by its visible label', () => {
    render(<Switch label="Email notifications" />)
    const control = screen.getByRole('switch', { name: 'Email notifications' })
    expect(control).toHaveAttribute('aria-checked', 'false')
  })

  it('reflects the on/off value via aria-checked', async () => {
    const user = userEvent.setup()
    render(<Switch label="Email notifications" />)
    const control = screen.getByRole('switch')

    expect(control).toHaveAttribute('aria-checked', 'false')
    await user.click(control)
    expect(control).toHaveAttribute('aria-checked', 'true')
  })

  it('links the description via aria-describedby without polluting the name', () => {
    render(<Switch label="Email notifications" description="Sends a daily digest at 8am." />)
    const control = screen.getByRole('switch', { name: 'Email notifications' })
    expect(control).toHaveAccessibleDescription('Sends a daily digest at 8am.')
  })

  it('signals state by thumb position for forced-colors safety (not color alone)', () => {
    const { container } = render(<Switch label="Email notifications" />)
    const thumb = container.querySelector('[data-slot="switch-thumb"]')
    // The thumb slides on the checked state via the group selector, so on/off
    // stays distinguishable when the checked fill color is overridden in WHCM.
    expect(thumb?.className).toContain('group-data-[checked]:translate-x-[0.875rem]')
    expect(thumb?.className).toContain('rtl:group-data-[checked]:-translate-x-[0.875rem]')
    // Borders keep the control visible in forced-colors mode.
    expect(container.querySelector('[data-slot="switch-track"]')?.className).toContain('border')
    expect(thumb?.className).toContain('border')
  })
})

describe('Switch controlled and uncontrolled', () => {
  it('supports an uncontrolled defaultChecked switch', async () => {
    const user = userEvent.setup()
    render(<Switch label="Email notifications" defaultChecked />)
    const control = screen.getByRole('switch')

    expect(control).toHaveAttribute('aria-checked', 'true')
    await user.click(control)
    expect(control).toHaveAttribute('aria-checked', 'false')
  })

  it('supports a controlled switch via checked + onCheckedChange', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()

    function Controlled(): React.JSX.Element {
      const [on, setOn] = React.useState(false)
      return (
        <Switch
          label="Email notifications"
          checked={on}
          onCheckedChange={(next) => {
            onCheckedChange(next)
            setOn(next)
          }}
        />
      )
    }

    render(<Controlled />)
    const control = screen.getByRole('switch')

    expect(control).toHaveAttribute('aria-checked', 'false')
    await user.click(control)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(control).toHaveAttribute('aria-checked', 'true')
  })
})

describe('Switch keyboard contract', () => {
  it('Tab moves focus to the switch', async () => {
    const user = userEvent.setup()
    render(<Switch label="Email notifications" />)

    await user.tab()
    expect(screen.getByRole('switch')).toHaveFocus()
  })

  it('Space toggles the switch on and off', async () => {
    const user = userEvent.setup()
    render(<Switch label="Email notifications" />)
    const control = screen.getByRole('switch')

    await user.tab()
    expect(control).toHaveFocus()
    await user.keyboard(' ')
    expect(control).toHaveAttribute('aria-checked', 'true')

    await user.keyboard(' ')
    expect(control).toHaveAttribute('aria-checked', 'false')
  })

  it('clicking the label text toggles the switch (the label is part of the target)', async () => {
    const user = userEvent.setup()
    render(<Switch label="Email notifications" />)

    await user.click(screen.getByText('Email notifications'))
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })

  it('a disabled switch is removed from the tab order and cannot toggle', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(<Switch label="Email notifications" disabled onCheckedChange={onCheckedChange} />)

    await user.tab()
    expect(screen.getByRole('switch')).not.toHaveFocus()
    await user.click(screen.getByRole('switch'))
    expect(onCheckedChange).not.toHaveBeenCalled()
  })
})

describe('Switch dev guard', () => {
  it('warns in development when label is missing or empty', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // Deliberately violating the required-label contract for the guard test.
    render(<Switch label={'' as unknown as string} />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('label'))
  })

  it('does not warn when a label is provided', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Switch label="Email notifications" />)
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('Switch Field wiring', () => {
  it('inherits id, describedby, invalid, required, and disabled from the Field contract', () => {
    render(
      <>
        <p id="notify-hint">Optional.</p>
        <p id="notify-error">Something is wrong.</p>
        <FieldProvider id="notify" hasHint hasError required disabled>
          <Switch label="Email notifications" />
        </FieldProvider>
      </>
    )

    const control = screen.getByRole('switch')
    // Keeps its OWN id (never the Field's) so the Field's <label htmlFor> does
    // not become a second label for the hidden input.
    expect(control).not.toHaveAttribute('id', 'notify')
    expect(control.id).not.toBe('')
    expect(control).toHaveAttribute('aria-describedby', 'notify-hint notify-error')
    expect(control).toHaveAttribute('aria-invalid', 'true')
    expect(control).toHaveAttribute('aria-required', 'true')
    expect(control).toHaveAttribute('data-disabled')
  })

  it('merges its own description before the Field describedby ids', () => {
    render(
      <>
        <p id="notify-hint">Optional.</p>
        <FieldProvider id="notify" hasHint>
          <Switch label="Email notifications" description="Own description" />
        </FieldProvider>
      </>
    )

    const control = screen.getByRole('switch')
    // The Switch's own description id comes first, then the Field's hint id.
    const describedBy = control.getAttribute('aria-describedby') ?? ''
    const [descId, ...rest] = describedBy.split(' ')
    expect(document.getElementById(descId)).toHaveTextContent('Own description')
    expect(rest).toEqual(['notify-hint'])
  })

  it('works standalone with a generated id outside any Field', () => {
    render(<Switch label="Email notifications" description="Own description" />)
    const control = screen.getByRole('switch')
    expect(control.id).not.toBe('')
    expect(control).toHaveAccessibleDescription('Own description')
  })
})

describe('Switch RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <Switch label="إشعارات البريد الإلكتروني" description="ملخص يومي في الثامنة صباحًا" />
      </div>
    )
    expect(
      screen.getByRole('switch', { name: 'إشعارات البريد الإلكتروني' })
    ).toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})
