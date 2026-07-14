// SPDX-License-Identifier: MIT

'use client'

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

import { DemoSection, DemoStack } from './demo-section'

interface Permit {
  id: string
  applicant: string
  status: string
}

const PERMITS: Permit[] = [
  { id: 'BP-1024', applicant: 'Rivera Construction', status: 'Approved' },
  { id: 'BP-1025', applicant: 'Chen Remodeling', status: 'Under review' },
  { id: 'BP-1026', applicant: 'Okonkwo Builders', status: 'Approved' },
]

export default function TableDemo(): React.JSX.Element {
  const [direction, setDirection] = React.useState<TableSortDirection>('ascending')

  const sorted = React.useMemo(() => {
    if (direction === 'none') return PERMITS
    const copy = [...PERMITS].sort((a, b) => a.id.localeCompare(b.id))
    if (direction === 'descending') copy.reverse()
    return copy
  }, [direction])

  const handleSort = () => {
    setDirection((prev) =>
      prev === 'none' ? 'ascending' : prev === 'ascending' ? 'descending' : 'none',
    )
  }

  return (
    <DemoStack>
      <DemoSection title="Sortable permit requests">
        <Table caption="Building permit requests" striped density="compact">
          <TableHead>
            <TableRow>
              <TableHeaderCell sortable sortDirection={direction} onSort={handleSort}>
                Permit
              </TableHeaderCell>
              <TableHeaderCell>Applicant</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((permit) => (
              <TableRow key={permit.id}>
                <TableHeaderCell scope="row">{permit.id}</TableHeaderCell>
                <TableCell>{permit.applicant}</TableCell>
                <TableCell>{permit.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DemoSection>
    </DemoStack>
  )
}
