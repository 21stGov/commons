// SPDX-License-Identifier: MIT

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Hover Card'

export default function Demo(): React.JSX.Element {
  return (
    <div style={{ maxWidth: '32rem', lineHeight: 1.7 }}>
      <p>
        The application was reviewed by the{' '}
        <HoverCard>
          <HoverCardTrigger href="/agencies/parks">Parks Department</HoverCardTrigger>
          <HoverCardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <strong>Parks Department</strong>
              <span>
                Maintains the city's parks, trails, and recreation centers, and reviews permits
                for public-space events.
              </span>
              <span style={{ opacity: 0.7 }}>parks@city.gov · (555) 010-2200</span>
            </div>
          </HoverCardContent>
        </HoverCard>{' '}
        before it was forwarded for final approval. The preview appears on hover and on keyboard
        focus; the link works on its own for touch users.
      </p>
    </div>
  )
}
