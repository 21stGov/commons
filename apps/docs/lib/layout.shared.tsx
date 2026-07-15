// SPDX-License-Identifier: MIT

import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

import { DocsPreferences } from '@/components/docs-preferences'
import { ThemeSelect } from '@/components/theme-select'

/**
 * Shared navbar/layout options for the home and docs layouts.
 *
 * `preferences` adds the global React ⇄ HTML framework selector above the theme
 * selector (via the `themeSwitch` slot, so it appears in the sidebar footer on
 * desktop and the nav on mobile). Only the docs have framework-specific
 * content, so the marketing home opts out and keeps the plain theme switcher.
 */
export function baseOptions({ preferences = false }: { preferences?: boolean } = {}): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="text-md font-bold" aria-label="Commons home">
          Commons
        </span>
      ),
    },
    links: [
      {
        text: 'Docs',
        url: '/docs',
        active: 'nested-url',
      },
      {
        text: 'Components',
        url: '/docs/components',
        active: 'nested-url',
      },
      {
        text: 'GitHub',
        url: 'https://github.com/21stgov/commons',
        external: true,
      },
    ],
    themeSwitch: {
      // Custom switcher so the high-contrast theme is reachable from the UI,
      // not just via OS preference. In the docs it is paired with the framework
      // selector so both viewing preferences live together.
      component: preferences ? <DocsPreferences /> : <ThemeSelect />,
    },
  }
}
