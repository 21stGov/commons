// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/cn'

// Minimal ambient typing so the dev-only guard compiles without
// @types/node. Bundlers statically replace `process.env.NODE_ENV`.
declare const process: { env: { NODE_ENV?: string | undefined } } | undefined

// ---------------------------------------------------------------------------
// Native semantics, not an ARIA grid
// ---------------------------------------------------------------------------
//
// This is a STATIC DATA TABLE: a real semantic `<table>` with `<caption>`,
// `<thead>`, `<tbody>`, `<tr>`, `<th scope>`, and `<td>`. Browsers and screen
// readers already give native tables their full contract — row/column
// relationships, header association via `scope`, and column-count/row-count
// announcements — for free. We add nothing that would override that.
//
// A `role="grid"`/`role="treegrid"` widget is a DIFFERENT thing: a fully
// interactive, keyboard-navigable data grid (arrow-key cell navigation,
// roving tabindex, editable cells) governed by the ARIA APG Grid pattern.
// That is a separate, future component. Do not reach for ARIA grid roles to
// display tabular data — a native table is more accessible and less code.
//
// The only interactivity here is optional per-column sorting, which is a
// native `<button>` inside a `<th aria-sort>` — sorting the data stays the
// consumer's job (`onSort` + `sortColumn`/`sortDirection`), the component owns
// only the `aria-sort` state, the button, and the direction icon.

// ---------------------------------------------------------------------------
// Context: density + variant flow to cells; caption id labels the scroll
// region and lets the dev-warn guard find the caption.
// ---------------------------------------------------------------------------

type TableDensity = 'comfortable' | 'compact'
type TableVariant = 'bordered' | 'borderless'

interface TableContextValue {
  density: TableDensity
  variant: TableVariant
  /** Id applied to the caption so the scroll region can be labelled by it. */
  captionId: string
}

const TableContext = React.createContext<TableContextValue | null>(null)

function useTableContext(): TableContextValue {
  const ctx = React.useContext(TableContext)
  if (ctx == null) {
    // Cells rendered outside <Table> still work standalone with sane
    // defaults; they just don't inherit density/variant.
    return { density: 'comfortable', variant: 'bordered', captionId: '' }
  }
  return ctx
}

// ---------------------------------------------------------------------------
// Table root
// ---------------------------------------------------------------------------

export const tableVariants = cva(
  // Real table, full width, rem-only type, logical alignment throughout.
  ['w-full border-collapse text-start text-sm text-foreground'],
  {
    variants: {
      variant: {
        // Full grid: a border on every cell plus an outer frame. The frame
        // also guarantees a boundary in forced-colors mode.
        bordered:
          'border border-border [&_th]:border [&_th]:border-border [&_td]:border [&_td]:border-border',
        // Minimal: no cell borders. Structure comes from the header underline
        // (below) and thin row dividers — never from color alone.
        borderless: '[&_tbody_tr]:border-b [&_tbody_tr]:border-border',
      },
      striped: {
        // Zebra rows are decorative; every row stays legible without them.
        true: '[&_tbody_tr:nth-child(even)]:bg-muted',
        false: '',
      },
      stacked: {
        // Below the `sm` breakpoint each row reflows into a labelled card.
        // The DOM stays a real <table> — only CSS `display` changes — so
        // `scope` header associations survive. `<thead>` is visually hidden
        // (sr-only, not `hidden`) so it stays in the accessibility tree while
        // each cell shows its column name via `data-label`. Each <td> must
        // therefore carry a `label` (see TableCell).
        true: [
          'max-sm:block',
          'max-sm:[&_thead]:sr-only',
          'max-sm:[&_tbody]:block',
          'max-sm:[&_tr]:mb-2 max-sm:[&_tr]:block max-sm:[&_tr]:rounded-md max-sm:[&_tr]:border max-sm:[&_tr]:border-border',
          'max-sm:[&_td]:flex max-sm:[&_td]:items-baseline max-sm:[&_td]:justify-between max-sm:[&_td]:gap-2 max-sm:[&_td]:text-end',
          "max-sm:[&_td]:before:me-2 max-sm:[&_td]:before:text-start max-sm:[&_td]:before:font-semibold max-sm:[&_td]:before:text-foreground max-sm:[&_td]:before:content-[attr(data-label)]",
        ],
        false: '',
      },
    },
    defaultVariants: {
      variant: 'bordered',
      striped: false,
      stacked: false,
    },
  }
)

type TableCvaProps = VariantProps<typeof tableVariants>

