// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { Menu as BaseMenu } from '@base-ui/react/menu'
import { Menubar as BaseMenubar } from '@base-ui/react/menubar'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import {
  dropdownMenuItemVariants,
  dropdownMenuPopupVariants,
} from '@/components/ui/dropdown-menu'
import { KbdGroup, type KbdToken } from '@/components/ui/kbd'
import { AmbientDirection } from '@/lib/ambient-direction'
import { cn } from '@/lib/cn'

/** Which side of a menu trigger the popup opens on (logical sides supported). */
export type MenubarSide =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'inline-start'
  | 'inline-end'

/** How a menu popup aligns to its trigger along the chosen side. */
export type MenubarAlign = 'start' | 'center' | 'end'

export interface MenubarProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'dir'> {
  /**
   * Modal behavior for the whole bar. `true` (the default) locks page scroll
   * and disables outside pointer interaction while a menu is open — the
   * desktop-application default. `false` leaves the page interactive.
   * @default true
   */
  modal?: boolean
  /**
   * Bar orientation. `horizontal` (the default) is the classic
   * File / Edit / View strip and roves between top menus with Left/Right;
   * `vertical` stacks them and roves with Up/Down.
   * @default "horizontal"
   */
  orientation?: 'horizontal' | 'vertical'
  /**
   * Loop the roving highlight from the last top menu back to the first (and
   * vice versa) when arrowing past the ends. @default true
   */
  loopFocus?: boolean
  /** Disable every top menu in the bar. @default false */
  disabled?: boolean
}

/**
 * A horizontal **application menu bar** — the File / Edit / View strip of a
 * desktop-style app — built on Base UI's Menubar, which coordinates a row of
 * Base UI Menus under one `role="menubar"`. It supplies the full APG menubar
 * keyboard contract: Left/Right Arrow rove between the top menus with a roving
 * tabindex (only one top menu is a tab stop), Home/End jump to the first/last,
 * Down (Up on a bottom-anchored bar) opens the focused menu onto its first
 * item, and once **any** menu is open, moving the pointer or arrowing onto an
 * adjacent top menu switches to it without an extra click. Inside an open menu
 * the standard Menu contract applies (Up/Down rove, typeahead, Enter/Space
 * activate, Escape closes and returns focus to the top menu).
 *
 * This is the desktop-application pattern, NOT website navigation. Use it only
 * for app-like tools that group **commands** (a document editor, a data-grid
 * console, an admin workbench). For moving between pages of a site use the
 * Navigation Menu (a `<nav>` of links); for a single trigger's action list use
 * the Dropdown Menu; for a right-click action list use the Context Menu.
 *
 * Renders the `role="menubar"` container element. Wrap the whole bar once; put
 * a `MenubarMenu` per top menu inside it.
 */
export const Menubar = React.forwardRef<HTMLDivElement, MenubarProps>(function Menubar(
  { className, modal = true, orientation = 'horizontal', loopFocus, disabled, ...props },
  ref
) {
  return (
    // AmbientDirection makes the bar (and its portalled popups, since React
    // context crosses portals) follow the DOM `dir` — global or a local
    // `dir="rtl"` — so logical sides flip, Left/Right rove the correct way,
    // and submenu chevrons point where the submenu opens, like the native
    // components; Base UI reads a provider, not the DOM.
    <AmbientDirection>
      <BaseMenubar
        {...props}
        ref={ref}
        modal={modal}
        orientation={orientation}
        loopFocus={loopFocus}
        disabled={disabled}
        data-slot="menubar"
        className={cn(
          // A real border on every state keeps the bar bounded in
          // forced-colors mode; the row is a flex strip of top menus.
          'flex w-fit items-center gap-05 rounded-md border border-border bg-background p-05',
          'data-[orientation=vertical]:w-fit data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
          className
        )}
      />
    </AmbientDirection>
  )
})

