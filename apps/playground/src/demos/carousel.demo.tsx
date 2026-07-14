// SPDX-License-Identifier: MIT

import { Carousel, CarouselContent, CarouselControls, CarouselItem, CarouselNext, CarouselPrevious, CarouselStatus } from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Carousel'

const photos = [
  { caption: 'Riverfront park at dawn', tone: 'bg-info text-info-foreground' },
  { caption: 'Downtown farmers market', tone: 'bg-success text-success-foreground' },
  { caption: 'Community library reading room', tone: 'bg-warning text-warning-foreground' },
  { caption: 'City hall at dusk', tone: 'bg-primary text-primary-foreground' },
]

export default function Demo(): React.JSX.Element {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Carousel label="Featured city services" className="min-w-0">
        <CarouselContent viewportClassName="border border-border bg-background">
          {['Building permits', 'Trash and recycling', 'Public meetings'].map((service, index) => (
            <CarouselItem key={service}>
              <div className="grid min-h-40 content-between gap-3 bg-muted p-4">
                <span className="text-sm text-muted-foreground">Service {index + 1}</span>
                <h3 className="text-lg font-semibold">{service}</h3>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselControls><CarouselPrevious /><CarouselStatus /><CarouselNext /></CarouselControls>
      </Carousel>

      <Carousel label="Latest city updates" orientation="vertical" className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-x-2">
        <CarouselContent viewportClassName="h-64 border border-border bg-background">
          {['Oak Street construction', 'Pool schedule changes', 'Election reminders'].map((update) => (
            <CarouselItem key={update}><div className="grid h-full content-center bg-muted p-4 text-lg font-semibold">{update}</div></CarouselItem>
          ))}
        </CarouselContent>
        <CarouselControls style={{ marginBlockStart: 0 }} className="col-start-2 row-start-1 flex-col py-1"><CarouselPrevious /><CarouselNext /></CarouselControls>
        <CarouselStatus
          className="col-start-1 justify-self-center"
          style={{ marginBlockStart: '0.75rem' }}
        />
      </Carousel>

      <Carousel label="City photo gallery" className="min-w-0 lg:col-span-2">
        <CarouselContent viewportClassName="border border-border">
          {photos.map((photo, index) => (
            <CarouselItem key={photo.caption} aria-label={`Photo ${index + 1}: ${photo.caption}`}>
              <div className={`flex aspect-video items-end p-4 ${photo.tone}`}>
                <p className="text-sm font-medium">{photo.caption}</p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselControls><CarouselPrevious /><CarouselStatus /><CarouselNext /></CarouselControls>
      </Carousel>
    </div>
  )
}
