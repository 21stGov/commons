// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from 'vitest'

import { cellValue, compareCells, enhanceTable } from './table.ts'

describe('compareCells', () => {
  it('compares wholly-numeric values numerically, not lexically', () => {
    expect(compareCells('9', '10')).toBeLessThan(0)
  })

  it('uses numeric-aware string compare for mixed values (IDs, ISO dates)', () => {
    expect(compareCells('BP-2', 'BP-10')).toBeLessThan(0)
    expect(compareCells('2026-01-05', '2026-02-01')).toBeLessThan(0)
  })
})

describe('cellValue', () => {
  it('prefers an explicit data-sort-value over the visible text', () => {
    document.body.innerHTML =
      '<table><tbody><tr><td data-sort-value="2026-01-05">Jan 5, 2026</td></tr></tbody></table>'
    const row = document.querySelector<HTMLElement>('tbody tr')!
    expect(cellValue(row, 0)).toBe('2026-01-05')
  })
})

function tableMarkup(): void {
  document.body.innerHTML = `
    <table>
      <thead>
        <tr>
          <th aria-sort="none"><button data-slot="table-sort-button">Name</button></th>
          <th aria-sort="none"><button data-slot="table-sort-button">Age</button></th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Charlie</td><td>30</td></tr>
        <tr><td>Alice</td><td>25</td></tr>
        <tr><td>Bob</td><td>40</td></tr>
      </tbody>
    </table>`
}
const sortButtons = () => document.querySelectorAll<HTMLElement>('[data-slot="table-sort-button"]')
const ths = () => document.querySelectorAll<HTMLElement>('th[aria-sort]')
const names = () => Array.from(document.querySelectorAll('tbody tr')).map((r) => r.children[0]!.textContent)

describe('enhanceTable', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('sorts ascending then descending by a text column, tracking aria-sort', () => {
    tableMarkup()
    enhanceTable(document)
    sortButtons()[0].click()
    expect(names()).toEqual(['Alice', 'Bob', 'Charlie'])
    expect(ths()[0].getAttribute('aria-sort')).toBe('ascending')
    sortButtons()[0].click()
    expect(names()).toEqual(['Charlie', 'Bob', 'Alice'])
    expect(ths()[0].getAttribute('aria-sort')).toBe('descending')
  })

  it('sorts a numeric column numerically', () => {
    tableMarkup()
    enhanceTable(document)
    sortButtons()[1].click()
    expect(names()).toEqual(['Alice', 'Charlie', 'Bob']) // 25, 30, 40
  })

  it('clears aria-sort on the other columns when a new one is sorted', () => {
    tableMarkup()
    enhanceTable(document)
    sortButtons()[0].click()
    sortButtons()[1].click()
    expect(ths()[0].getAttribute('aria-sort')).toBe('none')
    expect(ths()[1].getAttribute('aria-sort')).toBe('ascending')
  })
})
