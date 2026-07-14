// SPDX-License-Identifier: MIT

import {
  Button,
  CommandPalette,
  useCommandPaletteShortcut,
  type CommandGroup,
} from '@21stgov/commons-react'
import * as React from 'react'

export const title = 'Command Palette'

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
        // No icon: the reserved gutter keeps this label aligned with iconed rows.
        value: 'payment-plan',
        label: 'Set up a payment plan',
        keywords: ['installments'],
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
        keywords: ['pothole', 'graffiti', '311'],
      },
      {
        // No icon.
        value: 'report-outage',
        label: 'Report an outage',
        keywords: ['power', 'streetlight'],
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
        keywords: ['permit', 'license'],
      },
      { value: 'find-office', label: 'Find an office near me', icon: 'map-pin' },
      {
        value: 'legacy-portal',
        label: 'Open the legacy portal',
        icon: 'external-link',
        disabled: true,
      },
    ],
  },
]

export default function Demo(): React.JSX.Element {
  const [open, setOpen] = React.useState(false)
  const [lastRun, setLastRun] = React.useState<string | null>(null)

  useCommandPaletteShortcut(() => setOpen(true))

  return (
    <div className="flex flex-col items-start gap-4">
      <section aria-labelledby="cp-heading" className="flex flex-col items-start gap-2">
        <h3 id="cp-heading" className="text-sm font-semibold">
          Gov command launcher
        </h3>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Open command palette
        </Button>
        <p className="text-sm text-muted-foreground">
          Or press ⌘K (macOS) / Ctrl+K. Type “pay”, “pothole”, or “office”. Arrow keys move,
          Enter runs, Escape closes.
        </p>
        {lastRun != null ? (
          <p className="text-sm">
            Last command: <span className="font-medium">{lastRun}</span>
          </p>
        ) : null}
      </section>

      <section aria-labelledby="cp-rtl-heading" className="flex flex-col items-start gap-2">
        <h3 id="cp-rtl-heading" className="text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl">
          <RtlExample />
        </div>
      </section>

      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        items={GROUPS}
        onSelect={(item) => setLastRun(item.label)}
      />
    </div>
  )
}

function RtlExample(): React.JSX.Element {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        فتح لوحة الأوامر
      </Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        label="لوحة الأوامر"
        searchLabel="ابحث عن أمر"
        placeholder="اكتب أمرًا أو ابحث…"
        emptyText="لا توجد أوامر"
        items={GROUPS}
      />
    </>
  )
}
