// SPDX-License-Identifier: MIT

import { Separator } from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Separator'

export default function Demo(): React.JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '20rem' }}>
      <div>
        <p>Public records</p>
        <Separator />
        <p>Submit a request</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', height: '1.5rem' }}>
        <a href="/about">About</a>
        <Separator orientation="vertical" decorative />
        <a href="/contact">Contact</a>
        <Separator orientation="vertical" decorative />
        <a href="/help">Help</a>
      </div>
    </div>
  )
}