export interface MenubarMenuProps {
  /** Controlled open state of this top menu. */
  open?: boolean
  /** Initial open state for uncontrolled usage. @default false */
  defaultOpen?: boolean
  /** Called when this top menu opens or closes. */
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

/**
 * One top-level menu within the bar (its trigger + its popup). Renders no
 * element of its own — it is a Base UI Menu that reads the bar's context so
 * hovering an adjacent top menu switches to it while any menu is open, and the
 * bar owns the modal state. Put exactly one `MenubarTrigger` and one
 * `MenubarContent` inside.
 */
export function MenubarMenu({
  open,
  defaultOpen,
  onOpenChange,
  children,
}: MenubarMenuProps): React.JSX.Element {
  return (
    <BaseMenu.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {children}
    </BaseMenu.Root>
  )
}

export const menubarTriggerVariants = cva([
  // A top menu button. min-h-11 (2.75rem = 44px) meets the project pointer
  // target. The open/highlight fill is paired with font-medium so the active
  // top menu is never signalled by color alone (WCAG 1.4.1); the focus ring
  // and the `aria-expanded` state carry it in forced-colors mode.
  'inline-flex min-h-11 cursor-default select-none items-center gap-2 rounded-sm px-2 text-sm',
  'font-medium text-foreground outline-none',
  'hover:bg-muted data-highlighted:bg-muted',
  'data-[popup-open]:bg-muted',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  'data-disabled:pointer-events-none data-disabled:text-disabled-foreground',
])

export interface MenubarTriggerProps
  extends Omit<React.ComponentPropsWithoutRef<'button'>, 'onClick'> {
  /** Optional leading icon (inline SVG). Decorative — kept `aria-hidden`. */
  icon?: React.ReactNode
  /** Skip this top menu in keyboard navigation and disable opening it. */
  disabled?: boolean
}

/**
 * The clickable label for one top menu (`File`, `Edit`, …). Renders a
 * `<button role="menuitem">` with `aria-haspopup="menu"` and `aria-expanded`,
 * and participates in the bar's roving tabindex so only one top menu is a tab
 * stop at a time. Click, Enter, Space, or Down opens the menu.
 */
export const MenubarTrigger = React.forwardRef<HTMLButtonElement, MenubarTriggerProps>(
  function MenubarTrigger({ className, icon, disabled, children, ...props }, ref) {
    return (
      <BaseMenu.Trigger
        {...props}
        ref={ref}
        disabled={disabled}
        data-slot="menubar-trigger"
        className={cn(menubarTriggerVariants(), className)}
      >
        {icon != null ? (
          <span aria-hidden="true" className="flex size-2 shrink-0 items-center justify-center [&_svg]:size-2">
            {icon}
          </span>
        ) : null}
        {children}
      </BaseMenu.Trigger>
    )
  }
)

export interface MenubarContentProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'dir'> {
  /** Which side of the trigger to open on. @default "bottom" */
  side?: MenubarSide
  /** Alignment along the chosen side. @default "start" */
  align?: MenubarAlign
  /** Gap between the trigger and the popup, in pixels. @default 4 */
  sideOffset?: number
  /** Shift along the alignment axis, in pixels. @default 0 */
  alignOffset?: number
  /** Portal container. Defaults to `document.body`. */
  container?: React.ComponentProps<typeof BaseMenu.Portal>['container']
  /** Class merged onto the positioner (rarely needed). */
  positionerClassName?: string
}

/**
 * The popup for one top menu: portal + positioner + popup. Base UI supplies
 * `role="menu"`, roving focus, typeahead, Escape-to-close with focus return to
 * the top menu, and collision-aware positioning that flips logical sides in
 * RTL. Shares the Dropdown Menu's popup styling so every menu surface in the
 * system reads identically.
 */
export const MenubarContent = React.forwardRef<HTMLDivElement, MenubarContentProps>(
  function MenubarContent(
    {
      className,
      positionerClassName,
      side = 'bottom',
      align = 'start',
      sideOffset = 4,
      alignOffset = 0,
      container,
      children,
      ...props
    },
    ref
  ) {
    return (
      <BaseMenu.Portal container={container}>
        <BaseMenu.Positioner
          data-slot="menubar-positioner"
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          className={cn('z-50', positionerClassName)}
        >
          <BaseMenu.Popup
            {...props}
            ref={ref}
            data-slot="menubar-content"
            className={cn(dropdownMenuPopupVariants(), className)}
          >
            {children}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    )
  }
)

/** A fixed-size leading slot so icons/indicators keep item text aligned. */
function ItemSlot({ children }: { children?: React.ReactNode }): React.JSX.Element {
  return (
    <span
      aria-hidden={children == null ? 'true' : undefined}
      className="flex size-2 shrink-0 items-center justify-center [&_svg]:size-2"
    >
      {children}
    </span>
  )
}

export interface MenubarShortcutProps
  extends Omit<React.ComponentPropsWithoutRef<'span'>, 'children'> {
  /**
   * Shorthand for the shortcut's keys, rendered as Commons `Kbd` key caps via
   * `KbdGroup` (e.g. `keys={['mod', 'S']}` → ⌘S on macOS / Ctrl+S elsewhere).
   * Mutually exclusive with `children`.
   */
  keys?: Array<KbdToken | string>
  /** Manual shortcut content when `keys` is not enough (ignored if `keys` set). */
  children?: React.ReactNode
}

/**
 * A trailing keyboard-shortcut hint for a menu item. The visible key caps are
 * kept `aria-hidden` so the item's accessible name stays the command label
 * alone ("Save", not "Save Control S"); to also announce the shortcut, put
 * `aria-keyshortcuts` on the owning `MenubarItem` (its spread reaches the
 * `menuitem`). Pass `keys` for platform-adaptive Kbd glyphs, or `children` for
 * anything custom.
 */
export const MenubarShortcut = React.forwardRef<HTMLSpanElement, MenubarShortcutProps>(
  function MenubarShortcut({ className, keys, children, ...props }, ref) {
    return (
      <span
        {...props}
        ref={ref}
        aria-hidden="true"
        data-slot="menubar-shortcut"
        className={cn('ms-auto flex items-center ps-4 text-muted-foreground', className)}
      >
        {keys != null ? <KbdGroup keys={keys} size="sm" /> : children}
      </span>
    )
  }
)

export interface MenubarItemProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onClick'>,
    VariantProps<typeof dropdownMenuItemVariants> {
  /** Optional leading icon (inline SVG). Decorative — kept `aria-hidden`. */
  icon?: React.ReactNode
  /** Optional trailing content, typically a `MenubarShortcut`. */
  shortcut?: React.ReactNode
  /** Whether activating the item closes the menu. @default true */
  closeOnClick?: boolean
  /** Skip the item in keyboard navigation and disable activation. */
  disabled?: boolean
  /** Overrides the label used for first-letter typeahead matching. */
  label?: string
  /** Fired on activation (click, Enter, or Space). */
  onSelect?: React.MouseEventHandler<HTMLDivElement>
}

/**
 * A single command. Renders `role="menuitem"`. Pass `variant="destructive"`
 * for deletes and other irreversible commands, an optional leading `icon`, and
 * an optional trailing `shortcut`. Enter, Space, or click activates it (and
 * closes the menu unless `closeOnClick={false}`).
 */
export const MenubarItem = React.forwardRef<HTMLDivElement, MenubarItemProps>(
  function MenubarItem(
    { className, variant, icon, shortcut, closeOnClick, disabled, label, onSelect, children, ...props },
    ref
  ) {
    return (
      <BaseMenu.Item
        {...props}
        ref={ref}
        data-slot="menubar-item"
        disabled={disabled}
        label={label}
        closeOnClick={closeOnClick}
        onClick={onSelect}
        className={cn(dropdownMenuItemVariants({ variant }), className)}
      >
        {icon != null ? <ItemSlot>{icon}</ItemSlot> : null}
        <span className="grow truncate">{children}</span>
        {shortcut}
      </BaseMenu.Item>
    )
  }
)

export type MenubarSeparatorProps = React.ComponentPropsWithoutRef<'div'>

/**
 * A thin rule between groups of items. Renders `role="separator"`; purely
 * visual, so it is skipped by keyboard navigation.
 */
export const MenubarSeparator = React.forwardRef<HTMLDivElement, MenubarSeparatorProps>(
  function MenubarSeparator({ className, ...props }, ref) {
    return (
      <BaseMenu.Separator
        {...props}
        ref={ref}
        data-slot="menubar-separator"
        className={cn('-mx-05 my-05 h-px bg-border', className)}
      />
    )
  }
)

export type MenubarGroupProps = React.ComponentPropsWithoutRef<'div'>

/**
 * Groups related items. Pair with `MenubarLabel` inside it — Base UI wires the
 * label to the group via `aria-labelledby`.
 */
export const MenubarGroup = React.forwardRef<HTMLDivElement, MenubarGroupProps>(
  function MenubarGroup({ className, ...props }, ref) {
    return (
      <BaseMenu.Group
        {...props}
        ref={ref}
        data-slot="menubar-group"
        className={cn(className)}
      />
    )
  }
)

export type MenubarLabelProps = React.ComponentPropsWithoutRef<'div'>

/**
 * A non-interactive heading for a `MenubarGroup`. Renders the group's
 * `aria-labelledby` target — not a focusable item.
 */
export const MenubarLabel = React.forwardRef<HTMLDivElement, MenubarLabelProps>(
  function MenubarLabel({ className, ...props }, ref) {
    return (
      <BaseMenu.GroupLabel
        {...props}
        ref={ref}
        data-slot="menubar-label"
        className={cn('px-2 py-05 text-sm font-semibold text-muted-foreground', className)}
      />
    )
  }
)

function CheckIcon(): React.JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="size-2 shrink-0">
      <path
        d="m3.5 8.5 3 3 6-7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function RadioDot(): React.JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="size-1 shrink-0">
      <circle cx="8" cy="8" r="8" />
    </svg>
  )
}

