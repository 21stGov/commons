// SPDX-License-Identifier: MIT

'use client'

import { DataTable, type DataTableColumn } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

interface Permit {
  id: string
  applicant: string
  type: string
  status: 'Approved' | 'Pending' | 'Denied'
  submitted: string // ISO date
}

const permits: Permit[] = [
  { id: 'BLD-2041', applicant: 'Ada Lovelace', type: 'Building', status: 'Approved', submitted: '2026-01-05' },
  { id: 'ELC-2042', applicant: 'Grace Hopper', type: 'Electrical', status: 'Pending', submitted: '2026-03-12' },
  { id: 'PLM-2043', applicant: 'Alan Turing', type: 'Plumbing', status: 'Denied', submitted: '2026-02-20' },
  { id: 'BLD-2044', applicant: 'Katherine Johnson', type: 'Building', status: 'Pending', submitted: '2026-04-01' },
  { id: 'ZON-2045', applicant: 'Edsger Dijkstra', type: 'Zoning', status: 'Approved', submitted: '2026-01-28' },
  { id: 'ELC-2046', applicant: 'Barbara Liskov', type: 'Electrical', status: 'Approved', submitted: '2026-05-09' },
  { id: 'PLM-2047', applicant: 'Donald Knuth', type: 'Plumbing', status: 'Pending', submitted: '2026-03-30' },
]

const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })

const columns: DataTableColumn<Permit>[] = [
  { id: 'id', header: 'Permit #', accessorKey: 'id', sortable: true },
  { id: 'applicant', header: 'Applicant', accessorKey: 'applicant', sortable: true },
  { id: 'type', header: 'Type', accessorKey: 'type', sortable: true },
  { id: 'status', header: 'Status', accessorKey: 'status', sortable: true },
  {
    id: 'submitted',
    header: 'Submitted',
    accessorKey: 'submitted',
    sortable: true,
    sortValue: (row) => row.submitted,
    cell: (value) => dateFormatter.format(new Date(String(value))),
    align: 'end',
  },
]

function getRowId(row: Permit): string {
  return row.id
}

export default function DataTableDemo(): React.JSX.Element {
  const [selected, setSelected] = React.useState<string[]>(['ELC-2042'])

  return (
    <DemoStack>
      <DemoSection title="Sort, filter, select, and paginate">
        <DataTable
          caption="Permit applications"
          columns={columns}
          data={permits}
          getRowId={getRowId}
          selectable
          filterable
          filterPlaceholder="Filter permits"
          pageSize={4}
          pageSizeOptions={[4, 8, 20]}
          selectedIds={selected}
          onSelectionChange={setSelected}
        />
        <p className="text-sm text-muted-foreground">
          {selected.length === 0
            ? 'No permits selected.'
            : `${selected.length} selected: ${selected.join(', ')}`}
        </p>
      </DemoSection>

      <DemoSection title="Responsive stacked mode (narrow the viewport below sm)">
        <DataTable
          caption="Recent permit applications"
          columns={columns}
          data={permits.slice(0, 3)}
          getRowId={getRowId}
          stacked
        />
      </DemoSection>

      <DemoSection title="Compact, borderless, no interactivity">
        <DataTable
          caption="Permit applications (read-only)"
          columns={columns}
          data={permits.slice(0, 4)}
          getRowId={getRowId}
          density="compact"
          variant="borderless"
          striped
        />
      </DemoSection>
    </DemoStack>
  )
}
