// SPDX-License-Identifier: MIT

import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

import { ThemeSelect } from '@/components/theme-select'

/** Shared navbar/layout options for the home and docs layouts. */
export function baseOptions(): BaseLayoutProps {
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
      // not just via OS preference.
      component: <ThemeSelect />,
    },
  }
}