function SubmenuChevron(): React.JSX.Element {
  return (
    // Directional, so it mirrors in RTL (`rtl:-scale-x-100`) per the Commons
    // internationalization contract — the chevron always points toward where
    // the submenu opens.
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      className="ms-auto size-2 shrink-0 rtl:-scale-x-100"
    >
      <path
        d="m6 4 4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export interface MenubarCheckboxItemProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onClick'> {
  /** Controlled checked state. */
  checked?: boolean
  /** Initial checked state for uncontrolled usage. @default false */
  defaultChecked?: boolean
  /** Called when the tick is toggled. */
  onCheckedChange?: (checked: boolean) => void
  /** Optional trailing content, typically a `MenubarShortcut`. */
  shortcut?: React.ReactNode
  /** Whether activating the item closes the menu. @default false */
  closeOnClick?: boolean
  disabled?: boolean
  label?: string
}

/**
 * A menu item that toggles a setting. Renders `role="menuitemcheckbox"` with
 * `aria-checked`; the checkmark appears only when checked. Stays open on toggle
 * by default so several boxes can be flipped in one visit.
 */
export const MenubarCheckboxItem = React.forwardRef<HTMLDivElement, MenubarCheckboxItemProps>(
  function MenubarCheckboxItem(
    { className, checked, defaultChecked, onCheckedChange, shortcut, closeOnClick, disabled, label, children, ...props },
    ref
  ) {
    return (
      <BaseMenu.CheckboxItem
        {...props}
        ref={ref}
        data-slot="menubar-checkbox-item"
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        closeOnClick={closeOnClick}
        disabled={disabled}
        label={label}
        className={cn(dropdownMenuItemVariants(), className)}
      >
        <ItemSlot>
          <BaseMenu.CheckboxItemIndicator className="flex text-foreground">
            <CheckIcon />
          </BaseMenu.CheckboxItemIndicator>
        </ItemSlot>
        <span className="grow truncate">{children}</span>
        {shortcut}
      </BaseMenu.CheckboxItem>
    )
  }
)

export interface MenubarRadioGroupProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange' | 'defaultValue'> {
  /** Controlled selected value. */
  value?: string
  /** Initial selected value for uncontrolled usage. */
  defaultValue?: string
  /** Called with the newly selected value. */
  onValueChange?: (value: string) => void
  disabled?: boolean
}

