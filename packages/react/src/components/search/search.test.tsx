// SPDX-License-Identifier: MIT

import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Search } from '@/components/search'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

const SUGGESTIONS = ['Parking permits', 'Building permits', 'Pay water bill', 'Trash pickup']

describe('Search accessibility (axe)', () => {
  it('plain default state is axe-clean', async () => {
    const { container } = render(<Search />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('plain filled state (with clear button) is axe-clean', async () => {
    const { container } = render(<Search defaultValue="permits" />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('disabled state is axe-clean', async () => {
    const { container } = render(<Search defaultValue="permits" disabled />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('error state (aria-invalid) is axe-clean', async () => {
    const { container } = render(
      <>
        <p id="search-error">Enter at least two characters.</p>
        <Search aria-invalid aria-describedby="search-error" />
      </>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('icon-only (compact) submit is axe-clean', async () => {
    const { container } = render(<Search iconSubmit width="auto" />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('autocomplete variant is axe-clean', async () => {
    const { container } = render(<Search suggestions={SUGGESTIONS} />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('Search landmark, name, and controls', () => {
  it('renders a role=search landmark', () => {
    render(<Search />)
    expect(screen.getByRole('search')).toBeInTheDocument()
  })

  it('gives the input a real (default) accessible name', () => {
    render(<Search />)
    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeInTheDocument()
  })

  it('honors a custom label', () => {
    render(<Search label="Search the city site" />)
    expect(screen.getByRole('searchbox', { name: 'Search the city site' })).toBeInTheDocument()
  })

  it('exposes a submit button with an accessible name', () => {
    render(<Search submitLabel="Go" />)
    expect(screen.getByRole('button', { name: 'Go' })).toHaveAttribute('type', 'submit')
  })

  it('names the icon-only submit button via submitLabel', () => {
    render(<Search iconSubmit submitLabel="Search" />)
    expect(screen.getByRole('button', { name: 'Search' })).toHaveAttribute('type', 'submit')
  })

  it('gives the input the query name for no-JS form submission', () => {
    render(<Search name="query" />)
    expect(screen.getByRole('searchbox')).toHaveAttribute('name', 'query')
  })
})

describe('Search submit behavior', () => {
  it('calls onSearch with the query on Enter', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<Search onSearch={onSearch} />)

    const input = screen.getByRole('searchbox')
    await user.type(input, 'potholes')
    await user.keyboard('{Enter}')
    expect(onSearch).toHaveBeenCalledWith('potholes')
  })

  it('calls onSearch when the submit button is clicked', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<Search onSearch={onSearch} defaultValue="permits" />)

    await user.click(screen.getByRole('button', { name: 'Search' }))
    expect(onSearch).toHaveBeenCalledWith('permits')
  })

  it('prevents native submission when no action is provided', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <div onSubmit={onSubmit}>
        <Search onSearch={() => {}} defaultValue="x" />
      </div>
    )
    await user.click(screen.getByRole('button', { name: 'Search' }))
    // The bubbled submit event should have been defaultPrevented.
    expect(onSubmit).toHaveBeenCalled()
    expect(onSubmit.mock.calls[0][0].defaultPrevented).toBe(true)
  })
})

describe('Search clear button', () => {
  it('is hidden until there is text, then clears and refocuses', async () => {
    const user = userEvent.setup()
    render(<Search />)

    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()

    const input = screen.getByRole('searchbox')
    await user.type(input, 'water')
    const clear = screen.getByRole('button', { name: 'Clear search' })
    await user.click(clear)

    expect(input).toHaveValue('')
    expect(input).toHaveFocus()
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()
  })

  it('is not shown when disabled even with a value', () => {
    render(<Search defaultValue="permits" disabled />)
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()
  })
})

describe('Search controlled and uncontrolled', () => {
  it('supports an uncontrolled defaultValue', async () => {
    const user = userEvent.setup()
    render(<Search defaultValue="pool" />)
    const input = screen.getByRole('searchbox')
    expect(input).toHaveValue('pool')
    await user.type(input, 's')
    expect(input).toHaveValue('pools')
  })

  it('supports a controlled value via value + onValueChange', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    function Controlled(): React.JSX.Element {
      const [q, setQ] = React.useState('')
      return (
        <Search
          value={q}
          onValueChange={(next) => {
            onValueChange(next)
            setQ(next)
          }}
        />
      )
    }

    render(<Controlled />)
    const input = screen.getByRole('searchbox')
    await user.type(input, 'ab')
    expect(onValueChange).toHaveBeenLastCalledWith('ab')
    expect(input).toHaveValue('ab')
  })
})

describe('Search disabled state', () => {
  it('disables the input and submit button', () => {
    render(<Search disabled />)
    expect(screen.getByRole('searchbox')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Search' })).toBeDisabled()
  })
})

describe('Search autocomplete variant', () => {
  it('upgrades the input to a combobox', () => {
    render(<Search suggestions={SUGGESTIONS} />)
    expect(screen.getByRole('combobox', { name: 'Search' })).toBeInTheDocument()
  })

  it('filters suggestions as the user types and lets Enter submit any free text', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<Search suggestions={SUGGESTIONS} onSearch={onSearch} />)

    const input = screen.getByRole('combobox')
    await user.type(input, 'permit')

    const listbox = await screen.findByRole('listbox')
    const options = within(listbox).getAllByRole('option')
    expect(options).toHaveLength(2)
    expect(options.map((o) => o.textContent)).toEqual(['Parking permits', 'Building permits'])

    // A free-text query that is not a suggestion still submits.
    await user.clear(input)
    await user.type(input, 'zzz nonsense')
    await user.keyboard('{Enter}')
    expect(onSearch).toHaveBeenCalledWith('zzz nonsense')
  })

  it('shows a no-results boundary when nothing matches', async () => {
    const user = userEvent.setup()
    render(<Search suggestions={SUGGESTIONS} noResultsText="No suggestions" />)

    const input = screen.getByRole('combobox')
    await user.type(input, 'xyz')
    await waitFor(() => {
      expect(screen.getByText('No suggestions')).toBeInTheDocument()
    })
  })
})

describe('Search RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <Search label="بحث" submitLabel="بحث" defaultValue="حديقة" />
      </div>
    )
    expect(screen.getByRole('searchbox', { name: 'بحث' })).toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})
