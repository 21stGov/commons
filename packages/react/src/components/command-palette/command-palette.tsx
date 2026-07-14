// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { Combobox as BaseCombobox } from '@base-ui/react/combobox'
import { cva } from 'class-variance-authority'
import * as React from 'react'

import { DialogContent, DialogDescription, DialogTitle, Dialog } from '@/components/ui/dialog'
import { Icon, type IconName } from '@/components/ui/icon'
import { KbdGroup, type KbdToken } from '@/components/ui/kbd'
import { AmbientDirection } from '@/lib/ambient-direction'
import { cn } from '@/lib/cn'

/**
 * One runnable command. `value` is a stable id (never shown, used as the
 * React key and equality anchor); `label` is the visible text the user
 * reads back and filters against. `keywords` add extra match terms that
 * are not shown — synonyms, acronyms, or the plain-language phrasing a
 * resident might type ("trash" for "Sanitation pickup"). `shortcut` is an
 * ordered list of `Kbd` tokens/characters rendered as a keyboard hint.
 * Rare unavailable commands stay visible but `disabled` so the list stays
 * predictable (WCAG 3.2.4 consistent identification).
 */
export interface CommandItem {
  /** Stable id. Not displayed; used as the key and value identity. */
  value: string
  /** Visible, filterable command text. */
  label: string
  /** Optional leading glyph from the curated Icon set. */
  icon?: IconName
  /**
   * Optional trailing keyboard-shortcut hint, e.g. `['mod', 'K']` renders
   * ⌘K on macOS / Ctrl+K elsewhere. Purely presentational — wiring the
   * actual key handler is the consumer's job.
   */
  shortcut?: Array<KbdToken | string>
  /** Extra, hidden terms this command should also match on. */
  keywords?: readonly string[]
  /** Skip this command in filtering/activation but keep it visible. */
  disabled?: boolean
  /** Run when the command is chosen. Fires before the palette closes. */
  onSelect?: () => void
}

/**
 * A labelled cluster of related commands. The `heading` names the group
 * for both sighted users and screen readers (Base UI links it to the
 * group via `aria-labelledby`). Groups whose commands all filter out are
 * removed from the list automatically.
 */
export interface CommandGroup {
  /** Visible group heading (e.g. "Payments", "Report", "Navigate"). */
  heading: string
  /** The commands in this group. */
  items: readonly CommandItem[]
}

/**
 * One command row. 44px minimum target. Highlight (keyboard rove or
 * pointer) is never signalled by color alone (WCAG 1.4.1): `data-highlighted`
 * pairs a muted fill with a weight bump to `font-medium`, so the active row
 * stays distinguishable in Windows High Contrast / forced-colors mode where
 * the fill color is overridden. Commands are activated, never persistently
 * selected, so there is no check indicator.
 */
export const commandPaletteItemVariants = cva([
  'flex min-h-11 cursor-default select-none items-center gap-2 rounded-sm px-2 text-sm text-foreground',
  'outline-none',
  'data-highlighted:bg-muted data-highlighted:font-medium',
  'data-disabled:pointer-events-none data-disabled:text-disabled-foreground',
])

/**
 * Case-insensitive contains match against the command's visible label plus
 * its hidden keywords. An empty query matches everything. Shared between
 * Base UI's list filtering and the polite results-count announcement so the
 * two never disagree.
 */
function matchesQuery(item: CommandItem, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (q === '') {
    return true
  }
  const haystack = [item.label, ...(item.keywords ?? [])].join(' ').toLowerCase()
  return haystack.includes(q)
}

function SearchIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="pointer-events-none absolute inset-y-0 start-3 my-auto size-205 text-muted-foreground"
    >
      <circle cx="7" cy="7" r="3.75" />
      <path d="m12.5 12.5-2.6-2.6" />
    </svg>
  )
}

export interface CommandPaletteProps {
  /** Controlled open state. Opening is the consumer's responsibility. */
  open: boolean
  /** Called when the palette should open or close (Esc, backdrop, select). */
  onOpenChange: (open: boolean) => void
  /** Grouped commands to search and run. */
  items: readonly CommandGroup[]
  /**
   * Fires for every chosen command, after the command's own `onSelect` and
   * before the palette closes — a single place to log or route.
   */
  onSelect?: (item: CommandItem) => void
  /**
   * The dialog's accessible name, rendered as a visually-hidden title.
   * Translation-ready. @default "Command palette"
   */
  label?: string
  /**
   * Visually-hidden usage hint announced with the dialog.
   * Translation-ready. @default keyboard instructions
   */
  description?: string
  /**
   * Accessible name for the search input (there is no visible `<label>`).
   * Translation-ready. @default "Search for a command"
   */
  searchLabel?: string
  /**
   * Input placeholder. A placeholder is not a label — `searchLabel` is.
   * Translation-ready. @default "Type a command or search…"
   */
  placeholder?: string
  /**
   * Text shown when no command matches the query.
   * Translation-ready. @default "No commands found"
   */
  emptyText?: string
  /**
   * Builds the politely-announced results count. Translation-ready.
   * @default `${count} result(s) available`
   */
  formatResultCount?: (count: number) => string
  /**
   * Highlight the first match automatically while filtering, so Enter runs
   * it with no arrow-key step. On by default — the command-palette norm.
   * @default true
   */
  autoHighlight?: boolean
  /** Class merged onto the dialog surface. */
  className?: string
}

