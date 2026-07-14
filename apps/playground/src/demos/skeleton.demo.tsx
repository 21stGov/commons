// SPDX-License-Identifier: MIT

import * as React from 'react'

import { Skeleton } from '@21stgov/commons-react'

export const title = 'Skeleton'

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="skeleton-shapes-heading">
        <h3 id="skeleton-shapes-heading" className="text-sm font-semibold">
          Shapes
        </h3>
        <div className="flex flex-col gap-2">
          <Skeleton variant="text" />
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="block" height="6rem" />
          <Skeleton variant="circle" width="3rem" />
        </div>
      </section>

      <section aria-labelledby="skeleton-card-heading">
        <h3 id="skeleton-card-heading" className="text-sm font-semibold">
          Card placeholder (announce loading on the container)
        </h3>
        {/* The placeholders are aria-hidden; the region announces the load. */}
        <div
          role="status"
          aria-busy="true"
          aria-label="Loading profile"
          className="flex items-center gap-2 rounded-md border border-border p-2"
        >
          <Skeleton variant="circle" width="3rem" />
          <div className="flex flex-1 flex-col gap-1">
            <Skeleton variant="text" width="50%" />
            <Skeleton variant="text" width="80%" />
          </div>
        </div>
      </section>

      <section aria-labelledby="skeleton-label-heading">
        <h3 id="skeleton-label-heading" className="text-sm font-semibold">
          Lone placeholder with an sr-only status label
        </h3>
        <Skeleton variant="block" height="4rem" label="Loading your dashboard" />
      </section>

      <section aria-labelledby="skeleton-rtl-heading">
        <h3 id="skeleton-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl" className="flex flex-col gap-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="block" height="4rem" />
        </div>
      </section>
    </div>
  )
}
