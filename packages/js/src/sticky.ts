// SPDX-License-Identifier: MIT

/**
 * Sticky region stacking — the framework-agnostic counterpart to the React
 * `useStickyOffset` hook.
 *
 * Every `[data-cui-sticky]` element is pinned at the cumulative height of the
 * sticky elements before it in the document, so a sticky header sits below a
 * sticky gov banner, a sticky alert below both — for whatever subset is sticky.
 * `position: sticky` and the z-index come from the component's own classes
 * (`cui-header--sticky`, …); this only measures heights and assigns each `top`.
 */

let observer: ResizeObserver | undefined
let observed: HTMLElement[] = []
let frame = 0
let resizeWired = false

/** Assign each sticky region its cumulative `top`; re-observe for height changes. */
function coordinate(): void {
  // Clear the previous pass first, so an element whose data-cui-sticky was
  // removed loses the stale inline `top`.
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
    observer?.observe(el)
  }
}

/** rAF-coalesced recompute, so N sticky regions trigger one pass, not N. */
function schedule(): void {
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    coordinate()
  })
}

/**
 * Coordinate the sticky stack. Offsets are document-wide (they stack against the
 * viewport), so `root` is ignored — the whole stack is recomputed. Safe to call
 * repeatedly; call `enhance()` again after injecting sticky markup.
 */
export function enhanceSticky(_root: ParentNode): void {
  if (document.querySelector('[data-cui-sticky]') === null) return
  schedule()
  if (!resizeWired) {
    resizeWired = true
    window.addEventListener('resize', schedule)
  }
}
