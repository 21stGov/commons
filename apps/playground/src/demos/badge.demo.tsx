// SPDX-License-Identifier: MIT

import { Badge, RemovableTag, Tag } from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Badge and Tag'

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1">
        <Badge>Draft</Badge>
        <Badge variant="success">Approved</Badge>
        <Badge variant="warning">Action needed</Badge>
        <Badge variant="error">Past due</Badge>
      </div>
      <div className="flex flex-wrap gap-1">
        <Tag>Public works</Tag>
        <Tag size="big">New service</Tag>
        <RemovableTag label="Road closures" />
      </div>
    </div>
  )
}