/**
 * Groups mutually exclusive `MenubarRadioItem`s. Renders `role="group"`;
 * exactly one child is selected at a time.
 */
export const MenubarRadioGroup = React.forwardRef<HTMLDivElement, MenubarRadioGroupProps>(
  function MenubarRadioGroup(
    { className, value, defaultValue, onValueChange, disabled, ...props },
    ref
  ) {
    return (
      <BaseMenu.RadioGroup
        {...props}
        ref={ref}
        data-slot="menubar-radio-group"
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        className={cn(className)}
      />
    )
  }
)

export interface MenubarRadioItemProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onClick'> {
  /** Value set on the enclosing radio group when this item is chosen. */
  value: string
  /** Optional trailing content, typically a `MenubarShortcut`. */
  shortcut?: React.ReactNode
  /** Whether activating the item closes the menu. @default false */
  closeOnClick?: boolean
  disabled?: boolean
  label?: string
}

/**
 * One choice within a `MenubarRadioGroup`. Renders `role="menuitemradio"` with
 * `aria-checked`; the dot appears when selected.
 */
export const MenubarRadioItem = React.forwardRef<HTMLDivElement, MenubarRadioItemProps>(
  function MenubarRadioItem(
    { className, value, shortcut, closeOnClick, disabled, label, children, ...props },
    ref
  ) {
    return (
      <BaseMenu.RadioItem
        {...props}
        ref={ref}
        data-slot="menubar-radio-item"
        value={value}
        closeOnClick={closeOnClick}
        disabled={disabled}
        label={label}
        className={cn(dropdownMenuItemVariants(), className)}
      >
        <ItemSlot>
          <BaseMenu.RadioItemIndicator className="flex text-foreground">
            <RadioDot />
          </BaseMenu.RadioItemIndicator>
        </ItemSlot>
        <span className="grow truncate">{children}</span>
        {shortcut}
      </BaseMenu.RadioItem>
    )
  }
)

