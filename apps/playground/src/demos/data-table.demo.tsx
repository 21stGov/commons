// SPDX-License-Identifier: MIT

import { DataTable, type DataTableColumn } from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Data table'

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

export default function Demo(): React.JSX.Element {
  const [selected, setSelected] = React.useState<string[]>([])

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="dt-full-heading" className="flex flex-col gap-2">
        <h3 id="dt-full-heading" className="text-sm font-semibold">
          Sort, filter, select, and paginate
        </h3>
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
      </section>

      <section aria-labelledby="dt-stacked-heading" className="flex flex-col gap-2">
        <h3 id="dt-stacked-heading" className="text-sm font-semibold">
          Responsive stacked mode (narrow below sm)
        </h3>
        <DataTable
          caption="Recent permit applications"
          columns={columns}
          data={permits.slice(0, 3)}
          getRowId={getRowId}
          stacked
        />
      </section>

      <section aria-labelledby="dt-rtl-heading" className="flex flex-col gap-2">
        <h3 id="dt-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl">
          <DataTable
            caption="طلبات التصاريح"
            columns={columns}
            data={permits.slice(0, 4)}
            getRowId={getRowId}
            selectable
          />
        </div>
      </section>
    </div>
  )
}
