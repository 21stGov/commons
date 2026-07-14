// SPDX-License-Identifier: MIT

import { Popover as BasePopover } from '@base-ui/react/popover'
import * as React from 'react'

import { AmbientDirection } from '@/lib/ambient-direction'
import { cn } from '@/lib/cn'

type TriggerRenderProp = React.ComponentProps<typeof BasePopover.Trigger>['render']
type CloseRenderProp = React.ComponentProps<typeof BasePopover.Close>['render']

export interface PopoverProps {
  /** Controlled open state. Leave unset for uncontrolled usage. */
  open?: boolean
  /** Initial open state for uncontrolled usage. @default false */
  defaultOpen?: boolean
  /** Called when the popover opens or closes (Esc, outside press, Close). */
  onOpenChange?: (open: boolean) => void
  /**
   * Modal behavior. A popover is anchored, non-blocking content, so it stays
   * `false` by default: the rest of the page remains interactive. Set
   * `"trap-focus"` (or `true`) only when the popover must hold focus — render a
   * `PopoverClose` inside `PopoverContent` so touch screen-reader users can
   * still escape.
   * @default false
   */
  modal?: boolean | 'trap-focus'
  children?: React.ReactNode
}

/**
 * Interactive, anchored content root. Groups a trigger and its content and
 * renders no element of its own. Built on Base UI, which supplies open/close
 * state, Esc-to-close, `aria-expanded`/`aria-haspopup` on the trigger, moving
 * focus into the popup on open, and returning focus to the trigger on close.
 *
 * Unlike a tooltip, a popover is interactive: it may contain focusable
 * controls, small forms, and actions.
 */
export function Popover({
  open,
  defaultOpen,
  onOpenChange,
  modal = false,
  children,
}: PopoverProps): React.JSX.Element {
  return (
    // AmbientDirection makes the popover (and its portalled popup, since React
    // context crosses portals) follow the DOM `dir` — global or a local
    // `dir="rtl"` — so logical positioning sides flip, like the native
    // components; Base UI reads a provider, not the DOM.
    <AmbientDirection>
      <BasePopover.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange ? (nextOpen) => onOpenChange(nextOpen) : undefined}
        modal={modal}
      >
        {children}
      </BasePopover.Root>
    </AmbientDirection>
  )
}

export interface PopoverTriggerProps
  extends Omit<React.ComponentProps<typeof BasePopover.Trigger>, 'className'> {
  className?: string
  /**
   * Replace the rendered element (Base UI render prop, the asChild
   * equivalent). Pass `render={<Button>…</Button>}` to attach the popover to a
   * Commons Button, or any other focusable control. Base UI merges the trigger
   * behavior (`aria-haspopup`, `aria-expanded`, click handling) onto it.
   */
  render?: TriggerRenderProp
}

/**
 * The control that opens the popover. Renders a native `<button>` by default
 * with the Commons focus ring and a 44px target; pass `render` to attach the
 * behavior to an existing control such as a Commons Button.
 */
export const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  function PopoverTrigger({ className, render, ...props }, ref) {
    return (
      <BasePopover.Trigger
        {...props}
        ref={ref as never}
        render={render}
        data-slot="popover-trigger"
        className={cn(
          // Only styled when we render the default native button; when `render`
          // is supplied Base UI merges classes onto your element instead.
          'inline-flex min-h-11 cursor-pointer items-center justify-center gap-1 rounded-sm',
          'border border-border-strong bg-transparent px-105 py-05 text-sm font-medium text-foreground',
          'transition-colors motion-reduce:transition-none hover:bg-muted',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          'forced-colors:border-[CanvasText]',
          className
        )}
      />
    )
  }
)

type PopoverPopupProps = React.ComponentPropsWithoutRef<typeof BasePopover.Popup>
type PopoverPositionerProps = React.ComponentPropsWithoutRef<typeof BasePopover.Positioner>

export interface PopoverContentProps extends Omit<PopoverPopupProps, 'className'> {
  className?: string
  /** Preferred side; collision handling may flip it. @default "bottom" */
  side?: PopoverPositionerProps['side']
  /** Alignment relative to the trigger. @default "center" */
  align?: PopoverPositionerProps['align']
  /** Gap between trigger and popup, in CSS pixels. @default 8 */
  sideOffset?: PopoverPositionerProps['sideOffset']
  alignOffset?: PopoverPositionerProps['alignOffset']
  collisionPadding?: PopoverPositionerProps['collisionPadding']
  /** Portal container. Defaults to `document.body`. */
  container?: React.ComponentProps<typeof BasePopover.Portal>['container']
}

