// SPDX-License-Identifier: MIT

import * as React from 'react'

import { Button, ButtonGroup } from '@21stgov/commons-react'

export const title = 'Button group'

function ChevronIcon(): React.JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="button-group-horizontal-heading">
        <h3 id="button-group-horizontal-heading" className="text-sm font-semibold">
          Segmented (horizontal)
        </h3>
        <ButtonGroup aria-label="Text formatting">
          <Button variant="outline">Bold</Button>
          <Button variant="outline">Italic</Button>
          <Button variant="outline">Underline</Button>
        </ButtonGroup>
      </section>

      <section aria-labelledby="button-group-vertical-heading">
        <h3 id="button-group-vertical-heading" className="text-sm font-semibold">
          Vertical
        </h3>
        <ButtonGroup aria-label="View options" orientation="vertical">
          <Button variant="outline">List view</Button>
          <Button variant="outline">Grid view</Button>
          <Button variant="outline">Map view</Button>
        </ButtonGroup>
      </section>

      <section aria-labelledby="button-group-split-heading">
        <h3 id="button-group-split-heading" className="text-sm font-semibold">
          Split button
        </h3>
        <ButtonGroup aria-label="Save options">
          <Button variant="primary">Save</Button>
          <Button variant="primary" aria-label="More save options">
            <ChevronIcon />
          </Button>
        </ButtonGroup>
      </section>

      <section aria-labelledby="button-group-rtl-heading">
        <h3 id="button-group-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl" lang="ar">
          <ButtonGroup aria-label="تنسيق النص">
            <Button variant="outline">غامق</Button>
            <Button variant="outline">مائل</Button>
          </ButtonGroup>
        </div>
      </section>
    </div>
  )
}
