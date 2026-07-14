// SPDX-License-Identifier: MIT

/**
 * Data Table behavior — filter, sort, select (with count), and paginate.
 *
 * Contract (authored markup):
 *   root        <div data-slot="data-table">
 *   filter      <input data-datatable-filter>
 *   select-all  <input data-datatable-select-all>            (in the header)
 *   row select  <input data-datatable-row value="<id>">      (one per row)
 *   count       <element data-datatable-count>               (selection summary)
 *   page size   <select data-datatable-page-size>
 *   pager       <button data-datatable-prev> <span data-datatable-page-info>
 *               <button data-datatable-next>
 *   plus sortable headers ([data-slot="table-sort-button"] + th[aria-sort]).
 *
 * Filtering matches row text; sorting reorders the tbody then re-applies the
 * filter+page; selection reflects into the count and the (indeterminate)
 * select-all; pagination shows one page of the filtered rows.
 */

import { claim } from './dom.ts'
import { wireTableSort } from './table.ts'

export function enhanceDataTable(root: ParentNode): void {
  for (const dt of claim(root, '[data-slot="data-table"]', 'data-table')) {
    const table = dt.querySelector<HTMLElement>('table')
    const tbody = table?.querySelector('tbody')
    if (!table || !tbody) continue
    const filter = dt.querySelector<HTMLInputElement>('[data-datatable-filter]')
    const selectAll = dt.querySelector<HTMLInputElement>('[data-datatable-select-all]')
    // The selection-summary text often lives just outside the table (as in the
    // React demo); look in the parent too.
    const countEl =
      dt.querySelector<HTMLElement>('[data-datatable-count]') ??
      dt.parentElement?.querySelector<HTMLElement>('[data-datatable-count]') ??
      null
    const pageSizeSel = dt.querySelector<HTMLSelectElement>('[data-datatable-page-size]')
    const prev = dt.querySelector<HTMLButtonElement>('[data-datatable-prev]')
    const next = dt.querySelector<HTMLButtonElement>('[data-datatable-next]')
    const pageInfo = dt.querySelector<HTMLElement>('[data-datatable-page-info]')
    // Read rows fresh each time so a sort (which reorders the DOM) flows through
    // filtering + pagination.
    const allRows = (): HTMLElement[] => Array.from(tbody.querySelectorAll<HTMLElement>(':scope > tr'))
    const rowBox = (r: HTMLElement): HTMLInputElement | null =>
      r.querySelector<HTMLInputElement>('[data-datatable-row]')
    let page = 0

    const filtered = (): HTMLElement[] => {
      const q = (filter?.value ?? '').trim().toLowerCase()
      return allRows().filter((r) => q === '' || (r.textContent ?? '').toLowerCase().includes(q))
    }
    const pageSize = (): number => Number(pageSizeSel?.value) || allRows().length

    const updateSelection = (): void => {
      const chosen = allRows().filter((r) => rowBox(r)?.checked)
      const ids = chosen.map((r) => rowBox(r)?.value ?? '')
      if (countEl) {
        countEl.textContent =
          ids.length === 0 ? 'No permits selected.' : `${ids.length} selected: ${ids.join(', ')}`
      }
      if (selectAll) {
        const f = filtered()
        const checked = f.filter((r) => rowBox(r)?.checked).length
        selectAll.checked = f.length > 0 && checked === f.length
        selectAll.indeterminate = checked > 0 && checked < f.length
        selectAll.toggleAttribute('data-indeterminate', selectAll.indeterminate)
      }
    }

    const render = (): void => {
      const f = filtered()
      const size = pageSize()
      const pages = Math.max(1, Math.ceil(f.length / size))
      page = Math.min(Math.max(0, page), pages - 1)
      const visible = new Set(f.slice(page * size, page * size + size))
      for (const r of allRows()) r.hidden = !visible.has(r)
      if (pageInfo) pageInfo.textContent = `Page ${page + 1} of ${pages}`
      if (prev) prev.disabled = page === 0
      if (next) next.disabled = page >= pages - 1
      updateSelection()
    }

    filter?.addEventListener('input', () => {
      page = 0
      render()
    })
    pageSizeSel?.addEventListener('change', () => {
      page = 0
      render()
    })
    prev?.addEventListener('click', () => {
      page -= 1
      render()
    })
    next?.addEventListener('click', () => {
      page += 1
      render()
    })
    selectAll?.addEventListener('change', () => {
      for (const r of filtered()) {
        const box = rowBox(r)
        if (box) box.checked = selectAll.checked
      }
      selectAll.indeterminate = false
      updateSelection()
    })
    for (const r of allRows()) rowBox(r)?.addEventListener('change', updateSelection)
    wireTableSort(table, render)

    render()
  }
}
