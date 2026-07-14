// SPDX-License-Identifier: MIT

'use client'

import {
  Badge,
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselControls,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselStatus,
} from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

const services = [
  { title: 'Building permits', detail: 'Apply, upload plans, and track inspections.', badge: 'Online' },
  { title: 'Trash and recycling', detail: 'Find schedules and report a missed pickup.', badge: 'Popular' },
  { title: 'Public meetings', detail: 'Read agendas and request accommodations.', badge: 'Updated' },
]

const events = [
  'Summer concert at River Park',
  'Neighborhood cleanup day',
  'Small-business office hours',
  'Planning commission hearing',
  'Community budget workshop',
]

const photos = [
  { caption: 'Riverfront park at dawn', tone: 'bg-info text-info-foreground' },
  { caption: 'Downtown farmers market', tone: 'bg-success text-success-foreground' },
  { caption: 'Community library reading room', tone: 'bg-warning text-warning-foreground' },
  { caption: 'City hall at dusk', tone: 'bg-primary text-primary-foreground' },
]

function ServiceSlides(): React.JSX.Element {
  return (
    <CarouselContent viewportClassName="border border-border bg-background shadow-1">
      {services.map((service, index) => (
        <CarouselItem key={service.title}>
          <article className="grid min-h-44 items-center gap-6 bg-muted p-6 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="space-y-3">
              <Badge variant="info" size="sm">{service.badge}</Badge>
              <div className="space-y-1">
                <h4 className="text-xl font-semibold">{service.title}</h4>
                <p className="max-w-prose text-muted-foreground">{service.detail}</p>
              </div>
            </div>
            <span
              aria-hidden="true"
              className="justify-self-end text-6xl font-semibold leading-none tabular-nums text-muted-foreground sm:text-7xl"
            >
              {String(index + 1).padStart(2, '0')}
            </span>
          </article>
        </CarouselItem>
      ))}
    </CarouselContent>
  )
}

function ApiEventExample(): React.JSX.Element {
  const [api, setApi] = React.useState<CarouselApi>()
  const [eventsSeen, setEventsSeen] = React.useState(0)

  React.useEffect(() => {
    if (!api) return undefined
    const onSelect = () => setEventsSeen((count) => count + 1)
    api.on('select', onSelect)
    return () => { api.off('select', onSelect) }
  }, [api])

  return (
    <div className="max-w-3xl space-y-4">
      <Carousel label="Upcoming community events" setApi={setApi}>
        <CarouselContent viewportClassName="border border-border bg-background">
          {events.map((event, index) => (
            <CarouselItem key={event}>
              <article className="grid min-h-32 content-center gap-1 p-4">
                <p className="text-sm font-medium text-muted-foreground">Community event {index + 1}</p>
                <h4 className="text-lg font-semibold">{event}</h4>
              </article>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselControls>
          <CarouselPrevious />
          <CarouselStatus />
          <CarouselNext />
        </CarouselControls>
      </Carousel>
      <p className="text-sm text-muted-foreground">
        Selection events received through the API: <strong className="text-foreground">{eventsSeen}</strong>
      </p>
    </div>
  )
}

export default function CarouselDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Service highlights with visible position">
        <Carousel label="Featured city services" className="max-w-3xl">
          <ServiceSlides />
          <CarouselControls>
            <CarouselPrevious />
            <CarouselStatus />
            <CarouselNext />
          </CarouselControls>
        </Carousel>
      </DemoSection>

      <DemoSection title="Selection events and API access">
        <ApiEventExample />
      </DemoSection>

      <DemoSection title="Vertical orientation">
        <Carousel
          label="Latest city updates"
          orientation="vertical"
          className="grid max-w-xl grid-cols-[minmax(0,1fr)_auto] gap-x-2"
        >
          <CarouselContent viewportClassName="h-64 border border-border bg-background">
            {['Oak Street construction', 'Pool schedule changes', 'Election day reminders'].map((update) => (
              <CarouselItem key={update}>
                <article className="grid h-full content-center gap-1 bg-muted p-4">
                  <p className="text-sm font-medium text-muted-foreground">City update</p>
                  <h4 className="text-lg font-semibold">{update}</h4>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselControls style={{ marginBlockStart: 0 }} className="col-start-2 row-start-1 flex-col py-1">
            <CarouselPrevious />
            <CarouselNext />
          </CarouselControls>
          <CarouselStatus className="col-start-1 mt-3 justify-self-center" />
        </Carousel>
      </DemoSection>

      <DemoSection title="Media slides">
        <Carousel label="City photo gallery" className="max-w-3xl">
          <CarouselContent viewportClassName="border border-border">
            {photos.map((photo, index) => (
              <CarouselItem key={photo.caption} aria-label={`Photo ${index + 1}: ${photo.caption}`}>
                <div className={`flex aspect-video items-end p-4 ${photo.tone}`}>
                  <p className="text-sm font-medium">{photo.caption}</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselControls>
            <CarouselPrevious />
            <CarouselStatus />
            <CarouselNext />
          </CarouselControls>
        </Carousel>
      </DemoSection>
    </DemoStack>
  )
}
