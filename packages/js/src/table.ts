// SPDX-License-Identifier: MIT

/**
 * Sortable table behavior.
 *
 * Contract (works on the component's own markup):
 *   a `<th aria-sort>` with a `[data-slot="table-sort-button"]` inside marks a
 *   sortable column. Clicking cycles ascending → descending, updates aria-sort
 *   (clearing the others), and reorders the `<tbody>` rows by that column —
 *   numeric when both cells parse as numbers, otherwise locale string compare
 *   (ISO dates sort correctly as strings).
 */

import { all, claim } from './dom.ts'

export function cellValue(row: HTMLElement, index: number): string {
  const cell = row.children[index]
  // A cell may carry an explicit sort key (e.g. an ISO date behind a formatted
  // "Jan 5, 2026"); otherwise sort by its visible text.
  return (cell?.getAttribute('data-sort-value') ?? cell?.textContent ?? '').trim()
}

/** Parse a wholly-numeric value (allowing $, %, thousands commas); else NaN. */
function asNumber(s: string): number {
  const t = s.replace(/[$,%\s]/g, '')
  return /^-?\d*\.?\d+$/.test(t) ? Number(t) : NaN
}

export function compareCells(a: string, b: string): number {
  const na = asNumber(a)
  const nb = asNumber(b)
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb
  // IDs like "BP-1026" and ISO dates sort correctly as numeric-aware strings.
  return a.localeCompare(b, undefined, { numeric: true })
}

/**
 * Wire the sortable headers of one table. `onSort` (optional) runs after the
 * rows are reordered — the data table uses it to re-apply filter/pagination.
 */
export function wireTableSort(table: HTMLElement, onSort?: () => void): void {
  const tbody = table.querySelector('tbody')
  if (!tbody) return
  const headers = all<HTMLElement>(table, 'th[aria-sort]')
  for (const button of all<HTMLElement>(table, '[data-slot="table-sort-button"]')) {
    const th = button.closest('th')
    if (!th) continue
    const colIndex = Array.from(th.parentElement?.children ?? []).indexOf(th)
    button.addEventListener('click', () => {
      const dir = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending'
      for (const other of headers) other.setAttribute('aria-sort', other === th ? dir : 'none')
      const rows = Array.from(tbody.querySelectorAll<HTMLElement>(':scope > tr'))
      rows.sort((a, b) => {
        const cmp = compareCells(cellValue(a, colIndex), cellValue(b, colIndex))
        return dir === 'ascending' ? cmp : -cmp
      })
      for (const row of rows) tbody.appendChild(row)
      onSort?.()
    })
  }
}

export function enhanceTable(root: ParentNode): void {
  for (const table of claim(root, 'table', 'table-sort')) {
    // Tables inside a data table are wired by enhanceDataTable (sort re-applies
    // its filter/pagination); skip them here.
    if (table.closest('[data-slot="data-table"]')) continue
    wireTableSort(table)
  }
}
