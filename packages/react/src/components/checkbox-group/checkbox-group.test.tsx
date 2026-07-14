// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Checkbox } from '@/components/checkbox'
import { CheckboxGroup, type CheckboxGroupItem } from '@/components/checkbox-group'
import { FieldProvider } from '@/components/field/context'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

const FILTERS: CheckboxGroupItem[] = [
  { value: 'parks', label: 'Parks and recreation' },
  { value: 'roads', label: 'Roads and transit', description: 'Includes plowing.' },
  { value: 'water', label: 'Water and sewer' },
]

function FilterGroup(
  props: Partial<React.ComponentProps<typeof CheckboxGroup>> = {}
): React.JSX.Element {
  return <CheckboxGroup label="Service areas" items={FILTERS} {...props} />
}

describe('CheckboxGroup accessibility (axe)', () => {
  it('default group is axe-clean', async () => {
    const { container } = render(<FilterGroup />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('group with some selected and a select-all is axe-clean', async () => {
    const { container } = render(<FilterGroup selectAll defaultValue={['parks']} />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('fully-selected group with a select-all is axe-clean', async () => {
    const { container } = render(
      <FilterGroup selectAll defaultValue={['parks', 'roads', 'water']} />
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('disabled group is axe-clean', async () => {
    const { container } = render(<FilterGroup disabled selectAll />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('error state (inside FieldProvider) is axe-clean', async () => {
    const { container } = render(
      <>
        <p id="areas-error">Choose at least one service area.</p>
        <FieldProvider id="areas" hasError>
          <FilterGroup selectAll />
        </FieldProvider>
      </>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('standalone group named by aria-label is axe-clean', async () => {
    const { container } = render(<CheckboxGroup aria-label="Service areas" items={FILTERS} />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('composed Checkbox children are axe-clean', async () => {
    const { container } = render(
      <CheckboxGroup label="Notifications" selectAll defaultValue={['sms']}>
        <Checkbox value="email" label="Email" />
        <Checkbox value="sms" label="Text message" />
      </CheckboxGroup>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('CheckboxGroup name, role, and value', () => {
  it('renders a group named by its legend', () => {
    render(<FilterGroup />)
    const group = screen.getByRole('group', { name: 'Service areas' })
    expect(group.tagName).toBe('FIELDSET')
    expect(group).toHaveAttribute('data-slot', 'checkbox-group')
  })

  it('renders one native checkbox per item, named by its label', () => {
    render(<FilterGroup />)
    for (const item of FILTERS) {
      const box = screen.getByRole('checkbox', { name: item.label as string })
      expect(box).toBeInstanceOf(HTMLInputElement)
      expect(box).toHaveAttribute('type', 'checkbox')
    }
  })

  it('shares one native name across all options', () => {
    render(<FilterGroup name="areas" />)
    for (const item of FILTERS) {
      expect(screen.getByRole('checkbox', { name: item.label as string })).toHaveAttribute(
        'name',
        'areas'
      )
    }
  })

  it('links an item description via aria-describedby', () => {
    render(<FilterGroup />)
    expect(screen.getByRole('checkbox', { name: 'Roads and transit' })).toHaveAccessibleDescription(
      'Includes plowing.'
    )
  })

  it('reflects defaultValue as the initially-checked options (uncontrolled)', () => {
    render(<FilterGroup defaultValue={['parks', 'water']} />)
    expect(screen.getByRole('checkbox', { name: 'Parks and recreation' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Roads and transit' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Water and sewer' })).toBeChecked()
  })
})

describe('CheckboxGroup value array changes', () => {
  it('adds and removes values as options toggle (uncontrolled)', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<FilterGroup onValueChange={onValueChange} />)

    await user.click(screen.getByRole('checkbox', { name: 'Parks and recreation' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['parks'])
    expect(screen.getByRole('checkbox', { name: 'Parks and recreation' })).toBeChecked()

    await user.click(screen.getByRole('checkbox', { name: 'Water and sewer' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['parks', 'water'])

    await user.click(screen.getByRole('checkbox', { name: 'Parks and recreation' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['water'])
    expect(screen.getByRole('checkbox', { name: 'Parks and recreation' })).not.toBeChecked()
  })

  it('honors a controlled value (does not self-update without a new prop)', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<FilterGroup value={['roads']} onValueChange={onValueChange} />)

    const roads = screen.getByRole('checkbox', { name: 'Roads and transit' })
    expect(roads).toBeChecked()

    await user.click(roads)
    // The parent owns the value: it was notified, but the box stays checked
    // until the controlled prop changes.
    expect(onValueChange).toHaveBeenLastCalledWith([])
    expect(roads).toBeChecked()
  })

  it('wires composed Checkbox children to the shared value', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <CheckboxGroup label="Notifications" onValueChange={onValueChange}>
        <Checkbox value="email" label="Email" />
        <Checkbox value="sms" label="Text message" />
      </CheckboxGroup>
    )

    await user.click(screen.getByRole('checkbox', { name: 'Email' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['email'])
    expect(screen.getByRole('checkbox', { name: 'Email' })).toBeChecked()
  })
})

describe('CheckboxGroup select-all (indeterminate) parent', () => {
  it('is unchecked when no option is selected', () => {
    render(<FilterGroup selectAll />)
    const selectAll = screen.getByRole('checkbox', { name: 'Select all' }) as HTMLInputElement
    expect(selectAll).not.toBeChecked()
    expect(selectAll.indeterminate).toBe(false)
  })

  it('is indeterminate (mixed) when some options are selected', () => {
    render(<FilterGroup selectAll defaultValue={['parks']} />)
    const selectAll = screen.getByRole('checkbox', { name: 'Select all' }) as HTMLInputElement
    // The native `indeterminate` IDL property is what AT reports as "mixed";
    // a native checkbox exposes no `aria-checked` attribute.
    expect(selectAll.indeterminate).toBe(true)
    expect(selectAll).not.toBeChecked()
  })

  it('is checked (not mixed) when every option is selected', () => {
    render(<FilterGroup selectAll defaultValue={['parks', 'roads', 'water']} />)
    const selectAll = screen.getByRole('checkbox', { name: 'Select all' }) as HTMLInputElement
    expect(selectAll).toBeChecked()
    expect(selectAll.indeterminate).toBe(false)
  })

  it('cycles none -> all -> none as it is toggled', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<FilterGroup selectAll onValueChange={onValueChange} />)

    const selectAll = screen.getByRole('checkbox', { name: 'Select all' })

    await user.click(selectAll)
    expect(onValueChange).toHaveBeenLastCalledWith(['parks', 'roads', 'water'])

    await user.click(selectAll)
    expect(onValueChange).toHaveBeenLastCalledWith([])
  })

  it('selects all remaining options when clicked from an indeterminate state', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<FilterGroup selectAll defaultValue={['parks']} onValueChange={onValueChange} />)

    await user.click(screen.getByRole('checkbox', { name: 'Select all' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['parks', 'roads', 'water'])
  })

  it('names the option ids it governs via aria-controls', () => {
    render(<FilterGroup id="areas" selectAll />)
    const selectAll = screen.getByRole('checkbox', { name: 'Select all' })
    expect(selectAll).toHaveAttribute('aria-controls', 'areas-item-0 areas-item-1 areas-item-2')
  })

  it('preserves a disabled-and-checked option when select-all clears', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <CheckboxGroup
        label="Areas"
        selectAll
        defaultValue={['parks', 'roads', 'water']}
        onValueChange={onValueChange}
        items={[
          { value: 'parks', label: 'Parks' },
          { value: 'roads', label: 'Roads' },
          { value: 'water', label: 'Water', disabled: true },
        ]}
      />
    )

    const selectAll = screen.getByRole('checkbox', { name: 'Select all' }) as HTMLInputElement
    // Only the two enabled options count toward "all", so the parent is
    // checked; toggling clears just the enabled ones and keeps the locked one.
    expect(selectAll).toBeChecked()
    await user.click(selectAll)
    expect(onValueChange).toHaveBeenLastCalledWith(['water'])
  })
})

describe('CheckboxGroup Field wiring', () => {
  it('inherits describedby, invalid, and disabled from the Field contract', () => {
    render(
      <>
        <p id="areas-hint">Pick any that apply.</p>
        <p id="areas-error">Choose at least one.</p>
        <FieldProvider id="areas" hasHint hasError disabled>
          <FilterGroup />
        </FieldProvider>
      </>
    )

    const group = screen.getByRole('group')
    expect(group).toHaveAttribute('id', 'areas')
    expect(group).toHaveAttribute('aria-describedby', 'areas-hint areas-error')
    expect(group).toHaveAttribute('aria-invalid', 'true')

    for (const item of FILTERS) {
      expect(screen.getByRole('checkbox', { name: item.label as string })).toBeDisabled()
    }
  })

  it('disabling the group disables every option (native fieldset)', () => {
    render(<FilterGroup disabled selectAll />)
    expect(screen.getByRole('checkbox', { name: 'Select all' })).toBeDisabled()
    for (const item of FILTERS) {
      expect(screen.getByRole('checkbox', { name: item.label as string })).toBeDisabled()
    }
  })

  it('does not repeat the group error on each option (group owns the wiring)', () => {
    render(
      <>
        <p id="areas-error">Choose at least one.</p>
        <FieldProvider id="areas" hasError>
          <FilterGroup />
        </FieldProvider>
      </>
    )
    // The shielded options must not inherit the group's error describedby.
    expect(
      screen.getByRole('checkbox', { name: 'Parks and recreation' })
    ).not.toHaveAccessibleDescription('Choose at least one.')
  })
})

describe('CheckboxGroup keyboard', () => {
  it('Space toggles the focused option', async () => {
    const user = userEvent.setup()
    render(<FilterGroup />)

    await user.tab()
    const parks = screen.getByRole('checkbox', { name: 'Parks and recreation' })
    expect(parks).toHaveFocus()
    await user.keyboard(' ')
    expect(parks).toBeChecked()
  })

  it('Space on the select-all toggles every option', async () => {
    const user = userEvent.setup()
    render(<FilterGroup selectAll />)

    await user.tab()
    expect(screen.getByRole('checkbox', { name: 'Select all' })).toHaveFocus()
    await user.keyboard(' ')

    for (const item of FILTERS) {
      expect(screen.getByRole('checkbox', { name: item.label as string })).toBeChecked()
    }
  })
})

describe('CheckboxGroup dev guards', () => {
  it('warns when the group has no accessible name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<CheckboxGroup items={FILTERS} />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('accessible name'))
  })

  it('does not warn when named via label or aria-label', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <>
        <FilterGroup />
        <CheckboxGroup aria-label="Named group" items={FILTERS} />
      </>
    )
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('CheckboxGroup RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <CheckboxGroup
          label="مناطق الخدمة"
          selectAll
          items={[
            { value: 'parks', label: 'الحدائق' },
            { value: 'roads', label: 'الطرق' },
          ]}
        />
      </div>
    )
    expect(screen.getByRole('group', { name: 'مناطق الخدمة' })).toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})
