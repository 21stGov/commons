// SPDX-License-Identifier: MIT

'use client'

import * as React from 'react'

/**
 * Coordinates a stack of sticky page regions (gov banner, header, site alert)
 * so they stack instead of overlapping. Every element carrying `data-cui-sticky`
 * is pinned at the cumulative height of the sticky elements before it in the
 * document — so a sticky header sits below a sticky banner, a sticky alert below
 * both, for whatever subset is actually sticky.
 *
 * `position: sticky` and the z-index come from each component's own styles; this
 * only measures heights and assigns each element's `top`. The framework-agnostic
 * path gets the same behavior from `@21stgov/commons-js`.
 */

let observer: ResizeObserver | null = null
let observed: HTMLElement[] = []

function coordinate(): void {
  // Clear the previous pass first, so an element that just stopped being sticky
  // (its data-cui-sticky removed) loses the stale inline `top` we set on it.
  for (const el of observed) el.style.top = ''

  observed = Array.from(document.querySelectorAll<HTMLElement>('[data-cui-sticky]'))
  if (typeof ResizeObserver !== 'undefined') {
    observer ??= new ResizeObserver(schedule)
    observer.disconnect()
  }

  let top = 0
  for (const el of observed) {
    el.style.top = `${top}px`
    top += el.offsetHeight
    observer?.observe(el) // re-stack when any region's height changes
  }
}

let frame = 0
/** rAF-coalesced recompute, so N sticky regions trigger one pass, not N. */
function schedule(): void {
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    coordinate()
  })
}

/**
 * Keep the sticky stack coordinated while `active`. The element sets
 * `data-cui-sticky` itself (declaratively, so it is right on first paint); this
 * recomputes the stack on mount, on viewport resize, and again on cleanup so the
 * regions below move up when this one stops being sticky.
 */
export function useStickyOffset(active: boolean): void {
  React.useEffect(() => {
    if (!active) return
    schedule()
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('resize', schedule)
      schedule()
    }
  }, [active])
}
