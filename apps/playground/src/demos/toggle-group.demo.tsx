// SPDX-License-Identifier: MIT

import * as React from 'react'

import { Toggle, ToggleGroup } from '@21stgov/commons-react'

export const title = 'Toggle group'

function ControlledExample(): React.JSX.Element {
  const [alignment, setAlignment] = React.useState<string[]>(['left'])
  return (
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
  )
}

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="toggle-group-single-heading">
        <h3 id="toggle-group-single-heading" className="text-sm font-semibold">
          Single selection (segmented)
        </h3>
        <ToggleGroup aria-label="Text alignment" defaultValue={['left']}>
          <Toggle value="left">Left</Toggle>
          <Toggle value="center">Center</Toggle>
          <Toggle value="right">Right</Toggle>
        </ToggleGroup>
      </section>

      <section aria-labelledby="toggle-group-multiple-heading">
        <h3 id="toggle-group-multiple-heading" className="text-sm font-semibold">
          Multiple selection (formatting)
        </h3>
        <ToggleGroup aria-label="Text formatting" multiple defaultValue={['bold']}>
          <Toggle value="bold">Bold</Toggle>
          <Toggle value="italic">Italic</Toggle>
          <Toggle value="underline">Underline</Toggle>
        </ToggleGroup>
      </section>

      <section aria-labelledby="toggle-group-controlled-heading">
        <h3 id="toggle-group-controlled-heading" className="text-sm font-semibold">
          Controlled
        </h3>
        <ControlledExample />
      </section>

      <section aria-labelledby="toggle-group-vertical-heading">
        <h3 id="toggle-group-vertical-heading" className="text-sm font-semibold">
          Vertical
        </h3>
        <ToggleGroup
          aria-label="Map layers"
          multiple
          orientation="vertical"
          defaultValue={['roads']}
        >
          <Toggle value="roads">Roads</Toggle>
          <Toggle value="transit">Transit</Toggle>
          <Toggle value="parks">Parks</Toggle>
        </ToggleGroup>
      </section>

      <section aria-labelledby="toggle-group-rtl-heading">
        <h3 id="toggle-group-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl">
          <ToggleGroup aria-label="محاذاة النص" defaultValue={['right']}>
            <Toggle value="right">يمين</Toggle>
            <Toggle value="center">وسط</Toggle>
            <Toggle value="left">يسار</Toggle>
          </ToggleGroup>
        </div>
      </section>
    </div>
  )
}
