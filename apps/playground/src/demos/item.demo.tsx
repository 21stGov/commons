// SPDX-License-Identifier: MIT

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
  Switch,
} from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Item'

function Avatar({ initials }: { initials: string }): React.JSX.Element {
  return (
    <span
      aria-hidden="true"
      className="flex size-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
    >
      {initials}
    </span>
  )
}

export default function Demo(): React.JSX.Element {
  const [alerts, setAlerts] = React.useState(true)

  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="item-settings-heading">
        <h3 id="item-settings-heading" className="text-sm font-semibold">
          Settings row with a trailing Switch
        </h3>
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>Service outage alerts</ItemTitle>
            <ItemDescription>Get notified about water and power interruptions.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Switch label="Service outage alerts" checked={alerts} onCheckedChange={setAlerts} />
          </ItemActions>
        </Item>
      </section>

      <section aria-labelledby="item-media-heading">
        <h3 id="item-media-heading" className="text-sm font-semibold">
          Media row with an avatar and actions
        </h3>
        <Item variant="outline">
          <ItemMedia>
            <Avatar initials="JR" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Jordan Rivera</ItemTitle>
            <ItemDescription>Public Works Department</ItemDescription>
          </ItemContent>
          <ItemActions>
            <button
              type="button"
              className="min-h-11 rounded-md border border-border px-2 text-sm font-medium"
            >
              Message
            </button>
          </ItemActions>
        </Item>
      </section>

      <section aria-labelledby="item-group-heading">
        <h3 id="item-group-heading" className="text-sm font-semibold">
          Grouped list with dividers
        </h3>
        <ItemGroup variant="divided" role="list" aria-label="City services">
          <Item role="listitem">
            <ItemContent>
              <ItemTitle>
                <a href="#permits">Apply for a permit</a>
              </ItemTitle>
              <ItemDescription>Building, electrical, and plumbing permits.</ItemDescription>
            </ItemContent>
          </Item>
          <Item role="listitem">
            <ItemContent>
              <ItemTitle>
                <a href="#taxes">Pay property taxes</a>
              </ItemTitle>
              <ItemDescription>View your balance and pay online.</ItemDescription>
            </ItemContent>
          </Item>
        </ItemGroup>
      </section>

      <section aria-labelledby="item-rtl-heading">
        <h3 id="item-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl">
          <Item variant="outline">
            <ItemMedia>
              <Avatar initials="خ" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>خدمات المدينة</ItemTitle>
              <ItemDescription>تقديم طلب للحصول على تصريح.</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Switch label="تنبيهات" defaultChecked />
            </ItemActions>
          </Item>
        </div>
      </section>
    </div>
  )
}
