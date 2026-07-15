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

export const kbdVariants = cva(
  [
    'relative inline-flex shrink-0 items-center justify-center gap-05 whitespace-nowrap',
    // pt-[0.15em] optically centers the glyph: the mono face is top-heavy, so
    // with leading-none the flex-centered key label sits ~1px high in the cap.
    // em-relative so it holds at every size.
    'rounded-sm border font-mono leading-none font-medium pt-[0.15em]',
    'border-border-strong bg-muted text-foreground shadow-1',
    // A visible border is the ONLY state indicator this component ever
    // needs, but it is repeated here explicitly so forced-colors mode keeps
    // a boundary even if `shadow-1` (a color-based cue) is suppressed.
    'forced-colors:border-[CanvasText] forced-colors:shadow-none',
  ],
  {
    variants: {
      size: {
        sm: 'min-h-3 min-w-3 px-1 text-xs',
        md: 'min-h-4 min-w-4 px-105 text-sm',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

/**
 * Semantic keys Kbd knows how to render per platform.
 *
 * `mod` is the ADAPTIVE primary shortcut modifier — ⌘ on macOS/iOS, Ctrl
 * elsewhere — and is what most cross-platform shortcuts should use (the
 * "Cmd/Ctrl+K" pattern). `cmd` is the literal macOS Command key: it always
 * renders ⌘/"Command" regardless of viewer platform, for documentation that
 * specifically calls out the Mac key (e.g. next to a separate Windows-only
 * instruction). `ctrl`, `alt`, and `shift` are physical modifier keys that
 * exist on every platform but are spelled differently — Option/Control vs.
 * Alt/Ctrl — so their glyph AND spoken label are platform-adaptive too.
 */
export type KbdToken =
  | 'mod'
  | 'cmd'
  | 'ctrl'
  | 'alt'
  | 'shift'
  | 'enter'
  | 'esc'
  | 'tab'
  | 'space'
  | 'backspace'
  | 'delete'
  | 'up'
  | 'down'
  | 'left'
  | 'right'

type Platform = 'mac' | 'other'

interface TokenRender {
  /** Visual glyph, hidden from assistive tech (aria-hidden). */
  glyph: string
  /** Spoken name announced in place of the glyph. */
  label: string
}

// Every entry needs BOTH a "mac" and an "other" rendering: even keys whose
// glyph is plain text (Ctrl, Alt, Esc…) still get a distinct spoken `label`,
// because screen readers do not reliably expand abbreviations ("Esc" is not
// guaranteed to be read as "Escape").
const TOKEN_MAP: Record<KbdToken, Record<Platform, TokenRender>> = {
  mod: {
    mac: { glyph: '⌘', label: 'Command' },
    other: { glyph: 'Ctrl', label: 'Control' },
  },
  cmd: {
    mac: { glyph: '⌘', label: 'Command' },
    other: { glyph: '⌘', label: 'Command' },
  },
  ctrl: {
    mac: { glyph: '⌃', label: 'Control' },
    other: { glyph: 'Ctrl', label: 'Control' },
  },
  alt: {
    mac: { glyph: '⌥', label: 'Option' },
    other: { glyph: 'Alt', label: 'Alt' },
  },
  shift: {
    mac: { glyph: '⇧', label: 'Shift' },
    other: { glyph: 'Shift', label: 'Shift' },
  },
  enter: {
    mac: { glyph: '⏎', label: 'Return' },
    other: { glyph: 'Enter', label: 'Enter' },
  },
  esc: {
    mac: { glyph: '⎋', label: 'Escape' },
    other: { glyph: 'Esc', label: 'Escape' },
  },
  tab: {
    mac: { glyph: '⇥', label: 'Tab' },
    other: { glyph: 'Tab', label: 'Tab' },
  },
  space: {
    mac: { glyph: '␣', label: 'Space' },
    other: { glyph: 'Space', label: 'Space' },
  },
  backspace: {
    mac: { glyph: '⌫', label: 'Delete' },
    other: { glyph: 'Backspace', label: 'Backspace' },
  },
  delete: {
    mac: { glyph: '⌦', label: 'Forward Delete' },
    other: { glyph: 'Del', label: 'Delete' },
  },
  up: {
    mac: { glyph: '↑', label: 'Up Arrow' },
    other: { glyph: '↑', label: 'Up Arrow' },
  },
  down: {
    mac: { glyph: '↓', label: 'Down Arrow' },
    other: { glyph: '↓', label: 'Down Arrow' },
  },
  left: {
    mac: { glyph: '←', label: 'Left Arrow' },
    other: { glyph: '←', label: 'Left Arrow' },
  },
  right: {
    mac: { glyph: '→', label: 'Right Arrow' },
    other: { glyph: '→', label: 'Right Arrow' },
  },
}

const KBD_TOKENS = new Set<string>(Object.keys(TOKEN_MAP))

function isKbdToken(value: string): value is KbdToken {
  return KBD_TOKENS.has(value)
}

/**
 * Best-effort, SSR-safe platform sniff. Reads the modern
 * `navigator.userAgentData.platform` first (Chromium), falling back to the
 * deprecated-but-still-universal `navigator.platform`, then `userAgent`.
 * Never throws when `navigator` does not exist (server, non-browser test
 * runner) — it just reports "other".
 */
function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') {
    return 'other'
  }
  const uaData = (navigator as Navigator & { userAgentData?: { platform?: string } })
    .userAgentData
  const signal = uaData?.platform ?? navigator.platform ?? navigator.userAgent ?? ''
  return /mac|iphone|ipad|ipod/i.test(signal) ? 'mac' : 'other'
}

/**
 * The visitor's platform, detected client-side only.
 *
 * SSR-safety contract: the initial render — on the server AND on the
 * client's first paint before hydration effects run — always reports
 * `"other"`. `navigator` is never read during render (only inside
 * `useEffect`), so this can never crash in an environment without a DOM,
 * and the client's first render matches the server's markup exactly (no
 * hydration mismatch warning). Once mounted, the effect corrects the
 * platform and Kbd re-renders with the right glyph — a brief, unavoidable
 * flash on macOS, traded for SSR correctness.
 */
function usePlatform(): Platform {
  const [platform, setPlatform] = React.useState<Platform>('other')
  React.useEffect(() => {
    setPlatform(detectPlatform())
  }, [])
  return platform
}

export interface KbdProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children'>,
    VariantProps<typeof kbdVariants> {
  /**
   * A semantic modifier or special key, rendered as the correct glyph for
   * the visitor's platform with a matching spoken name (e.g. `token="mod"`
   * shows "⌘" on macOS / "Ctrl" on Windows and Linux, and always announces
   * "Command" / "Control" — never the raw symbol). Takes precedence over
   * `children`.
   */
  token?: KbdToken
  /**
   * Literal key content for anything that is not a semantic token — a
   * single character, digit, or short label (`"K"`, `"1"`, `"F5"`). The
   * visible text doubles as the accessible name, so no extra label is
   * added. Ignored when `token` is set.
   */
  children?: React.ReactNode
}

/**
 * A single keyboard key rendered as a native `<kbd>` "key cap": a small,
 * monospaced box with a visible border so it reads as a physical key even
 * in forced-colors mode (never color alone). Non-interactive — it adds no
 * tab stop and no ARIA widget role, matching how a shortcut hint is
 * presented next to the control it belongs to (a Button's label, a
 * Tooltip, a menu item).
 *
 * Pass `token` for a modifier or special key so the glyph AND its spoken
 * name are resolved per platform (see `KbdToken`); pass plain `children`
 * for a literal key. To show a full shortcut, compose multiple `Kbd`
 * elements with `KbdGroup`.
 */
export const Kbd = React.forwardRef<HTMLElement, KbdProps>(function Kbd(
  { className, token, size, children, ...props },
  ref
) {
  const platform = usePlatform()
  const rendered = token ? TOKEN_MAP[token][platform] : null

  return (
    <kbd
      {...props}
      ref={ref}
      data-slot="kbd"
      data-size={size ?? 'md'}
      data-token={token}
      className={cn(kbdVariants({ size }), className)}
    >
      {rendered ? (
        <>
          {/* The glyph is decorative to assistive tech: symbols like ⌘/⌥/⇧
              are inconsistently announced (some AT reads ⌘ as "diamond" or
              stays silent), so it is hidden and replaced by a reliable
              spoken name below. Visually, only the glyph shows. */}
          <span aria-hidden="true" data-slot="kbd-glyph">
            {rendered.glyph}
          </span>
          <span className="sr-only" data-slot="kbd-label">
            {rendered.label}
          </span>
        </>
      ) : (
        children
      )}
    </kbd>
  )
})

/**
 * Resolve the plain-text spoken name for one shortcut part, used to build
 * `KbdGroup`'s auto-computed `aria-label`. Returns `null` when the part has
 * no reliable text equivalent (non-string children on a composed `Kbd`),
 * which tells the caller it cannot safely auto-label the whole group.
 */
function spokenPartFor(
  token: KbdToken | undefined,
  literal: React.ReactNode,
  platform: Platform
): string | null {
  if (token) {
    return TOKEN_MAP[token][platform].label
  }
  return typeof literal === 'string' ? literal : null
}

export interface KbdGroupProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children'>,
    VariantProps<typeof kbdVariants> {
  /**
   * Shorthand for a shortcut: an ordered list of tokens and/or literal
   * characters, each rendered as its own key cap — e.g.
   * `keys={['mod', 'K']}` renders ⌘K on macOS / Ctrl+K elsewhere. A string
   * that matches a `KbdToken` name (`"mod"`, `"esc"`, …) is always treated
   * as that semantic token; to render a literal key whose text collides
   * with a token name, compose `Kbd` elements via `children` instead.
   * Mutually exclusive with `children` — when set, `children` is ignored.
   */
  keys?: Array<KbdToken | string>
  /**
   * Individual `Kbd` elements to compose manually instead of `keys`. Any
   * non-`Kbd` child (e.g. a custom-styled connector) passes through
   * unchanged but is excluded from the auto-computed spoken label below.
   */
  children?: React.ReactNode
  /**
   * Decorative separator rendered between key caps. Always `aria-hidden` —
   * the spoken announcement never includes it, so a screen reader hears
   * "Command K", not "Command plus K".
   * @default '+'
   */
  separator?: React.ReactNode
}

/**
 * Composes several `Kbd` key caps into one keyboard shortcut, following the
 * HTML spec's own pattern for keystrokes — nested `<kbd>` elements inside an
 * outer `<kbd>` — while adding `role="group"` so the WHOLE shortcut gets one
 * clean spoken name instead of assistive tech narrating each key and the
 * decorative separator separately.
 *
 * The group's `aria-label` is auto-computed from its parts whenever every
 * part has a known spoken name (all `keys` tokens/strings, or all `children`
 * are `Kbd` elements using `token` or string `children`) — e.g.
 * `<KbdGroup keys={['mod', 'K']} />` announces "Command K" on macOS and
 * "Control K" elsewhere with zero extra props. Pass an explicit `aria-label`
 * to override, or when a part cannot be auto-labeled (a dev-only console
 * warning flags the latter, mirroring `ToggleGroup`'s required-name guard).
 */
export const KbdGroup = React.forwardRef<HTMLElement, KbdGroupProps>(function KbdGroup(
  { className, keys, children, size, separator = '+', 'aria-label': ariaLabelProp, ...props },
  ref
) {
  const platform = usePlatform()
  const warnedRef = React.useRef(false)

  const entries: Array<{ node: React.ReactNode; spoken: string | null }> = keys
    ? keys.map((key, index) => {
        const token = isKbdToken(key) ? key : undefined
        const literal = token ? undefined : key
        return {
          node: (
            // eslint-disable-next-line react/no-array-index-key -- `keys` is a
            // fixed, order-significant shortcut description, not a
            // reorderable list.
            <Kbd key={index} token={token} size={size}>
              {literal}
            </Kbd>
          ),
          spoken: spokenPartFor(token, literal, platform),
        }
      })
    : React.Children.toArray(children).map((child) => {
        if (React.isValidElement<KbdProps>(child) && child.type === Kbd) {
          const node = React.cloneElement(child, { size: child.props.size ?? size })
          return { node, spoken: spokenPartFor(child.props.token, child.props.children, platform) }
        }
        return { node: child, spoken: null }
      })

  const autoLabel = entries.every((entry) => entry.spoken != null)
    ? entries.map((entry) => entry.spoken).join(' ')
    : undefined
  const resolvedLabel = ariaLabelProp ?? autoLabel

  // Dev-only guard: a role=group needs an accessible name (WCAG 1.3.1 /
  // 4.1.2) so screen-reader users hear what shortcut the keys spell out,
  // rather than an unlabeled group or a silent read-through of glyphs.
  React.useEffect(() => {
    if (
      (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') ||
      warnedRef.current ||
      resolvedLabel
    ) {
      return
    }
    warnedRef.current = true
    console.warn(
      '[commons] <KbdGroup> could not auto-compute a spoken label for this ' +
        'shortcut and none was provided. Pass `aria-label` (e.g. "Command ' +
        'K") so screen readers announce the combination.'
    )
  }, [resolvedLabel])

  return (
    <kbd
      {...props}
      ref={ref}
      role="group"
      aria-label={resolvedLabel}
      data-slot="kbd-group"
      className={cn('inline-flex items-center gap-1', className)}
    >
      {entries.map((entry, index) => (
        // eslint-disable-next-line react/no-array-index-key -- entries are a
        // fixed, order-significant shortcut description, not a reorderable
        // list, and carry no stable identity of their own.
        <React.Fragment key={index}>
          {index > 0 ? (
            <span
              aria-hidden="true"
              data-slot="kbd-group-separator"
              className="text-muted-foreground"
            >
              {separator}
            </span>
          ) : null}
          {entry.node}
        </React.Fragment>
      ))}
    </kbd>
  )
})
