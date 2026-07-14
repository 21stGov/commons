// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { Menu as BaseMenu } from '@base-ui/react/menu'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { Button, type ButtonProps } from '@/components/ui/button'
import { AmbientDirection } from '@/lib/ambient-direction'
import { cn } from '@/lib/cn'

type TriggerRenderProp = React.ComponentProps<typeof BaseMenu.Trigger>['render']

/** Which side of the trigger the popup opens on (logical sides supported). */
export type DropdownMenuSide =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'inline-start'
  | 'inline-end'

/** How the popup aligns to the trigger along the chosen side. */
export type DropdownMenuAlign = 'start' | 'center' | 'end'

export interface DropdownMenuProps {
  /** Controlled open state. Leave unset for uncontrolled usage. */
  open?: boolean
  /** Initial open state for uncontrolled usage. @default false */
  defaultOpen?: boolean
  /** Called when the menu opens or closes. */
  onOpenChange?: (open: boolean) => void
  /**
   * Modal behavior. `true` (the default) locks page scroll and disables
   * outside pointer interaction while the menu is open — appropriate for a
   * focused set of actions. `false` leaves the page interactive.
   * @default true
   */
  modal?: boolean
  /**
   * Loop the roving highlight from the last item back to the first (and
   * vice versa) when arrowing past the ends. @default true
   */
  loopFocus?: boolean
  children?: React.ReactNode
}

/**
 * Root of a dropdown menu — a list of application **actions** revealed from
 * a trigger. Renders no element of its own. Built on Base UI's Menu, which
 * supplies the APG menu-button keyboard contract: opening moves focus to
 * the first item, Up/Down rove between items with Home/End and first-letter
 * typeahead, Enter/Space activate and close, Escape closes and returns focus
 * to the trigger, and disabled items stay reachable by the arrow keys but
 * cannot be activated.
 *
 * This is a menu of actions, not site navigation. For moving between pages
 * use a `<nav>` with links; for a single on/off control use a Button; for a
 * long, filterable set of choices use the Combo Box.
 */
export function DropdownMenu({
  open,
  defaultOpen,
  onOpenChange,
  modal = true,
  loopFocus,
  children,
}: DropdownMenuProps): React.JSX.Element {
  return (
    // AmbientDirection makes the menu (and its portalled popup, since React
    // context crosses portals) follow the DOM `dir` — global or a local
    // `dir="rtl"` — so logical sides flip and the submenu chevron points the
    // right way, like the native components; Base UI reads a provider, not the
    // DOM.
    <AmbientDirection>
      <BaseMenu.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        modal={modal}
        loopFocus={loopFocus}
      >
        {children}
      </BaseMenu.Root>
    </AmbientDirection>
  )
}

export interface DropdownMenuTriggerProps extends ButtonProps {
  /**
   * Replace the rendered element (Base UI render prop, the asChild
   * equivalent). When set, the Commons Button styling props (`variant`,
   * `size`, `loading`) are ignored and Base UI merges the trigger props
   * (`aria-haspopup="menu"`, `aria-expanded`, click/keyboard handling) onto
   * your element instead.
   */
  render?: TriggerRenderProp
}

/**
 * Opens the menu. Renders a Commons `Button` by default (so it inherits the
 * 44px target and focus ring); pass `render` to attach the menu to your own
 * element. Base UI sets `aria-haspopup="menu"` and toggles `aria-expanded`.
 */
export const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  function DropdownMenuTrigger(
    { render, variant = 'secondary', size, loading, loadingLabel, className, children, ...props },
    ref
  ) {
    return (
      <BaseMenu.Trigger
        {...props}
        ref={ref}
        render={
          render ?? (
            <Button
              variant={variant}
              size={size}
              loading={loading}
              loadingLabel={loadingLabel}
              className={className}
            />
          )
        }
      >
        {children}
      </BaseMenu.Trigger>
    )
  }
)

