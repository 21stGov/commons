// SPDX-License-Identifier: MIT

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  type TableSortDirection,
} from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Table'

interface Permit {
  id: string
  applicant: string
  submitted: string
  status: string
}

const PERMITS: Permit[] = [
  { id: 'BP-1024', applicant: 'Rivera Construction', submitted: '2026-03-02', status: 'Approved' },
  { id: 'BP-1025', applicant: 'Chen Remodeling', submitted: '2026-03-05', status: 'Under review' },
  { id: 'BP-1026', applicant: 'Okonkwo Builders', submitted: '2026-02-19', status: 'Approved' },
  { id: 'BP-1027', applicant: 'Delgado Electric', submitted: '2026-03-11', status: 'Action needed' },
]

type SortKey = 'id' | 'submitted'

function nextDirection(current: TableSortDirection): TableSortDirection {
  if (current === 'none') return 'ascending'
  if (current === 'ascending') return 'descending'
  return 'none'
}

export default function Demo(): React.JSX.Element {
  const [sortKey, setSortKey] = React.useState<SortKey>('submitted')
  const [direction, setDirection] = React.useState<TableSortDirection>('ascending')

  const sorted = React.useMemo(() => {
    if (direction === 'none') return PERMITS
    const copy = [...PERMITS]
    copy.sort((a, b) => a[sortKey].localeCompare(b[sortKey]))
    if (direction === 'descending') copy.reverse()
    return copy
  }, [sortKey, direction])

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setDirection((prev) => nextDirection(prev))
    } else {
      setSortKey(key)
      setDirection('ascending')
    }
  }

  const dirFor = (key: SortKey): TableSortDirection => (sortKey === key ? direction : 'none')

  return (
    <div className="flex flex-col gap-8">
      {/* Sortable, consumer-controlled data table. */}
      <Table caption="Building permit requests (sortable)" striped>
        <TableHead>
          <TableRow>
            <TableHeaderCell sortable sortDirection={dirFor('id')} onSort={() => handleSort('id')}>
              Permit
            </TableHeaderCell>
            <TableHeaderCell>Applicant</TableHeaderCell>
            <TableHeaderCell
              sortable
              sortDirection={dirFor('submitted')}
              onSort={() => handleSort('submitted')}
            >
              Submitted
            </TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((permit) => (
            <TableRow key={permit.id}>
              <TableHeaderCell scope="row">{permit.id}</TableHeaderCell>
              <TableCell>{permit.applicant}</TableCell>
              <TableCell>{permit.submitted}</TableCell>
              <TableCell>{permit.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Stacked-responsive: resize below 640px to see rows reflow into cards. */}
      <Table caption="Permit requests (stacked below 640px)" stacked variant="borderless" density="compact">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Permit</TableHeaderCell>
            <TableHeaderCell>Applicant</TableHeaderCell>
            <TableHeaderCell>Submitted</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {PERMITS.map((permit) => (
            <TableRow key={permit.id}>
              <TableHeaderCell scope="row" data-label="Permit">
                {permit.id}
              </TableHeaderCell>
              <TableCell label="Applicant">{permit.applicant}</TableCell>
              <TableCell label="Submitted">{permit.submitted}</TableCell>
              <TableCell label="Status">{permit.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* RTL smoke: a full localized table in a right-to-left context. */}
      <div dir="rtl" lang="ar">
        <Table caption="طلبات تصاريح البناء">
          <TableHead>
            <TableRow>
              <TableHeaderCell sortable sortDirection="ascending" onSort={() => {}}>
                التصريح
              </TableHeaderCell>
              <TableHeaderCell>مقدم الطلب</TableHeaderCell>
              <TableHeaderCell>الحالة</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableHeaderCell scope="row">BP-1024</TableHeaderCell>
              <TableCell>شركة ريفيرا للإنشاءات</TableCell>
              <TableCell>معتمد</TableCell>
            </TableRow>
            <TableRow>
              <TableHeaderCell scope="row">BP-1025</TableHeaderCell>
              <TableCell>تشين للتجديد</TableCell>
              <TableCell>قيد المراجعة</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