/**
 * The popover surface: portal + positioner + popup. Base UI provides the
 * portalling, collision-aware anchored positioning, Esc-to-close, focus
 * management (focus in on open, back to the trigger on close), and the
 * `role="dialog"` semantics. Commons adds the styling. The content API is
 * intentionally open (`children`) so it can host filters, small forms, or a
 * future date picker.
 */
export const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  function PopoverContent(
    {
      className,
      side = 'bottom',
      align = 'center',
      sideOffset = 8,
      alignOffset,
      collisionPadding = 8,
      container,
      children,
      ...props
    },
    ref
  ) {
    return (
      <BasePopover.Portal container={container}>
        <BasePopover.Positioner
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          collisionPadding={collisionPadding}
          data-slot="popover-positioner"
          className="z-50 outline-none"
        >
          <BasePopover.Popup
            {...props}
            ref={ref}
            data-slot="popover-content"
            className={cn(
              'flex flex-col gap-105 rounded-md border border-border bg-background p-2 text-foreground shadow-3',
              '[max-inline-size:min(20rem,calc(100dvw-2rem))]',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              'motion-safe:origin-[var(--transform-origin)] motion-safe:transition-[opacity,scale]',
              'motion-safe:duration-150 motion-safe:ease-standard',
              'motion-safe:data-starting-style:scale-95 motion-safe:data-starting-style:opacity-0',
              'motion-safe:data-ending-style:scale-95 motion-safe:data-ending-style:opacity-0',
              'forced-colors:border-[CanvasText]',
              className
            )}
          >
            {children}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    )
  }
)

export type PopoverHeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export interface PopoverTitleProps extends React.ComponentPropsWithoutRef<'h2'> {
  /**
   * Heading element to render. Pick the level that fits the page outline
   * (no skipped levels).
   * @default "h2"
   */
  headingLevel?: PopoverHeadingLevel
}

/**
 * Optional title for the popover. Base UI wires its id to the popup's
 * `aria-labelledby`, giving the popover an accessible name.
 */
export const PopoverTitle = React.forwardRef<HTMLHeadingElement, PopoverTitleProps>(
  function PopoverTitle({ headingLevel = 'h2', className, ...props }, ref) {
    const HeadingTag = headingLevel
    return (
      <BasePopover.Title
        {...props}
        ref={ref}
        data-slot="popover-title"
        render={<HeadingTag />}
        className={cn('text-sm font-semibold leading-snug text-foreground', className)}
      />
    )
  }
)

export type PopoverDescriptionProps = React.ComponentPropsWithoutRef<'p'>

/**
 * Optional supporting text. Base UI wires its id to the popup's
 * `aria-describedby`.
 */
export const PopoverDescription = React.forwardRef<HTMLParagraphElement, PopoverDescriptionProps>(
  function PopoverDescription({ className, ...props }, ref) {
    return (
      <BasePopover.Description
        {...props}
        ref={ref}
        data-slot="popover-description"
        className={cn('text-sm leading-normal text-muted-foreground', className)}
      />
    )
  }
)

export interface PopoverCloseProps
  extends Omit<React.ComponentProps<typeof BasePopover.Close>, 'className'> {
  className?: string
  /**
   * Replace the rendered element (Base UI render prop). Pass
   * `render={<Button>…</Button>}` to close from a Commons Button.
   */
  render?: CloseRenderProp
}

/**
 * Closes the popover and returns focus to the trigger. Renders a native
 * `<button>` with the Commons focus ring and a 44px target by default; pass
 * `render` to swap in your own control.
 */
export const PopoverClose = React.forwardRef<HTMLButtonElement, PopoverCloseProps>(
  function PopoverClose({ className, render, ...props }, ref) {
    return (
      <BasePopover.Close
        {...props}
        ref={ref as never}
        render={render}
        data-slot="popover-close"
        className={cn(
          'inline-flex min-h-11 cursor-pointer items-center justify-center gap-1 rounded-sm',
          'border border-transparent bg-transparent px-105 py-05 text-sm font-medium text-foreground',
          'transition-colors motion-reduce:transition-none hover:bg-muted',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          className
        )}
      />
    )
  }
)
