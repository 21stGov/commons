// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from 'vitest'

import { enhanceDataTable } from './datatable.ts'

function dataTableMarkup(): void {
  document.body.innerHTML = `
    <div data-slot="data-table">
      <input data-datatable-filter />
      <select data-datatable-page-size>
        <option value="2">2</option>
        <option value="10" selected>10</option>
      </select>
      <table>
        <thead>
          <tr>
            <th><input data-datatable-select-all type="checkbox" /></th>
            <th aria-sort="none"><button data-slot="table-sort-button">Name</button></th>
          </tr>
        </thead>
        <tbody>
          <tr><td><input data-datatable-row type="checkbox" value="1" /></td><td>Alice</td></tr>
          <tr><td><input data-datatable-row type="checkbox" value="2" /></td><td>Bob</td></tr>
          <tr><td><input data-datatable-row type="checkbox" value="3" /></td><td>Charlie</td></tr>
        </tbody>
      </table>
      <p data-datatable-count></p>
      <p data-datatable-status></p>
      <ol data-datatable-pager></ol>
    </div>`
}
const filter = () => document.querySelector<HTMLInputElement>('[data-datatable-filter]')!
const pageSize = () => document.querySelector<HTMLSelectElement>('[data-datatable-page-size]')!
const selectAll = () => document.querySelector<HTMLInputElement>('[data-datatable-select-all]')!
const rows = () => document.querySelectorAll<HTMLElement>('tbody > tr')
const rowBox = (i: number) => rows()[i].querySelector<HTMLInputElement>('[data-datatable-row]')!
const count = () => document.querySelector<HTMLElement>('[data-datatable-count]')!
const status = () => document.querySelector<HTMLElement>('[data-datatable-status]')!
const pager = () => document.querySelector<HTMLElement>('[data-datatable-pager]')!

describe('enhanceDataTable', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('filters rows by text and updates the status count', () => {
    dataTableMarkup()
    enhanceDataTable(document)
    filter().value = 'ali'
    filter().dispatchEvent(new Event('input', { bubbles: true }))
    expect(rows()[0].hidden).toBe(false) // Alice
    expect(rows()[1].hidden).toBe(true) // Bob
    expect(rows()[2].hidden).toBe(true) // Charlie
    expect(status().textContent).toBe('Showing 1 to 1 of 1 results')
  })

  it('select-all checks every filtered row and summarizes the selection', () => {
    dataTableMarkup()
    enhanceDataTable(document)
    selectAll().checked = true
    selectAll().dispatchEvent(new Event('change', { bubbles: true }))
    expect(rowBox(0).checked).toBe(true)
    expect(rowBox(2).checked).toBe(true)
    expect(count().textContent).toBe('3 selected: 1, 2, 3')
  })

  it('a partial row selection makes select-all indeterminate', () => {
    dataTableMarkup()
    enhanceDataTable(document)
    rowBox(0).checked = true
    rowBox(0).dispatchEvent(new Event('change', { bubbles: true }))
    expect(count().textContent).toBe('1 selected: 1')
    expect(selectAll().indeterminate).toBe(true)
    expect(selectAll().checked).toBe(false)
  })

  it('paginates: page size limits visible rows, and the pager navigates pages', () => {
    dataTableMarkup()
    enhanceDataTable(document)
    pageSize().value = '2'
    pageSize().dispatchEvent(new Event('change', { bubbles: true }))
    expect(status().textContent).toBe('Showing 1 to 2 of 3 results')
    expect(rows()[2].hidden).toBe(true)

    const page2 = pager().querySelector<HTMLButtonElement>('[aria-label="Page 2"]')!
    page2.click()
    expect(status().textContent).toBe('Showing 3 to 3 of 3 results')
    expect(rows()[2].hidden).toBe(false)
  })
})
