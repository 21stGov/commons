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
 *   status      <element data-datatable-status>              (polite range count)
 *   pager       <ol data-datatable-pager>                    (Pagination list; JS-rendered)
 *   plus sortable headers ([data-slot="table-sort-button"] + th[aria-sort]).
 *
 * Filtering matches row text; sorting reorders the tbody then re-applies the
 * filter+page; selection reflects into the count and the (indeterminate)
 * select-all; pagination renders the Commons `Pagination` control (previous /
 * numbered pages / next) and a polite "Showing X to Y of N" status, matching
 * the React `DataTable`.
 */

import { claim } from './dom.ts'
import { wireTableSort } from './table.ts'

const SVG_NS = 'http://www.w3.org/2000/svg'

/** One slot in a pagination range: a page number or an overflow marker. */
type RangeItem = number | 'ellipsis'

/**
 * Visible page slots: always the first, last, current, and one sibling on each
 * side; gaps collapse to an ellipsis. Mirrors the React `paginationRange` so the
 * control stays a constant width as you move through pages.
 */
function paginationRange(current: number, total: number, siblings = 1): RangeItem[] {
  if (total < 1) return []
  const clamped = Math.min(Math.max(current, 1), total)
  const maxSlots = siblings * 2 + 5
  const range = (start: number, end: number): number[] => {
    const out: number[] = []
    for (let p = start; p <= end; p += 1) out.push(p)
    return out
  }
  if (total <= maxSlots) return range(1, total)
  const left = Math.max(clamped - siblings, 1)
  const right = Math.min(clamped + siblings, total)
  const showLeft = left > 2
  const showRight = right < total - 1
  if (!showLeft && showRight) return [...range(1, maxSlots - 2), 'ellipsis', total]
  if (showLeft && !showRight) return [1, 'ellipsis', ...range(total - (maxSlots - 3), total)]
  return [1, 'ellipsis', ...range(left, right), 'ellipsis', total]
}

/** A directional chevron for the Previous/Next controls. */
function chevron(direction: 'previous' | 'next'): SVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('viewBox', '0 0 16 16')
  svg.setAttribute('fill', 'none')
  svg.setAttribute('stroke', 'currentColor')
  svg.setAttribute('stroke-width', '1.5')
  const path = document.createElementNS(SVG_NS, 'path')
  path.setAttribute('d', direction === 'previous' ? 'M10 3.5 5.5 8l4.5 4.5' : 'm6 3.5 4.5 4.5L6 12.5')
  path.setAttribute('stroke-linecap', 'round')
  path.setAttribute('stroke-linejoin', 'round')
  svg.append(path)
  return svg
}

function li(child: HTMLElement): HTMLLIElement {
  const item = document.createElement('li')
  item.className = 'cui-pagination-item'
  item.setAttribute('data-slot', 'pagination-item')
  item.append(child)
  return item
}

export function enhanceDataTable(root: ParentNode): void {
  for (const dt of claim(root, '[data-slot="data-table"]', 'data-table')) {
    const table = dt.querySelector<HTMLElement>('table')
    const tbody = table?.querySelector('tbody')
    if (!table || !tbody) continue
    const filter = dt.querySelector<HTMLInputElement>('[data-datatable-filter]')
    const selectAll = dt.querySelector<HTMLInputElement>('[data-datatable-select-all]')
    // The selection-summary text and pager often live just outside the table
    // (as in the React demo); look in the parent too.
    const scope = (sel: string): HTMLElement | null =>
      dt.querySelector<HTMLElement>(sel) ?? dt.parentElement?.querySelector<HTMLElement>(sel) ?? null
    const countEl = scope('[data-datatable-count]')
    const statusEl = scope('[data-datatable-status]')
    const pager = scope('[data-datatable-pager]')
    const pageSizeSel = dt.querySelector<HTMLSelectElement>('[data-datatable-page-size]')
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

    const goTo = (next: number, pages: number): void => {
      page = Math.min(Math.max(next, 0), pages - 1)
      render()
    }

    const renderPager = (pages: number): void => {
      if (!pager) return
      pager.textContent = ''
      const current = page + 1 // 1-based for display
      if (pages <= 1) return

      if (current > 1) {
        const prev = document.createElement('button')
        prev.type = 'button'
        prev.className = 'cui-pagination-previous cui-pagination-page--direction'
        prev.setAttribute('data-slot', 'pagination-previous')
        prev.append(chevron('previous'), document.createTextNode('Previous'))
        prev.addEventListener('click', () => goTo(page - 1, pages))
        pager.append(li(prev))
      }

      for (const item of paginationRange(current, pages)) {
        if (item === 'ellipsis') {
          const span = document.createElement('span')
          span.className = 'cui-pagination-ellipsis'
          span.setAttribute('aria-hidden', 'true')
          span.setAttribute('data-slot', 'pagination-ellipsis')
          span.textContent = '…'
          pager.append(li(span))
          continue
        }
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = 'cui-pagination-page cui-pagination-page--page'
        btn.setAttribute('data-slot', 'pagination-page')
        btn.setAttribute('aria-label', `Page ${item}`)
        btn.textContent = String(item)
        if (item === current) {
          btn.classList.add('cui-pagination-page--current')
          btn.setAttribute('aria-current', 'page')
        }
        btn.addEventListener('click', () => goTo(item - 1, pages))
        pager.append(li(btn))
      }

      if (current < pages) {
        const next = document.createElement('button')
        next.type = 'button'
        next.className = 'cui-pagination-next cui-pagination-page--direction'
        next.setAttribute('data-slot', 'pagination-next')
        next.append(document.createTextNode('Next'), chevron('next'))
        next.addEventListener('click', () => goTo(page + 1, pages))
        pager.append(li(next))
      }
    }

    const render = (): void => {
      const f = filtered()
      const size = pageSize()
      const total = f.length
      const pages = Math.max(1, Math.ceil(total / size))
      page = Math.min(Math.max(0, page), pages - 1)
      const start = page * size
      const visible = new Set(f.slice(start, start + size))
      for (const r of allRows()) r.hidden = !visible.has(r)
      if (statusEl) {
        statusEl.textContent =
          total === 0
            ? 'No results'
            : `Showing ${start + 1} to ${Math.min(start + size, total)} of ${total} results`
      }
      renderPager(pages)
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
