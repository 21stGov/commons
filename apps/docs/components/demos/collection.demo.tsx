// SPDX-License-Identifier: MIT

'use client'

import {
  Collection,
  CollectionCalendarDate,
  CollectionContent,
  CollectionDescription,
  CollectionItem,
  CollectionMedia,
  CollectionMeta,
  CollectionMetaItem,
  CollectionTitle,
} from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function CollectionDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Upcoming civic meetings">
        <Collection className="max-w-3xl">
          <CollectionItem>
            <CollectionMedia>
              <CollectionCalendarDate date={new Date('2026-08-04T18:00:00-04:00')} />
            </CollectionMedia>
            <CollectionContent>
              <CollectionTitle href="#budget-session" headingLevel="h4">City budget listening session</CollectionTitle>
              <CollectionDescription>Share priorities for the coming fiscal year. Interpretation is available by request.</CollectionDescription>
              <CollectionMeta>
                <CollectionMetaItem>6:00 PM</CollectionMetaItem>
                <CollectionMetaItem>Central Library</CollectionMetaItem>
              </CollectionMeta>
            </CollectionContent>
          </CollectionItem>
          <CollectionItem>
            <CollectionMedia>
              <CollectionCalendarDate date={new Date('2026-08-12T17:30:00-04:00')} />
            </CollectionMedia>
            <CollectionContent>
              <CollectionTitle href="#parks-board" headingLevel="h4">Parks advisory board</CollectionTitle>
              <CollectionDescription>Review playground improvements and the fall recreation schedule.</CollectionDescription>
              <CollectionMeta>
                <CollectionMetaItem>5:30 PM</CollectionMetaItem>
                <CollectionMetaItem>Community Center</CollectionMetaItem>
              </CollectionMeta>
            </CollectionContent>
          </CollectionItem>
        </Collection>
      </DemoSection>

      <DemoSection title="Condensed service updates">
        <Collection condensed className="max-w-3xl">
          <CollectionItem><CollectionContent><CollectionTitle href="#oak-street" headingLevel="h4">Oak Street water-main work</CollectionTitle><CollectionMeta><CollectionMetaItem>Updated today</CollectionMetaItem><CollectionMetaItem>Public Works</CollectionMetaItem></CollectionMeta></CollectionContent></CollectionItem>
          <CollectionItem><CollectionContent><CollectionTitle href="#pickup" headingLevel="h4">Holiday pickup schedule</CollectionTitle><CollectionMeta><CollectionMetaItem>Service notice</CollectionMetaItem></CollectionMeta></CollectionContent></CollectionItem>
        </Collection>
      </DemoSection>
    </DemoStack>
  )
}
