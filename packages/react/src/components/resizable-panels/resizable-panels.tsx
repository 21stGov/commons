// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

'use client'

import { cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/cn'

// Minimal ambient typing so the dev-only guard compiles without
// @types/node. Bundlers statically replace `process.env.NODE_ENV`.
declare const process: { env: { NODE_ENV?: string | undefined } } | undefined

/** Named responsive breakpoints (min-widths), mirroring Tailwind defaults. */
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

type Breakpoint = keyof typeof BREAKPOINTS

type Direction = 'horizontal' | 'vertical'

export const resizablePanelsVariants = cva('flex w-full', {
  variants: {
    // The layout axis when NOT stacked. `stacked` (small screens / zoom) always
    // forces a column so content reflows down a single axis (WCAG 1.4.10).
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    },
    stacked: {
      true: 'flex-col',
      false: '',
    },
  },
  defaultVariants: { orientation: 'horizontal', stacked: false },
})

// ---------------------------------------------------------------------------
// Sizing helpers (pure — safe to unit test and to run in render)
// ---------------------------------------------------------------------------

interface PanelConfig {
  id?: string
  defaultSize?: number
  minSize: number
  maxSize: number
}

/** Round to 4 decimals to keep percentage arithmetic from drifting. */
function round(n: number): number {
  return Number(n.toFixed(4))
}

/**
 * Resolve the starting size (%) of every panel so the row sums to 100.
 * Panels with an explicit `defaultSize` keep it; the remainder is split evenly
 * across the rest. Finally everything is normalised so rounding never leaves a
 * gap or overflow.
 */
function resolveSizes(configs: PanelConfig[]): number[] {
  const count = configs.length
  if (count === 0) {
    return []
  }
  const explicit = configs.map((c) => c.defaultSize)
  const explicitTotal = explicit.reduce<number>((sum, v) => sum + (v ?? 0), 0)
  const autoCount = explicit.filter((v) => v == null).length
  const remaining = Math.max(0, 100 - explicitTotal)
  const perAuto = autoCount > 0 ? remaining / autoCount : 0
  const raw = explicit.map((v) => (v == null ? perAuto : v))
  return normalize(raw, configs)
}

/** Scale a size array to sum 100 while respecting each panel's min/max. */
function normalize(sizes: number[], configs: PanelConfig[]): number[] {
  if (sizes.length === 0) {
    return []
  }
  const clamped = sizes.map((v, i) =>
    Math.min(configs[i].maxSize, Math.max(configs[i].minSize, v))
  )
  const total = clamped.reduce((sum, v) => sum + v, 0)
  if (total <= 0) {
    const even = 100 / sizes.length
    return sizes.map(() => round(even))
  }
  const scaled = clamped.map((v) => round((v / total) * 100))
  // The last panel absorbs the rounding remainder so the row sums to EXACTLY
  // 100 (a leftover fraction would leave a hairline gap or overflow).
  const head = scaled.slice(0, -1).reduce((sum, v) => sum + v, 0)
  scaled[scaled.length - 1] = round(100 - head)
  return scaled
}

/**
 * Clamp a boundary delta so neither the growing nor the shrinking neighbour
 * violates its min/max. A separator at `boundaryIndex` moves the edge between
 * panel `i` and panel `i+1`: what one gains, the other loses.
 */
