// SPDX-License-Identifier: MIT

import * as React from 'react'

import { FieldGroup, Switch } from '@21stgov/commons-react'

export const title = 'Switch'

function ControlledExample(): React.JSX.Element {
  const [on, setOn] = React.useState(true)
  return (
    <div className="flex flex-col gap-2">
      <Switch
        label="Dark mode"
        description="Applies immediately across the app."
        checked={on}
        onCheckedChange={setOn}
      />
      <p className="text-sm text-muted-foreground">
        Dark mode is {on ? 'on' : 'off'}.
      </p>
    </div>
  )
}

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="switch-states-heading">
        <h3 id="switch-states-heading" className="text-sm font-semibold">
          States
        </h3>
        <div className="flex flex-col">
          <Switch label="Email notifications" defaultChecked />
          <Switch
            label="Text message alerts"
            description="Standard message rates may apply."
          />
          <Switch label="Disabled setting" disabled />
          <Switch label="Disabled and on" disabled defaultChecked />
        </div>
      </section>

      <section aria-labelledby="switch-controlled-heading">
        <h3 id="switch-controlled-heading" className="text-sm font-semibold">
          Controlled
        </h3>
        <ControlledExample />
      </section>

      <section aria-labelledby="switch-field-heading">
        <h3 id="switch-field-heading" className="text-sm font-semibold">
          In a FieldGroup
        </h3>
        <FieldGroup label="Notification settings" hint="These take effect right away.">
          <Switch label="Service outages" defaultChecked />
          <Switch label="Meeting reminders" />
          <Switch label="Newsletter" />
        </FieldGroup>
      </section>

      <section aria-labelledby="switch-rtl-heading">
        <h3 id="switch-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl" className="flex flex-col">
          <Switch
            label="إشعارات البريد الإلكتروني"
            description="ملخص يومي في الثامنة صباحًا."
            defaultChecked
          />
        </div>
      </section>
    </div>
  )
}
