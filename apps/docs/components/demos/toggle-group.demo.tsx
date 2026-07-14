// SPDX-License-Identifier: MIT

'use client'

import { Toggle, ToggleGroup } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function ToggleGroupDemo(): React.JSX.Element {
  const [alignment, setAlignment] = React.useState<string[]>(['left'])

  return (
    <DemoStack>
      <DemoSection title="Single selection (segmented)">
        <ToggleGroup aria-label="Text alignment" defaultValue={['left']}>
          <Toggle value="left">Left</Toggle>
          <Toggle value="center">Center</Toggle>
          <Toggle value="right">Right</Toggle>
        </ToggleGroup>
      </DemoSection>

      <DemoSection title="Multiple selection (formatting)">
        <ToggleGroup aria-label="Text formatting" multiple defaultValue={['bold']}>
          <Toggle value="bold">Bold</Toggle>
          <Toggle value="italic">Italic</Toggle>
          <Toggle value="underline">Underline</Toggle>
        </ToggleGroup>
      </DemoSection>

      <DemoSection title="Controlled">
        <div className="flex flex-col gap-2">
          <ToggleGroup aria-label="Text alignment" value={alignment} onValueChange={setAlignment}>
            <Toggle value="left">Left</Toggle>
            <Toggle value="center">Center</Toggle>
            <Toggle value="right">Right</Toggle>
          </ToggleGroup>
          <p className="text-sm text-muted-foreground">
            Alignment: {alignment.length > 0 ? alignment.join(', ') : 'none'}.
          </p>
        </div>
      </DemoSection>

      <DemoSection title="Vertical">
        <ToggleGroup aria-label="Map layers" multiple orientation="vertical" defaultValue={['roads']}>
          <Toggle value="roads">Roads</Toggle>
          <Toggle value="transit">Transit</Toggle>
          <Toggle value="parks">Parks</Toggle>
        </ToggleGroup>
      </DemoSection>
    </DemoStack>
  )
}
