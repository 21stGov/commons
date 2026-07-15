// SPDX-License-Identifier: MIT

'use client'

import * as React from 'react'

import { demos } from '@/components/demos'
import { useFramework } from '@/components/use-framework'

/**
 * Live demo frame on generated component pages, driven by the page-wide
 * React ⇄ HTML preference ({@link useFramework}):
 *
 *  - Preview: the real `@21stgov/commons-react` component (React), or the same
 *    component as framework-agnostic `.cui-*` markup in an <iframe> (HTML).
 *    The iframe isolates `commons.css`'s reset/theme from the docs' Tailwind
 *    and is served from /cui/<name>.html (see scripts/cui-frames.ts).
 *  - Code: the matching source — the JSX usage snippet (React) or the copyable
 *    `.cui-*` markup (HTML). Both arrive as build-time syntax-highlighted MDX
 *    children tagged with `data-framework-code`.
 */
export function ComponentDemo({
  name,
  children,
}: {
  name: string
  children?: React.ReactNode
}): React.JSX.Element {
  const [framework] = useFramework()
  const loader = demos[name]
  const Demo = React.useMemo(() => (loader ? React.lazy(loader) : undefined), [loader])
  const [view, setView] = React.useState<'preview' | 'code'>('preview')

  // Split the code children by framework. The generator wraps each fence in a
  // <div data-framework-code="react|html">; anything untagged is treated as
  // React code (back-compatible with hand-authored uses).
  const codeByFramework = React.useMemo(() => {
    const map: Partial<Record<'react' | 'html', React.ReactNode>> = {}
    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) return
      const tag = (child.props as { 'data-framework-code'?: string })['data-framework-code']
      if (tag === 'react' || tag === 'html') map[tag] = child
      else if (map.react === undefined) map.react = child
    })
    return map
  }, [children])

  const activeCode = codeByFramework[framework]

  // The HTML iframe is same-origin, so read its rendered height on load to size
  // the frame to its content instead of a scroll box.
  const iframeRef = React.useRef<HTMLIFrameElement>(null)
  const [htmlSeen, setHtmlSeen] = React.useState(false)
  const [frameHeight, setFrameHeight] = React.useState<number>()
  const [theme, setTheme] = React.useState('light')

  const showFrame = framework === 'html' && view === 'preview'
  React.useEffect(() => {
    if (!showFrame) return
    setHtmlSeen(true)
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
  }, [showFrame])

  const syncHeight = React.useCallback(() => {
    const body = iframeRef.current?.contentDocument?.body
    if (body) setFrameHeight(body.scrollHeight + 4)
  }, [])

  if (!Demo) {
    return (
      <p className="not-prose rounded-md border border-warning-border bg-warning p-4 text-warning-foreground">
        No live demo is registered for “{name}” yet.
      </p>
    )
  }

  return (
    <div className="docs-component-demo not-prose">
      {activeCode ? (
        <div role="group" aria-label="Example view" className="docs-component-demo-toolbar">
          <button type="button" aria-pressed={view === 'preview'} onClick={() => setView('preview')}>
            Preview
          </button>
          <button type="button" aria-pressed={view === 'code'} onClick={() => setView('code')}>
            Code
          </button>
        </div>
      ) : null}

      {/* React preview */}
      <div className="docs-component-demo-preview" hidden={framework !== 'react' || view !== 'preview'}>
        <React.Suspense
          fallback={<p className="text-sm text-muted-foreground">Loading example…</p>}
        >
          <Demo />
        </React.Suspense>
      </div>

      {/* HTML (vanilla) preview */}
      <div className="docs-component-demo-html" hidden={framework !== 'html' || view !== 'preview'}>
        {htmlSeen ? (
          <iframe
            ref={iframeRef}
            src={`/cui/${name}.html?theme=${theme}`}
            title={`${name} — framework-agnostic HTML example`}
            className="docs-component-demo-frame"
            loading="lazy"
            onLoad={syncHeight}
            style={{ display: 'block', width: '100%', border: 0, height: frameHeight ?? 240 }}
          />
        ) : null}
      </div>

      {/* Code for the active framework */}
      {activeCode ? (
        <div className="docs-component-demo-code" hidden={view !== 'code'}>
          {activeCode}
        </div>
      ) : null}
    </div>
  )
}
