// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { ContextMenu as BaseContextMenu } from '@base-ui/react/context-menu'
import type { VariantProps } from 'class-variance-authority'
import * as React from 'react'

import {
  dropdownMenuItemVariants,
  dropdownMenuPopupVariants,
} from '@/components/ui/dropdown-menu'
import { AmbientDirection } from '@/lib/ambient-direction'
import { cn } from '@/lib/cn'

/** Which side of the anchor point the popup opens on (logical sides supported). */
export type ContextMenuSide =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'inline-start'
  | 'inline-end'

/** How the popup aligns to the anchor along the chosen side. */
export type ContextMenuAlign = 'start' | 'center' | 'end'

export interface ContextMenuProps {
  /** Controlled open state. Leave unset for uncontrolled usage. */
  open?: boolean
  /** Initial open state for uncontrolled usage. @default false */
  defaultOpen?: boolean
  /** Called when the menu opens or closes. */
  onOpenChange?: (open: boolean) => void
  /**
   * Loop the roving highlight from the last item back to the first (and
   * vice versa) when arrowing past the ends. @default true
   */
  loopFocus?: boolean
  children?: React.ReactNode
}

/**
 * Root of a context menu — a set of application **actions** revealed by
 * right-clicking (or long-pressing) an anchor region, or by pressing the
 * Menu key / Shift+F10 while a focusable element inside that region has
 * focus. Renders no element of its own. Built on Base UI's Context Menu,
 * which shares the APG menu keyboard contract with the Dropdown Menu once
 * open: the first item is focused on open, Up/Down rove between items with
 * Home/End and first-letter typeahead, Enter/Space activate and close,
 * Escape closes and returns focus to the trigger region, and disabled items
 * stay reachable by the arrow keys but cannot be activated.
 *
 * A context menu **hides** functionality behind a gesture, so it must only
 * ever *duplicate* actions that are also reachable another way (a visible
 * button, a toolbar, a Dropdown Menu) — never be the sole path to an action.
 * It is unreachable for most touch and many keyboard users otherwise.
 */
export function ContextMenu({
  open,
  defaultOpen,
  onOpenChange,
  loopFocus,
  children,
}: ContextMenuProps): React.JSX.Element {
  return (
    // AmbientDirection makes the menu (and its portalled popup, since React
    // context crosses portals) follow the DOM `dir` — global or a local
    // `dir="rtl"` — so logical sides flip and the submenu chevron points the
    // right way, like the native components; Base UI reads a provider, not the
    // DOM.
    <AmbientDirection>
      <BaseContextMenu.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange ? (nextOpen) => onOpenChange(nextOpen) : undefined}
        loopFocus={loopFocus}
      >
        {children}
      </BaseContextMenu.Root>
    </AmbientDirection>
  )
}

export interface ContextMenuTriggerProps
  extends React.ComponentPropsWithoutRef<'div'> {}

/**
 * The area that opens the menu. Renders a `<div>` that listens for the
 * `contextmenu` event (right click, long press, or the keyboard Menu key /
 * Shift+F10). For keyboard and touch users to reach the menu at all, place
 * a real, focusable, independently-useful control inside this region — the
 * keyboard `contextmenu` event is dispatched at the focused element and
 * bubbles here, and touch users have no other way in. The context menu must
 * duplicate those controls' actions, not replace them.
 */
export const ContextMenuTrigger = React.forwardRef<HTMLDivElement, ContextMenuTriggerProps>(
  function ContextMenuTrigger({ className, ...props }, ref) {
    return (
      <BaseContextMenu.Trigger
        {...props}
        ref={ref}
        data-slot="context-menu-trigger"
        className={cn(className)}
      />
    )
  }
)

export interface ContextMenuContentProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'dir'> {
  /** Which side of the anchor point to open on. @default "bottom" */
  side?: ContextMenuSide
  /** Alignment along the chosen side. @default "start" */
  align?: ContextMenuAlign
  /** Gap between the anchor point and the popup, in pixels. @default 2 */
  sideOffset?: number
  /** Shift along the alignment axis, in pixels. @default 0 */
  alignOffset?: number
  /** Portal container. Defaults to `document.body`. */
  container?: React.ComponentProps<typeof BaseContextMenu.Portal>['container']
  /** Class merged onto the positioner (rarely needed). */
  positionerClassName?: string
}

/**
 * The menu surface: portal + positioner + popup. Base UI supplies
 * `role="menu"`, roving focus, typeahead, Escape-to-close with focus return
 * to the trigger region, and cursor-anchored, collision-aware positioning
 * that flips logical sides in RTL. Shares the Dropdown Menu's popup styling
 * so the two surfaces read identically.
 */