export interface TableProps
  extends Omit<React.TableHTMLAttributes<HTMLTableElement>, 'className'>,
    Omit<TableCvaProps, 'striped' | 'stacked'> {
  /** Class names merged onto the `<table>` element. */
  className?: string
  /**
   * Visual density of every cell. `comfortable` is roomier; `compact`
   * tightens padding for dense data.
   * @default "comfortable"
   */
  density?: TableDensity
  /** Zebra-stripe body rows (decorative — rows stay readable without it). */
  striped?: boolean
  /**
   * Reflow each row into a labelled card below the `sm` breakpoint. Each
   * `TableCell` must supply a `label` so the stacked card can show the
   * column name. Desktop stays a real `<table>`.
   */
  stacked?: boolean
  /**
   * Caption text. REQUIRED for accessibility unless you render
   * `<Table.Caption>` yourself. A table with no caption is a dev-time
   * warning. Translation-ready: pass a localized string.
   */
  caption?: string
  /** Class names for the focusable scroll region wrapping the table. */
  containerClassName?: string
}

/**
 * A static, semantic data table. Renders a native `<table>` wrapped in a
 * horizontally scrollable, focusable region so keyboard-only users can reach
 * overflowing columns (WCAG 2.1.1) and the region is labelled by the caption.
 *
 * Compose with `Table.Head`/`Table.Body`/`Table.Row`/`Table.HeaderCell`/
 * `Table.Cell` (or the standalone `TableHead` … exports). Supply a caption via
 * the `caption` prop or a `<Table.Caption>` child — one is required.
 */
export const Table = React.forwardRef<HTMLTableElement, TableProps>(function Table(
  {
    className,
    containerClassName,
    variant = 'bordered',
    density = 'comfortable',
    striped = false,
    stacked = false,
    caption,
    children,
    ...props
  },
  ref
) {
  const captionId = React.useId()
  const innerRef = React.useRef<HTMLTableElement | null>(null)
  const warnedRef = React.useRef(false)

  // Dev-only guard: a data table must have a caption (WCAG 1.3.1 / native
  // table name). Checked against the rendered DOM so it covers the `caption`
  // prop, a `<Table.Caption>` child, or a hand-written `<caption>`.
  React.useEffect(() => {
    if (
      (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') ||
      warnedRef.current
    ) {
      return
    }
    const node = innerRef.current
    if (!node) {
      return
    }
    const captionEl = node.querySelector(':scope > caption')
    const hasCaption = captionEl != null && (captionEl.textContent ?? '').trim().length > 0
    if (!hasCaption) {
      warnedRef.current = true
      console.warn(
        '[commons] <Table> has no caption. A data table must name itself for ' +
          'screen readers — pass the `caption` prop or render <Table.Caption>.'
      )
    }
  })

  const resolvedVariant: TableVariant = variant ?? 'bordered'
  const contextValue = React.useMemo<TableContextValue>(
    () => ({ density, variant: resolvedVariant, captionId }),
    [density, resolvedVariant, captionId]
  )

  return (
    <div
      role="region"
      aria-labelledby={captionId}
      tabIndex={0}
      data-slot="table-scroll-region"
      className={cn(
        'w-full overflow-x-auto',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        containerClassName
      )}
    >
      <TableContext.Provider value={contextValue}>
        <table
          {...props}
          ref={(node) => {
            innerRef.current = node
            if (typeof ref === 'function') {
              ref(node)
            } else if (ref) {
              ref.current = node
            }
          }}
          data-slot="table"
          className={cn(tableVariants({ variant, striped, stacked }), className)}
        >
          {caption != null ? <TableCaption>{caption}</TableCaption> : null}
          {children}
        </table>
      </TableContext.Provider>
    </div>
  )
}) as React.ForwardRefExoticComponent<
  TableProps & React.RefAttributes<HTMLTableElement>
> & {
  Caption: typeof TableCaption
  Head: typeof TableHead
  Body: typeof TableBody
  Row: typeof TableRow
  HeaderCell: typeof TableHeaderCell
  Cell: typeof TableCell
}

// ---------------------------------------------------------------------------
// Caption
// ---------------------------------------------------------------------------

export interface TableCaptionProps
  extends React.HTMLAttributes<HTMLTableCaptionElement> {}

/**
 * The table's accessible name and description. Renders a native `<caption>`
 * (the first child of `<table>`) and carries the id the scroll region is
 * labelled by. Use either this or the `caption` prop — one is required.
 */
export const TableCaption = React.forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  function TableCaption({ className, id, ...props }, ref) {
    const { captionId } = useTableContext()
    return (
      <caption
        {...props}
        ref={ref}
        id={id ?? captionId}
        data-slot="table-caption"
        className={cn('px-105 py-105 text-start text-sm text-muted-foreground', className)}
      />
    )
  }
)

// ---------------------------------------------------------------------------
// Sections + rows
// ---------------------------------------------------------------------------

export interface TableHeadProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

/** The `<thead>` grouping the column-header row(s). */
export const TableHead = React.forwardRef<HTMLTableSectionElement, TableHeadProps>(
  function TableHead({ className, ...props }, ref) {
    return (
      <thead
        {...props}
        ref={ref}
        data-slot="table-head"
        className={cn('[&_th]:border-b-2 [&_th]:border-border-strong', className)}
      />
    )
  }
)

