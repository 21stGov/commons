// SPDX-License-Identifier: MIT

'use client'

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
  CardMedia,
  CardTitle,
} from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

function CivicMedia({ label }: { label: string }): React.JSX.Element {
  return (
    <div aria-label={label} role="img" className="flex min-h-32 size-full items-center justify-center bg-muted text-muted-foreground">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6">
        <path d="M3 9h18M5 9v9m4-9v9m6-9v9m4-9v9M3 18h18M12 3l9 4H3l9-4Z" />
      </svg>
    </div>
  )
}

export default function CardDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Related service cards in a semantic list">
        <CardGroup columns="two" aria-label="Popular services">
          <CardItem>
            <Card>
              <CardHeader>
                <CardTitle headingLevel="h4">Building permits</CardTitle>
                <CardDescription>Applications, inspections, and permit status.</CardDescription>
                <CardAction><Badge variant="info" size="sm">Online</Badge></CardAction>
              </CardHeader>
              <CardContent>Start a residential or commercial permit application.</CardContent>
              <CardFooter><Button variant="outline" size="sm">View permits</Button></CardFooter>
            </Card>
          </CardItem>
          <CardItem>
            <Card appearance="subtle">
              <CardHeader>
                <CardTitle headingLevel="h4">Trash and recycling</CardTitle>
                <CardDescription>Schedules, missed pickups, and bulky items.</CardDescription>
              </CardHeader>
              <CardContent>Find the collection schedule for your address.</CardContent>
              <CardFooter><Button variant="outline" size="sm">Check schedule</Button></CardFooter>
            </Card>
          </CardItem>
        </CardGroup>
      </DemoSection>

      <DemoSection title="Header-first media card">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle headingLevel="h4">Community center renovation</CardTitle>
            <CardDescription>Construction updates and reopening timeline.</CardDescription>
          </CardHeader>
          <CardMedia><CivicMedia label="Illustration of a civic building" /></CardMedia>
          <CardContent>The east entrance remains open during construction.</CardContent>
          <CardFooter><Button variant="outline" size="sm">Read the update</Button></CardFooter>
        </Card>
      </DemoSection>

      <DemoSection title="Responsive flag card with media at inline end">
        <Card orientation="horizontal" mediaPosition="end" className="max-w-3xl">
          <CardHeader>
            <CardTitle headingLevel="h4">Public meeting</CardTitle>
            <CardDescription>Tuesday at 6 p.m. · Council chamber</CardDescription>
          </CardHeader>
          <CardMedia><CivicMedia label="Illustration of City Hall" /></CardMedia>
          <CardContent>Review the agenda and request interpretation or accommodations.</CardContent>
          <CardFooter><Button variant="outline" size="sm">Meeting details</Button></CardFooter>
        </Card>
      </DemoSection>

      <DemoSection title="RTL flag layout">
        <div dir="rtl" lang="ar">
          <Card orientation="horizontal" mediaPosition="start" className="max-w-3xl">
            <CardHeader><CardTitle headingLevel="h4">خدمات المجتمع</CardTitle></CardHeader>
            <CardMedia><CivicMedia label="رسم توضيحي لمبنى مدني" /></CardMedia>
            <CardContent>معلومات حول الخدمات والبرامج المحلية.</CardContent>
            <CardFooter><Button variant="outline" size="sm">عرض الخدمات</Button></CardFooter>
          </Card>
        </div>
      </DemoSection>
    </DemoStack>
  )
}
