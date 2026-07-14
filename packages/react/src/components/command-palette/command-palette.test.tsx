// SPDX-License-Identifier: MIT

import { render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  CommandPalette,
  useCommandPaletteShortcut,
  type CommandGroup,
  type CommandPaletteProps,
} from '@/components/command-palette'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

const paySpy = vi.fn()

function makeGroups(): CommandGroup[] {
  return [
    {
      heading: 'Payments',
      items: [
        {
          value: 'pay-bill',
          label: 'Pay a bill',
          icon: 'mail',
          shortcut: ['mod', 'B'],
          keywords: ['invoice', 'utility'],
          onSelect: paySpy,
        },
      ],
    },
    {
      heading: 'Report',
      items: [
        {
          value: 'report-issue',
          label: 'Report an issue',
          icon: 'alert-triangle',
          keywords: ['pothole', 'complaint'],
        },
        { value: 'report-outage', label: 'Report an outage', disabled: true },
      ],
    },
    {
      heading: 'Navigate',
      items: [
        { value: 'find-service', label: 'Find a service', icon: 'search', shortcut: ['mod', 'F'] },
      ],
    },
  ]
}

/**
 * Renders the palette with real controlled state (so the Dialog focus trap
 * and reset-on-close behavior are exercised), starting open by default.
 */
function renderPalette(
  overrides: Partial<CommandPaletteProps> & { initialOpen?: boolean } = {}
): {
  onOpenChange: ReturnType<typeof vi.fn>
  onSelect: ReturnType<typeof vi.fn>
  container: HTMLElement
} {
  const { initialOpen = true, items, onSelect: onSelectProp, ...rest } = overrides
  const onOpenChange = vi.fn()
  const onSelect = vi.fn((item) => onSelectProp?.(item))

  function Wrapper(): React.JSX.Element {
    const [open, setOpen] = React.useState(initialOpen)
    return (
      <CommandPalette
        open={open}
        onOpenChange={(next) => {
          onOpenChange(next)
          setOpen(next)
        }}
        items={items ?? makeGroups()}
        onSelect={onSelect}
        {...rest}
      />
    )
  }

  const { container } = render(<Wrapper />)
  return { onOpenChange, onSelect, container }
}

function getInput(): HTMLElement {
  return screen.getByRole('combobox', { name: 'Search for a command' })
}

describe('CommandPalette accessibility (axe)', () => {
  it('open with grouped commands is axe-clean', async () => {
    renderPalette()
    await screen.findByRole('dialog')
    expect(await axeCheck(document.body)).toHaveNoViolations()
  })

  it('empty (no matches) state is axe-clean', async () => {
    const user = userEvent.setup()
    renderPalette()
    await screen.findByRole('dialog')
    await user.type(getInput(), 'zzzzzzz')
    expect(await screen.findByText('No commands found')).toBeInTheDocument()
    expect(await axeCheck(document.body)).toHaveNoViolations()
  })

  it('with a disabled command is axe-clean', async () => {
    renderPalette()
    expect(await screen.findByRole('option', { name: 'Report an outage' })).toBeInTheDocument()
    expect(await axeCheck(document.body)).toHaveNoViolations()
  })

  it('is axe-clean in a dir=rtl document', async () => {
    render(
      <div dir="rtl">
        <CommandPalette open onOpenChange={() => {}} items={makeGroups()} />
      </div>
    )
    await screen.findByRole('dialog')
    expect(await axeCheck(document.body)).toHaveNoViolations()
  })
})

describe('CommandPalette name, role, and structure', () => {
  it('exposes a named dialog and a named combobox input', async () => {
    renderPalette()
    expect(await screen.findByRole('dialog', { name: 'Command palette' })).toBeInTheDocument()
    expect(getInput()).toHaveAttribute('aria-haspopup', 'listbox')
  })

  it('honors a custom label as the dialog accessible name', async () => {
    renderPalette({ label: 'Quick actions' })
    expect(await screen.findByRole('dialog', { name: 'Quick actions' })).toBeInTheDocument()
  })

  it('renders grouped commands with visible group headings', async () => {
    renderPalette()
    await screen.findByRole('dialog')
    expect(screen.getByText('Payments')).toBeInTheDocument()
    expect(screen.getByText('Report')).toBeInTheDocument()
    expect(screen.getByText('Navigate')).toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(4)
  })

  it('marks a disabled command aria-disabled but keeps it visible', async () => {
    renderPalette()
    const disabled = await screen.findByRole('option', { name: 'Report an outage' })
    expect(disabled).toHaveAttribute('aria-disabled', 'true')
  })
})

