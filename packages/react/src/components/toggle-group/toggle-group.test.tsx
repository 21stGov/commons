// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Toggle } from '@/components/toggle'
import { ToggleGroup } from '@/components/toggle-group'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

function AlignmentGroup(props: React.ComponentProps<typeof ToggleGroup>): React.JSX.Element {
  return (
    <ToggleGroup aria-label="Text alignment" {...props}>
      <Toggle value="left">Left</Toggle>
      <Toggle value="center">Center</Toggle>
      <Toggle value="right">Right</Toggle>
    </ToggleGroup>
  )
}

describe('ToggleGroup accessibility (axe)', () => {
  it('default state is axe-clean', async () => {
    const { container } = render(<AlignmentGroup defaultValue={['left']} />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('multiple-selection state is axe-clean', async () => {
    const { container } = render(
      <ToggleGroup aria-label="Text formatting" multiple defaultValue={['bold', 'italic']}>
        <Toggle value="bold">Bold</Toggle>
        <Toggle value="italic">Italic</Toggle>
        <Toggle value="underline">Underline</Toggle>
      </ToggleGroup>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('disabled group is axe-clean', async () => {
    const { container } = render(<AlignmentGroup disabled defaultValue={['left']} />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('ToggleGroup name and role', () => {
  it('exposes a named role=group', () => {
    render(<AlignmentGroup />)
    expect(screen.getByRole('group', { name: 'Text alignment' })).toBeInTheDocument()
  })

  it('renders each item as a pressable button', () => {
    render(<AlignmentGroup defaultValue={['center']} />)
    expect(screen.getByRole('button', { name: 'Left' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Center' })).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('ToggleGroup single selection', () => {
  it('pressing an item unpresses the previously pressed one', async () => {
    const user = userEvent.setup()
    render(<AlignmentGroup defaultValue={['left']} />)

    const left = screen.getByRole('button', { name: 'Left' })
    const right = screen.getByRole('button', { name: 'Right' })
    expect(left).toHaveAttribute('aria-pressed', 'true')

    await user.click(right)
    expect(right).toHaveAttribute('aria-pressed', 'true')
    expect(left).toHaveAttribute('aria-pressed', 'false')
  })
})

describe('ToggleGroup multiple selection', () => {
  it('lets several items stay pressed at once', async () => {
    const user = userEvent.setup()
    render(
      <ToggleGroup aria-label="Text formatting" multiple defaultValue={['bold']}>
        <Toggle value="bold">Bold</Toggle>
        <Toggle value="italic">Italic</Toggle>
      </ToggleGroup>
    )

    const bold = screen.getByRole('button', { name: 'Bold' })
    const italic = screen.getByRole('button', { name: 'Italic' })

    await user.click(italic)
    expect(bold).toHaveAttribute('aria-pressed', 'true')
    expect(italic).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('ToggleGroup controlled', () => {
  it('supports controlled value + onValueChange', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    function Controlled(): React.JSX.Element {
      const [value, setValue] = React.useState<string[]>(['left'])
      return (
        <ToggleGroup
          aria-label="Text alignment"
          value={value}
          onValueChange={(next) => {
            onValueChange(next)
            setValue(next)
          }}
        >
          <Toggle value="left">Left</Toggle>
          <Toggle value="right">Right</Toggle>
        </ToggleGroup>
      )
    }

    render(<Controlled />)
    await user.click(screen.getByRole('button', { name: 'Right' }))
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange.mock.calls[0]?.[0]).toEqual(['right'])
    expect(screen.getByRole('button', { name: 'Right' })).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('ToggleGroup keyboard (roving tabindex)', () => {
  it('places a single tab stop on the group and moves focus with arrow keys', async () => {
    const user = userEvent.setup()
    render(<AlignmentGroup defaultValue={['left']} />)

    const left = screen.getByRole('button', { name: 'Left' })
    const center = screen.getByRole('button', { name: 'Center' })

    // One Tab lands on the group's active item.
    await user.tab()
    expect(left).toHaveFocus()

    // Arrow keys move the roving focus between items.
    await user.keyboard('{ArrowRight}')
    expect(center).toHaveFocus()
    await user.keyboard('{ArrowLeft}')
    expect(left).toHaveFocus()
  })

  it('toggles the focused item with Space', async () => {
    const user = userEvent.setup()
    render(<AlignmentGroup />)

    await user.tab()
    const left = screen.getByRole('button', { name: 'Left' })
    expect(left).toHaveFocus()
    await user.keyboard(' ')
    expect(left).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('ToggleGroup RTL', () => {
  it('flips arrow-key direction when dir=rtl', async () => {
    const user = userEvent.setup()
    render(<AlignmentGroup dir="rtl" defaultValue={['left']} />)

    const left = screen.getByRole('button', { name: 'Left' })
    const center = screen.getByRole('button', { name: 'Center' })

    await user.tab()
    expect(left).toHaveFocus()
    // In RTL, ArrowLeft moves to the NEXT item (visually to the left).
    await user.keyboard('{ArrowLeft}')
    expect(center).toHaveFocus()
  })
})

describe('ToggleGroup dev guard', () => {
  it('warns when the group has no accessible name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <ToggleGroup>
        <Toggle value="left">Left</Toggle>
      </ToggleGroup>
    )
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('accessible name'))
  })

  it('does not warn when aria-label is provided', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<AlignmentGroup />)
    expect(warn).not.toHaveBeenCalled()
  })
})
