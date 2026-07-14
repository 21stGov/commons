// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Toggle } from '@/components/toggle'
import { ToggleGroup } from '@/components/toggle-group'
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator } from '@/components/toolbar'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

function BasicToolbar(props: React.ComponentProps<typeof Toolbar>): React.JSX.Element {
  return (
    <Toolbar aria-label="Text formatting" {...props}>
      <ToolbarButton>Bold</ToolbarButton>
      <ToolbarButton>Italic</ToolbarButton>
      <ToolbarButton>Underline</ToolbarButton>
    </Toolbar>
  )
}

describe('Toolbar accessibility (axe)', () => {
  it('a basic button toolbar is axe-clean', async () => {
    const { container } = render(<BasicToolbar />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('a toolbar with a toggle group and separator is axe-clean', async () => {
    const { container } = render(
      <Toolbar aria-label="Editor">
        <ToggleGroup aria-label="Text style" multiple>
          <Toggle value="bold">Bold</Toggle>
          <Toggle value="italic">Italic</Toggle>
        </ToggleGroup>
        <ToolbarSeparator />
        <ToolbarGroup aria-label="Actions">
          <ToolbarButton>Link</ToolbarButton>
          <ToolbarButton>Clear</ToolbarButton>
        </ToolbarGroup>
      </Toolbar>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('a vertical toolbar is axe-clean', async () => {
    const { container } = render(
      <Toolbar aria-label="Map layers" orientation="vertical">
        <ToolbarButton>Roads</ToolbarButton>
        <ToolbarButton>Transit</ToolbarButton>
      </Toolbar>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('a disabled item is axe-clean', async () => {
    const { container } = render(
      <Toolbar aria-label="Text formatting">
        <ToolbarButton>Bold</ToolbarButton>
        <ToolbarButton disabled>Italic</ToolbarButton>
      </Toolbar>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <Toolbar aria-label="تنسيق النص" dir="rtl">
          <ToolbarButton>غامق</ToolbarButton>
          <ToolbarButton>مائل</ToolbarButton>
        </Toolbar>
      </div>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Toolbar name, role, and orientation', () => {
  it('exposes role=toolbar named by its aria-label', () => {
    render(<BasicToolbar />)
    expect(screen.getByRole('toolbar', { name: 'Text formatting' })).toBeInTheDocument()
  })

  it('reflects orientation via aria-orientation', () => {
    render(<BasicToolbar orientation="vertical" />)
    expect(screen.getByRole('toolbar')).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('defaults to a horizontal orientation', () => {
    render(<BasicToolbar />)
    expect(screen.getByRole('toolbar')).toHaveAttribute('aria-orientation', 'horizontal')
  })

  it('supports being named by aria-labelledby', () => {
    render(
      <>
        <span id="tb-label">Row actions</span>
        <Toolbar aria-labelledby="tb-label">
          <ToolbarButton>Edit</ToolbarButton>
        </Toolbar>
      </>
    )
    expect(screen.getByRole('toolbar', { name: 'Row actions' })).toBeInTheDocument()
  })
})

describe('Toolbar roving tabindex + arrow navigation', () => {
  it('exposes a single tab stop: only one item is tabbable', () => {
    render(<BasicToolbar />)
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toHaveAttribute('tabindex', '0')
    expect(buttons[1]).toHaveAttribute('tabindex', '-1')
    expect(buttons[2]).toHaveAttribute('tabindex', '-1')
  })

  it('Tab lands on the first item, and Tab again leaves the toolbar', async () => {
    const user = userEvent.setup()
    render(
      <>
        <BasicToolbar />
        <button type="button">After</button>
      </>
    )
    const buttons = screen.getAllByRole('button', { name: /bold|italic|underline/i })

    await user.tab()
    expect(buttons[0]).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus()
  })

  it('ArrowRight/ArrowLeft move focus between items on a horizontal toolbar', async () => {
    const user = userEvent.setup()
    render(<BasicToolbar />)
    const buttons = screen.getAllByRole('button')

    await user.tab()
    expect(buttons[0]).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    expect(buttons[1]).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    expect(buttons[2]).toHaveFocus()

    await user.keyboard('{ArrowLeft}')
    expect(buttons[1]).toHaveFocus()
  })

  it('loops focus from the last item back to the first', async () => {
    const user = userEvent.setup()
    render(<BasicToolbar />)
    const buttons = screen.getAllByRole('button')

    await user.tab()
    await user.keyboard('{ArrowLeft}')
    // Wraps from the first item to the last (loopFocus default).
    expect(buttons[2]).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    expect(buttons[0]).toHaveFocus()
  })

  it('ArrowDown/ArrowUp move focus on a vertical toolbar', async () => {
    const user = userEvent.setup()
    render(<BasicToolbar orientation="vertical" />)
    const buttons = screen.getAllByRole('button')

    await user.tab()
    await user.keyboard('{ArrowDown}')
    expect(buttons[1]).toHaveFocus()

    await user.keyboard('{ArrowUp}')
    expect(buttons[0]).toHaveFocus()
  })

  it('is RTL-aware: ArrowLeft moves to the next (visually left) item in dir=rtl', async () => {
    const user = userEvent.setup()
    render(<BasicToolbar dir="rtl" />)
    const buttons = screen.getAllByRole('button')

    await user.tab()
    expect(buttons[0]).toHaveFocus()

    // In RTL the reading order still starts at the first item; ArrowLeft moves
    // to the NEXT item (which sits to the left), not the previous one.
    await user.keyboard('{ArrowLeft}')
    expect(buttons[1]).toHaveFocus()
  })
})

describe('ToolbarButton composition', () => {
  it('renders the Commons Button so it activates and keeps its variant border', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Toolbar aria-label="Actions">
        <ToolbarButton variant="primary" onClick={onClick}>
          Save
        </ToolbarButton>
      </Toolbar>
    )
    const button = screen.getByRole('button', { name: 'Save' })
    // Commons Button base classes flow through Base UI's render composition.
    expect(button.className).toContain('border')
    expect(button).toHaveAttribute('type', 'button')

    await user.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('a nested ToggleGroup joins the toolbar as one arrow-navigation stop', async () => {
    const user = userEvent.setup()
    render(
      <Toolbar aria-label="Editor">
        <ToolbarButton>Undo</ToolbarButton>
        <ToggleGroup aria-label="Text style" multiple>
          <Toggle value="bold">Bold</Toggle>
          <Toggle value="italic">Italic</Toggle>
        </ToggleGroup>
      </Toolbar>
    )

    await user.tab()
    expect(screen.getByRole('button', { name: 'Undo' })).toHaveFocus()

    // Arrow navigation crosses out of the button and into the toggle group,
    // proving the group is part of the toolbar's single tab stop.
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('button', { name: 'Bold', pressed: false })).toHaveFocus()
  })
})

describe('ToolbarSeparator', () => {
  it('renders a real separator with a vertical orientation by default', () => {
    render(
      <Toolbar aria-label="Editor">
        <ToolbarButton>A</ToolbarButton>
        <ToolbarSeparator />
        <ToolbarButton>B</ToolbarButton>
      </Toolbar>
    )
    const separator = screen.getByRole('separator')
    expect(separator).toHaveAttribute('aria-orientation', 'vertical')
    // The rule is drawn with a border so it survives forced-colors mode.
    expect(separator.className).toContain('before:border-s')
  })
})

describe('Toolbar dev guard', () => {
  it('warns in development when no accessible name is set', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <Toolbar>
        <ToolbarButton>Bold</ToolbarButton>
      </Toolbar>
    )
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('accessible name'))
  })

  it('does not warn when an aria-label is provided', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<BasicToolbar />)
    expect(warn).not.toHaveBeenCalled()
  })
})