describe('CommandPalette filtering', () => {
  it('filters case-insensitively by label', async () => {
    const user = userEvent.setup()
    renderPalette()
    await screen.findByRole('dialog')

    await user.type(getInput(), 'REPORT')
    await waitFor(() => {
      const labels = screen.getAllByRole('option').map((o) => o.textContent)
      expect(labels).toEqual(expect.arrayContaining(['Report an issue']))
      expect(labels).not.toEqual(expect.arrayContaining(['Pay a bill']))
    })
  })

  it('matches on hidden keywords, not just the visible label', async () => {
    const user = userEvent.setup()
    renderPalette()
    await screen.findByRole('dialog')

    await user.type(getInput(), 'pothole')
    await waitFor(() => {
      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(1)
      expect(options[0]).toHaveTextContent('Report an issue')
    })
  })

  it('shows the empty state when nothing matches', async () => {
    const user = userEvent.setup()
    renderPalette()
    await screen.findByRole('dialog')

    await user.type(getInput(), 'nonexistent-command')
    expect(await screen.findByText('No commands found')).toBeInTheDocument()
    expect(screen.queryAllByRole('option')).toHaveLength(0)
  })

  it('announces the current results count in a polite live region', async () => {
    const user = userEvent.setup()
    renderPalette()
    const status = (await screen.findByRole('dialog')).querySelector(
      '[data-slot="command-palette-status"]'
    )
    expect(status).toHaveTextContent('4 results available')

    await user.type(getInput(), 'pay')
    await waitFor(() => expect(status).toHaveTextContent('1 result available'))
  })
})

describe('CommandPalette keyboard contract', () => {
  it('opens with focus in the search input', async () => {
    renderPalette()
    await screen.findByRole('dialog')
    await waitFor(() => expect(getInput()).toHaveFocus())
  })

  it('tracks the highlighted command with aria-activedescendant', async () => {
    const user = userEvent.setup()
    renderPalette()
    const input = getInput()
    await waitFor(() => expect(input).toHaveFocus())

    // autoHighlight (on by default) points aria-activedescendant at the first
    // match as soon as the query filters the list.
    await user.type(input, 'report')
    await waitFor(() => {
      const activeId = input.getAttribute('aria-activedescendant')
      expect(activeId).toBeTruthy()
      expect(document.getElementById(activeId as string)).toHaveAttribute('role', 'option')
    })
  })

  it('runs the highlighted command on Enter, then closes', async () => {
    const user = userEvent.setup()
    const { onSelect, onOpenChange } = renderPalette()
    await screen.findByRole('dialog')

    await user.type(getInput(), 'pay')
    // The option's accessible name folds in its shortcut hint, so match loosely.
    await screen.findByRole('option', { name: /Pay a bill/ })
    await user.keyboard('{Enter}')

    expect(paySpy).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ value: 'pay-bill' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('closes and reports the change on Escape', async () => {
    const user = userEvent.setup()
    const { onOpenChange } = renderPalette()
    await screen.findByRole('dialog')

    await user.keyboard('{Escape}')
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })
})

describe('CommandPalette command activation', () => {
  it('runs a command and closes when its row is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { onOpenChange } = renderPalette({ onSelect })
    const row = await screen.findByRole('option', { name: /Find a service/ })

    await user.click(row)
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ value: 'find-service' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('does not run a disabled command', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    renderPalette({ onSelect })
    const disabled = await screen.findByRole('option', { name: 'Report an outage' })

    await user.click(disabled)
    expect(onSelect).not.toHaveBeenCalled()
  })
})

describe('useCommandPaletteShortcut', () => {
  it('fires the trigger on Ctrl+K and Meta+K', async () => {
    const user = userEvent.setup()
    const onTrigger = vi.fn()
    renderHook(() => useCommandPaletteShortcut(onTrigger))

    await user.keyboard('{Control>}k{/Control}')
    expect(onTrigger).toHaveBeenCalledTimes(1)

    await user.keyboard('{Meta>}k{/Meta}')
    expect(onTrigger).toHaveBeenCalledTimes(2)
  })

  it('does not fire without the platform modifier', async () => {
    const user = userEvent.setup()
    const onTrigger = vi.fn()
    renderHook(() => useCommandPaletteShortcut(onTrigger))

    await user.keyboard('k')
    expect(onTrigger).not.toHaveBeenCalled()
  })

  it('does nothing when disabled', async () => {
    const user = userEvent.setup()
    const onTrigger = vi.fn()
    renderHook(() => useCommandPaletteShortcut(onTrigger, { enabled: false }))

    await user.keyboard('{Control>}k{/Control}')
    expect(onTrigger).not.toHaveBeenCalled()
  })

  it('supports a custom key', async () => {
    const user = userEvent.setup()
    const onTrigger = vi.fn()
    renderHook(() => useCommandPaletteShortcut(onTrigger, { key: '/' }))

    await user.keyboard('{Control>}/{/Control}')
    expect(onTrigger).toHaveBeenCalledTimes(1)
  })
})
