// SPDX-License-Identifier: MIT

import { ThemeImage } from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Theme Image'

// The same mark drawn three ways: color for light, white for dark, black for
// high contrast. Inline data URIs so the demo is self-contained.
const seal = (color: string): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="21" fill="none" stroke="${color}" stroke-width="3"/><path d="M12 31 21 18l6 8 4-5 5 10z" fill="${color}"/><circle cx="31" cy="15" r="3" fill="${color}"/></svg>`
  )}`

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <ThemeImage
        light={seal('#2e609f')}
        dark={seal('#f9fafa')}
        highContrast={seal('#000000')}
        alt=""
        className="size-6"
      />
      <p className="text-sm text-muted-foreground">
        Switch the theme to swap the mark — color on light, white on dark,
        black in high contrast.
      </p>
    </div>
  )
}
