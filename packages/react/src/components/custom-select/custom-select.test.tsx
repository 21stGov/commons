// SPDX-License-Identifier: MIT

import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { CustomSelect, type CustomSelectEntry } from '@/components/custom-select'
import { FieldProvider } from '@/components/field/context'
import { axeCheck } from '../../../test/setup.js'

const STATES: CustomSelectEntry[] = [
  { value: 'al', label: 'Alabama' },
  { value: 'ak', label: 'Alaska' },
  { value: 'az', label: 'Arizona' },
  { value: 'ca', label: 'California' },
  { value: 'co', label: 'Colorado', disabled: true },
]

const GROUPED: CustomSelectEntry[] = [
  {
    label: 'Northeast',
    items: [
      { value: 'me', label: 'Maine' },
      { value: 'vt', label: 'Vermont' },
    ],
  },
  {
    label: 'West',
    items: [
      { value: 'ca', label: 'California' },
      { value: 'or', label: 'Oregon' },
    ],
  },
]

function StateSelect(
  props: Partial<React.ComponentProps<typeof CustomSelect>>
): React.JSX.Element {
  return <CustomSelect triggerLabel="State" placeholder="Choose a state" items={STATES} {...props} />
}

/** The trigger button carrying role=combobox. */
function getTrigger(name?: string | RegExp): HTMLElement {
  return screen.getByRole('combobox', name ? { name } : undefined)
}

describe('CustomSelect name, role, and value', () => {
  it('renders a trigger with role combobox advertising the listbox', () => {
    render(<StateSelect />)
    const trigger = getTrigger()
    expect(trigger.tagName).toBe('BUTTON')
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
    expect(trigger).toHaveAttribute('data-slot', 'custom-select-trigger')
  })

  it('is collapsed until opened (aria-expanded=false)', () => {
    render(<StateSelect />)
    expect(getTrigger()).toHaveAttribute('aria-expanded', 'false')
  })

  it('accessible name is the standalone triggerLabel plus the placeholder while empty', () => {
    render(<StateSelect />)
    // triggerLabel ("State") + value text (the placeholder) => "State Choose a state".
    expect(getTrigger(/State/)).toBeInTheDocument()
    expect(getTrigger(/Choose a state/)).toBeInTheDocument()
  })

  it('accessible name includes the current value once selected', () => {
    render(<StateSelect defaultValue="az" />)
    expect(getTrigger(/Arizona/)).toBeInTheDocument()
  })

  it('takes its label from a surrounding Field and still appends the value', () => {
    render(
      <>
        <p id="state-label">Home state</p>
        <FieldProvider id="state" hasLabel>
          <StateSelect defaultValue="ak" />
        </FieldProvider>
      </>
    )
    // The Field label id is `${id}-label`; render its target text so the name resolves.
    const trigger = getTrigger()
    const labelledBy = trigger.getAttribute('aria-labelledby') ?? ''
    expect(labelledBy).toContain('state-label')
    expect(trigger).toHaveTextContent('Alaska')
  })
})

describe('CustomSelect opening and options', () => {
  it('opens on click and lists every option as role=option', async () => {
    const user = userEvent.setup()
    render(<StateSelect />)

    await user.click(getTrigger())
    const listbox = await screen.findByRole('listbox')
    expect(getTrigger()).toHaveAttribute('aria-expanded', 'true')
    expect(within(listbox).getAllByRole('option')).toHaveLength(STATES.length)
  })

  it('renders grouped options under role=group with a group label', async () => {
    const user = userEvent.setup()
    render(<CustomSelect triggerLabel="Region" items={GROUPED} placeholder="Pick" />)

    await user.click(getTrigger())
    await screen.findByRole('listbox')

    const groups = screen.getAllByRole('group')
    expect(groups).toHaveLength(2)
    expect(screen.getByText('Northeast')).toBeInTheDocument()
    expect(screen.getByText('West')).toBeInTheDocument()
  })
})

describe('CustomSelect keyboard contract', () => {
  it('receives focus with Tab', async () => {
    const user = userEvent.setup()
    render(<StateSelect />)
    await user.tab()
    expect(getTrigger()).toHaveFocus()
  })

  it('opens with ArrowDown and selects with Enter', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<StateSelect onValueChange={onValueChange} />)

    const trigger = getTrigger()
    trigger.focus()
    await user.keyboard('{ArrowDown}')
    await screen.findByRole('listbox')

    await user.keyboard('{Enter}')
    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalled()
    })
    // A value is committed and the list closes.
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('marks the selected option aria-selected with a check indicator when reopened', async () => {
    const user = userEvent.setup()
    render(<StateSelect defaultValue="az" />)

    await user.click(getTrigger())
    await screen.findByRole('listbox')

    const selected = await screen.findByRole('option', { name: /Arizona/, selected: true })
    expect(selected.querySelector('[data-slot="custom-select-item-indicator"]')).not.toBeNull()
  })

  it('closes on Escape without changing the selection', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<StateSelect defaultValue="ak" onValueChange={onValueChange} />)

    const trigger = getTrigger()
    trigger.focus()
    await user.keyboard('{ArrowDown}')
    await screen.findByRole('listbox')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })
    expect(onValueChange).not.toHaveBeenCalled()
    expect(trigger).toHaveTextContent('Alaska')
  })
})