export const dropdownMenuPopupVariants = cva([
  // The visible surface. A real border on every state keeps a boundary in
  // forced-colors mode; the height is capped to the anchor-relative
  // available space so a long menu scrolls inside instead of running off
  // screen (usable at 400% zoom / reflow).
  'min-w-[12rem] rounded-md border border-border bg-background p-05 text-foreground shadow-3',
  '[max-block-size:var(--available-height)] overflow-y-auto overscroll-contain',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  // Motion: fade + slight scale via Base UI transition states, disabled for
  // reduced-motion users. Easing token comes from the Tailwind bridge.
  'motion-safe:transition-[opacity,scale] motion-safe:duration-150 motion-safe:ease-standard',
  'motion-safe:data-starting-style:opacity-0 motion-safe:data-starting-style:scale-95',
  'motion-safe:data-ending-style:opacity-0 motion-safe:data-ending-style:scale-95',
])

export interface DropdownMenuContentProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'dir'> {
  /** Which side of the trigger to open on. @default "bottom" */
  side?: DropdownMenuSide
  /** Alignment along the chosen side. @default "start" */
  align?: DropdownMenuAlign
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
 * The menu surface: portal + positioner + popup. Base UI supplies
 * `role="menu"`, roving focus, typeahead, Escape-to-close with focus return
 * to the trigger, and collision-aware positioning that flips logical sides
 * in RTL. Commons adds the styling and the 44px item targets.
 */
export const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  function DropdownMenuContent(
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
          data-slot="dropdown-menu-positioner"
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          className={cn('z-50', positionerClassName)}
        >
          <BaseMenu.Popup
            {...props}
            ref={ref}
            data-slot="dropdown-menu-content"
            className={cn(dropdownMenuPopupVariants(), className)}
          >
            {children}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    )
  }
)

