// SPDX-License-Identifier: MIT

/**
 * Resizable Panels behavior — drag (or arrow-key) a handle to resize neighbours.
 *
 * Works on the component's own markup: an `[data-slot="resizable-panels"]`
 * ([data-direction]) with `[data-slot="resizable-panel"]` (flex-basis %) split by
 * `[data-slot="resizable-handle"]`. Dragging a handle shifts flex-basis between
 * the panels on either side (min 40px each); Arrow keys nudge by 2%.
 */

import { all, claim } from './dom.ts'

const MIN = 40

export function enhanceResizable(root: ParentNode): void {
  for (const container of claim(root, '[data-slot="resizable-panels"]', 'resizable')) {
    const horizontal = container.getAttribute('data-direction') !== 'vertical'
    const size = (el: Element): number => {
      const r = el.getBoundingClientRect()
      return horizontal ? r.width : r.height
    }

    // The divider between panels is the direct child; the draggable handle may be
    // nested inside it (…-handle-track > …-handle).
    const dividers = all<HTMLElement>(container, ':scope > [data-slot="resizable-handle-track"], :scope > [data-slot="resizable-handle"]')
    for (const divider of dividers) {
      const handle = divider.querySelector<HTMLElement>('[data-slot="resizable-handle"]') ?? divider
      const prev = divider.previousElementSibling as HTMLElement | null
      const nextPanel = divider.nextElementSibling as HTMLElement | null
      if (!prev || !nextPanel) continue

      const apply = (prevPx: number, nextPx: number): void => {
        const total = size(container) || 1
        prev.style.flexBasis = `${(prevPx / total) * 100}%`
        nextPanel.style.flexBasis = `${(nextPx / total) * 100}%`
        handle.setAttribute('aria-valuenow', String(Math.round((prevPx / total) * 100)))
      }

      handle.addEventListener('pointerdown', (event) => {
        event.preventDefault()
        const startPos = horizontal ? event.clientX : event.clientY
        const startPrev = size(prev)
        const startNext = size(nextPanel)
        handle.setPointerCapture(event.pointerId)

        const onMove = (ev: PointerEvent): void => {
          const delta = (horizontal ? ev.clientX : ev.clientY) - startPos
          let p = startPrev + delta
          let n = startNext - delta
          if (p < MIN) {
            n += p - MIN
            p = MIN
          }
          if (n < MIN) {
            p += n - MIN
            n = MIN
          }
          apply(p, n)
        }
        const onUp = (): void => {
          handle.releasePointerCapture(event.pointerId)
          document.removeEventListener('pointermove', onMove)
          document.removeEventListener('pointerup', onUp)
        }
        document.addEventListener('pointermove', onMove)
        document.addEventListener('pointerup', onUp)
      })

      handle.addEventListener('keydown', (event) => {
        const inc = horizontal ? 'ArrowRight' : 'ArrowDown'
        const dec = horizontal ? 'ArrowLeft' : 'ArrowUp'
        const dir = event.key === inc ? 1 : event.key === dec ? -1 : 0
        if (!dir) return
        event.preventDefault()
        const step = (size(container) || 1) * 0.02 * dir
        apply(Math.max(MIN, size(prev) + step), Math.max(MIN, size(nextPanel) - step))
      })
    }
  }
}
