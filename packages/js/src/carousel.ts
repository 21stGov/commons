// SPDX-License-Identifier: MIT

/**
 * Carousel behavior.
 *
 * Contract (authored markup):
 *   root     <div data-slot="carousel" [data-orientation="vertical"]>
 *   viewport <div data-slot="carousel-viewport">        (overflow: hidden)
 *              content <div data-slot="carousel-content"> (flex track)
 *                item  <div data-slot="carousel-item">    (basis-full)
 *   prev     <button data-slot="carousel-previous">
 *   next     <button data-slot="carousel-next">
 *   status   <span data-slot="carousel-status">
 *
 * Each item is a full viewport; moving translates the track. Prev/Next step one
 * item and disable at the ends; the status reads "N of M"; off-screen items are
 * aria-hidden so only the current slide is in the a11y tree.
 */

import { all, claim } from './dom.ts'

export function enhanceCarousel(root: ParentNode): void {
  for (const el of claim(root, '[data-slot="carousel"]', 'carousel')) {
    const content = el.querySelector<HTMLElement>('[data-slot="carousel-content"]')
    const items = all<HTMLElement>(el, '[data-slot="carousel-item"]')
    const prev = el.querySelector<HTMLButtonElement>('[data-slot="carousel-previous"]')
    const next = el.querySelector<HTMLButtonElement>('[data-slot="carousel-next"]')
    const status = el.querySelector<HTMLElement>('[data-slot="carousel-status"]')
    if (!content || items.length === 0) continue
    const vertical = el.getAttribute('data-orientation') === 'vertical'

    let index = 0
    const update = (): void => {
      // Translate by the item's real offset (not -index*100%) so the flex gap
      // between slides doesn't leave a sliver of the neighbour showing.
      const first = items[0]!
      const active = items[index]!
      const offset = vertical
        ? active.offsetTop - first.offsetTop
        : active.offsetLeft - first.offsetLeft
      content.style.transform = vertical ? `translateY(${-offset}px)` : `translateX(${-offset}px)`
      if (status) status.textContent = `${index + 1} of ${items.length}`
      if (prev) prev.disabled = index === 0
      if (next) next.disabled = index === items.length - 1
      items.forEach((item, i) => {
        item.setAttribute('aria-hidden', String(i !== index))
        for (const el2 of item.querySelectorAll<HTMLElement>('a,button,input,select,textarea')) {
          el2.tabIndex = i === index ? 0 : -1
        }
      })
    }

    const go = (delta: number): void => {
      index = Math.max(0, Math.min(items.length - 1, index + delta))
      update()
    }
    prev?.addEventListener('click', () => go(-1))
    next?.addEventListener('click', () => go(1))
    update()
  }
}
