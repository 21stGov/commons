// SPDX-License-Identifier: MIT

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Avatar'

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Avatar size="lg">
          <AvatarFallback>MC</AvatarFallback>
          <AvatarBadge label="Available" />
        </Avatar>
        <div>
          <p className="font-semibold">Maya Chen</p>
          <p className="text-sm text-muted-foreground">Permit specialist · Available</p>
        </div>
      </div>
      <AvatarGroup ariaLabel="Service team">
        <Avatar><AvatarFallback>MC</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>AR</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>JL</AvatarFallback></Avatar>
        <AvatarGroupCount count={4} />
      </AvatarGroup>
    </div>
  )
}
