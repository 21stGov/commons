// SPDX-License-Identifier: MIT

'use client'

import { Skeleton } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function SkeletonDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Shapes">
        <div className="flex flex-col gap-2">
          <Skeleton variant="text" />
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="block" height="6rem" />
          <Skeleton variant="circle" width="3rem" />
        </div>
      </DemoSection>

      <DemoSection title="Card placeholder (loading announced on the container)">
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
      </DemoSection>

      <DemoSection title="Lone placeholder with sr-only status label">
        <Skeleton variant="block" height="4rem" label="Loading your dashboard" />
      </DemoSection>
    </DemoStack>
  )
}