export const dropdownMenuItemVariants = cva(
  [
    // 44px target, single row. Highlight (keyboard rove or pointer) is never
    // color alone (WCAG 1.4.1): the muted/danger fill is paired with a
    // weight bump to font-medium.
    'flex min-h-11 w-full cursor-default select-none items-center gap-2 rounded-sm px-2 text-sm',
    'outline-none',
    'data-disabled:pointer-events-none data-disabled:text-disabled-foreground',
  ],
  {
    variants: {
      variant: {
        default: [
          'text-foreground',
          'data-highlighted:bg-muted data-highlighted:font-medium',
        ],
        // Destructive rows read as danger from their text alone; the
        // highlight adds the error surface + weight so it is never signalled
        // by color only. Uses the readable error-text token (as Field errors
        // do), not the solid danger button fill.
        destructive: [
          'text-error-foreground',
          'data-highlighted:bg-error data-highlighted:font-medium',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
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

export interface DropdownMenuItemProps
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
export const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  function DropdownMenuItem(
    { className, variant, icon, closeOnClick, disabled, label, onSelect, children, ...props },
    ref
  ) {
    return (
      <BaseMenu.Item
        {...props}
        ref={ref}
        data-slot="dropdown-menu-item"
        disabled={disabled}
        label={label}
        closeOnClick={closeOnClick}
        onClick={onSelect}
        className={cn(dropdownMenuItemVariants({ variant }), className)}
      >
        {icon != null ? <ItemSlot>{icon}</ItemSlot> : null}
        <span className="grow truncate">{children}</span>
      </BaseMenu.Item>
    )
  }
)

export type DropdownMenuSeparatorProps = React.ComponentPropsWithoutRef<'div'>

/**
 * A thin rule between groups of items. Renders `role="separator"`; purely
 * visual, so it is skipped by keyboard navigation.
 */
export const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, DropdownMenuSeparatorProps>(
  function DropdownMenuSeparator({ className, ...props }, ref) {
    return (
      <BaseMenu.Separator
        {...props}
        ref={ref}
        data-slot="dropdown-menu-separator"
        className={cn('-mx-05 my-05 h-px bg-border', className)}
      />
    )
  }
)

export type DropdownMenuGroupProps = React.ComponentPropsWithoutRef<'div'>

/**
 * Groups related items. Pair with `DropdownMenuLabel` inside it — Base UI
 * wires the label to the group via `aria-labelledby`.
 */
export const DropdownMenuGroup = React.forwardRef<HTMLDivElement, DropdownMenuGroupProps>(
  function DropdownMenuGroup({ className, ...props }, ref) {
    return (
      <BaseMenu.Group
        {...props}
        ref={ref}
        data-slot="dropdown-menu-group"
        className={cn(className)}
      />
    )
  }
)

export type DropdownMenuLabelProps = React.ComponentPropsWithoutRef<'div'>

/**
 * A non-interactive heading for a `DropdownMenuGroup`. Renders
 * `DropdownMenuGroup`'s `aria-labelledby` target — not a focusable item.
 */
export const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  function DropdownMenuLabel({ className, ...props }, ref) {
    return (
      <BaseMenu.GroupLabel
        {...props}
        ref={ref}
        data-slot="dropdown-menu-label"
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

export interface DropdownMenuCheckboxItemProps
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
export const DropdownMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuCheckboxItemProps
>(function DropdownMenuCheckboxItem(
  { className, checked, defaultChecked, onCheckedChange, closeOnClick, disabled, label, children, ...props },
  ref
) {
  return (
    <BaseMenu.CheckboxItem
      {...props}
      ref={ref}
      data-slot="dropdown-menu-checkbox-item"
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
    </BaseMenu.CheckboxItem>
  )
})

export interface DropdownMenuRadioGroupProps
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
 * Groups mutually exclusive `DropdownMenuRadioItem`s. Renders `role="group"`;
 * exactly one child is selected at a time.
 */
export const DropdownMenuRadioGroup = React.forwardRef<HTMLDivElement, DropdownMenuRadioGroupProps>(
  function DropdownMenuRadioGroup(
    { className, value, defaultValue, onValueChange, disabled, ...props },
    ref
  ) {
    return (
      <BaseMenu.RadioGroup
        {...props}
        ref={ref}
        data-slot="dropdown-menu-radio-group"
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        className={cn(className)}
      />
    )
  }
)

export interface DropdownMenuRadioItemProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onClick'> {
  /** Value set on the enclosing radio group when this item is chosen. */
  value: string
  /** Whether activating the item closes the menu. @default false */
  closeOnClick?: boolean
  disabled?: boolean
  label?: string
}

/**
 * One choice within a `DropdownMenuRadioGroup`. Renders
 * `role="menuitemradio"` with `aria-checked`; the dot appears when selected.
 */
export const DropdownMenuRadioItem = React.forwardRef<HTMLDivElement, DropdownMenuRadioItemProps>(
  function DropdownMenuRadioItem(
    { className, value, closeOnClick, disabled, label, children, ...props },
    ref
  ) {
    return (
      <BaseMenu.RadioItem
        {...props}
        ref={ref}
        data-slot="dropdown-menu-radio-item"
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
      </BaseMenu.RadioItem>
    )
  }
)

export interface DropdownMenuSubProps {
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
export function DropdownMenuSub({
  open,
  defaultOpen,
  onOpenChange,
  children,
}: DropdownMenuSubProps): React.JSX.Element {
  return (
    <BaseMenu.SubmenuRoot open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {children}
    </BaseMenu.SubmenuRoot>
  )
}

export interface DropdownMenuSubTriggerProps
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
export const DropdownMenuSubTrigger = React.forwardRef<HTMLDivElement, DropdownMenuSubTriggerProps>(
  function DropdownMenuSubTrigger({ className, icon, disabled, label, children, ...props }, ref) {
    return (
      <BaseMenu.SubmenuTrigger
        {...props}
        ref={ref}
        data-slot="dropdown-menu-sub-trigger"
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
 * The submenu surface (portal + positioner + popup). Opens to the inline end
 * by default and flips to the opposite side on collision or in RTL.
 */
export const DropdownMenuSubContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  function DropdownMenuSubContent(
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
          data-slot="dropdown-menu-sub-positioner"
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          className={cn('z-50', positionerClassName)}
        >
          <BaseMenu.Popup
            {...props}
            ref={ref}
            data-slot="dropdown-menu-sub-content"
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
 * The raw Base UI Menu parts (`Root`, `Trigger`, `Portal`, `Positioner`,
 * `Popup`, `Item`, `Separator`, `Group`, `GroupLabel`, `CheckboxItem`,
 * `RadioGroup`, `RadioItem`, `SubmenuRoot`, `SubmenuTrigger`, …), for layouts
 * the composed API does not cover. Style with the exported
 * `dropdownMenuPopupVariants` / `dropdownMenuItemVariants` to stay on-token.
 */
export const DropdownMenuPrimitive = BaseMenu
