// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { FieldProvider } from '@/components/field/context'
import { Radio, RadioGroup } from '@/components/radio-group'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

function ContactGroup(
  props: Partial<React.ComponentProps<typeof RadioGroup>> = {}
): React.JSX.Element {
  return (
    <RadioGroup label="Preferred contact method" {...props}>
      <Radio label="Email" value="email" />
      <Radio label="Phone" value="phone" />
      <Radio label="Mail" value="mail" />
    </RadioGroup>
  )
}

describe('RadioGroup accessibility (axe)', () => {
  it('default group is axe-clean', async () => {
    const { container } = render(<ContactGroup />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('group with a selection and descriptions is axe-clean', async () => {
    const { container } = render(
      <RadioGroup label="Delivery speed">
        <Radio
          label="Standard"
          value="standard"
          description="5 to 7 business days"
          defaultChecked
        />
        <Radio label="Express" value="express" description="1 business day" />
      </RadioGroup>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('disabled group is axe-clean', async () => {
    const { container } = render(<ContactGroup disabled />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('required group is axe-clean', async () => {
    const { container } = render(<ContactGroup required />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('error state (inside FieldProvider) is axe-clean', async () => {
    const { container } = render(
      <>
        <p id="contact-error">Choose a contact method.</p>
        <FieldProvider id="contact" hasError>
          <ContactGroup />
        </FieldProvider>
      </>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('standalone group named by aria-label is axe-clean', async () => {
    const { container } = render(
      <RadioGroup aria-label="Preferred contact method">
        <Radio label="Email" value="email" />
        <Radio label="Phone" value="phone" />
      </RadioGroup>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('RadioGroup name, role, and value', () => {
  it('renders a radiogroup named by its legend', () => {
    render(<ContactGroup />)

    const group = screen.getByRole('radiogroup', {
      name: 'Preferred contact method',
    })
    expect(group.tagName).toBe('FIELDSET')
    expect(group).toHaveAttribute('data-slot', 'radio-group')
  })

  it('renders native radio inputs named by their visible labels', () => {
    render(<ContactGroup />)

    for (const name of ['Email', 'Phone', 'Mail']) {
      const radio = screen.getByRole('radio', { name })
      expect(radio).toBeInstanceOf(HTMLInputElement)
      expect(radio).toHaveAttribute('type', 'radio')
    }
  })

  it('shares one native name across all radios in the group', () => {
    render(<ContactGroup />)

    const radios = screen.getAllByRole('radio') as HTMLInputElement[]
    const names = new Set(radios.map((radio) => radio.name))
    expect(names.size).toBe(1)
    expect([...names][0]).not.toBe('')
  })

  it('generates distinct names for separate groups (useId fallback)', () => {
    render(
      <>
        <RadioGroup aria-label="Group one">
          <Radio label="A" value="a" />
        </RadioGroup>
        <RadioGroup aria-label="Group two">
          <Radio label="B" value="b" />
        </RadioGroup>
      </>
    )

    const [a, b] = screen.getAllByRole('radio') as HTMLInputElement[]
    expect(a.name).not.toBe(b.name)
  })

  it('uses an explicit group name and lets a Radio override it', () => {
    render(
      <RadioGroup label="Options" name="options">
        <Radio label="A" value="a" />
        <Radio label="B" value="b" name="override" />
      </RadioGroup>
    )

    const [a, b] = screen.getAllByRole('radio') as HTMLInputElement[]
    expect(a.name).toBe('options')
    expect(b.name).toBe('override')
  })

  it('selecting one radio deselects the others (native single selection)', async () => {
    const user = userEvent.setup()
    render(<ContactGroup />)

    const email = screen.getByRole('radio', { name: 'Email' })
    const phone = screen.getByRole('radio', { name: 'Phone' })

    await user.click(email)
    expect(email).toBeChecked()

    await user.click(phone)
    expect(phone).toBeChecked()
    expect(email).not.toBeChecked()
  })

  it('links a Radio description via aria-describedby', () => {
    render(
      <RadioGroup label="Delivery speed">
        <Radio label="Standard" value="standard" description="5 to 7 business days" />
      </RadioGroup>
    )

    expect(screen.getByRole('radio', { name: 'Standard' })).toHaveAccessibleDescription(
      '5 to 7 business days'
    )
  })

  it("aligns the control to the first text line via a one-line control box", () => {
    const { container } = render(
      <RadioGroup label="Delivery speed">
        <Radio label="Standard" value="standard" description="5 to 7 days" />
      </RadioGroup>,
    );
    expect(
      container.querySelector('[data-slot="radio-label"]')?.className,
    ).toContain("justify-center");
    expect(
      container.querySelector('[data-slot="radio-row"]')?.className,
    ).toContain("items-start");
    expect(
      container.querySelector('[data-slot="radio-control-box"]')?.className,
    ).toContain("h-[1.375em]");
  })

  it('propagates required from the group to every radio', () => {
    render(<ContactGroup required />)

    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toBeRequired()
    }
  })

  it('disabling the group disables every radio (native fieldset)', () => {
    render(<ContactGroup disabled />)

    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toBeDisabled()
    }
  })

  it('warns in development when the group has no accessible name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <RadioGroup>
        <Radio label="A" value="a" />
      </RadioGroup>
    )
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('accessible name'))
  })

  it('does not warn when the group is named via label or aria-label', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <>
        <ContactGroup />
        <RadioGroup aria-label="Named group">
          <Radio label="A" value="a" />
        </RadioGroup>
      </>
    )
    expect(warn).not.toHaveBeenCalled()
  })

  it('warns in development when a Radio has no label', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <RadioGroup aria-label="Group">
        <Radio label={'' as unknown as string} value="a" />
      </RadioGroup>
    )
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('label'))
  })
})

describe('RadioGroup Field wiring', () => {
  it('inherits describedby, invalid, required, and disabled from the Field contract', () => {
    render(
      <>
        <p id="contact-hint">Pick one.</p>
        <p id="contact-error">Choose a contact method.</p>
        <FieldProvider id="contact" hasHint hasError required disabled>
          <ContactGroup />
        </FieldProvider>
      </>
    )

    const group = screen.getByRole('radiogroup')
    expect(group).toHaveAttribute('id', 'contact')
    expect(group).toHaveAttribute('aria-describedby', 'contact-hint contact-error')
    expect(group).toHaveAttribute('aria-invalid', 'true')

    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toBeRequired()
      expect(radio).toBeDisabled()
    }
  })
})

describe('RadioGroup keyboard contract (native)', () => {
  it('Tab moves focus into the group', async () => {
    const user = userEvent.setup()
    render(<ContactGroup />)

    await user.tab()
    expect(screen.getByRole('radio', { name: 'Email' })).toHaveFocus()
  })

  it('Arrow Down moves selection to the next radio', async () => {
    const user = userEvent.setup()
    render(<ContactGroup />)

    await user.click(screen.getByRole('radio', { name: 'Email' }))
    await user.keyboard('{ArrowDown}')

    const phone = screen.getByRole('radio', { name: 'Phone' })
    expect(phone).toHaveFocus()
    expect(phone).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Email' })).not.toBeChecked()
  })

  it('Arrow Right also moves selection forward (LTR)', async () => {
    const user = userEvent.setup()
    render(<ContactGroup />)

    await user.click(screen.getByRole('radio', { name: 'Email' }))
    await user.keyboard('{ArrowRight}')

    expect(screen.getByRole('radio', { name: 'Phone' })).toBeChecked()
  })

  it('Arrow Up moves selection to the previous radio', async () => {
    const user = userEvent.setup()
    render(<ContactGroup />)

    await user.click(screen.getByRole('radio', { name: 'Phone' }))
    await user.keyboard('{ArrowUp}')

    const email = screen.getByRole('radio', { name: 'Email' })
    expect(email).toHaveFocus()
    expect(email).toBeChecked()
  })

  it('Space selects the focused radio', async () => {
    const user = userEvent.setup()
    render(<ContactGroup />)

    await user.tab()
    await user.keyboard(' ')

    expect(screen.getByRole('radio', { name: 'Email' })).toBeChecked()
  })
})

describe('RadioGroup RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <RadioGroup label="طريقة التواصل المفضلة">
          <Radio label="البريد الإلكتروني" value="email" />
          <Radio label="الهاتف" value="phone" />
        </RadioGroup>
      </div>
    )

    expect(screen.getByRole('radiogroup', { name: 'طريقة التواصل المفضلة' })).toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})
