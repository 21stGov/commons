// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { SearchIcon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
  paginationRange,
} from '@/components/ui/pagination'
import { Select } from '@/components/ui/select'
import { Table, type TableSortDirection } from '@/components/ui/table'
import { cn } from '@/lib/cn'

// ---------------------------------------------------------------------------
// Native table, driven by column defs — not an ARIA grid
// ---------------------------------------------------------------------------
//
// DataTable is a thin, self-contained orchestration layer over the Commons
// primitives (`Table`, `Checkbox`, `Input`, `Select`, `Pagination`, `Icon`).
// It stays a REAL semantic `<table>`: `<caption>`, `<thead>`, `<tbody>`,
// `<th scope>`, `<td>`. Browsers and screen readers give native tables their
// full contract (row/column relationships, header association, row/column
// counts) for free — we add sorting, selection, filtering, and paging around
// that contract without ever replacing it with `role="grid"`.
//
// Everything is controlled OR uncontrolled: sort, selection, filter text, and
// page each accept a `value`/`default…`/`on…Change` triple, so the table can
// drive itself (client-side) or defer to server state (pass `pageCount` for
// server-side paging). No third-party table engine — the transforms are a few
// pure functions below.

// ---------------------------------------------------------------------------
// Controllable state (mirrors the pattern used across Commons)
// ---------------------------------------------------------------------------

function useControllableState<T>(
  controlled: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void
): [T, (next: T) => void] {
  const isControlled = controlled !== undefined
  const [uncontrolled, setUncontrolled] = React.useState<T>(defaultValue)
  const value = isControlled ? (controlled as T) : uncontrolled
  const setValue = React.useCallback(
    (next: T) => {
      if (!isControlled) {
        setUncontrolled(next)
      }
      onChange?.(next)
    },
    [isControlled, onChange]
  )
  return [value, setValue]
}

// ---------------------------------------------------------------------------
// Column + sort types
// ---------------------------------------------------------------------------

/** Text alignment for a column, applied with logical props so it flips in RTL. */
export type DataTableAlign = 'start' | 'center' | 'end'

/**
 * One column definition. Provide EITHER `accessorKey` (a key of the row) or
 * `accessor` (a function) to read the cell value; `cell` then formats it for
 * display. `sortValue` supplies the primitive used for sorting/filtering when
 * the raw value is not directly comparable (e.g. a Date rendered as a string).
 */
export interface DataTableColumn<T> {
  /** Stable identifier — used for sort state, React keys, and the select payload. */
  id: string
  /** Visible column header (also the stacked-card label when it is a string). */
  header: React.ReactNode
  /** Read the cell value from a row by key. Ignored when `accessor` is set. */
  accessorKey?: keyof T
  /** Read the cell value from a row by function. Wins over `accessorKey`. */
  accessor?: (row: T) => unknown
  /** Format the value for display. Defaults to rendering the raw value. */
  cell?: (value: unknown, row: T) => React.ReactNode
  /**
   * Value used for sorting and global filtering. Defaults to the accessor
   * value coerced to a string/number. Override for dates, statuses, etc.
   */
  sortValue?: (row: T) => string | number
  /** Make this column sortable (renders an `aria-sort` header button). */
  sortable?: boolean
  /** Cell text alignment (logical — flips in RTL). @default "start" */
  align?: DataTableAlign
  /** Extra classes merged onto every `<td>`/`<th>` in this column. */
  className?: string
  /**
   * Plain-text label shown beside the value in stacked (card) mode. Falls
   * back to `header` when it is a string. Required if `header` is a node and
   * the table is `stacked`.
   */
  headerLabel?: string
}

/** Current sort: a column id + direction, or `null` for the natural order. */
export interface DataTableSort {
  columnId: string
  direction: 'ascending' | 'descending'
}

// ---------------------------------------------------------------------------
// Alignment variant
// ---------------------------------------------------------------------------

export const dataTableCellVariants = cva('', {
  variants: {
    align: {
      start: 'text-start',
      center: 'text-center',
      end: 'text-end',
    },
  },
  defaultVariants: {
    align: 'start',
  },
})

type CellCvaProps = VariantProps<typeof dataTableCellVariants>

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

function readValue<T>(column: DataTableColumn<T>, row: T): unknown {
  if (column.accessor) {
    return column.accessor(row)
  }
  if (column.accessorKey != null) {
    return row[column.accessorKey]
  }
  return undefined
}

function comparableValue<T>(column: DataTableColumn<T>, row: T): string | number {
  if (column.sortValue) {
    return column.sortValue(row)
  }
  const raw = readValue(column, row)
  if (typeof raw === 'number') {
    return raw
  }
  return raw == null ? '' : String(raw)
}

