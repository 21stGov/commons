// SPDX-License-Identifier: MIT

import { render, screen, within } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it } from 'vitest'

import { ProcessList, ProcessListItem } from '@/components/process-list'
import { axeCheck } from '../../../test/setup.js'

function BasicSteps(): React.JSX.Element {
  return (
    <ProcessList>
      <ProcessListItem heading="Gather your documents">
        Collect proof of income, ID, and proof of residency.
      </ProcessListItem>
      <ProcessListItem heading="Complete the application">
        Fill out every required field on the form.
      </ProcessListItem>
      <ProcessListItem heading="Submit and await review">
        A caseworker will contact you within 10 business days.
      </ProcessListItem>
    </ProcessList>
  )
}

describe('ProcessList accessibility (axe)', () => {
  it('is axe-clean with plain steps and no status', async () => {
    const { container } = render(<BasicSteps />)
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean with complete/current/upcoming statuses', async () => {
    const { container } = render(
      <ProcessList>
        <ProcessListItem heading="Gather documents" status="complete">
          Done.
        </ProcessListItem>
        <ProcessListItem heading="Complete the application" status="current">
          In progress.
        </ProcessListItem>
        <ProcessListItem heading="Await review" status="upcoming">
          Not started.
        </ProcessListItem>
      </ProcessList>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('is axe-clean with a nested substep ProcessList', async () => {
    const { container } = render(
      <ProcessList>
        <ProcessListItem heading="Gather your documents">
          <p>You will need the following:</p>
          <ProcessList size="compact">
            <ProcessListItem heading="Proof of income">Pay stubs or a W-2.</ProcessListItem>
            <ProcessListItem heading="Proof of residency">A recent utility bill.</ProcessListItem>
          </ProcessList>
        </ProcessListItem>
        <ProcessListItem heading="Submit the application">Upload everything.</ProcessListItem>
      </ProcessList>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('renders and stays axe-clean in a dir="rtl" document', async () => {
    const { container } = render(
      <div dir="rtl" lang="ar">
        <ProcessList>
          <ProcessListItem heading="اجمع مستنداتك">اجمع الأوراق المطلوبة.</ProcessListItem>
          <ProcessListItem heading="أكمل الطلب">املأ جميع الحقول.</ProcessListItem>
        </ProcessList>
      </div>
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

describe('ProcessList structure', () => {
  it('renders a real ordered list with one list item per step', () => {
    render(<BasicSteps />)
    const list = screen.getByRole('list')
    expect(list.tagName).toBe('OL')
    expect(within(list).getAllByRole('listitem')).toHaveLength(3)
  })

  it('renders each heading at the default h3 level', () => {
    render(<BasicSteps />)
    const headings = screen.getAllByRole('heading', { level: 3 })
    expect(headings).toHaveLength(3)
    expect(headings[0]).toHaveTextContent('Gather your documents')
  })

  it('lets the consumer pick a different heading level', () => {
    render(
      <ProcessList>
        <ProcessListItem heading="Step one" headingLevel="h2">
          Body
        </ProcessListItem>
      </ProcessList>
    )
    expect(screen.getByRole('heading', { level: 2, name: 'Step one' })).toBeInTheDocument()
  })
})

describe('ProcessList automatic numbering', () => {
  it('numbers markers from real render order, not a hand-typed index', () => {
    render(<BasicSteps />)
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('1')
    expect(items[1]).toHaveTextContent('2')
    expect(items[2]).toHaveTextContent('3')
  })

  it('renumbers automatically when an item is conditionally omitted', () => {
    render(
      <ProcessList>
        <ProcessListItem heading="First">First body</ProcessListItem>
        {false}
        <ProcessListItem heading="Second">Second body</ProcessListItem>
      </ProcessList>
    )
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('1')
    expect(items[1]).toHaveTextContent('2')
  })

  it('accepts an explicit position override for continuing a sequence', () => {
    render(
      <ProcessList>
        <ProcessListItem heading="Fourth step" position={4}>
          Body
        </ProcessListItem>
        <ProcessListItem heading="Fifth step">Body</ProcessListItem>
      </ProcessList>
    )
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('4')
    // The following item's auto-assigned position continues from render
    // order (index 2), not from the explicit override.
    expect(items[1]).toHaveTextContent('2')
  })
})

describe('ProcessList status', () => {
  it('tags each item with its status via data-status, omitting it when unset', () => {
    render(
      <ProcessList>
        <ProcessListItem heading="No status">Body</ProcessListItem>
        <ProcessListItem heading="Complete" status="complete">
          Body
        </ProcessListItem>
      </ProcessList>
    )
    const items = screen.getAllByRole('listitem')
    expect(items[0]).not.toHaveAttribute('data-status')
    expect(items[1]).toHaveAttribute('data-status', 'complete')
  })

  it('renders a checkmark instead of the number for a complete step', () => {
    render(
      <ProcessList>
        <ProcessListItem heading="Complete" status="complete">
          Body
        </ProcessListItem>
      </ProcessList>
    )
    const item = screen.getByRole('listitem')
    expect(item.querySelector('svg')).toBeInTheDocument()
    expect(item).not.toHaveTextContent('1')
  })

  it('marks the current step with aria-current="step"', () => {
    render(
      <ProcessList>
        <ProcessListItem heading="Done" status="complete">
          Body
        </ProcessListItem>
        <ProcessListItem heading="Now" status="current">
          Body
        </ProcessListItem>
        <ProcessListItem heading="Later" status="upcoming">
          Body
        </ProcessListItem>
      </ProcessList>
    )
    const items = screen.getAllByRole('listitem')
    const current = items.filter((item) => item.getAttribute('aria-current') === 'step')
    expect(current).toHaveLength(1)
    expect(current[0]).toHaveTextContent('Now')
  })

  it('announces a spelled-out, translatable status word per item', () => {
    render(
      <ProcessList>
        <ProcessListItem heading="Done" status="complete">
          Body
        </ProcessListItem>
        <ProcessListItem heading="Later" status="upcoming" statusLabel="pendiente">
          Body
        </ProcessListItem>
      </ProcessList>
    )
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('Done, completed')
    expect(items[1]).toHaveTextContent('Later, pendiente')
  })

  it('adds no status word when status is unset', () => {
    render(<BasicSteps />)
    const item = screen.getAllByRole('listitem')[0]
    expect(item).not.toHaveTextContent(/completed|current step|not started/)
  })
})

describe('ProcessList substeps', () => {
  it('renders a nested ProcessList as a real nested ordered list', () => {
    render(
      <ProcessList>
        <ProcessListItem heading="Gather your documents">
          <ProcessList size="compact">
            <ProcessListItem heading="Proof of income">Pay stubs.</ProcessListItem>
            <ProcessListItem heading="Proof of residency">Utility bill.</ProcessListItem>
          </ProcessList>
        </ProcessListItem>
      </ProcessList>
    )
    const lists = screen.getAllByRole('list')
    expect(lists).toHaveLength(2)
    const nestedItems = within(lists[1]).getAllByRole('listitem')
    expect(nestedItems).toHaveLength(2)
    expect(nestedItems[0]).toHaveTextContent('Proof of income')
  })
})
