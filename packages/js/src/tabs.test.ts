// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from 'vitest'

import { enhanceTabs } from './tabs.ts'

function tabsMarkup(): void {
  document.body.innerHTML = `
    <div data-slot="tabs" data-orientation="horizontal">
      <div data-slot="tabs-list" role="tablist">
        <button data-slot="tabs-tab" role="tab" aria-controls="pane1" data-active aria-selected="true">One</button>
        <button data-slot="tabs-tab" role="tab" aria-controls="pane2" aria-selected="false">Two</button>
        <button data-slot="tabs-tab" role="tab" aria-controls="pane3" aria-selected="false" data-disabled>Three</button>
      </div>
      <div data-slot="tabs-panel" id="pane1" role="tabpanel">1</div>
      <div data-slot="tabs-panel" id="pane2" role="tabpanel" hidden>2</div>
      <div data-slot="tabs-panel" id="pane3" role="tabpanel" hidden>3</div>
    </div>`
}

describe('enhanceTabs', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('activates a tab on click: aria-selected, data-active, roving tabindex, panel visibility', () => {
    tabsMarkup()
    enhanceTabs(document)
    const [t1, t2] = document.querySelectorAll<HTMLElement>('[data-slot="tabs-tab"]')
    t2.click()
    expect(t2.getAttribute('aria-selected')).toBe('true')
    expect(t2.hasAttribute('data-active')).toBe(true)
    expect(t2.tabIndex).toBe(0)
    expect(t1.getAttribute('aria-selected')).toBe('false')
    expect(t1.tabIndex).toBe(-1)
    expect(document.getElementById('pane2')!.hidden).toBe(false)
    expect(document.getElementById('pane1')!.hidden).toBe(true)
  })

  it('ArrowRight moves selection to the next enabled tab (activation follows focus)', () => {
    tabsMarkup()
    enhanceTabs(document)
    const [t1, t2] = document.querySelectorAll<HTMLElement>('[data-slot="tabs-tab"]')
    t1.focus()
    t1.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    expect(document.activeElement).toBe(t2)
    expect(t2.getAttribute('aria-selected')).toBe('true')
  })

  it('skips disabled tabs when navigating (wraps past the disabled last tab)', () => {
    tabsMarkup()
    enhanceTabs(document)
    const tabs = document.querySelectorAll<HTMLElement>('[data-slot="tabs-tab"]')
    tabs[1].focus()
    tabs[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    expect(document.activeElement).toBe(tabs[0])
  })

  it('does not activate a disabled tab on click', () => {
    tabsMarkup()
    enhanceTabs(document)
    const tabs = document.querySelectorAll<HTMLElement>('[data-slot="tabs-tab"]')
    tabs[2].click()
    expect(tabs[2].getAttribute('aria-selected')).toBe('false')
    expect(document.getElementById('pane3')!.hidden).toBe(true)
  })
})