/**
 * A ⌘K-style command launcher: a modal Dialog (focus trap, Esc-to-close,
 * focus return) wrapping Base UI's Combobox in its inline mode, so the
 * filterable command list lives inside the dialog body instead of a nested
 * popup.
 *
 * The input carries `role="combobox"` with `aria-expanded`, `aria-controls`,
 * and `aria-activedescendant`; the list is a `listbox` of grouped `option`s.
 * Typing filters case-insensitively (label + keywords), Up/Down move the
 * highlight, Enter runs the highlighted command, and Escape closes the
 * palette and returns focus to wherever it was. Commands are *activated*,
 * not selected, so nothing stays checked between opens — and because the
 * Combobox's `open` is bound to the dialog's, its query/highlight/input all
 * reset every time the palette closes.
 *
 * **Opening is the consumer's job.** Wire a ⌘K / Ctrl+K listener (see
 * `useCommandPaletteShortcut`) or a button to flip `open`. This keeps the
 * shortcut owner — and any conflict resolution — in the app, not the widget.
 */
export function CommandPalette({
  open,
  onOpenChange,
  items,
  onSelect,
  label = 'Command palette',
  description = 'Search for a command, then press Enter to run it. Press Escape to close.',
  searchLabel = 'Search for a command',
  placeholder = 'Type a command or search…',
  emptyText = 'No commands found',
  formatResultCount = (count) => `${count} ${count === 1 ? 'result' : 'results'} available`,
  autoHighlight = true,
  className,
}: CommandPaletteProps): React.JSX.Element {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const [query, setQuery] = React.useState('')

  // Count matches with the SAME predicate Base UI filters with, so the
  // spoken tally always matches what is on screen.
  const resultCount = React.useMemo(
    () =>
      items.reduce(
        (sum, group) => sum + group.items.filter((item) => matchesQuery(item, query)).length,
        0
      ),
    [items, query]
  )

  const handleValueChange = React.useCallback(
    (selected: CommandItem | null) => {
      // Fires on activation. `value` is pinned to null below, so nothing is
      // ever retained as "selected" — we just run the command and close.
      if (selected == null || selected.disabled) {
        return
      }
      selected.onSelect?.()
      onSelect?.(selected)
      onOpenChange(false)
    },
    [onSelect, onOpenChange]
  )

  return (
    // AmbientDirection makes the combobox (and its portalled dialog, since
    // React context crosses portals) follow the DOM `dir` — global or a local
    // `dir="rtl"` — like the native components; Base UI reads a provider, not
    // the DOM.
    <AmbientDirection>
      <BaseCombobox.Root<CommandItem>
        items={items as never}
        // Bound to the dialog's open state per Base UI's Combobox-in-Dialog
        // guidance: it renders the list inline AND resets the query, highlight,
        // and input value each time the dialog closes.
        open={open}
        onOpenChange={onOpenChange}
        inline
        autoHighlight={autoHighlight}
        // Pinned to null: commands are activated, not selected, so no row ever
        // stays checked and reopening starts clean.
        value={null}
        onValueChange={handleValueChange}
        onInputValueChange={setQuery}
        isItemEqualToValue={(a, b) => a?.value === b?.value}
        itemToStringLabel={(item) => item?.label ?? ''}
        itemToStringValue={(item) => item?.value ?? ''}
        filter={(item, q) => matchesQuery(item as CommandItem, q)}
      >
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent
            size="lg"
            // The search input and Escape are the ways out; a floating Close
            // "X" over the search field reads as clutter in this pattern.
            dismissible={false}
            initialFocus={inputRef}
            className={cn('gap-0 overflow-hidden p-0', className)}
            data-slot="command-palette"
          >
            {/* Visually-hidden name + usage hint: the dialog needs an
                accessible name (WCAG 4.1.2), and the palette is otherwise a
                bare search box. */}
            <DialogTitle className="sr-only">{label}</DialogTitle>
            <DialogDescription className="sr-only">{description}</DialogDescription>

            <div
              data-slot="command-palette-input-row"
              className="relative border-b border-border p-105"
            >
              <SearchIcon />
              <BaseCombobox.Input
                ref={inputRef}
                data-slot="command-palette-input"
                placeholder={placeholder}
                aria-label={searchLabel}
                // In inline mode Base UI omits these (there is no separate
                // popup), but role=combobox still requires aria-expanded, and
                // the APG combobox pattern wants aria-haspopup. The inline
                // listbox is always present while the palette is open, so
                // expanded is unconditionally true.
                aria-expanded
                aria-haspopup="listbox"
                className={cn(
                  'w-full min-w-0 rounded-sm border border-border bg-background shadow-1',
                  'min-h-11 ps-5 pe-105 py-1 text-base text-foreground placeholder:text-muted-foreground',
                  'transition-colors motion-reduce:transition-none',
                  'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring'
                )}
              />
            </div>

            {/* Polite live region: the current match tally, announced to
                screen readers as the query narrows (WCAG 4.1.3). Kept mounted
                and updated by content, per Base UI's Status contract. */}
            <BaseCombobox.Status
              data-slot="command-palette-status"
              className="sr-only"
            >
              {formatResultCount(resultCount)}
            </BaseCombobox.Status>

            <div
              data-slot="command-palette-list-container"
              className="max-h-[min(24rem,60dvh)] overflow-y-auto overscroll-contain p-1"
            >
              <BaseCombobox.Empty
                data-slot="command-palette-empty"
                className="px-2 py-105 text-center text-sm text-muted-foreground"
              >
                {emptyText}
              </BaseCombobox.Empty>
              <BaseCombobox.List data-slot="command-palette-list">
                {(group: CommandGroup) => (
                  <BaseCombobox.Group
                    key={group.heading}
                    items={group.items as never}
                    data-slot="command-palette-group"
                    className="py-1 first:pt-0"
                  >
                    <BaseCombobox.GroupLabel
                      data-slot="command-palette-group-label"
                      className="px-2 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {group.heading}
                    </BaseCombobox.GroupLabel>
                    <BaseCombobox.Collection>
                      {(item: CommandItem) => (
                        <BaseCombobox.Item
                          key={item.value}
                          value={item}
                          disabled={item.disabled}
                          data-slot="command-palette-item"
                          className={commandPaletteItemVariants()}
                        >
                          {/* Icons are optional. When a command has none, a
                              same-size spacer holds the gutter so every label
                              lines up whether or not its row has an icon. */}
                          {item.icon != null ? (
                            <Icon
                              name={item.icon}
                              size="sm"
                              className="shrink-0 text-muted-foreground"
                            />
                          ) : (
                            <span aria-hidden="true" className="size-205 shrink-0" />
                          )}
                          <span className="grow truncate">{item.label}</span>
                          {item.shortcut != null && item.shortcut.length > 0 ? (
                            <KbdGroup keys={item.shortcut} size="sm" className="ms-auto shrink-0" />
                          ) : null}
                        </BaseCombobox.Item>
                      )}
                    </BaseCombobox.Collection>
                  </BaseCombobox.Group>
                )}
              </BaseCombobox.List>
            </div>
          </DialogContent>
        </Dialog>
      </BaseCombobox.Root>
    </AmbientDirection>
  )
}