export const ContextMenuContent = React.forwardRef<HTMLDivElement, ContextMenuContentProps>(
  function ContextMenuContent(
    {
      className,
      positionerClassName,
      side = 'bottom',
      align = 'start',
      sideOffset = 2,
      alignOffset = 0,
      container,
      children,
      ...props
    },
    ref
  ) {
    return (
      <BaseContextMenu.Portal container={container}>
        <BaseContextMenu.Positioner
          data-slot="context-menu-positioner"
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          className={cn('z-50', positionerClassName)}
        >
          <BaseContextMenu.Popup
            {...props}
            ref={ref}
            data-slot="context-menu-content"
            className={cn(dropdownMenuPopupVariants(), className)}
          >
            {children}
          </BaseContextMenu.Popup>
        </BaseContextMenu.Positioner>
      </BaseContextMenu.Portal>
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

export interface ContextMenuItemProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onClick'>,
    VariantProps<typeof dropdownMenuItemVariants> {
  /** Optional leading icon (inline SVG). Decorative — kept `aria-hidden`. */
  icon?: React.ReactNode
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
 * A single action. Renders `role="menuitem"`. Pass `variant="destructive"`
 * for deletes and other irreversible actions, and an optional leading
 * `icon`. Enter, Space, or click activates it (and closes the menu unless
 * `closeOnClick={false}`).
 */
export const ContextMenuItem = React.forwardRef<HTMLDivElement, ContextMenuItemProps>(
  function ContextMenuItem(
    { className, variant, icon, closeOnClick, disabled, label, onSelect, children, ...props },
    ref
  ) {
    return (
      <BaseContextMenu.Item
        {...props}
        ref={ref}
        data-slot="context-menu-item"
        disabled={disabled}
        label={label}
        closeOnClick={closeOnClick}
        onClick={onSelect}
        className={cn(dropdownMenuItemVariants({ variant }), className)}
      >
        {icon != null ? <ItemSlot>{icon}</ItemSlot> : null}
        <span className="grow truncate">{children}</span>
      </BaseContextMenu.Item>
    )
  }
)

export type ContextMenuSeparatorProps = React.ComponentPropsWithoutRef<'div'>

/**
 * A thin rule between groups of items. Renders `role="separator"`; purely
 * visual, so it is skipped by keyboard navigation.
 */
export const ContextMenuSeparator = React.forwardRef<HTMLDivElement, ContextMenuSeparatorProps>(
  function ContextMenuSeparator({ className, ...props }, ref) {
    return (
      <BaseContextMenu.Separator
        {...props}
        ref={ref}
        data-slot="context-menu-separator"
        className={cn('-mx-05 my-05 h-px bg-border', className)}
      />
    )
  }
)

export type ContextMenuGroupProps = React.ComponentPropsWithoutRef<'div'>

/**
 * Groups related items. Pair with `ContextMenuLabel` inside it — Base UI
 * wires the label to the group via `aria-labelledby`.
 */
export const ContextMenuGroup = React.forwardRef<HTMLDivElement, ContextMenuGroupProps>(
  function ContextMenuGroup({ className, ...props }, ref) {
    return (
      <BaseContextMenu.Group
        {...props}
        ref={ref}
        data-slot="context-menu-group"
        className={cn(className)}
      />
    )
  }
)

export type ContextMenuLabelProps = React.ComponentPropsWithoutRef<'div'>

/**
 * A non-interactive heading for a `ContextMenuGroup`. Renders the group's
 * `aria-labelledby` target — not a focusable item.
 */
export const ContextMenuLabel = React.forwardRef<HTMLDivElement, ContextMenuLabelProps>(
  function ContextMenuLabel({ className, ...props }, ref) {
    return (
      <BaseContextMenu.GroupLabel
        {...props}
        ref={ref}
        data-slot="context-menu-label"
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
      className="size-2 shrink-0 rtl:-scale-x-100"
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

export interface ContextMenuCheckboxItemProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onClick'> {
  /** Controlled checked state. */
  checked?: boolean
  /** Initial checked state for uncontrolled usage. @default false */
  defaultChecked?: boolean
  /** Called when the tick is toggled. */
  onCheckedChange?: (checked: boolean) => void
  /** Whether activating the item closes the menu. @default false */
  closeOnClick?: boolean
  disabled?: boolean
  label?: string
}

/**
 * A menu item that toggles a setting. Renders `role="menuitemcheckbox"` with
 * `aria-checked`; the checkmark appears only when checked. Stays open on
 * toggle by default so several boxes can be flipped in one visit.
 */
export const ContextMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  ContextMenuCheckboxItemProps
>(function ContextMenuCheckboxItem(
  { className, checked, defaultChecked, onCheckedChange, closeOnClick, disabled, label, children, ...props },
  ref
) {
  return (
    <BaseContextMenu.CheckboxItem
      {...props}
      ref={ref}
      data-slot="context-menu-checkbox-item"
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange}
      closeOnClick={closeOnClick}
      disabled={disabled}
      label={label}
      className={cn(dropdownMenuItemVariants(), className)}
    >
      <ItemSlot>
        <BaseContextMenu.CheckboxItemIndicator className="flex text-foreground">
          <CheckIcon />
        </BaseContextMenu.CheckboxItemIndicator>
      </ItemSlot>
      <span className="grow truncate">{children}</span>
    </BaseContextMenu.CheckboxItem>
  )
})

export interface ContextMenuRadioGroupProps
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
 * Groups mutually exclusive `ContextMenuRadioItem`s. Renders `role="group"`;
 * exactly one child is selected at a time.
 */
export const ContextMenuRadioGroup = React.forwardRef<HTMLDivElement, ContextMenuRadioGroupProps>(
  function ContextMenuRadioGroup(
    { className, value, defaultValue, onValueChange, disabled, ...props },
    ref
  ) {
    return (
      <BaseContextMenu.RadioGroup
        {...props}
        ref={ref}
        data-slot="context-menu-radio-group"
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        className={cn(className)}
      />
    )
  }
)

export interface ContextMenuRadioItemProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onClick'> {
  /** Value set on the enclosing radio group when this item is chosen. */
  value: string
  /** Whether activating the item closes the menu. @default false */
  closeOnClick?: boolean
  disabled?: boolean
  label?: string
}

/**
 * One choice within a `ContextMenuRadioGroup`. Renders
 * `role="menuitemradio"` with `aria-checked`; the dot appears when selected.
 */
export const ContextMenuRadioItem = React.forwardRef<HTMLDivElement, ContextMenuRadioItemProps>(
  function ContextMenuRadioItem(
    { className, value, closeOnClick, disabled, label, children, ...props },
    ref
  ) {
    return (
      <BaseContextMenu.RadioItem
        {...props}
        ref={ref}
        data-slot="context-menu-radio-item"
        value={value}
        closeOnClick={closeOnClick}
        disabled={disabled}
        label={label}
        className={cn(dropdownMenuItemVariants(), className)}
      >
        <ItemSlot>
          <BaseContextMenu.RadioItemIndicator className="flex text-foreground">
            <RadioDot />
          </BaseContextMenu.RadioItemIndicator>
        </ItemSlot>
        <span className="grow truncate">{children}</span>
      </BaseContextMenu.RadioItem>
    )
  }
)

export interface ContextMenuSubProps {
  /** Controlled open state of the submenu. */
  open?: boolean
  /** Initial open state for uncontrolled usage. @default false */
  defaultOpen?: boolean
  /** Called when the submenu opens or closes. */
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

/**
 * Root of a nested submenu. Renders no element of its own. Right Arrow (Left
 * in RTL) opens it and moves focus to its first item; Left Arrow (Right in
 * RTL) or Escape closes it and returns focus to the submenu trigger.
 */
export function ContextMenuSub({
  open,
  defaultOpen,
  onOpenChange,
  children,
}: ContextMenuSubProps): React.JSX.Element {
  return (
    <BaseContextMenu.SubmenuRoot open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {children}
    </BaseContextMenu.SubmenuRoot>
  )
}

export interface ContextMenuSubTriggerProps
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
export const ContextMenuSubTrigger = React.forwardRef<HTMLDivElement, ContextMenuSubTriggerProps>(
  function ContextMenuSubTrigger({ className, icon, disabled, label, children, ...props }, ref) {
    return (
      <BaseContextMenu.SubmenuTrigger
        {...props}
        ref={ref}
        data-slot="context-menu-sub-trigger"
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
      </BaseContextMenu.SubmenuTrigger>
    )
  }
)

/**
 * The submenu surface (portal + positioner + popup). Opens to the inline end
 * by default and flips to the opposite side on collision or in RTL.
 */
export const ContextMenuSubContent = React.forwardRef<HTMLDivElement, ContextMenuContentProps>(
  function ContextMenuSubContent(
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
      <BaseContextMenu.Portal container={container}>
        <BaseContextMenu.Positioner
          data-slot="context-menu-sub-positioner"
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          className={cn('z-50', positionerClassName)}
        >
          <BaseContextMenu.Popup
            {...props}
            ref={ref}
            data-slot="context-menu-sub-content"
            className={cn(dropdownMenuPopupVariants(), className)}
          >
            {children}
          </BaseContextMenu.Popup>
        </BaseContextMenu.Positioner>
      </BaseContextMenu.Portal>
    )
  }
)

/**
 * The raw Base UI Context Menu parts (`Root`, `Trigger`, `Portal`,
 * `Positioner`, `Popup`, `Item`, `Separator`, `Group`, `GroupLabel`,
 * `CheckboxItem`, `RadioGroup`, `RadioItem`, `SubmenuRoot`, `SubmenuTrigger`,
 * …), for layouts the composed API does not cover. Style with the Dropdown
 * Menu's exported `dropdownMenuPopupVariants` / `dropdownMenuItemVariants` to
 * stay on-token.
 */
export const ContextMenuPrimitive = BaseContextMenu
