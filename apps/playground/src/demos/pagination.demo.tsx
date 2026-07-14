// SPDX-License-Identifier: MIT

import * as React from 'react'

import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@21stgov/commons-react'

export const title = 'Pagination'

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="pagination-basic-heading">
        <h3 id="pagination-basic-heading" className="text-sm font-semibold">
          Result pages (page 4 of 5)
        </h3>
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
      </section>

      <section aria-labelledby="pagination-first-heading">
        <h3 id="pagination-first-heading" className="text-sm font-semibold">
          First page (Previous hidden)
        </h3>
        <Pagination label="Search result pages">
          <PaginationList>
            <PaginationItem>
              <PaginationPage current href="#p1">
                1
              </PaginationPage>
            </PaginationItem>
            <PaginationItem>
              <PaginationPage href="#p2">2</PaginationPage>
            </PaginationItem>
            <PaginationItem>
              <PaginationPage href="#p3">3</PaginationPage>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#p2" />
            </PaginationItem>
          </PaginationList>
        </Pagination>
      </section>
    </div>
  )
}
