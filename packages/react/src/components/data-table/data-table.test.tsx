// SPDX-License-Identifier: MIT

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DataTable, type DataTableColumn, type DataTableSort } from '@/components/data-table'
import { axeCheck } from '../../../test/setup.js'

afterEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// Fixture: a small permit-application dataset
// ---------------------------------------------------------------------------

interface Permit {
  id: string
  applicant: string
  type: string
  status: string
  submitted: string // ISO date
}

const permits: Permit[] = [
  { id: 'P-100', applicant: 'Ada Lovelace', type: 'Building', status: 'Approved', submitted: '2026-01-05' },
  { id: 'P-101', applicant: 'Grace Hopper', type: 'Electrical', status: 'Pending', submitted: '2026-03-12' },
  { id: 'P-102', applicant: 'Alan Turing', type: 'Plumbing', status: 'Denied', submitted: '2026-02-20' },
  { id: 'P-103', applicant: 'Katherine Johnson', type: 'Building', status: 'Pending', submitted: '2026-04-01' },
  { id: 'P-104', applicant: 'Edsger Dijkstra', type: 'Zoning', status: 'Approved', submitted: '2026-01-28' },
]

const columns: DataTableColumn<Permit>[] = [
  { id: 'id', header: 'Permit', accessorKey: 'id', sortable: true },
  { id: 'applicant', header: 'Applicant', accessorKey: 'applicant', sortable: true },
  { id: 'type', header: 'Type', accessorKey: 'type' },
  { id: 'status', header: 'Status', accessorKey: 'status' },
  {
    id: 'submitted',
    header: 'Submitted',
    accessorKey: 'submitted',
    sortable: true,
    sortValue: (row) => row.submitted,
    align: 'end',
  },
]

function getRowId(row: Permit): string {
  return row.id
}

// ---------------------------------------------------------------------------
// Accessibility (axe)
// ---------------------------------------------------------------------------

