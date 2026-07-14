// SPDX-License-Identifier: MIT

import { AspectRatio } from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Aspect Ratio'

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex max-w-2xl flex-col gap-2">
      <p className="text-sm font-semibold">Responsive 16:9 preview</p>
      <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-md border border-border">
        <div className="flex size-full items-end bg-muted p-2">
          <span className="rounded-sm border border-border bg-background px-105 py-05 text-sm">
            Community services
          </span>
        </div>
      </AspectRatio>
    </div>
  )
}
