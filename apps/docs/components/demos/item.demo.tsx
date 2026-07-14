// SPDX-License-Identifier: MIT

'use client'

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

import { DemoSection, DemoStack } from './demo-section'

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

export default function ItemDemo(): React.JSX.Element {
  const [alerts, setAlerts] = React.useState(true)

  return (
    <DemoStack>
      <DemoSection title="Settings row with a trailing Switch">
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>Service outage alerts</ItemTitle>
            <ItemDescription>Get notified about water and power interruptions.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Switch label="Service outage alerts" checked={alerts} onCheckedChange={setAlerts} />
          </ItemActions>
        </Item>
      </DemoSection>

      <DemoSection title="Media row with an avatar and actions">
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
      </DemoSection>

      <DemoSection title="Grouped list with dividers">
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
          <Item role="listitem">
            <ItemContent>
              <ItemTitle>
                <a href="#trash">Report a missed pickup</a>
              </ItemTitle>
              <ItemDescription>Trash, recycling, and yard waste.</ItemDescription>
            </ItemContent>
          </Item>
        </ItemGroup>
      </DemoSection>
    </DemoStack>
  )
}
