// SPDX-License-Identifier: MIT

'use client'

import {
  Toggle,
  ToggleGroup,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function ToolbarDemo(): React.JSX.Element {
  const [rows, setRows] = React.useState(3)

  return (
    <DemoStack>
      <DemoSection title="Text formatting (toggle group + separator + buttons)">
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
      </DemoSection>

      <DemoSection title="Table action bar (grouped actions)">
        <Toolbar aria-label="Row actions" className="w-full">
          <ToolbarGroup aria-label="Edit">
            <ToolbarButton variant="secondary">Edit</ToolbarButton>
            <ToolbarButton variant="secondary">Duplicate</ToolbarButton>
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarButton
            variant="ghost"
            onClick={() => setRows((n) => n + 1)}
          >
            Add row
          </ToolbarButton>
          <ToolbarButton variant="danger">Delete</ToolbarButton>
        </Toolbar>
        <p className="text-sm text-muted-foreground">{rows} rows.</p>
      </DemoSection>

      <DemoSection title="Vertical">
        <Toolbar aria-label="Map layers" orientation="vertical">
          <ToolbarButton variant="outline">Roads</ToolbarButton>
          <ToolbarButton variant="outline">Transit</ToolbarButton>
          <ToolbarSeparator orientation="horizontal" />
          <ToolbarButton variant="outline">Parks</ToolbarButton>
        </Toolbar>
      </DemoSection>

      <DemoSection title="RTL">
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
      </DemoSection>
    </DemoStack>
  )
}
