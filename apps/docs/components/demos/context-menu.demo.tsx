// SPDX-License-Identifier: MIT

'use client'

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function ContextMenuDemo(): React.JSX.Element {
  const [dense, setDense] = React.useState(false)

  return (
    <DemoStack>
      <DemoSection title="Right-click a row (actions also in the visible menu)">
        <ContextMenu>
          <ContextMenuTrigger>
            <div className="flex items-center justify-between gap-4 rounded-md border border-border p-4">
              <span>Permit BP-1024 — Rivera Construction</span>
              <DropdownMenu>
                <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Edit</ContextMenuItem>
            <ContextMenuItem>Duplicate</ContextMenuItem>
            <ContextMenuItem disabled>Archive</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </DemoSection>

      <DemoSection title="Checkbox item and a submenu">
        <ContextMenu>
          <ContextMenuTrigger>
            <div className="rounded-md border border-border p-4">
              <button type="button" className="underline underline-offset-2">
                Right-click this results table
              </button>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuGroup>
              <ContextMenuLabel>View</ContextMenuLabel>
              <ContextMenuCheckboxItem checked={dense} onCheckedChange={setDense}>
                Dense rows
              </ContextMenuCheckboxItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger>Export as</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem>CSV</ContextMenuItem>
                <ContextMenuItem>PDF</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
          </ContextMenuContent>
        </ContextMenu>
      </DemoSection>
    </DemoStack>
  )
}
