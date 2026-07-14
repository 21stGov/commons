// SPDX-License-Identifier: MIT

import { Collection, CollectionCalendarDate, CollectionContent, CollectionDescription, CollectionItem, CollectionMedia, CollectionMeta, CollectionMetaItem, CollectionTitle } from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Collection'

export default function Demo(): React.JSX.Element {
  return (
    <Collection className="max-w-3xl">
      <CollectionItem>
        <CollectionMedia><CollectionCalendarDate date={new Date('2026-08-04T18:00:00-04:00')} /></CollectionMedia>
        <CollectionContent>
          <CollectionTitle href="#budget">City budget listening session</CollectionTitle>
          <CollectionDescription>Share priorities for the coming fiscal year.</CollectionDescription>
          <CollectionMeta><CollectionMetaItem>6:00 PM</CollectionMetaItem><CollectionMetaItem>Central Library</CollectionMetaItem></CollectionMeta>
        </CollectionContent>
      </CollectionItem>
      <CollectionItem>
        <CollectionContent>
          <CollectionTitle href="#water">Oak Street water-main work</CollectionTitle>
          <CollectionDescription>Crews will maintain local access throughout construction.</CollectionDescription>
        </CollectionContent>
      </CollectionItem>
    </Collection>
  )
}
