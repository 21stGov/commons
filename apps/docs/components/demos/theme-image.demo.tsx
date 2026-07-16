// SPDX-License-Identifier: MIT

'use client'

import { ThemeImage } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

// The same mark drawn three ways: color for light, white for dark, black for
// high contrast. Inline data URIs so the demo is self-contained.
const seal = (color: string): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="21" fill="none" stroke="${color}" stroke-width="3"/><path d="M12 31 21 18l6 8 4-5 5 10z" fill="${color}"/><circle cx="31" cy="15" r="3" fill="${color}"/></svg>`
  )}`

const LIGHT = seal('#2e609f')
const DARK = seal('#f9fafa')
const HIGH_CONTRAST = seal('#000000')

export default function ThemeImageDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="One mark, three renderings — switch the theme up top to swap it">
        <div className="flex items-center gap-2">
          <ThemeImage
            light={LIGHT}
            dark={DARK}
            highContrast={HIGH_CONTRAST}
            alt=""
            className="size-6"
          />
          <p className="text-sm text-muted-foreground">
            The seal renders color on light, white on dark, and black in high
            contrast — only the active variant is in the accessibility tree.
          </p>
        </div>
      </DemoSection>

      <DemoSection title="A single source works everywhere (dark and high contrast reuse it)">
        <ThemeImage light={LIGHT} alt="" className="size-6" />
      </DemoSection>
    </DemoStack>
  )
}
