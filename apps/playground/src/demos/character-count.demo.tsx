// SPDX-License-Identifier: MIT

import { CharacterCount, Field, Textarea } from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Character count'

export default function Demo(): React.JSX.Element {
  const [value, setValue] = React.useState('The council will meet on Tuesday.')

  return (
    <div className="flex max-w-prose flex-col gap-6">
      <Field
        label="Public comment"
        hint="A soft limit — you can keep typing; we validate on submit."
      >
        <CharacterCount maxLength={40} value={value} onValueChange={setValue}>
          <Textarea value={value} onChange={(event) => setValue(event.target.value)} />
        </CharacterCount>
      </Field>
    </div>
  )
}
