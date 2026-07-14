// SPDX-License-Identifier: MIT

import { Kbd, KbdGroup } from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Kbd'

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Kbd>K</Kbd>
        <Kbd token="esc" />
        <Kbd token="enter" />
        <Kbd size="sm">F5</Kbd>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground">Open quick switcher</span>
        <KbdGroup keys={['mod', 'K']} />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground">Mac Command, always literal</span>
        <Kbd token="cmd" />
      </div>
    </div>
  )
}
