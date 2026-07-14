// SPDX-License-Identifier: MIT

/** Anchored positioning for popups (menu, popover, tooltip) — no dependency. */

export type Side = 'top' | 'bottom' | 'left' | 'right'
export type Align = 'start' | 'center' | 'end'

interface PositionOptions {
  side?: Side
  align?: Align
  gap?: number
  padding?: number
}

/**
 * Position `positioner` next to `anchor`, flipping to the opposite side when it
 * would overflow the viewport. `positioner` is expected to be `position: fixed`
 * (the CSS puts it at `z-50`); we set its `inset-block-start` / `inset-inline-start`.
 * Not a full floating-ui, but enough for the menu/popover/tooltip cases.
 */
export function positionAnchored(
  anchor: HTMLElement,
  positioner: HTMLElement,
  { side = 'bottom', align = 'start', gap = 6, padding = 8 }: PositionOptions = {},
): void {
  positioner.style.position = 'fixed'
  positioner.style.insetBlockStart = '0'
  positioner.style.insetInlineStart = '0'
  positioner.style.visibility = 'hidden'

  const a = anchor.getBoundingClientRect()
  const p = positioner.getBoundingClientRect()
  const vw = document.documentElement.clientWidth
  const vh = document.documentElement.clientHeight

  const fitsBelow = a.bottom + gap + p.height <= vh - padding
  const fitsAbove = a.top - gap - p.height >= padding
  let resolved = side
  if (side === 'bottom' && !fitsBelow && fitsAbove) resolved = 'top'
  else if (side === 'top' && !fitsAbove && fitsBelow) resolved = 'bottom'

  let top = 0
  let left = 0
  if (resolved === 'bottom' || resolved === 'top') {
    top = resolved === 'bottom' ? a.bottom + gap : a.top - gap - p.height
    if (align === 'start') left = a.left
    else if (align === 'end') left = a.right - p.width
    else left = a.left + (a.width - p.width) / 2
  } else {
    left = resolved === 'right' ? a.right + gap : a.left - gap - p.width
    if (align === 'start') top = a.top
    else if (align === 'end') top = a.bottom - p.height
    else top = a.top + (a.height - p.height) / 2
  }

  // Clamp into the viewport.
  left = Math.max(padding, Math.min(left, vw - p.width - padding))
  top = Math.max(padding, Math.min(top, vh - p.height - padding))

  positioner.style.insetInlineStart = `${left}px`
  positioner.style.insetBlockStart = `${top}px`
  positioner.style.visibility = ''
}
