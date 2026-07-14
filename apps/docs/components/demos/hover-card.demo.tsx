// SPDX-License-Identifier: MIT

'use client'

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function HoverCardDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Preview a link's destination">
        <p className="max-w-prose leading-7">
          Reviewed by the{' '}
          <HoverCard>
            <HoverCardTrigger href="/agencies/parks">Parks Department</HoverCardTrigger>
            <HoverCardContent>
              <div className="flex flex-col gap-1">
                <strong>Parks Department</strong>
                <span>
                  Maintains the city's parks, trails, and recreation centers, and reviews
                  permits for public-space events.
                </span>
                <span className="text-muted-foreground">parks@city.gov · (555) 010-2200</span>
              </div>
            </HoverCardContent>
          </HoverCard>{' '}
          before final approval. The preview opens on hover and on keyboard focus; the link works
          on its own for touch users.
        </p>
      </DemoSection>
    </DemoStack>
  )
}
