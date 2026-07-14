// SPDX-License-Identifier: MIT

'use client'

import { ResizableHandle, ResizablePanel, ResizablePanels } from '@21stgov/commons-react'
import * as React from 'react'

import { DemoSection, DemoStack } from './demo-section'

const KEYBOARD_HINT =
  'Tip: focus a divider and use Arrow keys to resize, Home/End for min/max, double-click to reset.'

function PaneBody({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="flex h-full flex-col gap-1 bg-muted p-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  )
}

export default function ResizablePanelsDemo(): React.JSX.Element {
  return (
    <DemoStack>
      <DemoSection title="Horizontal split (list + detail)">
        <p className="text-sm text-muted-foreground">{KEYBOARD_HINT}</p>
        <ResizablePanels
          aria-label="Records"
          className="h-64 overflow-hidden rounded-md border border-border"
        >
          <ResizablePanel defaultSize={35} minSize={20} maxSize={60}>
            <PaneBody title="List">
              <ul className="flex flex-col gap-1">
                <li>Permit #10231</li>
                <li>Permit #10232</li>
                <li>Permit #10233</li>
              </ul>
            </PaneBody>
          </ResizablePanel>
          <ResizableHandle label="Resize the list pane" collapsible />
          <ResizablePanel defaultSize={65}>
            <PaneBody title="Detail">
              Select a record to review its status, applicant, and history.
            </PaneBody>
          </ResizablePanel>
        </ResizablePanels>
      </DemoSection>

      <DemoSection title="Vertical split">
        <ResizablePanels
          direction="vertical"
          aria-label="Editor and output"
          className="h-72 overflow-hidden rounded-md border border-border"
        >
          <ResizablePanel defaultSize={60} minSize={25}>
            <PaneBody title="Editor">Draft the notice text here.</PaneBody>
          </ResizablePanel>
          <ResizableHandle label="Resize the editor pane" />
          <ResizablePanel defaultSize={40} minSize={15}>
            <PaneBody title="Preview">The rendered notice appears below.</PaneBody>
          </ResizablePanel>
        </ResizablePanels>
      </DemoSection>

      <DemoSection title="Three-pane layout">
        <ResizablePanels
          aria-label="Workspace"
          className="h-64 overflow-hidden rounded-md border border-border"
        >
          <ResizablePanel defaultSize={22} minSize={12}>
            <PaneBody title="Navigation">Sections</PaneBody>
          </ResizablePanel>
          <ResizableHandle label="Resize the navigation pane" />
          <ResizablePanel defaultSize={53}>
            <PaneBody title="Content">Main working area.</PaneBody>
          </ResizablePanel>
          <ResizableHandle label="Resize the content pane" />
          <ResizablePanel defaultSize={25} minSize={15}>
            <PaneBody title="Inspector">Properties</PaneBody>
          </ResizablePanel>
        </ResizablePanels>
      </DemoSection>

      <DemoSection title="Persisted sizes (controlled)">
        <ControlledExample />
      </DemoSection>
    </DemoStack>
  )
}

function ControlledExample(): React.JSX.Element {
  const [sizes, setSizes] = React.useState([50, 50])
  return (
    <div className="flex flex-col gap-2">
      <ResizablePanels
        aria-label="Controlled split"
        sizes={sizes}
        onResize={setSizes}
        className="h-40 overflow-hidden rounded-md border border-border"
      >
        <ResizablePanel minSize={15}>
          <PaneBody title="Left">{Math.round(sizes[0])}%</PaneBody>
        </ResizablePanel>
        <ResizableHandle label="Resize the left pane" />
        <ResizablePanel minSize={15}>
          <PaneBody title="Right">{Math.round(sizes[1])}%</PaneBody>
        </ResizablePanel>
      </ResizablePanels>
      <p className="text-sm text-muted-foreground">
        Sizes: {sizes.map((s) => `${Math.round(s)}%`).join(' / ')}
      </p>
    </div>
  )
}
