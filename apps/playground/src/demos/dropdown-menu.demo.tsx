// SPDX-License-Identifier: MIT

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Dropdown Menu'

function DotsIcon(): React.JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="8" cy="3" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="8" cy="13" r="1.5" />
    </svg>
  )
}

function PencilIcon(): React.JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11 3.5 12.5 5 5.5 12H4v-1.5L11 3.5Z" strokeLinejoin="round" />
    </svg>
  )
}

function CopyIcon(): React.JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5.5" y="5.5" width="7" height="7" rx="1" />
      <path d="M3.5 10.5V4a.5.5 0 0 1 .5-.5h6" strokeLinecap="round" />
    </svg>
  )
}

function TrashIcon(): React.JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3.5 4.5h9M6.5 4.5V3.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1M5 4.5l.5 8h5l.5-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Demo(): React.JSX.Element {
  const [columns, setColumns] = React.useState({ status: true, owner: false, updated: true })
  const [density, setDensity] = React.useState('comfortable')

  return (
    <div className="flex max-w-md flex-col gap-5">
      <section aria-labelledby="dm-actions-heading">
        <h3 id="dm-actions-heading" className="mb-2 text-sm font-semibold">
          Row actions (with a destructive item)
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger>Record actions</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem icon={<PencilIcon />}>Edit</DropdownMenuItem>
            <DropdownMenuItem icon={<CopyIcon />}>Duplicate</DropdownMenuItem>
            <DropdownMenuItem disabled>Archive</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" icon={<TrashIcon />}>
              Delete record
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>

      <section aria-labelledby="dm-icon-heading">
        <h3 id="dm-icon-heading" className="mb-2 text-sm font-semibold">
          Icon-only trigger (More)
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger variant="ghost" aria-label="More actions">
            <DotsIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem>Move to…</DropdownMenuItem>
            <DropdownMenuItem>Export</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>

      <section aria-labelledby="dm-checkbox-heading">
        <h3 id="dm-checkbox-heading" className="mb-2 text-sm font-semibold">
          Checkbox items + a radio group
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger>View options</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Columns</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={columns.status}
                onCheckedChange={(v) => setColumns((c) => ({ ...c, status: v }))}
              >
                Status
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columns.owner}
                onCheckedChange={(v) => setColumns((c) => ({ ...c, owner: v }))}
              >
                Owner
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columns.updated}
                onCheckedChange={(v) => setColumns((c) => ({ ...c, updated: v }))}
              >
                Last updated
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={density} onValueChange={setDensity}>
              <DropdownMenuLabel>Density</DropdownMenuLabel>
              <DropdownMenuRadioItem value="comfortable">Comfortable</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>

      <section aria-labelledby="dm-submenu-heading">
        <h3 id="dm-submenu-heading" className="mb-2 text-sm font-semibold">
          Submenu
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger>Share</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem icon={<CopyIcon />}>Copy link</DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Send to</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Email</DropdownMenuItem>
                <DropdownMenuItem>Text message</DropdownMenuItem>
                <DropdownMenuItem>Internal message</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Manage access</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>

      <section aria-labelledby="dm-rtl-heading">
        <h3 id="dm-rtl-heading" className="mb-2 text-sm font-semibold">
          RTL (labels read right-to-left; the submenu chevron mirrors)
        </h3>
        <div dir="rtl" lang="ar">
          <DropdownMenu>
            <DropdownMenuTrigger>إجراءات</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>تحرير</DropdownMenuItem>
              <DropdownMenuItem>تكرار</DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>مشاركة</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>بريد إلكتروني</DropdownMenuItem>
                  <DropdownMenuItem>رسالة نصية</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">حذف</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>
    </div>
  )
}
