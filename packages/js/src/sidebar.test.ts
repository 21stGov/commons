// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from 'vitest'

import { enhanceSidebar } from './sidebar.ts'

function sidebarMarkup(): void {
  document.body.innerHTML = `
    <nav data-slot="sidebar" id="sb">
      <button data-slot="sidebar-trigger" aria-controls="sb" aria-expanded="true">Collapse</button>
      <button data-slot="sidebar-group-trigger" aria-expanded="true" aria-controls="grp">Group</button>
      <div data-slot="sidebar-group-panel" id="grp"><a href="#">Item</a></div>
    </nav>`
}

describe('enhanceSidebar', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('the collapse toggle flips data-collapsed on the sidebar and its aria-expanded', () => {
    sidebarMarkup()
    enhanceSidebar(document)
    const nav = document.querySelector<HTMLElement>('[data-slot="sidebar"]')!
    const trigger = document.querySelector<HTMLElement>('[data-slot="sidebar-trigger"]')!
    expect(nav.hasAttribute('data-collapsed')).toBe(false)
    trigger.click()
    expect(nav.hasAttribute('data-collapsed')).toBe(true)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    trigger.click()
    expect(nav.hasAttribute('data-collapsed')).toBe(false)
  })

  it('a group trigger toggles its panel like a disclosure', () => {
    sidebarMarkup()
    enhanceSidebar(document)
    const groupTrigger = document.querySelector<HTMLElement>('[data-slot="sidebar-group-trigger"]')!
    const panel = document.getElementById('grp')!
    expect(panel.hidden).toBe(false)
    groupTrigger.click()
    expect(groupTrigger.getAttribute('aria-expanded')).toBe('false')
    expect(panel.hidden).toBe(true)
    groupTrigger.click()
    expect(panel.hidden).toBe(false)
  })
})
