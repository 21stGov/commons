// SPDX-License-Identifier: MIT

import * as React from 'react'

import {
  Toggle,
  ToggleGroup,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from '@21stgov/commons-react'

export const title = 'Toolbar'

export default function Demo(): React.JSX.Element {
  const [rows, setRows] = React.useState(3)

  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="toolbar-formatting-heading">
        <h3 id="toolbar-formatting-heading" className="text-sm font-semibold">
          Text formatting (toggle group + separator + buttons)
        </h3>
        <Toolbar aria-label="Text formatting">
          <ToggleGroup aria-label="Text style" multiple defaultValue={['bold']}>
            <Toggle value="bold">Bold</Toggle>
            <Toggle value="italic">Italic</Toggle>
            <Toggle value="underline">Underline</Toggle>
          </ToggleGroup>
          <ToolbarSeparator />
          <ToggleGroup aria-label="Alignment" defaultValue={['left']}>
            <Toggle value="left">Left</Toggle>
            <Toggle value="center">Center</Toggle>
            <Toggle value="right">Right</Toggle>
          </ToggleGroup>
          <ToolbarSeparator />
          <ToolbarButton>Link</ToolbarButton>
          <ToolbarButton>Clear</ToolbarButton>
        </Toolbar>
      </section>

      <section aria-labelledby="toolbar-actions-heading">
        <h3 id="toolbar-actions-heading" className="text-sm font-semibold">
          Table action bar (grouped actions)
        </h3>
        <Toolbar aria-label="Row actions" className="w-full">
          <ToolbarGroup aria-label="Edit">
            <ToolbarButton variant="secondary">Edit</ToolbarButton>
            <ToolbarButton variant="secondary">Duplicate</ToolbarButton>
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarButton variant="ghost" onClick={() => setRows((n) => n + 1)}>
            Add row
          </ToolbarButton>
          <ToolbarButton variant="danger">Delete</ToolbarButton>
        </Toolbar>
        <p className="text-sm text-muted-foreground">{rows} rows.</p>
      </section>

      <section aria-labelledby="toolbar-vertical-heading">
        <h3 id="toolbar-vertical-heading" className="text-sm font-semibold">
          Vertical
        </h3>
        <Toolbar aria-label="Map layers" orientation="vertical">
          <ToolbarButton variant="outline">Roads</ToolbarButton>
          <ToolbarButton variant="outline">Transit</ToolbarButton>
          <ToolbarSeparator orientation="horizontal" />
          <ToolbarButton variant="outline">Parks</ToolbarButton>
        </Toolbar>
      </section>

      <section aria-labelledby="toolbar-rtl-heading">
        <h3 id="toolbar-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl">
          <Toolbar aria-label="تنسيق النص">
            <ToggleGroup aria-label="نمط النص" multiple defaultValue={['bold']}>
              <Toggle value="bold">غامق</Toggle>
              <Toggle value="italic">مائل</Toggle>
            </ToggleGroup>
            <ToolbarSeparator />
            <ToolbarButton>رابط</ToolbarButton>
          </Toolbar>
        </div>
      </section>
    </div>
  )
}
