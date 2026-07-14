// SPDX-License-Identifier: MIT

'use client'

import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function PaginationDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Result pages">
        <Pagination label="Permit result pages">
          <PaginationList>
            <PaginationItem>
              <PaginationPrevious href="#page-3" />
            </PaginationItem>
            <PaginationItem>
              <PaginationPage href="#page-1">1</PaginationPage>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationPage href="#page-3">3</PaginationPage>
            </PaginationItem>
            <PaginationItem>
              <PaginationPage current href="#page-4">
                4
              </PaginationPage>
            </PaginationItem>
            <PaginationItem>
              <PaginationPage href="#page-5">5</PaginationPage>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#page-5" />
            </PaginationItem>
          </PaginationList>
        </Pagination>
      </DemoSection>
    </DemoStack>
  )
}
