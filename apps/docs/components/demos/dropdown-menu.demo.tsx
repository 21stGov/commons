// SPDX-License-Identifier: MIT

'use client'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function DropdownMenuDemo(): React.JSX.Element {
  const [showStatus, setShowStatus] = React.useState(true)

  return (
    <DemoStack>
      <DemoSection title="Row actions">
        <DropdownMenu>
          <DropdownMenuTrigger>Record actions</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem disabled>Archive</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Delete record</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </DemoSection>

      <DemoSection title="Checkbox items and a submenu">
        <DropdownMenu>
          <DropdownMenuTrigger>View options</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Columns</DropdownMenuLabel>
              <DropdownMenuCheckboxItem checked={showStatus} onCheckedChange={setShowStatus}>
                Status
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Export as</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>CSV</DropdownMenuItem>
                <DropdownMenuItem>PDF</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </DemoSection>
    </DemoStack>
  )
}
