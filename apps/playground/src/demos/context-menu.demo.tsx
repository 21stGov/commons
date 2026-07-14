// SPDX-License-Identifier: MIT

import {
  Button,
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
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

export const title = 'Context Menu'

export default function Demo(): React.JSX.Element {
  const [dense, setDense] = React.useState(false)
  const [sort, setSort] = React.useState('name')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '32rem' }}>
      {/* A context menu ONLY ever duplicates actions already reachable another
          way. Here the same actions live in a visible Dropdown Menu, and the
          right-click menu is a power-user accelerator over the same row. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                padding: '1rem',
                border: '1px solid var(--cui-color-border, #ccc)',
                borderRadius: '0.375rem',
              }}
            >
              <span>Permit BP-1024 — Rivera Construction</span>
              {/* The visible, always-available path to the same actions. */}
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
      </div>

      {/* Checkbox, radio group, and a submenu. */}
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            style={{
              padding: '1rem',
              border: '1px solid var(--cui-color-border, #ccc)',
              borderRadius: '0.375rem',
            }}
          >
            <Button variant="secondary">Right-click this results table</Button>
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
          <ContextMenuRadioGroup value={sort} onValueChange={setSort}>
            <ContextMenuLabel>Sort by</ContextMenuLabel>
            <ContextMenuRadioItem value="name">Name</ContextMenuRadioItem>
            <ContextMenuRadioItem value="date">Date</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
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
    </div>
  )
}
