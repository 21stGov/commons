// SPDX-License-Identifier: MIT

'use client'

import { CharacterCount, Field, Textarea } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

export default function CharacterCountDemo(): React.JSX.Element {
  const [comment, setComment] = React.useState('The council will meet on Tuesday.')

  return (
    <DemoStack>
      <DemoSection title="Soft limit on a Textarea (type past 40 to see the over-limit state)">
        <div className="max-w-md">
          <Field
            label="Public comment"
            hint="A soft limit — you can keep typing; we validate on submit."
          >
            <CharacterCount maxLength={40} value={comment} onValueChange={setComment}>
              <Textarea value={comment} onChange={(event) => setComment(event.target.value)} />
            </CharacterCount>
          </Field>
        </div>
      </DemoSection>

      <DemoSection title="Custom message templates">
        <div className="max-w-md">
          <Field label="Headline">
            <CharacterCount
              maxLength={60}
              defaultValue="Neighborhood cleanup this weekend"
              messageTemplate="{remaining} of {max} characters remaining"
              overMessageTemplate="Remove {over} characters"
            >
              <Textarea rows={2} />
            </CharacterCount>
          </Field>
        </div>
      </DemoSection>
    </DemoStack>
  )
}