describe('DataTable accessibility (axe)', () => {
  it('default table is axe-clean', async () => {
    const { container } = render(
      <DataTable caption="Permit applications" columns={columns} data={permits} getRowId={getRowId} />
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('with selection, filtering, and pagination is axe-clean', async () => {
    const { container } = render(
      <DataTable
        caption="Permit applications"
        columns={columns}
        data={permits}
        getRowId={getRowId}
        selectable
        filterable
        pageSize={2}
        pageSizeOptions={[2, 5, 10]}
        defaultSelectedIds={['P-100']}
      />
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('empty (filtered to nothing) state is axe-clean', async () => {
    const { container } = render(
      <DataTable
        caption="Permit applications"
        columns={columns}
        data={permits}
        getRowId={getRowId}
        filterable
        defaultFilterValue="zzzz-no-match"
      />
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })

  it('stacked (responsive) mode is axe-clean', async () => {
    const { container } = render(
      <DataTable
        caption="Permit applications"
        columns={columns}
        data={permits}
        getRowId={getRowId}
        stacked
        selectable
      />
    )
    expect(await axeCheck(container)).toHaveNoViolations()
  })
})

// ---------------------------------------------------------------------------
// Semantics
// ---------------------------------------------------------------------------

describe('DataTable semantics', () => {
  it('renders a real table named by its caption with column headers', () => {
    render(
      <DataTable caption="Permit applications" columns={columns} data={permits} getRowId={getRowId} />
    )
    const table = screen.getByRole('table', { name: 'Permit applications' })
    expect(table).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Applicant' })).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

describe('DataTable sorting', () => {
  function firstBodyCellText(): string[] {
    const rows = screen.getAllByRole('row')
    // row[0] is the header row.
    return rows.slice(1).map((row) => within(row).getAllByRole('cell')[0].textContent ?? '')
  }

  it('a sortable header is a button inside a th with aria-sort', () => {
    render(
      <DataTable caption="Permit applications" columns={columns} data={permits} getRowId={getRowId} />
    )
    const header = screen.getByRole('columnheader', { name: 'Permit' })
    expect(header).toHaveAttribute('aria-sort', 'none')
    expect(within(header).getByRole('button', { name: 'Permit' })).toBeInTheDocument()
  })

  it('a non-sortable column exposes no sort button and no aria-sort', () => {
    render(
      <DataTable caption="Permit applications" columns={columns} data={permits} getRowId={getRowId} />
    )
    const header = screen.getByRole('columnheader', { name: 'Type' })
    expect(header).not.toHaveAttribute('aria-sort')
    expect(within(header).queryByRole('button')).not.toBeInTheDocument()
  })

  it('cycles none -> ascending -> descending -> none and reorders rows', async () => {
    const user = userEvent.setup()
    render(
      <DataTable caption="Permit applications" columns={columns} data={permits} getRowId={getRowId} />
    )
    const header = screen.getByRole('columnheader', { name: 'Applicant' })
    const button = within(header).getByRole('button')

    // Natural order (first cell = Permit id column).
    expect(firstBodyCellText()).toEqual(['P-100', 'P-101', 'P-102', 'P-103', 'P-104'])

    // Ascending by applicant name: Ada, Alan, Edsger, Grace, Katherine.
    await user.click(button)
    expect(header).toHaveAttribute('aria-sort', 'ascending')
    expect(firstBodyCellText()).toEqual(['P-100', 'P-102', 'P-104', 'P-101', 'P-103'])

    // Descending: the reverse.
    await user.click(button)
    expect(header).toHaveAttribute('aria-sort', 'descending')
    expect(firstBodyCellText()).toEqual(['P-103', 'P-101', 'P-104', 'P-102', 'P-100'])

    // Back to none / natural order.
    await user.click(button)
    expect(header).toHaveAttribute('aria-sort', 'none')
    expect(firstBodyCellText()).toEqual(['P-100', 'P-101', 'P-102', 'P-103', 'P-104'])
  })

  it('supports controlled sort state', async () => {
    const user = userEvent.setup()
    const onSortChange = vi.fn()

    function Controlled(): React.JSX.Element {
      const [sort, setSort] = React.useState<DataTableSort | null>(null)
      return (
        <DataTable
          caption="Permit applications"
          columns={columns}
          data={permits}
          getRowId={getRowId}
          sort={sort}
          onSortChange={(next) => {
            onSortChange(next)
            setSort(next)
          }}
        />
      )
    }

    render(<Controlled />)
    const header = screen.getByRole('columnheader', { name: 'Permit' })
    await user.click(within(header).getByRole('button'))
    expect(onSortChange).toHaveBeenCalledWith({ columnId: 'id', direction: 'ascending' })
    expect(header).toHaveAttribute('aria-sort', 'ascending')
  })
})

// ---------------------------------------------------------------------------
// Selection
// ---------------------------------------------------------------------------

describe('DataTable selection', () => {
  const selectByApplicant = (row: Permit): string => `Select ${row.applicant}`

  it('names the select-all (default) and each row checkbox', () => {
    render(
      <DataTable
        caption="Permit applications"
        columns={columns}
        data={permits}
        getRowId={getRowId}
        selectable
      />
    )
    // Default row label references the first cell value (the permit id).
    expect(screen.getByRole('checkbox', { name: 'Select all rows' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Select P-100' })).toBeInTheDocument()
  })

  it('uses a custom rowSelectLabel when provided', () => {
    render(
      <DataTable
        caption="Permit applications"
        columns={columns}
        data={permits}
        getRowId={getRowId}
        selectable
        rowSelectLabel={selectByApplicant}
      />
    )
    expect(screen.getByRole('checkbox', { name: 'Select Ada Lovelace' })).toBeInTheDocument()
  })

  it('toggles a single row and reports the selection', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    render(
      <DataTable
        caption="Permit applications"
        columns={columns}
        data={permits}
        getRowId={getRowId}
        selectable
        rowSelectLabel={selectByApplicant}
        onSelectionChange={onSelectionChange}
      />
    )
    await user.click(screen.getByRole('checkbox', { name: 'Select Grace Hopper' }))
    expect(onSelectionChange).toHaveBeenLastCalledWith(['P-101'])
  })

  it('select-all is indeterminate when only some rows are selected', async () => {
    const user = userEvent.setup()
    render(
      <DataTable
        caption="Permit applications"
        columns={columns}
        data={permits}
        getRowId={getRowId}
        selectable
        rowSelectLabel={selectByApplicant}
      />
    )
    const selectAll = screen.getByRole<HTMLInputElement>('checkbox', { name: 'Select all rows' })
    expect(selectAll.indeterminate).toBe(false)
    expect(selectAll.checked).toBe(false)

    await user.click(screen.getByRole('checkbox', { name: 'Select Ada Lovelace' }))
    expect(selectAll.indeterminate).toBe(true)
    expect(selectAll.checked).toBe(false)
  })

  it('select-all selects then clears every row', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    render(
      <DataTable
        caption="Permit applications"
        columns={columns}
        data={permits}
        getRowId={getRowId}
        selectable
        onSelectionChange={onSelectionChange}
      />
    )
    const selectAll = screen.getByRole<HTMLInputElement>('checkbox', { name: 'Select all rows' })

    await user.click(selectAll)
    expect(onSelectionChange).toHaveBeenLastCalledWith(['P-100', 'P-101', 'P-102', 'P-103', 'P-104'])
    expect(selectAll.checked).toBe(true)
    expect(selectAll.indeterminate).toBe(false)

    await user.click(selectAll)
    expect(onSelectionChange).toHaveBeenLastCalledWith([])
  })

  it('reflects a controlled selection', () => {
    render(
      <DataTable
        caption="Permit applications"
        columns={columns}
        data={permits}
        getRowId={getRowId}
        selectable
        rowSelectLabel={selectByApplicant}
        selectedIds={['P-102']}
      />
    )
    expect(screen.getByRole<HTMLInputElement>('checkbox', { name: 'Select Alan Turing' }).checked).toBe(
      true
    )
    expect(
      screen.getByRole<HTMLInputElement>('checkbox', { name: 'Select Ada Lovelace' }).checked
    ).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------

describe('DataTable filtering', () => {
  it('filters rows across columns and announces the count', async () => {
    const user = userEvent.setup()
    render(
      <DataTable
        caption="Permit applications"
        columns={columns}
        data={permits}
        getRowId={getRowId}
        filterable
      />
    )
    const filter = screen.getByRole('searchbox', { name: 'Filter table' })
    await user.type(filter, 'Pending')

    // Two permits are Pending.
    expect(screen.getByRole('cell', { name: 'Grace Hopper' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Katherine Johnson' })).toBeInTheDocument()
    expect(screen.queryByRole('cell', { name: 'Ada Lovelace' })).not.toBeInTheDocument()

    const status = document.querySelector('[data-slot="data-table-status"]')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status?.textContent).toContain('2')
  })

  it('shows the empty state when nothing matches', async () => {
    const user = userEvent.setup()
    render(
      <DataTable
        caption="Permit applications"
        columns={columns}
        data={permits}
        getRowId={getRowId}
        filterable
        emptyText="No permits found"
      />
    )
    await user.type(screen.getByRole('searchbox', { name: 'Filter table' }), 'nomatch')
    expect(screen.getByRole('cell', { name: 'No permits found' })).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

describe('DataTable pagination', () => {
  it('splits rows into pages and navigates with Next/Previous', async () => {
    const user = userEvent.setup()
    render(
      <DataTable
        caption="Permit applications"
        columns={columns}
        data={permits}
        getRowId={getRowId}
        pageSize={2}
      />
    )
    // Page 1: first two rows.
    expect(screen.getByRole('cell', { name: 'Ada Lovelace' })).toBeInTheDocument()
    expect(screen.queryByRole('cell', { name: 'Alan Turing' })).not.toBeInTheDocument()

    const nav = screen.getByRole('navigation', { name: 'Table pages' })
    await user.click(within(nav).getByRole('button', { name: 'Next' }))

    // Page 2: next two rows.
    expect(screen.getByRole('cell', { name: 'Alan Turing' })).toBeInTheDocument()
    expect(screen.queryByRole('cell', { name: 'Ada Lovelace' })).not.toBeInTheDocument()
  })

  it('marks the current page with aria-current', async () => {
    const user = userEvent.setup()
    render(
      <DataTable
        caption="Permit applications"
        columns={columns}
        data={permits}
        getRowId={getRowId}
        pageSize={2}
      />
    )
    const nav = screen.getByRole('navigation', { name: 'Table pages' })
    expect(within(nav).getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page')

    await user.click(within(nav).getByRole('button', { name: 'Page 3' }))
    expect(within(nav).getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page')
  })

  it('changing the page size resets to page 1', async () => {
    const user = userEvent.setup()
    const onPageSizeChange = vi.fn()
    render(
      <DataTable
        caption="Permit applications"
        columns={columns}
        data={permits}
        getRowId={getRowId}
        defaultPageSize={2}
        pageSizeOptions={[2, 5]}
        onPageSizeChange={onPageSizeChange}
      />
    )
    const nav = screen.getByRole('navigation', { name: 'Table pages' })
    await user.click(within(nav).getByRole('button', { name: 'Next' }))
    expect(screen.getByRole('cell', { name: 'Alan Turing' })).toBeInTheDocument()

    // Selecting 5 rows/page shows everything on one page again (back to page 1).
    await user.selectOptions(screen.getByRole('combobox', { name: 'Rows per page' }), '5')
    expect(onPageSizeChange).toHaveBeenCalledWith(5)
    expect(screen.getByRole('cell', { name: 'Ada Lovelace' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Edsger Dijkstra' })).toBeInTheDocument()
  })
})
