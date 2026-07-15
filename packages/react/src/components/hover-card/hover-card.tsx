// SPDX-License-Identifier: MIT

'use client'

import { PreviewCard as BasePreviewCard } from '@base-ui/react/preview-card'
import * as React from 'react'

import { AmbientDirection } from '@/lib/ambient-direction'
import { cn } from '@/lib/cn'

declare const process: { env: { NODE_ENV?: string | undefined } } | undefined

type TriggerRenderProp = React.ComponentProps<typeof BasePreviewCard.Trigger>['render']

export interface HoverCardProps {
  /** Controlled open state. Leave unset for uncontrolled usage. */
  open?: boolean
  /** Initial open state for uncontrolled usage. @default false */
  defaultOpen?: boolean
  /** Called when the card opens or closes (hover, focus, Esc, blur). */
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

/**
 * Root of a hover card — a rich, **supplementary** preview of a link's
 * destination, shown on hover *and* on keyboard focus of the trigger and
 * dismissed on Escape or blur. Renders no element of its own. Built on Base
 * UI's Preview Card.
 *
 * A hover card is **non-critical by contract**: everything it shows must also
 * be reachable another way — the trigger is a real link, and the preview only
 * summarizes what lies at the other end. Never place the only copy of
 * important information, or any essential action, inside it: hover surfaces
 * are unreachable on touch and easy to miss. For content the user must act on,
 * use a Popover; for plain descriptive text, use a Tooltip.
 */
export function HoverCard({
  open,
  defaultOpen,
  onOpenChange,
  children,
}: HoverCardProps): React.JSX.Element {
  return (
    // AmbientDirection makes the hover card (and its portalled popup, since
    // React context crosses portals) follow the DOM `dir` — global or a local
    // `dir="rtl"` — so logical positioning sides flip, like the native
    // components; Base UI reads a provider, not the DOM.
    <AmbientDirection>
      <BasePreviewCard.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange ? (nextOpen) => onOpenChange(nextOpen) : undefined}
      >
        {children}
      </BasePreviewCard.Root>
    </AmbientDirection>
  )
}

export interface HoverCardTriggerProps
  extends Omit<React.ComponentProps<typeof BasePreviewCard.Trigger>, 'className'> {
  className?: string
  /**
   * How long to wait, in milliseconds, before the card opens on hover.
   * @default 600
   */
  delay?: number
  /**
   * How long to wait, in milliseconds, before the card closes after the
   * pointer leaves. The gap lets the pointer cross from the trigger onto the
   * card without it disappearing. @default 300
   */
  closeDelay?: number
  /**
   * Replace the rendered element (Base UI render prop). The trigger **must**
   * stay a genuine, focusable, independently-useful control — a real link is
   * the intended element, because it works on touch and by keyboard even
   * when the hover preview never opens.
   */
  render?: TriggerRenderProp
}

/**
 * The element the card previews. Renders a native `<a>` by default — pass an
 * `href` so it is a real, focusable link that works without the card (on
 * touch, and for keyboard users). The card opens on hover and on focus of
 * this element. In development, a warning fires if the trigger is not
 * focusable, because a non-focusable trigger cannot open the card by keyboard
 * and hides its content from everyone who is not using a mouse.
 */
export const HoverCardTrigger = React.forwardRef<HTMLAnchorElement, HoverCardTriggerProps>(
  function HoverCardTrigger({ className, render, ...props }, forwardedRef) {
    const [node, setNode] = React.useState<HTMLElement | null>(null)
    const composedRef = React.useCallback(
      (value: HTMLAnchorElement | null) => {
        setNode(value)
        if (typeof forwardedRef === 'function') {
          forwardedRef(value)
        } else if (forwardedRef) {
          forwardedRef.current = value
        }
      },
      [forwardedRef]
    )

    React.useEffect(() => {
      if (
        !node ||
        (typeof process !== 'undefined' && process.env.NODE_ENV === 'production')
      ) {
        return
      }
      const focusable =
        (node.tabIndex >= 0 || node.matches('a[href], button, input, select, textarea')) &&
        !node.hasAttribute('disabled')
      if (!focusable) {
        console.warn(
          '[commons] <HoverCardTrigger> is not focusable. A hover card must open on ' +
            'keyboard focus as well as hover, and its trigger must be independently useful ' +
            'on touch — render a real link (an <a> with href) or another focusable control.'
        )
      }
    }, [node])

    return (
      <BasePreviewCard.Trigger
        {...props}
        ref={composedRef}
        render={render}
        data-slot="hover-card-trigger"
        className={cn(
          // A body-text link: underlined so it never relies on color alone
          // (WCAG 1.4.1), with the Commons focus ring and inheriting text.
          'rounded-sm text-inherit underline underline-offset-2',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          className
        )}
      />
    )
  }
)

type PreviewCardPopupProps = React.ComponentPropsWithoutRef<typeof BasePreviewCard.Popup>
type PreviewCardPositionerProps = React.ComponentPropsWithoutRef<typeof BasePreviewCard.Positioner>

export interface HoverCardContentProps extends Omit<PreviewCardPopupProps, 'className'> {
  className?: string
  /** Preferred side; collision handling may flip it. @default "bottom" */
  side?: PreviewCardPositionerProps['side']
  /** Alignment relative to the trigger. @default "center" */
  align?: PreviewCardPositionerProps['align']
  /** Gap between trigger and card, in CSS pixels. @default 8 */
  sideOffset?: PreviewCardPositionerProps['sideOffset']
  alignOffset?: PreviewCardPositionerProps['alignOffset']
  collisionPadding?: PreviewCardPositionerProps['collisionPadding']
  /** Portal container. Defaults to `document.body`. */
  container?: React.ComponentProps<typeof BasePreviewCard.Portal>['container']
}

/**
 * The card surface: portal + positioner + popup. Base UI provides the
 * portalling, collision-aware anchored positioning that flips logical sides
 * in RTL, hover/focus open with a short close delay so the pointer can cross
 * onto the card, and Escape-to-close. Commons adds the styling. The content
 * API is open (`children`) for a rich preview — a name, avatar, and summary —
 * that must remain purely supplementary.
 */
export const HoverCardContent = React.forwardRef<HTMLDivElement, HoverCardContentProps>(
  function HoverCardContent(
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
      <BasePreviewCard.Portal container={container}>
        <BasePreviewCard.Positioner
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          collisionPadding={collisionPadding}
          data-slot="hover-card-positioner"
          className="z-50 outline-none"
        >
          <BasePreviewCard.Popup
            {...props}
            ref={ref}
            data-slot="hover-card-content"
            className={cn(
              'rounded-md border border-border bg-background p-2 text-foreground shadow-3',
              '[max-inline-size:min(20rem,calc(100dvw-2rem))] text-sm leading-normal',
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
          </BasePreviewCard.Popup>
        </BasePreviewCard.Positioner>
      </BasePreviewCard.Portal>
    )
  }
)

/**
 * The raw Base UI Preview Card parts (`Root`, `Trigger`, `Portal`,
 * `Positioner`, `Popup`, `Arrow`, `Backdrop`, `Viewport`), for layouts the
 * composed API does not cover.
 */
export const HoverCardPrimitive = BasePreviewCard
