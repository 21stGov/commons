// SPDX-License-Identifier: MIT

/**
 * Scroll Area behavior — a styled overlay scrollbar over a native scroll.
 *
 * Contract (authored markup):
 *   root      <div data-slot="scroll-area">                    (relative, fixed size)
 *     viewport <div data-slot="scroll-area-viewport">          (overflow:auto, native bar hidden)
 *     bar      <div data-slot="scroll-area-scrollbar" data-orientation="vertical|horizontal">
 *       thumb    <div data-slot="scroll-area-thumb">
 *
 * The viewport owns real scrolling (wheel, drag, keyboard); this enhancer sizes
 * and positions each thumb from the viewport's scroll metrics, hides a bar whose
 * axis does not overflow, and lets you drag the thumb to scroll.
 */

import { all, claim } from './dom.ts'

export function enhanceScrollArea(root: ParentNode): void {
  for (const area of claim(root, '[data-slot="scroll-area"]', 'scroll-area')) {
    const viewport = area.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')
    if (!viewport) continue
    const bars = all<HTMLElement>(area, '[data-slot="scroll-area-scrollbar"]')

    const sync = (): void => {
      for (const bar of bars) {
        const vertical = bar.getAttribute('data-orientation') !== 'horizontal'
        const thumb = bar.querySelector<HTMLElement>('[data-slot="scroll-area-thumb"]')
        const client = vertical ? viewport.clientHeight : viewport.clientWidth
        const scroll = vertical ? viewport.scrollHeight : viewport.scrollWidth
        const pos = vertical ? viewport.scrollTop : viewport.scrollLeft
        const overflows = scroll > client + 1
        bar.hidden = !overflows
        if (!thumb || !overflows) continue
        const ratio = client / scroll
        const barSize = vertical ? bar.clientHeight : bar.clientWidth
        const thumbSize = Math.max(barSize * ratio, 44)
        const travel = barSize - thumbSize
        const offset = scroll === client ? 0 : (pos / (scroll - client)) * travel
        if (vertical) {
          thumb.style.height = `${thumbSize}px`
          thumb.style.transform = `translateY(${offset}px)`
        } else {
          thumb.style.width = `${thumbSize}px`
          thumb.style.transform = `translateX(${offset}px)`
        }
      }
    }

    viewport.addEventListener('scroll', sync, { passive: true })
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(sync)
      ro.observe(viewport)
      const inner = viewport.firstElementChild
      if (inner) ro.observe(inner)
    }

    // Drag a thumb to scroll.
    for (const bar of bars) {
      const vertical = bar.getAttribute('data-orientation') !== 'horizontal'
      const thumb = bar.querySelector<HTMLElement>('[data-slot="scroll-area-thumb"]')
      thumb?.addEventListener('pointerdown', (event) => {
        event.preventDefault()
        const start = vertical ? event.clientY : event.clientX
        const startScroll = vertical ? viewport.scrollTop : viewport.scrollLeft
        const client = vertical ? viewport.clientHeight : viewport.clientWidth
        const scroll = vertical ? viewport.scrollHeight : viewport.scrollWidth
        const barSize = vertical ? bar.clientHeight : bar.clientWidth
        thumb.setPointerCapture(event.pointerId)
        const onMove = (ev: PointerEvent): void => {
          const delta = (vertical ? ev.clientY : ev.clientX) - start
          const travel = barSize - Math.max(barSize * (client / scroll), 44)
          const next = startScroll + (travel <= 0 ? 0 : (delta / travel) * (scroll - client))
          if (vertical) viewport.scrollTop = next
          else viewport.scrollLeft = next
        }
        const onUp = (): void => {
          thumb.releasePointerCapture(event.pointerId)
          document.removeEventListener('pointermove', onMove)
          document.removeEventListener('pointerup', onUp)
        }
        document.addEventListener('pointermove', onMove)
        document.addEventListener('pointerup', onUp)
      })
    }

    sync()
  }
}
