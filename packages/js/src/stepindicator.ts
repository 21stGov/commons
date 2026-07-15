// SPDX-License-Identifier: MIT

/**
 * Step Indicator behavior — drive an interactive step indicator from Back/Next
 * buttons (the demo's `currentStep` state, which the static rewrite drops).
 *
 * Contract: a `[data-slot="step-indicator"]` whose section also holds a Back and
 * a Next `<button>`. Each `[data-slot="step-indicator-step"]` carries a
 * `data-status` (complete | current | incomplete) that the CSS reads; the marker
 * (the numbered/check circle) is the step's only non-slotted `<span>`. Advancing
 * updates every step's status + marker (a check for complete, else its number),
 * `aria-current`, the "Step X of Y" counter, and the buttons' disabled bounds.
 */

import { all, claim } from './dom.ts'

const markerOf = (step: Element): HTMLElement | null => {
  for (const child of step.children) {
    if (child.tagName === 'SPAN' && !child.hasAttribute('data-slot')) return child as HTMLElement
  }
  return null
}

export function enhanceStepIndicator(root: ParentNode): void {
  for (const indicator of claim(root, '[data-slot="step-indicator"]', 'step-indicator')) {
    const steps = all<HTMLElement>(indicator, '[data-slot="step-indicator-step"]')
    if (steps.length < 2) continue

    const scope = indicator.closest('section') ?? indicator.parentElement
    const buttons = scope ? Array.from(scope.querySelectorAll<HTMLButtonElement>('button')) : []
    const back = buttons.find((b) => /back|previous|prev/i.test(b.textContent ?? ''))
    const next = buttons.find((b) => /next|continue|forward/i.test(b.textContent ?? ''))
    if (!back && !next) continue // not the interactive one

    // Reuse the SSR'd check glyph for steps that become complete.
    let checkHTML = ''
    for (const step of steps) {
      if (step.getAttribute('data-status') === 'complete') {
        checkHTML = markerOf(step)?.innerHTML ?? ''
        break
      }
    }
    const counter = indicator.querySelector<HTMLElement>('[data-slot="step-indicator-counter"]')

    let current = steps.findIndex((s) => s.getAttribute('data-status') === 'current')
    if (current < 0) current = 0

    const render = (): void => {
      steps.forEach((step, i) => {
        const status = i < current ? 'complete' : i === current ? 'current' : 'incomplete'
        step.setAttribute('data-status', status)
        if (i === current) step.setAttribute('aria-current', 'step')
        else step.removeAttribute('aria-current')
        const marker = markerOf(step)
        if (marker) {
          if (status === 'complete' && checkHTML) marker.innerHTML = checkHTML
          else marker.textContent = String(i + 1)
        }
      })
      if (counter) counter.textContent = `Step ${current + 1} of ${steps.length}`
      if (back) back.disabled = current === 0
      if (next) next.disabled = current === steps.length - 1
    }

    back?.addEventListener('click', () => {
      if (current > 0) {
        current -= 1
        render()
      }
    })
    next?.addEventListener('click', () => {
      if (current < steps.length - 1) {
        current += 1
        render()
      }
    })
  }
}