describe('CustomSelect selection state', () => {
  it('supports controlled value + onValueChange', async () => {
    const user = userEvent.setup()

    function Controlled(): React.JSX.Element {
      const [value, setValue] = React.useState<string | null>('al')
      return <CustomSelect triggerLabel="State" items={STATES} value={value} onValueChange={setValue} />
    }

    render(<Controlled />)
    const trigger = getTrigger()
    expect(trigger).toHaveTextContent('Alabama')

    await user.click(trigger)
    await screen.findByRole('listbox')
    await user.click(screen.getByRole('option', { name: /Arizona/ }))

    await waitFor(() => {
      expect(trigger).toHaveTextContent('Arizona')
    })
  })

  it('supports an uncontrolled defaultValue', () => {
    render(<StateSelect defaultValue="ca" />)
    expect(getTrigger()).toHaveTextContent('California')
  })

  it('does not commit a disabled option', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<StateSelect onValueChange={onValueChange} />)

    await user.click(getTrigger())
    await screen.findByRole('listbox')

    const disabled = screen.getByRole('option', { name: /Colorado/ })
    expect(disabled).toHaveAttribute('aria-disabled', 'true')
    await user.click(disabled)
    expect(onValueChange).not.toHaveBeenCalled()
  })
})

describe('CustomSelect Field wiring', () => {
  it('adopts id, describedby, invalid, required, and disabled from the Field', () => {
    render(
      <FieldProvider id="state" hasHint hasError required disabled>
        <StateSelect />
        <p id="state-hint">Pick one.</p>
        <p id="state-error">Choose a state.</p>
      </FieldProvider>
    )

    const trigger = getTrigger()
    expect(trigger).toHaveAttribute('id', 'state')
    expect(trigger).toHaveAttribute('aria-describedby', 'state-hint state-error')
    expect(trigger).toHaveAttribute('aria-invalid', 'true')
    expect(trigger).toHaveAttribute('aria-required', 'true')
    expect(trigger).toBeDisabled()
  })

  it('omits state attributes the Field does not set', () => {
    render(
      <FieldProvider id="state">
        <StateSelect />
      </FieldProvider>
    )

    const trigger = getTrigger()
    expect(trigger).not.toHaveAttribute('aria-describedby')
    expect(trigger).not.toHaveAttribute('aria-invalid')
    expect(trigger).not.toHaveAttribute('aria-required')
    expect(trigger).not.toBeDisabled()
  })

  it('lets an explicit id win over Field wiring', () => {
    render(
      <FieldProvider id="state">
        <StateSelect id="custom" />
      </FieldProvider>
    )
    expect(getTrigger()).toHaveAttribute('id', 'custom')
  })

  it('works standalone outside a FieldProvider', () => {
    render(<StateSelect />)
    const trigger = getTrigger()
    expect(trigger).not.toHaveAttribute('aria-describedby')
    expect(trigger).not.toHaveAttribute('aria-invalid')
  })
})

describe('CustomSelect disabled', () => {
  it('does not open when disabled and is skipped by Tab', async () => {
    const user = userEvent.setup()
    render(
      <>
        <StateSelect disabled />
        <button type="button">After</button>
      </>
    )

    const trigger = getTrigger()
    expect(trigger).toBeDisabled()
    await user.tab()
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus()
  })
})

describe('CustomSelect forced-colors safety', () => {
  it('keeps a border on the trigger and draws a currentColor chevron', () => {
    const { container } = render(<StateSelect />)
    const trigger = getTrigger()
    expect(trigger.className).toContain('border')
    const chevron = container.querySelector('[data-slot="custom-select-icon"] svg')
    expect(chevron?.querySelector('path')).toHaveAttribute('stroke', 'currentColor')
  })
})

describe('CustomSelect accessibility (axe)', () => {
  it('is axe-clean when closed', async () => {
    const { container } = render(<StateSelect />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean when open with options', async () => {
    const user = userEvent.setup()
    render(<StateSelect />)
    await user.click(getTrigger())
    await screen.findByRole('listbox')

    // Base UI portals the popup to document.body. The "region" rule is a
    // page-level best-practice check (all content inside a landmark) that an
    // isolated test page cannot satisfy — not a defect of the select, whose
    // listbox is correctly associated to the trigger via aria-controls.
    expect(
      await axeCheck(document.body, { rules: { region: { enabled: false } } })
    ).toHaveNoViolations()
  })

  it('is axe-clean with grouped options open', async () => {
    const user = userEvent.setup()
    render(<CustomSelect triggerLabel="Region" items={GROUPED} placeholder="Pick" />)
    await user.click(getTrigger())
    await screen.findByRole('listbox')
    expect(
      await axeCheck(document.body, { rules: { region: { enabled: false } } })
    ).toHaveNoViolations()
  })

  it('is axe-clean inside a Field in an error state', async () => {
    const { container } = render(
      <FieldProvider id="state" hasError>
        <StateSelect />
        <p id="state-error">Choose a state.</p>
      </FieldProvider>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean when disabled', async () => {
    const { container } = render(<StateSelect disabled />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('CustomSelect RTL', () => {
  it('renders and opens in a dir=rtl document', async () => {
    const user = userEvent.setup()
    const items: CustomSelectEntry[] = [
      { value: 'cairo', label: 'القاهرة' },
      { value: 'giza', label: 'الجيزة' },
    ]

    const { container } = render(
      <div dir="rtl" lang="ar">
        <CustomSelect triggerLabel="المدينة" items={items} placeholder="اختر" />
      </div>
    )

    const trigger = getTrigger(/المدينة/)
    expect(trigger).toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()

    await user.click(trigger)
    expect(await screen.findByRole('listbox')).toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(2)
  })
})
