// SPDX-License-Identifier: MIT

'use client'

import { FieldGroup, Switch } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function SwitchDemo(): React.JSX.Element {
  const [on, setOn] = React.useState(true)

  return (
    <DemoStack>
      <DemoSection title="States">
        <div className="flex flex-col">
          <Switch label="Email notifications" defaultChecked />
          <Switch label="Text message alerts" description="Standard message rates may apply." />
          <Switch label="Disabled setting" disabled />
          <Switch label="Disabled and on" disabled defaultChecked />
        </div>
      </DemoSection>

      <DemoSection title="Controlled (applies immediately)">
        <div className="flex flex-col gap-2">
          <Switch label="Dark mode" checked={on} onCheckedChange={setOn} />
          <p className="text-sm text-muted-foreground">Dark mode is {on ? 'on' : 'off'}.</p>
        </div>
      </DemoSection>

      <DemoSection title="In a FieldGroup">
        <FieldGroup label="Notification settings" hint="These take effect right away.">
          <Switch label="Service outages" defaultChecked />
          <Switch label="Meeting reminders" />
          <Switch label="Newsletter" />
        </FieldGroup>
      </DemoSection>
    </DemoStack>
  )
}
