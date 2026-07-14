// SPDX-License-Identifier: MIT

'use client'

import { Tab, Tabs } from 'fumadocs-ui/components/tabs'
import * as React from 'react'

import { CopyCommandButton } from '@/components/copy-command-button'

const commands = {
  npm: 'npx @21stgov/commons init',
  pnpm: 'pnpm dlx @21stgov/commons init',
  yarn: 'yarn dlx @21stgov/commons init',
  bun: 'bunx @21stgov/commons init',
} as const

/** The `init` command with package-manager variants (homepage hero). */
export function InstallCommand(): React.JSX.Element {
  return (
    <Tabs
      groupId="package-manager"
      persist
      items={Object.keys(commands)}
      className="docs-install-command"
      label="Package manager"
    >
      {(Object.entries(commands) as [string, string][]).map(([pm, command]) => (
        <Tab key={pm} value={pm}>
          <div className="docs-install-command-panel">
            <pre tabIndex={0}>
              <code>{command}</code>
            </pre>
            <CopyCommandButton value={command} />
          </div>
        </Tab>
      ))}
    </Tabs>
  )
}