function clampDelta(
  sizes: number[],
  configs: PanelConfig[],
  boundaryIndex: number,
  delta: number
): number {
  const i = boundaryIndex
  const j = boundaryIndex + 1
  const maxIncrease = Math.min(configs[i].maxSize - sizes[i], sizes[j] - configs[j].minSize)
  const maxDecrease = Math.min(sizes[i] - configs[i].minSize, configs[j].maxSize - sizes[j])
  return Math.max(-maxDecrease, Math.min(maxIncrease, delta))
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface ResizableContextValue {
  direction: Direction
  stacked: boolean
  disabled: boolean
  step: number
  sizes: number[]
  configs: PanelConfig[]
  panelIds: string[]
  groupRef: React.RefObject<HTMLDivElement | null>
  /** Nudge a boundary by a signed percentage (arrow keys, pointer drag). */
  resizeBy: (boundaryIndex: number, deltaPercent: number) => void
  /** Set the leading panel of a boundary to an absolute size (Home/End/reset). */
  setBoundaryTo: (boundaryIndex: number, targetSize: number) => void
}

const ResizableContext = React.createContext<ResizableContextValue | null>(null)

function useResizableContext(part: string): ResizableContextValue {
  const ctx = React.useContext(ResizableContext)
  if (!ctx) {
    throw new Error(`[commons] <${part}> must be rendered inside <ResizablePanels>.`)
  }
  return ctx
}

// Marker fields let the group identify its children by reference without
// coupling to display names (which minify) or fragile type guards.
const PANEL_TYPE = Symbol('commons.resizable-panel')
const HANDLE_TYPE = Symbol('commons.resizable-handle')

/**
 * Read the resolved reading direction at a node (follows the DOM `dir`). Prefer
 * the nearest `dir` attribute (works everywhere, including jsdom); fall back to
 * the computed `direction` for CSS-only direction in real browsers.
 */
function isRtl(node: Element | null): boolean {
  if (!node) {
    return false
  }
  const withDir = node.closest?.('[dir]')
  if (withDir) {
    return withDir.getAttribute('dir') === 'rtl'
  }
  if (typeof window !== 'undefined') {
    return window.getComputedStyle(node).direction === 'rtl'
  }
  return false
}

// ---------------------------------------------------------------------------
// Group
// ---------------------------------------------------------------------------

export interface ResizablePanelsProps {
  /**
   * Layout axis. `horizontal` places panels side by side (separators are
   * vertical bars moved left/right); `vertical` stacks them (separators are
   * horizontal bars moved up/down). @default "horizontal"
   */
  direction?: Direction
  /**
   * Controlled panel sizes as percentages that sum to 100 (one per
   * `ResizablePanel`, in order). Pair with `onResize` for persistence.
   */
  sizes?: number[]
  /** Initial sizes for uncontrolled usage; falls back to each panel's `defaultSize`. */
  defaultSizes?: number[]
  /** Fired with the full size array (%) whenever a boundary moves. */
  onResize?: (sizes: number[]) => void
  /** Alias of `onResize`; both fire if provided. */
  onLayout?: (sizes: number[]) => void
  /** Percentage a boundary moves per Arrow keypress. @default 5 */
  step?: number
  /**
   * Below this breakpoint the panels stack into a single column and every
   * separator becomes inert (removed from the tab order and the a11y tree) so
   * content reflows for small screens and 400% zoom (WCAG 1.4.10). Accepts a
   * named Tailwind breakpoint, a pixel min-width, or `false` to never stack.
   * @default "md"
   */
  stackAt?: Breakpoint | number | false
  /** Disable every separator (panels keep their current sizes). */
  disabled?: boolean
  /** `ResizablePanel` and `ResizableHandle` children, interleaved. */
  children: React.ReactNode
  /** Class for the group container. */
  className?: string
  /** Accessible label for the group landmark. */
  'aria-label'?: string
  /** Id of an element labelling the group. */
  'aria-labelledby'?: string
}

/**
 * A split-pane layout with draggable, keyboard-operable separators. Base UI has
 * no resizable primitive, so this is self-contained: pointer events for drag,
 * full keyboard support for everyone else.
 *
 * Accessibility highlights:
 * - **Real separators.** Each `ResizableHandle` is a `role="separator"` with
 *   `aria-orientation`, `aria-valuenow/min/max` (the resized panel's size %),
 *   `aria-controls` pointing at that panel, and `tabindex=0`. It follows the
 *   WAI-ARIA Window Splitter pattern.
 * - **Never loses keyboard operability.** Arrow keys resize by `step`
 *   (mirrored under `dir="rtl"`), Home/End jump to the panel's min/max, and
 *   Enter/Space toggle a collapse to the minimum.
 * - **Reflow fallback.** Below `stackAt` the panels stack and the separators
 *   go inert, so the layout reflows to one column for small screens and zoom.
 * - **Forced-colors safe.** Separators keep a visible border and a grip in
 *   every state; state is conveyed by size text and position, never color
 *   alone.
 * - **44px targets.** The thin separator line carries a transparent 44px hit
 *   area (project minimum, WCAG 2.5.5) via an overlapping overlay.
 */
export const ResizablePanels = React.forwardRef<HTMLDivElement, ResizablePanelsProps>(
  function ResizablePanels(
    {
      direction = 'horizontal',
      sizes: sizesProp,
      defaultSizes,
      onResize,
      onLayout,
      step = 5,
      stackAt = 'md',
      disabled = false,
      children,
      className,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
    },
    forwardedRef
  ) {
    const generatedId = React.useId()
    const localRef = React.useRef<HTMLDivElement>(null)
    // Merge the forwarded ref with our own — the group element must be
    // measurable for pointer math while still exposing its node to callers.
    const setGroupRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        localRef.current = node
        if (typeof forwardedRef === 'function') {
          forwardedRef(node)
        } else if (forwardedRef) {
          forwardedRef.current = node
        }
      },
      [forwardedRef]
    )

    // Walk the children once to learn each panel's constraints and to inject
    // the positional indices the panels and handles need. Only element
    // children carrying our markers are treated as panels/handles.
    const childArray = React.Children.toArray(children)
    const configs: PanelConfig[] = []
    let panelCursor = -1
    const mappedChildren = childArray.map((child) => {
      if (!React.isValidElement(child)) {
        return child
      }
      const type = child.type as { $commonsType?: symbol }
      if (type?.$commonsType === PANEL_TYPE) {
        panelCursor += 1
        const props = child.props as ResizablePanelProps
        configs.push({
          id: props.id,
          defaultSize: props.defaultSize,
          minSize: props.minSize ?? 0,
          maxSize: props.maxSize ?? 100,
        })
        return React.cloneElement(child as React.ReactElement<ResizablePanelProps>, {
          _index: panelCursor,
        } as Partial<ResizablePanelProps>)
      }
      if (type?.$commonsType === HANDLE_TYPE) {
        // A handle sits on the boundary after the most recently seen panel.
        return React.cloneElement(child as React.ReactElement<ResizableHandleProps>, {
          _boundaryIndex: panelCursor,
        } as Partial<ResizableHandleProps>)
      }
      return child
    })

    const panelIds = configs.map((c, i) => c.id ?? `${generatedId}-panel-${i}`)

    // Uncontrolled source of truth. Initialised from defaultSizes or each
    // panel's defaultSize; recomputed only if the panel count changes.
    const isControlled = sizesProp !== undefined
    const [uncontrolled, setUncontrolled] = React.useState<number[]>(() =>
      defaultSizes ? normalize(defaultSizes, configs) : resolveSizes(configs)
    )
    // If panels are added/removed at runtime, re-resolve so lengths stay in sync.
    React.useEffect(() => {
      if (!isControlled && uncontrolled.length !== configs.length) {
        setUncontrolled(resolveSizes(configs))
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [configs.length, isControlled])

    const sizes = isControlled ? (sizesProp as number[]) : uncontrolled

    const emit = React.useCallback(
      (next: number[]) => {
        onResize?.(next)
        onLayout?.(next)
      },
      [onResize, onLayout]
    )

    const applyNext = React.useCallback(
      (next: number[]) => {
        if (!isControlled) {
          setUncontrolled(next)
        }
        emit(next)
      },
      [isControlled, emit]
    )

    // Keep the latest sizes/configs in a ref so the stable callbacks below read
    // fresh values without being re-created on every resize.
    const stateRef = React.useRef({ sizes, configs })
    stateRef.current = { sizes, configs }

    const resizeBy = React.useCallback(
      (boundaryIndex: number, deltaPercent: number) => {
        const { sizes: cur, configs: cfg } = stateRef.current
        if (boundaryIndex < 0 || boundaryIndex >= cur.length - 1) {
          return
        }
        const d = clampDelta(cur, cfg, boundaryIndex, deltaPercent)
        if (d === 0) {
          return
        }
        const next = [...cur]
        next[boundaryIndex] = round(cur[boundaryIndex] + d)
        next[boundaryIndex + 1] = round(cur[boundaryIndex + 1] - d)
        applyNext(next)
      },
      [applyNext]
    )

    const setBoundaryTo = React.useCallback(
      (boundaryIndex: number, targetSize: number) => {
        const { sizes: cur } = stateRef.current
        if (boundaryIndex < 0 || boundaryIndex >= cur.length - 1) {
          return
        }
        resizeBy(boundaryIndex, targetSize - cur[boundaryIndex])
      },
      [resizeBy]
    )

    // Responsive stacking. A single boolean drives BOTH the CSS (column layout,
    // auto panel sizing) and the handles' inertness, so there is one source of
    // truth. SSR renders un-stacked (the common desktop case) and corrects on
    // mount.
    const [stacked, setStacked] = React.useState(false)
    React.useEffect(() => {
      if (stackAt === false || typeof window === 'undefined' || !window.matchMedia) {
        setStacked(false)
        return
      }
      const px = typeof stackAt === 'number' ? stackAt : BREAKPOINTS[stackAt]
      const mql = window.matchMedia(`(max-width: ${px - 0.02}px)`)
      const update = (): void => setStacked(mql.matches)
      update()
      mql.addEventListener('change', update)
      return () => mql.removeEventListener('change', update)
    }, [stackAt])

    // configs/panelIds are fresh arrays each render; serialise them so the memo
    // updates when the structure or a panel's constraints change, not on every
    // unrelated render.
    const configSig = configs
      .map((c) => `${c.minSize}/${c.maxSize}/${c.defaultSize ?? ''}`)
      .join('|')
    const idSig = panelIds.join(',')
    const ctx = React.useMemo<ResizableContextValue>(
      () => ({
        direction,
        stacked,
        disabled,
        step,
        sizes,
        configs,
        panelIds,
        groupRef: localRef,
        resizeBy,
        setBoundaryTo,
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [direction, stacked, disabled, step, sizes, resizeBy, setBoundaryTo, configSig, idSig]
    )

    return (
      <ResizableContext.Provider value={ctx}>
        <div
          ref={setGroupRef}
          // A generic grouping landmark so an `aria-label`/`aria-labelledby`
          // naming the whole split is valid and announced.
          role="group"
          data-slot="resizable-panels"
          data-direction={direction}
          data-stacked={stacked || undefined}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          className={cn(
            resizablePanelsVariants({ orientation: direction, stacked }),
            className
          )}
        >
          {mappedChildren}
        </div>
      </ResizableContext.Provider>
    )
  }
)

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

export interface ResizablePanelProps {
  /** Initial size as a percentage of the group. Omit to share the remainder evenly. */
  defaultSize?: number
  /** Smallest size (%) this panel may shrink to. @default 0 */
  minSize?: number
  /** Largest size (%) this panel may grow to. @default 100 */
  maxSize?: number
  /** Panel id; a handle's `aria-controls` points here. Auto-generated if omitted. */
  id?: string
  /** Panel content. */
  children?: React.ReactNode
  /** Class for the panel element. */
  className?: string
  /** @internal Injected by `ResizablePanels`. */
  _index?: number
}

/**
 * One pane in a `ResizablePanels` group. Its size is a flex-basis percentage
 * managed by the group; when the group stacks (small screens) the panel becomes
 * auto-sized full width so its content reflows.
 */
export const ResizablePanel = Object.assign(
  React.forwardRef<HTMLDivElement, ResizablePanelProps>(function ResizablePanel(
    { children, className, id: idProp, _index = 0 },
    ref
  ) {
    const ctx = useResizableContext('ResizablePanel')
    const size = ctx.sizes[_index] ?? 0
    const id = idProp ?? ctx.panelIds[_index]

    return (
      <div
        ref={ref}
        id={id}
        data-slot="resizable-panel"
        data-panel-index={_index}
        // When stacked, drop the basis so the panel is auto-height/full-width
        // and its content drives its own size (reflow). Otherwise the basis
        // percentage — with grow/shrink locked — sets an exact share.
        style={
          ctx.stacked
            ? undefined
            : { flexBasis: `${size}%`, flexGrow: 0, flexShrink: 0 }
        }
        className={cn('min-h-0 min-w-0 overflow-auto', ctx.stacked && 'w-full', className)}
      >
        {children}
      </div>
    )
  }),
  { $commonsType: PANEL_TYPE }
)

// ---------------------------------------------------------------------------
// Handle
// ---------------------------------------------------------------------------

// The visible separator line. `basis-px` keeps the gutter a hairline; the
// pressable box is an overlapping overlay (below). A real bg on every state
// paints a boundary in forced-colors mode. Same both axes — `basis-px` is the
// cross-thin size and `self-stretch` spans the other.
const trackClasses = 'relative shrink-0 grow-0 basis-px self-stretch bg-border-strong'

// The 44px hit area, centred over the hairline and overlapping the neighbouring
// panels (higher z-index wins the pointer). Physical translate is mirrored for
// RTL. Focus ring is on this element so it is always visible when tabbed to.
const grabClasses: Record<Direction, string> = {
  horizontal: [
    'group absolute inset-block-0 start-1/2 z-10 flex w-11 -translate-x-1/2 rtl:translate-x-1/2',
    'cursor-col-resize touch-none items-center justify-center',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    'data-[disabled]:cursor-default',
  ].join(' '),
  vertical: [
    'group absolute inset-inline-0 top-1/2 z-10 flex h-11 -translate-y-1/2',
    'cursor-row-resize touch-none items-center justify-center',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    'data-[disabled]:cursor-default',
  ].join(' '),
}

// The grip pill inside the hit area — the visible affordance. A border keeps it
// distinct in forced-colors mode; color shifts to primary on hover/focus/drag
// are a redundant (not sole) cue. Motion is gated behind motion-safe.
const gripClasses: Record<Direction, string> = {
  horizontal: [
    'pointer-events-none rounded-full border border-border-strong bg-border-strong',
    'h-8 w-1 transition-colors motion-reduce:transition-none',
    'group-hover:bg-primary group-hover:border-primary',
    'group-focus-visible:bg-primary group-focus-visible:border-primary',
    'group-data-[dragging]:bg-primary group-data-[dragging]:border-primary',
    'group-data-[disabled]:bg-disabled group-data-[disabled]:border-disabled-border',
  ].join(' '),
  vertical: [
    'pointer-events-none rounded-full border border-border-strong bg-border-strong',
    'h-1 w-8 transition-colors motion-reduce:transition-none',
    'group-hover:bg-primary group-hover:border-primary',
    'group-focus-visible:bg-primary group-focus-visible:border-primary',
    'group-data-[dragging]:bg-primary group-data-[dragging]:border-primary',
    'group-data-[disabled]:bg-disabled group-data-[disabled]:border-disabled-border',
  ].join(' '),
}

export interface ResizableHandleProps {
  /**
   * Accessible name for the separator (WCAG 4.1.2). Translation-ready.
   * @default "Resize panel"
   */
  label?: string
  /**
   * Allow Enter/Space to toggle the leading panel between its minimum
   * (collapsed) and its previous size. @default false
   */
  collapsible?: boolean
  /** Reset both panels to their default sizes on double-click. @default true */
  resetOnDoubleClick?: boolean
  /** Class for the separator hit area. */
  className?: string
  /** @internal Injected by `ResizablePanels`. */
  _boundaryIndex?: number
}

/**
 * The draggable separator between two panels. It is a real
 * `role="separator"` implementing the WAI-ARIA Window Splitter pattern:
 * pointer drag resizes with pointer capture and min/max clamping, and the
 * keyboard covers everyone else — Arrow keys step (mirrored in RTL), Home/End
 * jump to the resized panel's min/max, and (when `collapsible`) Enter/Space
 * toggle a collapse. When the group stacks it renders inert.
 */
export const ResizableHandle = Object.assign(
  React.forwardRef<HTMLDivElement, ResizableHandleProps>(function ResizableHandle(
    { label = 'Resize panel', collapsible = false, resetOnDoubleClick = true, className, _boundaryIndex = 0 },
    ref
  ) {
    const ctx = useResizableContext('ResizableHandle')
    const { direction, stacked, disabled, step, sizes, configs, panelIds, groupRef } = ctx
    const boundary = _boundaryIndex
    const leadingConfig = configs[boundary]
    const leadingSize = sizes[boundary] ?? 0
    const inert = stacked || disabled

    const draggingRef = React.useRef(false)
    const [dragging, setDragging] = React.useState(false)
    // Remembers the pre-collapse size so a collapse can be undone.
    const collapsedFromRef = React.useRef<number | null>(null)

    // Convert an absolute pointer position into a target size for the leading
    // panel, then resize to it. Absolute (not incremental) math avoids drift
    // when the boundary is pinned at a min/max during a drag.
    const pointerResize = React.useCallback(
      (clientX: number, clientY: number) => {
        const group = groupRef.current
        if (!group) {
          return
        }
        const rect = group.getBoundingClientRect()
        const horizontal = direction === 'horizontal'
        const total = horizontal ? rect.width : rect.height
        if (total <= 0) {
          return
        }
        const rtl = horizontal && isRtl(group)
        const raw = horizontal
          ? rtl
            ? rect.right - clientX
            : clientX - rect.left
          : clientY - rect.top
        const pointerPercent = (raw / total) * 100
        // Size the boundary so the cumulative width up to and including the
        // leading panel meets the pointer.
        let before = 0
        for (let k = 0; k < boundary; k += 1) {
          before += sizes[k]
        }
        ctx.setBoundaryTo(boundary, pointerPercent - before)
      },
      [ctx, boundary, direction, groupRef, sizes]
    )

    const onPointerDown = (event: React.PointerEvent<HTMLDivElement>): void => {
      if (inert || event.button !== 0) {
        return
      }
      event.preventDefault()
      draggingRef.current = true
      setDragging(true)
      // Pointer capture keeps events flowing to the handle even when the
      // pointer strays over a panel. Guarded: jsdom lacks setPointerCapture.
      try {
        event.currentTarget.setPointerCapture?.(event.pointerId)
      } catch {
        /* not supported (tests) — dragging still works via move handler */
      }
    }

    const onPointerMove = (event: React.PointerEvent<HTMLDivElement>): void => {
      if (!draggingRef.current || inert) {
        return
      }
      pointerResize(event.clientX, event.clientY)
    }

    const endDrag = (event: React.PointerEvent<HTMLDivElement>): void => {
      if (!draggingRef.current) {
        return
      }
      draggingRef.current = false
      setDragging(false)
      try {
        event.currentTarget.releasePointerCapture?.(event.pointerId)
      } catch {
        /* no-op */
      }
    }

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
      if (inert) {
        return
      }
      const horizontal = direction === 'horizontal'
      const rtl = horizontal && isRtl(event.currentTarget)
      // `positive` = the key that grows the leading panel (moves the boundary
      // toward the inline/block end), already mirrored for RTL.
      const forwardKey = horizontal ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown'
      const backwardKey = horizontal ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp'

      switch (event.key) {
        case forwardKey:
          event.preventDefault()
          ctx.resizeBy(boundary, step)
          break
        case backwardKey:
          event.preventDefault()
          ctx.resizeBy(boundary, -step)
          break
        case 'Home':
          event.preventDefault()
          ctx.setBoundaryTo(boundary, leadingConfig?.minSize ?? 0)
          break
        case 'End':
          event.preventDefault()
          ctx.setBoundaryTo(boundary, leadingConfig?.maxSize ?? 100)
          break
        case 'Enter':
        case ' ':
          if (!collapsible) {
            return
          }
          event.preventDefault()
          {
            const min = leadingConfig?.minSize ?? 0
            if (leadingSize <= min + 0.01) {
              // Restore to the remembered size (or the default share).
              const restore = collapsedFromRef.current ?? leadingConfig?.defaultSize ?? 50
              collapsedFromRef.current = null
              ctx.setBoundaryTo(boundary, restore)
            } else {
              collapsedFromRef.current = leadingSize
              ctx.setBoundaryTo(boundary, min)
            }
          }
          break
        default:
          break
      }
    }

    const onDoubleClick = (): void => {
      if (inert || !resetOnDoubleClick) {
        return
      }
      ctx.setBoundaryTo(boundary, leadingConfig?.defaultSize ?? 50)
    }

    const orientation = direction === 'horizontal' ? 'vertical' : 'horizontal'

    // When the group stacks (small screens / zoom) the separator is removed
    // entirely: it leaves the tab order and the accessibility tree, and the
    // panels reflow into a single column with no stray divider (WCAG 1.4.10).
    if (stacked) {
      return null
    }

    return (
      <div
        data-slot="resizable-handle-track"
        data-direction={direction}
        className={cn(trackClasses, className)}
      >
        <div
          ref={ref}
          role="separator"
          aria-orientation={orientation}
          aria-label={label}
          aria-controls={panelIds[boundary]}
          aria-valuenow={Math.round(leadingSize)}
          aria-valuemin={Math.round(leadingConfig?.minSize ?? 0)}
          aria-valuemax={Math.round(leadingConfig?.maxSize ?? 100)}
          aria-valuetext={`${Math.round(leadingSize)}%`}
          aria-disabled={disabled || undefined}
          tabIndex={inert ? -1 : 0}
          data-slot="resizable-handle"
          data-boundary-index={boundary}
          data-dragging={dragging || undefined}
          data-disabled={disabled || undefined}
          className={grabClasses[direction]}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={onKeyDown}
          onDoubleClick={onDoubleClick}
        >
          <span aria-hidden="true" data-slot="resizable-handle-grip" className={gripClasses[direction]} />
        </div>
      </div>
    )
  }),
  { $commonsType: HANDLE_TYPE }
)
