// SPDX-License-Identifier: MIT

'use client'

import { Badge, RemovableTag, Tag } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function BadgeDemo(): React.JSX.Element {
  const [topics, setTopics] = React.useState(['Permits', 'Road closures', 'Public meetings'])

  return (
    <DemoStack>
      <DemoSection title="Status badges">
        <div className="flex flex-wrap gap-1">
          <Badge>Draft</Badge>
          <Badge variant="info">Under review</Badge>
          <Badge variant="success">Approved</Badge>
          <Badge variant="warning">Action needed</Badge>
          <Badge variant="error">Past due</Badge>
          <Badge variant="outline">Archived</Badge>
        </div>
      </DemoSection>

      <DemoSection title="Static categories">
        <div className="flex flex-wrap gap-1">
          <Tag>Public works</Tag>
          <Tag>Parks</Tag>
          <Tag size="big">New service</Tag>
        </div>
      </DemoSection>

      <DemoSection title="Applied filters with explicit remove buttons">
        <div className="flex flex-wrap gap-1">
          {topics.map((topic) => (
            <RemovableTag
              key={topic}
              label={topic}
              onRemove={() => setTopics((current) => current.filter((item) => item !== topic))}
            />
          ))}
        </div>
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {topics.length} {topics.length === 1 ? 'filter' : 'filters'} applied
        </p>
      </DemoSection>

      <DemoSection title="RTL and localized control name">
        <div dir="rtl" lang="ar">
          <RemovableTag label="تصاريح" removeLabel="إزالة تصاريح" />
        </div>
      </DemoSection>
    </DemoStack>
  )
}
