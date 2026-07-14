// SPDX-License-Identifier: MIT

import { cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/cn'

// ---------------------------------------------------------------------------
// ProcessList: the USWDS "process list" pattern — a native <ol> of long-form
// instructional steps ("How to apply: 1. Gather documents … 2. Submit …"),
// each with a numbered circular marker connected to the next by a vertical
// line. This is DISTINCT from StepIndicator, which is a compact horizontal
// progress tracker for a fixed wizard flow. ProcessList is for reading, not
// navigating: no ARIA beyond real list/heading semantics, no interactivity of
// its own.
//
// Compound API (matches Card/IconList): <ProcessList> provides list
// semantics + shared sizing via context; <ProcessListItem> is the <li>. There
// is no Base UI primitive involved (native <ol>/<li>/<hN> only), so no
// AmbientDirection wrapper is needed — see the RTL note below.
// ---------------------------------------------------------------------------

export type ProcessListSize = 'default' | 'compact'
export type ProcessListItemStatus = 'complete' | 'current' | 'upcoming'
export type ProcessListHeadingLevel = 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

interface ProcessListSizeContextValue {
  size: ProcessListSize
}

const ProcessListSizeContext = React.createContext<ProcessListSizeContextValue>({
  size: 'default',
})

export const processListVariants = cva(['m-0 list-none p-0'])

export interface ProcessListProps
  extends Omit<React.OlHTMLAttributes<HTMLOListElement>, 'children'> {
  /**
   * `compact` shrinks the marker, rail, and body type — use it for a nested
   * `ProcessList` rendered as a step's substeps. @default "default"
   */
  size?: ProcessListSize
  /** `ProcessListItem` elements. Render order IS the list order. */
  children?: React.ReactNode
}

/**
 * A native `<ol>` of instructional steps. `list-style: none` replaces the
 * decimal marker with each item's own circular marker, which — per the same
 * gotcha `List`'s `unstyled` variant and `IconList` document — silently
 * drops list semantics from Safari/VoiceOver, so the list carries an
 * explicit `role="list"`. This does not affect the real ordering: `<li>`
 * position-in-set/set-size is computed from the `<ol>`/`<li>` DOM structure
 * itself, independent of CSS or the `role` value, so a screen reader still
 * announces "1 of 4", "2 of 4", etc.
 *
 * Each `ProcessListItem`'s visible ordinal number is likewise derived from
 * real render order (not hand-typed): `ProcessList` walks its children and
 * assigns `position` automatically, so reordering the JSX renumbers the
 * markers for free. Pass `position` explicitly on an item only for the rare
 * case of continuing a sequence across two separate `ProcessList`s.
 */
export const ProcessList = React.forwardRef<HTMLOListElement, ProcessListProps>(
  function ProcessList({ className, size = 'default', children, ...props }, ref) {
    const items = React.Children.toArray(children).filter(React.isValidElement)
    let autoPosition = 0

    return (
      <ProcessListSizeContext.Provider value={{ size }}>
        <ol
          {...props}
          ref={ref}
          role="list"
          data-slot="process-list"
          data-size={size}
          style={{ paddingInlineStart: 0, ...props.style }}
          // A nested (compact) substep list sits inside a step's body, often
          // directly after an intro paragraph whose flow margin is now zeroed
          // by the core reset — so it needs its own top margin to breathe away
          // from that text. Gated on `compact` so the top-level rhythm (a
          // `default` list, never nested) is untouched.
          className={cn(processListVariants(), size === 'compact' && 'mt-1', className)}
        >
          {items.map((child, index) => {
            autoPosition += 1
            const element = child as React.ReactElement<ProcessListItemProps>
            const explicitPosition = element.props.position
            return React.cloneElement(element, {
              key: element.key ?? index,
              position: explicitPosition ?? autoPosition,
            })
          })}
        </ol>
      </ProcessListSizeContext.Provider>
    )
  }
)

// Marker: a numbered circle, or a checkmark once complete — mirrors
// StepIndicator's non-color-cue strategy. A real border in every status
// (never `border-0`) keeps the marker visible in forced-colors mode, and
// `forced-colors:border-[CanvasText]` guarantees the filled `complete`
// state — which normally uses `border-transparent` — still paints a real
// edge once colors are forced (the same fix Card's `elevated` appearance
// applies to its shadow-only boundary). Status is never color-only: `complete`
// swaps in a checkmark glyph, `current` doubles the border weight, and
// `upcoming` drops to a lighter number weight.
export const processListMarkerVariants = cva(
  [
    'flex shrink-0 items-center justify-center rounded-full border',
    'font-semibold leading-none tabular-nums',
    'forced-colors:border-[CanvasText]',
    'transition-colors motion-reduce:transition-none',
  ],
  {
    variants: {
      status: {
        neutral: 'border-border-strong bg-background text-foreground',
        complete: 'border-transparent bg-primary text-primary-foreground',
        current: 'border-2 border-primary bg-background text-primary',
        upcoming: 'border-border bg-background font-normal text-muted-foreground',
      },
      size: {
        default: 'size-8 text-sm',
        compact: 'size-6 text-xs',
      },
    },
    defaultVariants: { status: 'neutral', size: 'default' },
  }
)

// Connector: a thin vertical rule from this marker down to the next one.
// It lives in the same flex column as the marker (`items-center` centers its
// `w-2px` width under the marker automatically — no manual offset math, and
// no `rtl:` mirror needed, because the marker/content split is a `flex-row`
// main-axis relationship, which is direction-aware by spec: `dir="rtl"`
// swaps which side the rail renders on without any extra CSS). `flex-1`
// stretches it to fill the rail's full height, which itself is stretched
// (via the parent `<li>`'s default `align-items: stretch`) to match the
// taller content column — so the line always reaches exactly to where the
// next marker begins, never falling short or overshooting.
// `forced-colors:bg-[CanvasText]` keeps the line visible in forced-colors
// mode, since a background-only fill (no border geometry makes sense on a
// 2px rule) can otherwise be suppressed there.
const connectorClasses = cn(
  'w-2px flex-1 forced-colors:bg-[CanvasText]',
  'transition-colors motion-reduce:transition-none'
)

function CheckIcon(): React.JSX.Element {
  // Inline SVG with currentColor so it survives forced-colors mode — same
  // glyph as StepIndicator's CheckIcon, duplicated locally so ProcessList
  // stays a standalone leaf with no cross-component registryDependency.
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="size-4">
      <path
        d="m3.5 8.5 3 3 6-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const STATUS_WORD: Record<ProcessListItemStatus, string> = {
  complete: 'completed',
  current: 'current step',
  upcoming: 'not started yet',
}

export interface ProcessListItemProps
  extends Omit<React.LiHTMLAttributes<HTMLLIElement>, 'children'> {
  /** Visible step heading. Translatable. */
  heading: React.ReactNode
  /**
   * Heading element matching the surrounding document outline — never
   * hardcode a level, or the process list can create a skipped-heading-level
   * violation wherever it is dropped into a page. @default "h3"
   */
  headingLevel?: ProcessListHeadingLevel
  /**
   * Progress annotation for this step. Omit it for a plain instructional
   * list with no progress semantics (the common case). When set, it is
   * conveyed with a non-color marker cue (filled + checkmark for `complete`,
   * a doubled border for `current`, a lighter number weight for `upcoming`)
   * plus a visually hidden status word — never color alone.
   */
  status?: ProcessListItemStatus
  /**
   * Overrides the visually hidden status word announced after the heading
   * for screen-reader users (default: "completed" / "current step" / "not
   * started yet"). Translation-ready. Ignored when `status` is unset.
   */
  statusLabel?: string
  /**
   * This step's 1-based ordinal, used for its visible marker number.
   * `ProcessList` assigns this automatically from render order — pass it
   * explicitly only to continue a sequence across two separate
   * `ProcessList`s (e.g. a paginated instruction set). Ignored visually when
   * `status="complete"`, which shows a checkmark instead.
   */
  position?: number
  /**
   * Body content for the step: paragraphs, links, images, or a nested
   * `ProcessList` (with `size="compact"`) for substeps. Any interactive
   * content here keeps its own semantics and 44px target — ProcessList adds
   * none of its own.
   */
  children?: React.ReactNode
}

/**
 * One step of a `ProcessList`: a numbered marker plus a heading and body.
 * Renders as a plain `<li>` — real ordered-list semantics come from being a
 * direct child of `ProcessList`'s `<ol>`, so a screen reader announces
 * "1 of 4" etc. regardless of the decorative marker. `status="current"` adds
 * `aria-current="step"`, matching StepIndicator's convention, so assistive
 * technology can also identify the active step directly.
 */
export const ProcessListItem = React.forwardRef<HTMLLIElement, ProcessListItemProps>(
  function ProcessListItem(
    {
      className,
      heading,
      headingLevel = 'h3',
      status,
      statusLabel,
      position,
      children,
      ...props
    },
    ref
  ) {
    const { size } = React.useContext(ProcessListSizeContext)
    const HeadingTag = headingLevel
    const markerStatus = status ?? 'neutral'
    const word = status ? (statusLabel ?? STATUS_WORD[status]) : undefined

    return (
      <li
        {...props}
        ref={ref}
        aria-current={status === 'current' ? 'step' : undefined}
        data-slot="process-list-item"
        data-status={status ?? undefined}
        className={cn(
          'flex',
          size === 'compact' ? 'gap-1' : 'gap-105',
          // Both rules key off THIS <li>'s own :last-child state (is it the
          // final step in the list), reaching into its descendants — not the
          // content div's :last-child state among the li's own two children,
          // which would always be true and always fire. A pure CSS check, so
          // both stay correct through conditional rendering without
          // ProcessList needing to compute or pass an isLast flag.
          'last:[&_[data-slot=process-list-connector]]:hidden',
          'last:[&_[data-slot=process-list-content]]:pb-0',
          className
        )}
      >
        {/* Rail: marker + connector, decorative (aria-hidden). The list's
            real semantics live on the <li>/<ol> themselves. */}
        <div
          aria-hidden="true"
          data-slot="process-list-rail"
          className={cn('flex shrink-0 flex-col items-center', size === 'compact' ? 'w-6' : 'w-8')}
        >
          <span
            data-slot="process-list-marker"
            className={processListMarkerVariants({ status: markerStatus, size })}
          >
            {status === 'complete' ? <CheckIcon /> : position}
          </span>
          <span
            data-slot="process-list-connector"
            className={cn(connectorClasses, status === 'complete' ? 'bg-primary' : 'bg-border')}
          />
        </div>

        <div
          data-slot="process-list-content"
          // Trailing space below each item's body sets the vertical gap to the
          // next marker. `compact` (nested substeps) gets a touch more than
          // before (`pb-205`) so stacked substeps don't read as cramped, while
          // staying tighter than the top-level `default` (`pb-3`).
          className={cn('min-w-0 flex-1', size === 'compact' ? 'pb-205' : 'pb-3')}
        >
          <HeadingTag
            data-slot="process-list-heading"
            className={cn(
              'text-foreground',
              size === 'compact' ? 'text-sm font-semibold' : 'text-md font-semibold'
            )}
          >
            {heading}
            {word != null ? <span className="sr-only">, {word}</span> : null}
          </HeadingTag>
          {children != null ? (
            <div
              data-slot="process-list-body"
              className={cn(
                'mt-05 text-muted-foreground',
                size === 'compact' ? 'text-xs' : 'text-sm'
              )}
            >
              {children}
            </div>
          ) : null}
        </div>
      </li>
    )
  }
)
