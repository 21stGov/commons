// SPDX-License-Identifier: MIT

import * as React from 'react'

import { ResizableHandle, ResizablePanel, ResizablePanels } from '@21stgov/commons-react'

export const title = 'Resizable Panels'

function Pane({ title, children }: { title: string; children?: React.ReactNode }): React.JSX.Element {
  return (
    <div className="flex h-full flex-col gap-1 bg-muted p-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
      <div className="text-sm text-foreground">{children}</div>
    </div>
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
          <Pane title="Left">{Math.round(sizes[0])}%</Pane>
        </ResizablePanel>
        <ResizableHandle label="Resize the left pane" />
        <ResizablePanel minSize={15}>
          <Pane title="Right">{Math.round(sizes[1])}%</Pane>
        </ResizablePanel>
      </ResizablePanels>
      <p className="text-sm text-muted-foreground">
        Sizes: {sizes.map((s) => `${Math.round(s)}%`).join(' / ')}
      </p>
    </div>
  )
}

export default function Demo(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">
        Focus a divider and use Arrow keys to resize, Home/End for min/max, Enter/Space to collapse,
        double-click to reset.
      </p>

      <section aria-labelledby="rp-horizontal-heading">
        <h3 id="rp-horizontal-heading" className="mb-2 text-sm font-semibold">
          Horizontal split (list + detail)
        </h3>
        <ResizablePanels
          aria-label="Records"
          className="h-64 overflow-hidden rounded-md border border-border"
        >
          <ResizablePanel defaultSize={35} minSize={20} maxSize={60}>
            <Pane title="List">
              <ul className="flex flex-col gap-1">
                <li>Permit #10231</li>
                <li>Permit #10232</li>
                <li>Permit #10233</li>
              </ul>
            </Pane>
          </ResizablePanel>
          <ResizableHandle label="Resize the list pane" collapsible />
          <ResizablePanel defaultSize={65}>
            <Pane title="Detail">Select a record to review its status and history.</Pane>
          </ResizablePanel>
        </ResizablePanels>
      </section>

      <section aria-labelledby="rp-vertical-heading">
        <h3 id="rp-vertical-heading" className="mb-2 text-sm font-semibold">
          Vertical split
        </h3>
        <ResizablePanels
          direction="vertical"
          aria-label="Editor and preview"
          className="h-72 overflow-hidden rounded-md border border-border"
        >
          <ResizablePanel defaultSize={60} minSize={25}>
            <Pane title="Editor">Draft the notice text here.</Pane>
          </ResizablePanel>
          <ResizableHandle label="Resize the editor pane" />
          <ResizablePanel defaultSize={40} minSize={15}>
            <Pane title="Preview">The rendered notice appears below.</Pane>
          </ResizablePanel>
        </ResizablePanels>
      </section>

      <section aria-labelledby="rp-three-heading">
        <h3 id="rp-three-heading" className="mb-2 text-sm font-semibold">
          Three-pane layout
        </h3>
        <ResizablePanels
          aria-label="Workspace"
          className="h-64 overflow-hidden rounded-md border border-border"
        >
          <ResizablePanel defaultSize={22} minSize={12}>
            <Pane title="Navigation">Sections</Pane>
          </ResizablePanel>
          <ResizableHandle label="Resize the navigation pane" />
          <ResizablePanel defaultSize={53}>
            <Pane title="Content">Main working area.</Pane>
          </ResizablePanel>
          <ResizableHandle label="Resize the content pane" />
          <ResizablePanel defaultSize={25} minSize={15}>
            <Pane title="Inspector">Properties</Pane>
          </ResizablePanel>
        </ResizablePanels>
      </section>

      <section aria-labelledby="rp-controlled-heading">
        <h3 id="rp-controlled-heading" className="mb-2 text-sm font-semibold">
          Persisted sizes (controlled)
        </h3>
        <ControlledExample />
      </section>

      <section aria-labelledby="rp-rtl-heading">
        <h3 id="rp-rtl-heading" className="mb-2 text-sm font-semibold">
          RTL
        </h3>
        <div dir="rtl">
          <ResizablePanels
            aria-label="تقسيم"
            className="h-40 overflow-hidden rounded-md border border-border"
          >
            <ResizablePanel defaultSize={40} minSize={20}>
              <Pane title="القائمة">عناصر</Pane>
            </ResizablePanel>
            <ResizableHandle label="تغيير حجم القائمة" />
            <ResizablePanel defaultSize={60}>
              <Pane title="التفاصيل">المحتوى</Pane>
            </ResizablePanel>
          </ResizablePanels>
        </div>
      </section>
    </div>
  )
}
