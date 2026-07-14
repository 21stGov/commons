// SPDX-License-Identifier: MIT

'use client'

import {
  Button,
  CommandPalette,
  useCommandPaletteShortcut,
  type CommandGroup,
} from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

const GROUPS: CommandGroup[] = [
  {
    heading: 'Payments',
    items: [
      {
        value: 'pay-bill',
        label: 'Pay a bill',
        icon: 'mail',
        shortcut: ['mod', 'B'],
        keywords: ['invoice', 'utility', 'water', 'tax'],
      },
      {
        // No icon: labels still align via the reserved gutter.
        value: 'payment-plan',
        label: 'Set up a payment plan',
        keywords: ['installments', 'arrears'],
      },
    ],
  },
  {
    heading: 'Report',
    items: [
      {
        value: 'report-issue',
        label: 'Report an issue',
        icon: 'alert-triangle',
        shortcut: ['mod', 'R'],
        keywords: ['pothole', 'graffiti', '311', 'complaint'],
      },
      {
        // No icon.
        value: 'report-outage',
        label: 'Report an outage',
        keywords: ['power', 'water main', 'streetlight'],
      },
    ],
  },
  {
    heading: 'Find',
    items: [
      {
        value: 'find-service',
        label: 'Find a service',
        icon: 'search',
        shortcut: ['mod', 'F'],
        keywords: ['permit', 'license', 'directory'],
      },
      {
        // No icon.
        value: 'find-office',
        label: 'Find an office near me',
        keywords: ['location', 'hours', 'city hall'],
      },
      {
        value: 'legacy-portal',
        label: 'Open the legacy portal',
        icon: 'external-link',
        disabled: true,
      },
    ],
  },
]

export default function CommandPaletteDemo(): React.JSX.Element {
  const [open, setOpen] = React.useState(false)
  const [lastRun, setLastRun] = React.useState<string | null>(null)

  // Opening is the consumer's job — wire the conventional Cmd/Ctrl+K.
  useCommandPaletteShortcut(() => setOpen(true))

  return (
    <DemoStack>
      <DemoSection title="Open with a button or ⌘K / Ctrl+K">
        <div className="flex flex-col items-start gap-2">
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Open command palette
          </Button>
          <p className="text-sm text-muted-foreground">
            Or press ⌘K (macOS) / Ctrl+K. Try typing “pay”, “pothole”, or “office”.
          </p>
          {lastRun != null ? (
            <p className="text-sm text-foreground">
              Last command: <span className="font-medium">{lastRun}</span>
            </p>
          ) : null}
        </div>

        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          items={GROUPS}
          onSelect={(item) => setLastRun(item.label)}
        />
      </DemoSection>
    </DemoStack>
  )
}