export interface UseCommandPaletteShortcutOptions {
  /** The key pressed with the platform modifier. @default "k" */
  key?: string
  /** Turn the listener off (e.g. when a form owns the keystroke). @default true */
  enabled?: boolean
}

/**
 * Registers the conventional Cmd+K (macOS) / Ctrl+K (elsewhere) shortcut to
 * open a command palette, and returns nothing — you supply the handler.
 *
 * SSR-safe: it only ever touches `window` inside an effect, so it renders
 * identically on the server and never throws in a non-browser environment.
 * Platform-aware without sniffing the UA: it fires on *either* `metaKey` or
 * `ctrlKey`, which resolves to ⌘ on Mac and Ctrl on Windows/Linux — the same
 * "mod" concept `Kbd` renders. The latest callback is always used (kept in a
 * ref) so passing an inline arrow never re-binds the listener.
 */
export function useCommandPaletteShortcut(
  onTrigger: () => void,
  options?: UseCommandPaletteShortcutOptions
): void {
  const { key = 'k', enabled = true } = options ?? {}
  const callbackRef = React.useRef(onTrigger)

  React.useEffect(() => {
    callbackRef.current = onTrigger
  }, [onTrigger])

  React.useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return undefined
    }
    const target = key.toLowerCase()
    function handleKeyDown(event: KeyboardEvent): void {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === target) {
        event.preventDefault()
        callbackRef.current()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [key, enabled])
}
