// SPDX-License-Identifier: MIT

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { EmptyState } from '@/components/empty-state'
import { axeCheck } from '../../../test/setup.js'

function Icon(): React.JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor">
      <circle cx="8" cy="8" r="6" />
    </svg>
  )
}

describe('EmptyState accessibility (axe)', () => {
  it('default (empty) variant is axe-clean', async () => {
    const { container } = render(
      <EmptyState heading="No documents yet">Upload a file to get started.</EmptyState>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('no-results variant with icon and action is axe-clean', async () => {
    const { container } = render(
      <EmptyState
        variant="no-results"
        icon={<Icon />}
        heading="No results"
        action={<button type="button">Clear filters</button>}
      >
        No records matched your search. Try a broader term.
      </EmptyState>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('EmptyState heading', () => {
  it('renders the heading as an h2 by default', () => {
    render(<EmptyState heading="No documents yet" />)
    const heading = screen.getByRole('heading', { level: 2, name: 'No documents yet' })
    expect(heading.tagName).toBe('H2')
  })

  it('renders the heading at the requested level', () => {
    render(<EmptyState heading="No documents yet" headingLevel="h3" />)
    expect(screen.getByRole('heading', { level: 3, name: 'No documents yet' })).toBeInTheDocument()
  })
})

describe('EmptyState action', () => {
  it('renders the action and it is focusable and clickable', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <EmptyState
        heading="No results"
        action={
          <button type="button" onClick={onClick}>
            Clear filters
          </button>
        }
      />
    )

    const action = screen.getByRole('button', { name: 'Clear filters' })
    await user.tab()
    expect(action).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('EmptyState semantics', () => {
  it('is content, not an error: it exposes no alert role and no live region', () => {
    const { container } = render(
      <EmptyState variant="no-results" heading="No results">
        Nothing matched.
      </EmptyState>
    )
    expect(screen.queryByRole('alert')).toBeNull()
    const root = container.querySelector('[data-slot="empty-state"]')
    expect(root).not.toHaveAttribute('role')
    expect(root).not.toHaveAttribute('aria-live')
    expect(root).toHaveAttribute('data-variant', 'no-results')
  })

  it('wraps the decorative icon in an aria-hidden slot', () => {
    const { container } = render(<EmptyState heading="No documents yet" icon={<Icon />} />)
    const iconSlot = container.querySelector('[data-slot="empty-state-icon"]')
    expect(iconSlot).toHaveAttribute('aria-hidden', 'true')
  })

  it('defaults to the empty variant', () => {
    const { container } = render(<EmptyState heading="No documents yet" />)
    expect(container.querySelector('[data-slot="empty-state"]')).toHaveAttribute(
      'data-variant',
      'empty'
    )
  })
})

describe('EmptyState RTL', () => {
  it('renders and stays axe-clean in a dir=rtl document', async () => {
    const { container } = render(
      <div dir="rtl">
        <EmptyState
          variant="no-results"
          heading="لا توجد نتائج"
          action={<button type="button">مسح عوامل التصفية</button>}
        >
          لم يطابق أي سجل بحثك.
        </EmptyState>
      </div>
    )
    expect(screen.getByRole('heading', { name: 'لا توجد نتائج' })).toBeInTheDocument()
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})
