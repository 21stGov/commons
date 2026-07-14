// SPDX-License-Identifier: MIT

import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardGroup,
  CardHeader,
  CardItem,
  CardTitle,
} from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Card'

export default function Demo(): React.JSX.Element {
  return (
    <CardGroup columns="two" aria-label="Popular services">
      <CardItem>
        <Card>
          <CardHeader>
            <CardTitle headingLevel="h3">Building permits</CardTitle>
            <CardDescription>Applications, inspections, and status.</CardDescription>
            <CardAction><Badge variant="info" size="sm">Online</Badge></CardAction>
          </CardHeader>
          <CardContent>Start or continue a permit application.</CardContent>
          <CardFooter><Button variant="outline" size="sm">View permits</Button></CardFooter>
        </Card>
      </CardItem>
      <CardItem>
        <Card appearance="subtle">
          <CardHeader>
            <CardTitle headingLevel="h3">Trash and recycling</CardTitle>
            <CardDescription>Schedules and missed pickups.</CardDescription>
          </CardHeader>
          <CardContent>Find the collection schedule for your address.</CardContent>
          <CardFooter><Button variant="outline" size="sm">Check schedule</Button></CardFooter>
        </Card>
      </CardItem>
    </CardGroup>
  )
}