function headerLabelOf<T>(column: DataTableColumn<T>): string {
  if (column.headerLabel != null) {
    return column.headerLabel
  }
  return typeof column.header === 'string' ? column.header : ''
}

/** Maps a `DataTableSort` for `columnId` to the `aria-sort` token value. */
function ariaSortOf(sort: DataTableSort | null, columnId: string): TableSortDirection {
  if (sort == null || sort.columnId !== columnId) {
    return 'none'
  }
  return sort.direction
}

/** Tri-state toggle: none → ascending → descending → none. */
function nextSort(sort: DataTableSort | null, columnId: string): DataTableSort | null {
  if (sort == null || sort.columnId !== columnId) {
    return { columnId, direction: 'ascending' }
  }
  if (sort.direction === 'ascending') {
    return { columnId, direction: 'descending' }
  }
  return null
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface DataTableProps<T> {
  /** Column definitions, left to right (before the optional selection column). */
  columns: ReadonlyArray<DataTableColumn<T>>
  /** The rows to display. */
  data: readonly T[]
  /**
   * Caption text — the table's accessible name. REQUIRED (WCAG 1.3.1);
   * translation-ready.
   */
  caption: string
  /**
   * Stable id for a row, used as the selection key and React key. Defaults to
   * the row index (fine for static data; supply a real id for sortable +
   * selectable data so selection survives reordering).
   */
  getRowId?: (row: T, index: number) => string

  // --- Sorting ---
  /** Controlled sort state. */
  sort?: DataTableSort | null
  /** Initial sort for uncontrolled usage. @default null */
  defaultSort?: DataTableSort | null
  /** Called with the next sort state (or `null` when cleared). */
  onSortChange?: (sort: DataTableSort | null) => void

  // --- Selection ---
  /** Render a leading checkbox column for per-row + select-all selection. */
  selectable?: boolean
  /** Controlled selected row ids. */
  selectedIds?: readonly string[]
  /** Initial selection for uncontrolled usage. @default [] */
  defaultSelectedIds?: readonly string[]
  /** Called with the next selected id list. */
  onSelectionChange?: (ids: string[]) => void
  /** Accessible name for the header select-all checkbox. @default "Select all rows" */
  selectAllLabel?: string
  /** Accessible name for a row's checkbox. Defaults to the row's first cell value. */
  rowSelectLabel?: (row: T, index: number) => string

  // --- Filtering ---
  /** Show a global text filter over every column's value. */
  filterable?: boolean
  /** Controlled filter query. */
  filterValue?: string
  /** Initial filter query for uncontrolled usage. @default "" */
  defaultFilterValue?: string
  /** Called with the next filter query. */
  onFilterChange?: (value: string) => void
  /** Placeholder for the filter input. @default "Filter results" */
  filterPlaceholder?: string
  /** Accessible name for the filter input. @default "Filter table" */
  filterLabel?: string

  // --- Pagination ---
  /**
   * Rows per page (controlled). Enables client-side paging. Omit this and
   * `defaultPageSize` and `pageCount` to render every row without pagination.
   */
  pageSize?: number
  /** Initial rows per page for uncontrolled paging (with a page-size selector). */
  defaultPageSize?: number
  /** Controlled current page (1-based). */
  page?: number
  /** Initial page for uncontrolled usage. @default 1 */
  defaultPage?: number
  /** Called with the next page number. */
  onPageChange?: (page: number) => void
  /**
   * Total page count for SERVER-SIDE paging. When set, `data` is treated as a
   * single already-paged slice (rows are not sliced locally) and this is the
   * page total. Client-side paging computes this from `pageSize` instead.
   */
  pageCount?: number
  /** Total row count for server-side paging (used only in the status text). */
  rowCount?: number
  /** Options for a page-size `<Select>`. Omit to hide the selector. */
  pageSizeOptions?: readonly number[]
  /** Called when the page-size selector changes. */
  onPageSizeChange?: (size: number) => void
  /** Accessible name for the pagination landmark. @default "Table pages" */
  paginationLabel?: string

  // --- Presentation ---
  /**
   * Reflow each row into a labelled card below the `sm` breakpoint so narrow
   * viewports never force horizontal scrolling as the only option. Desktop
   * stays a real `<table>`. @default true
   */
  stacked?: boolean
  /** Zebra-stripe body rows (decorative). */
  striped?: boolean
  /** Cell density. @default "comfortable" */
  density?: 'comfortable' | 'compact'
  /** Table border treatment. @default "bordered" */
  variant?: 'bordered' | 'borderless'
  /** Text shown (and announced) when there are no rows to display. @default "No results" */
  emptyText?: string
  /** Class merged onto the outer wrapper. */
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A column-driven, accessible data table. Composes the Commons `Table` (a real
 * semantic table, never an ARIA grid) with optional sorting, row selection,
 * global filtering, and pagination — all controlled or uncontrolled — plus a
 * responsive stacked-card fallback.
 *
 * Accessibility contract:
 * - **Sorting** is a `<button>` inside `<th aria-sort>`; state is conveyed to
 *   assistive tech via `aria-sort` and visually by a non-color direction glyph.
 *   Activating a header cycles none → ascending → descending → none.
 * - **Selection** uses the Commons `Checkbox`: a header select-all (mixed/
 *   indeterminate when the page is partially selected) plus a per-row box, each
 *   with an accessible name referencing its row.
 * - **Filtering** is a labelled `Input`; the result count is announced in a
 *   polite live region.
 * - **Empty state** ("No results") is a full-width caption cell, announced.
 * - Every control is a real focusable element with a 44px target; nothing is
 *   conveyed by color alone (borders + glyphs + position survive forced-colors
 *   mode); alignment uses logical `text-*` so it flips in RTL.
 *
 * Per-column filtering is intentionally left as an extension: give each column
 * a `sortValue` and filter `data` yourself, then pass the filtered rows in with
 * `filterable={false}` (or drive `filterValue` and do the matching upstream).
 */
export function DataTable<T>({
  columns,
  data,
  caption,
  getRowId,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  selectable = false,
  selectedIds: selectedIdsProp,
  defaultSelectedIds,
  onSelectionChange,
  selectAllLabel = 'Select all rows',
  rowSelectLabel,
  filterable = false,
  filterValue: filterValueProp,
  defaultFilterValue = '',
  onFilterChange,
  filterPlaceholder = 'Filter results',
  filterLabel = 'Filter table',
  pageSize,
  defaultPageSize,
  page: pageProp,
  defaultPage = 1,
  onPageChange,
  pageCount,
  rowCount,
  pageSizeOptions,
  onPageSizeChange,
  paginationLabel = 'Table pages',
  stacked = true,
  striped = false,
  density = 'comfortable',
  variant = 'bordered',
  emptyText = 'No results',
  className,
}: DataTableProps<T>): React.JSX.Element {
  const resolveRowId = React.useCallback(
    (row: T, index: number): string => (getRowId ? getRowId(row, index) : String(index)),
    [getRowId]
  )

  const [sort, setSort] = useControllableState<DataTableSort | null>(
    sortProp,
    defaultSort,
    onSortChange
  )
  const [selectedIds, setSelectedIds] = useControllableState<readonly string[]>(
    selectedIdsProp,
    defaultSelectedIds ?? [],
    (next) => onSelectionChange?.([...next])
  )
  const [filterValue, setFilterValue] = useControllableState<string>(
    filterValueProp,
    defaultFilterValue,
    onFilterChange
  )
  const [page, setPage] = useControllableState<number>(pageProp, defaultPage, onPageChange)
  const [activePageSize, setActivePageSize] = useControllableState<number | undefined>(
    pageSize,
    defaultPageSize,
    (next) => {
      if (next != null) {
        onPageSizeChange?.(next)
      }
    }
  )

  const manualPaging = pageCount != null
  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds])
  const statusId = React.useId()

  // --- Transform pipeline: filter → sort → paginate -----------------------

  const columnById = React.useMemo(() => {
    const map = new Map<string, DataTableColumn<T>>()
    for (const column of columns) {
      map.set(column.id, column)
    }
    return map
  }, [columns])

  const filteredRows = React.useMemo(() => {
    if (!filterable || filterValue.trim() === '') {
      return data as readonly T[]
    }
    const query = filterValue.trim().toLowerCase()
    return (data as readonly T[]).filter((row) =>
      columns.some((column) => String(comparableValue(column, row)).toLowerCase().includes(query))
    )
  }, [data, columns, filterable, filterValue])

  const sortedRows = React.useMemo(() => {
    if (sort == null) {
      return filteredRows
    }
    const column = columnById.get(sort.columnId)
    if (column == null) {
      return filteredRows
    }
    const factor = sort.direction === 'ascending' ? 1 : -1
    // Copy first: Array.prototype.sort mutates in place.
    return [...filteredRows].sort((a, b) => {
      const av = comparableValue(column, a)
      const bv = comparableValue(column, b)
      if (typeof av === 'number' && typeof bv === 'number') {
        return (av - bv) * factor
      }
      return String(av).localeCompare(String(bv)) * factor
    })
  }, [filteredRows, sort, columnById])

  const totalRows = manualPaging ? (rowCount ?? sortedRows.length) : sortedRows.length
  const totalPages = manualPaging
    ? Math.max(1, pageCount ?? 1)
    : activePageSize
      ? Math.max(1, Math.ceil(sortedRows.length / activePageSize))
      : 1
  const currentPage = Math.min(Math.max(page, 1), totalPages)

  const pageRows = React.useMemo(() => {
    if (manualPaging || activePageSize == null) {
      return sortedRows
    }
    const start = (currentPage - 1) * activePageSize
    return sortedRows.slice(start, start + activePageSize)
  }, [sortedRows, manualPaging, activePageSize, currentPage])

  const pageRowIds = React.useMemo(
    () => pageRows.map((row, index) => resolveRowId(row, index)),
    [pageRows, resolveRowId]
  )

  // --- Selection (scoped to the visible page) -----------------------------

  const selectedOnPage = pageRowIds.filter((id) => selectedSet.has(id)).length
  const allPageSelected = pageRowIds.length > 0 && selectedOnPage === pageRowIds.length
  const somePageSelected = selectedOnPage > 0 && !allPageSelected

  const toggleRow = React.useCallback(
    (id: string, checked: boolean) => {
      const next = new Set(selectedSet)
      if (checked) {
        next.add(id)
      } else {
        next.delete(id)
      }
      setSelectedIds([...next])
    },
    [selectedSet, setSelectedIds]
  )

  const toggleAllOnPage = React.useCallback(
    (checked: boolean) => {
      const next = new Set(selectedSet)
      for (const id of pageRowIds) {
        if (checked) {
          next.add(id)
        } else {
          next.delete(id)
        }
      }
      setSelectedIds([...next])
    },
    [selectedSet, pageRowIds, setSelectedIds]
  )

  // --- Handlers -----------------------------------------------------------

  const handleSort = React.useCallback(
    (columnId: string) => {
      setSort(nextSort(sort, columnId))
    },
    [sort, setSort]
  )

  const goToPage = React.useCallback(
    (next: number) => {
      setPage(Math.min(Math.max(next, 1), totalPages))
    },
    [setPage, totalPages]
  )

  const handleFilter = React.useCallback(
    (value: string) => {
      setFilterValue(value)
      // Any new query invalidates the current page offset.
      if (!manualPaging) {
        setPage(1)
      }
    },
    [setFilterValue, setPage, manualPaging]
  )

  const handlePageSize = React.useCallback(
    (size: number) => {
      setActivePageSize(size)
      if (!manualPaging) {
        setPage(1)
      }
    },
    [setActivePageSize, setPage, manualPaging]
  )

  // --- Derived UI bits ----------------------------------------------------

  const totalColumnCount = columns.length + (selectable ? 1 : 0)
  const showPagination = totalPages > 1
  const showToolbar = filterable || (pageSizeOptions != null && pageSizeOptions.length > 0)

  const rangeStart = totalRows === 0 ? 0 : (currentPage - 1) * (activePageSize ?? totalRows) + 1
  const rangeEnd = manualPaging
    ? Math.min(rangeStart + pageRows.length - 1, totalRows)
    : Math.min(currentPage * (activePageSize ?? totalRows), totalRows)

  const statusText =
    totalRows === 0
      ? emptyText
      : activePageSize != null || manualPaging
        ? `Showing ${rangeStart} to ${rangeEnd} of ${totalRows} results`
        : `${totalRows} ${totalRows === 1 ? 'result' : 'results'}`

  return (
    <div data-slot="data-table" className={cn('flex flex-col gap-2', className)}>
      {showToolbar ? (
        <div
          data-slot="data-table-toolbar"
          className="flex flex-wrap items-end justify-between gap-2"
        >
          {filterable ? (
            <div data-slot="data-table-filter" className="w-full max-w-xs">
              <Input
                type="search"
                value={filterValue}
                onChange={(event) => handleFilter(event.target.value)}
                placeholder={filterPlaceholder}
                aria-label={filterLabel}
                aria-controls={statusId}
                prefix={<SearchIcon />}
              />
            </div>
          ) : (
            // Keep the page-size control pinned to the inline end even without
            // a filter.
            <span />
          )}

          {pageSizeOptions != null && pageSizeOptions.length > 0 ? (
            <label
              data-slot="data-table-page-size"
              className="flex items-center gap-105 text-sm text-foreground"
            >
              <span>Rows per page</span>
              <Select
                size="sm"
                value={activePageSize != null ? String(activePageSize) : undefined}
                onChange={(event) => handlePageSize(Number(event.target.value))}
                wrapperClassName="w-auto"
                className="w-auto"
                aria-label="Rows per page"
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </label>
          ) : null}
        </div>
      ) : null}

      <Table
        caption={caption}
        stacked={stacked}
        striped={striped}
        density={density}
        variant={variant}
      >
        <Table.Head>
          <Table.Row>
            {selectable ? (
              <Table.HeaderCell scope="col" className="w-px align-middle">
                <Checkbox
                  checked={allPageSelected}
                  indeterminate={somePageSelected}
                  onChange={(event) => toggleAllOnPage(event.target.checked)}
                  label={<span className="sr-only">{selectAllLabel}</span>}
                />
              </Table.HeaderCell>
            ) : null}
            {columns.map((column) => {
              const isSortable = column.sortable === true
              const alignClass = dataTableCellVariants({ align: column.align ?? 'start' })
              if (isSortable) {
                return (
                  <Table.HeaderCell
                    key={column.id}
                    scope="col"
                    sortable
                    sortDirection={ariaSortOf(sort, column.id)}
                    onSort={() => handleSort(column.id)}
                    className={cn(alignClass, column.className)}
                  >
                    {column.header}
                  </Table.HeaderCell>
                )
              }
              return (
                <Table.HeaderCell
                  key={column.id}
                  scope="col"
                  className={cn(alignClass, column.className)}
                >
                  {column.header}
                </Table.HeaderCell>
              )
            })}
          </Table.Row>
        </Table.Head>

        <Table.Body>
          {pageRows.length === 0 ? (
            <Table.Row>
              <Table.Cell
                colSpan={totalColumnCount}
                label={emptyText}
                className="py-105 text-center text-muted-foreground"
              >
                {emptyText}
              </Table.Cell>
            </Table.Row>
          ) : (
            pageRows.map((row, index) => {
              const rowId = pageRowIds[index]
              const isSelected = selectedSet.has(rowId)
              const rowLabel =
                rowSelectLabel?.(row, index) ??
                (columns.length > 0
                  ? `Select ${String(comparableValue(columns[0], row))}`
                  : `Select row ${index + 1}`)
              return (
                <Table.Row key={rowId} data-selected={isSelected || undefined}>
                  {selectable ? (
                    <Table.Cell label={selectAllLabel} className="w-px align-middle">
                      <Checkbox
                        checked={isSelected}
                        onChange={(event) => toggleRow(rowId, event.target.checked)}
                        label={<span className="sr-only">{rowLabel}</span>}
                      />
                    </Table.Cell>
                  ) : null}
                  {columns.map((column) => {
                    const value = readValue(column, row)
                    const content = column.cell ? column.cell(value, row) : (value as React.ReactNode)
                    return (
                      <Table.Cell
                        key={column.id}
                        label={headerLabelOf(column)}
                        className={cn(
                          dataTableCellVariants({ align: column.align ?? 'start' }),
                          column.className
                        )}
                      >
                        {content}
                      </Table.Cell>
                    )
                  })}
                </Table.Row>
              )
            })
          )}
        </Table.Body>
      </Table>

      {/* Polite status: announces the current result/range count after a
          filter or page change without stealing focus. */}
      <div
        id={statusId}
        data-slot="data-table-status"
        aria-live="polite"
        aria-atomic="true"
        className="text-sm text-muted-foreground"
      >
        {statusText}
      </div>

      {showPagination ? (
        <Pagination label={paginationLabel} data-slot="data-table-pagination">
          <PaginationList>
            {currentPage > 1 ? (
              <PaginationItem>
                <PaginationPrevious onClick={() => goToPage(currentPage - 1)} />
              </PaginationItem>
            ) : null}
            {paginationRange(currentPage, totalPages).map((item, index) =>
              item === 'ellipsis' ? (
                // eslint-disable-next-line react/no-array-index-key -- ellipsis has no stable id
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <PaginationPage
                    current={item === currentPage}
                    aria-label={`Page ${item}`}
                    onClick={() => goToPage(item)}
                  >
                    {item}
                  </PaginationPage>
                </PaginationItem>
              )
            )}
            {currentPage < totalPages ? (
              <PaginationItem>
                <PaginationNext onClick={() => goToPage(currentPage + 1)} />
              </PaginationItem>
            ) : null}
          </PaginationList>
        </Pagination>
      ) : null}
    </div>
  )
}