export interface TableBodyProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

/** The `<tbody>` grouping the data rows. */
export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  function TableBody({ className, ...props }, ref) {
    return <tbody {...props} ref={ref} data-slot="table-body" className={cn(className)} />
  }
)

export interface TableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {}

/** A `<tr>`. */
export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  function TableRow({ className, ...props }, ref) {
    return <tr {...props} ref={ref} data-slot="table-row" className={cn(className)} />
  }
)

// ---------------------------------------------------------------------------
// Cells
// ---------------------------------------------------------------------------

const cellPadding: Record<TableDensity, string> = {
  comfortable: 'px-2 py-105',
  compact: 'px-105 py-05',
}

/** Sort direction, matching the `aria-sort` token values. */
export type TableSortDirection = 'ascending' | 'descending' | 'none'

export interface TableHeaderCellProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /**
   * Header direction. `col` (default) heads a column; `row` heads a row —
   * pass `scope="row"` on the first cell of each row for two-axis tables.
   * @default "col"
   */
  scope?: 'col' | 'row'
  /**
   * Make this column sortable. Renders a full-width `<button>` inside the
   * `<th>` and exposes `aria-sort`. Sorting the data stays the consumer's job.
   */
  sortable?: boolean
  /**
   * Current sort state of a `sortable` column. Drives `aria-sort` (conveyed
   * to assistive tech, non-color) and the direction icon.
   * @default "none"
   */
  sortDirection?: TableSortDirection
  /** Called when a `sortable` header button is activated. */
  onSort?: () => void
}

/** Up/down direction indicator. Decorative — `aria-sort` conveys state to AT. */
function SortIcon({ direction }: { direction: TableSortDirection }): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="size-[1em] shrink-0"
    >
      <path
        d="M6 2.5 9 6H3z"
        fill="currentColor"
        stroke="none"
        className={direction === 'ascending' ? 'opacity-100' : 'opacity-30'}
      />
      <path
        d="M6 13.5 3 10h6z"
        fill="currentColor"
        stroke="none"
        className={direction === 'descending' ? 'opacity-100' : 'opacity-30'}
      />
    </svg>
  )
}

/**
 * A header cell (`<th>`). Defaults to `scope="col"`; pass `scope="row"` for
 * row headers. When `sortable`, renders a 44px-tall full-width `<button>` and
 * reflects sort state through `aria-sort` plus a non-color direction icon.
 */
export const TableHeaderCell = React.forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  function TableHeaderCell(
    { className, scope = 'col', sortable = false, sortDirection = 'none', onSort, children, ...props },
    ref
  ) {
    const { density } = useTableContext()
    const padding = cellPadding[density]

    if (sortable) {
      return (
        <th
          {...props}
          ref={ref}
          scope={scope}
          aria-sort={sortDirection}
          data-slot="table-header-cell"
          className={cn('p-0 text-start align-middle font-semibold', className)}
        >
          <button
            type="button"
            onClick={onSort}
            data-slot="table-sort-button"
            className={cn(
              'flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 text-start',
              'font-semibold underline-offset-2 hover:underline',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              padding
            )}
          >
            <span>{children}</span>
            <SortIcon direction={sortDirection} />
          </button>
        </th>
      )
    }

    // Non-sortable header: wrap the label in the SAME min-h-11 + padding +
    // items-center line-box the sortable header's <button> uses, so every
    // header cell in the row centers its text at the same baseline whether or
    // not the column is sortable. The <th> itself goes p-0 (like the sortable
    // one) so the inner box owns the padding.
    return (
      <th
        {...props}
        ref={ref}
        scope={scope}
        data-slot="table-header-cell"
        className={cn('p-0 text-start align-middle font-semibold', className)}
      >
        <span
          data-slot="table-header-cell-content"
          className={cn('flex min-h-11 w-full items-center text-start', padding)}
        >
          {children}
        </span>
      </th>
    )
  }
)

export interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /**
   * Column name shown beside the value in stacked (card) mode. Required for
   * every cell when the table uses `stacked`; sets `data-label`, which the
   * stacked CSS surfaces via `::before`. Ignored in desktop layout.
   */
  label?: string
}

/** A data cell (`<td>`). Supply `label` when the table is `stacked`. */
export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  function TableCell({ className, label, children, ...props }, ref) {
    const { density } = useTableContext()
    return (
      <td
        {...props}
        ref={ref}
        data-slot="table-cell"
        data-label={label}
        className={cn('align-middle', cellPadding[density], className)}
      >
        {children}
      </td>
    )
  }
)

// Compound-component surface: `<Table.Head>`, `<Table.Cell>`, etc.
Table.Caption = TableCaption
Table.Head = TableHead
Table.Body = TableBody
Table.Row = TableRow
Table.HeaderCell = TableHeaderCell
Table.Cell = TableCell
