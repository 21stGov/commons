// SPDX-License-Identifier: MIT

import { DirectionProvider, type TextDirection } from '@base-ui/react/direction-provider'
import * as React from 'react'

const isBrowser = typeof document !== 'undefined'

// useLayoutEffect avoids a first-paint LTR flash on RTL pages, but warns
// during SSR (the docs site) — fall back to useEffect on the server.
const useIsomorphicLayoutEffect = isBrowser ? React.useLayoutEffect : React.useEffect

/**
 * Base UI components read their reading direction from a `DirectionProvider`,
 * NOT the DOM `dir` attribute — so on their own they stay LTR even inside
 * `<html dir="rtl">` or a local `<div dir="rtl">`. Native components (link,
 * breadcrumb, …) follow the DOM automatically via CSS logical properties.
 *
 * `AmbientDirection` closes that gap: it reads the *resolved* direction at its
 * own position in the DOM (which reflects the nearest `dir`/`direction`,
 * whether that is on `<html>` or a local ancestor) and feeds it to a
 * `DirectionProvider` — so a Commons Base UI component follows `dir="rtl"`
 * with no provider setup, exactly like the native components.
 *
 * - A hidden probe reads the ambient direction; `direction` is an inherited
 *   property, so `getComputedStyle` resolves it even though the probe is
 *   `display:none` (no layout cost).
 * - A `MutationObserver` on `<html dir>` keeps it in sync when the direction
 *   is toggled at runtime.
 * - SSR-safe: renders `ltr` on the server and corrects on mount (RTL apps can
 *   still wrap once in Base UI's `DirectionProvider` to avoid the first-paint
 *   correction — that provider is re-exported from the package root).
 */
export function AmbientDirection({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [direction, setDirection] = React.useState<TextDirection>('ltr')
  const probeRef = React.useRef<HTMLSpanElement>(null)

  useIsomorphicLayoutEffect(() => {
    const node = probeRef.current
    if (!node || !isBrowser) {
      return
    }
    const read = (): void => {
      const resolved = getComputedStyle(node).direction
      setDirection(resolved === 'rtl' ? 'rtl' : 'ltr')
    }
    read()
    // The common runtime change is a global `<html dir>` toggle; a static
    // local `dir="rtl"` is already captured by the mount read above.
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir'],
    })
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <span ref={probeRef} aria-hidden="true" style={{ display: 'none' }} />
      <DirectionProvider direction={direction}>{children}</DirectionProvider>
    </>
  )
}