export interface MenubarSubProps {
  /** Controlled open state of the submenu. */
  open?: boolean
  /** Initial open state for uncontrolled usage. @default false */
  defaultOpen?: boolean
  /** Called when the submenu opens or closes. */
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

/**
 * Root of a nested submenu. Renders no element of its own. Right Arrow (Left in
 * RTL) opens it and moves focus to its first item; Left Arrow (Right in RTL) or
 * Escape closes it and returns focus to the submenu trigger.
 */
export function MenubarSub({
  open,
  defaultOpen,
  onOpenChange,
  children,
}: MenubarSubProps): React.JSX.Element {
  return (
    <BaseMenu.SubmenuRoot open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {children}
    </BaseMenu.SubmenuRoot>
  )
}

export interface MenubarSubTriggerProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onClick'> {
  /** Optional leading icon (inline SVG). Decorative — kept `aria-hidden`. */
  icon?: React.ReactNode
  disabled?: boolean
  label?: string
}

/**
 * The item that opens a submenu. Renders `role="menuitem"` with
 * `aria-haspopup="menu"` and `aria-expanded`, plus a trailing chevron that
 * mirrors in RTL.
 */
export const MenubarSubTrigger = React.forwardRef<HTMLDivElement, MenubarSubTriggerProps>(
  function MenubarSubTrigger({ className, icon, disabled, label, children, ...props }, ref) {
    return (
      <BaseMenu.SubmenuTrigger
        {...props}
        ref={ref}
        data-slot="menubar-sub-trigger"
        disabled={disabled}
        label={label}
        className={cn(
          dropdownMenuItemVariants(),
          'data-[popup-open]:bg-muted data-[popup-open]:font-medium',
          className
        )}
      >
        {icon != null ? <ItemSlot>{icon}</ItemSlot> : null}
        <span className="grow truncate">{children}</span>
        <SubmenuChevron />
      </BaseMenu.SubmenuTrigger>
    )
  }
)

/**
 * The submenu surface (portal + positioner + popup). Opens to the inline end by
 * default and flips to the opposite side on collision or in RTL.
 */
export const MenubarSubContent = React.forwardRef<HTMLDivElement, MenubarContentProps>(
  function MenubarSubContent(
    {
      className,
      positionerClassName,
      side = 'inline-end',
      align = 'start',
      sideOffset = 0,
      alignOffset = -4,
      container,
      children,
      ...props
    },
    ref
  ) {
    return (
      <BaseMenu.Portal container={container}>
        <BaseMenu.Positioner
          data-slot="menubar-sub-positioner"
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          className={cn('z-50', positionerClassName)}
        >
          <BaseMenu.Popup
            {...props}
            ref={ref}
            data-slot="menubar-sub-content"
            className={cn(dropdownMenuPopupVariants(), className)}
          >
            {children}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    )
  }
)

/**
 * The raw Base UI Menubar container part, for layouts the composed API does not
 * cover (pair it with `MenubarPrimitive` menu parts). Style with the exported
 * `menubarTriggerVariants` and the Dropdown Menu's `dropdownMenuPopupVariants`
 * / `dropdownMenuItemVariants` to stay on-token.
 */
export const MenubarRootPrimitive = BaseMenubar

/**
 * The raw Base UI Menu parts (`Root`, `Trigger`, `Portal`, `Positioner`,
 * `Popup`, `Item`, `Separator`, `Group`, `GroupLabel`, `CheckboxItem`,
 * `RadioGroup`, `RadioItem`, `SubmenuRoot`, `SubmenuTrigger`, …) used for each
 * top menu inside the bar, for layouts the composed API does not cover.
 */
export const MenubarPrimitive = BaseMenu
