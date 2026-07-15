// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

'use client'

import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { Button, type ButtonProps } from '@/components/ui/button'
import { AmbientDirection } from '@/lib/ambient-direction'
import { cn } from '@/lib/cn'

// Minimal ambient typing so the dev-only guard compiles without
// @types/node. Bundlers statically replace `process.env.NODE_ENV`.
declare const process: { env: { NODE_ENV?: string | undefined } } | undefined

type TriggerRenderProp = React.ComponentProps<typeof BaseDialog.Trigger>['render']
type CloseRenderProp = React.ComponentProps<typeof BaseDialog.Close>['render']

const DrawerModalContext = React.createContext(true)

export interface DrawerProps {
  /** Controlled open state. Leave unset for uncontrolled usage. */
  open?: boolean
  /** Initial open state for uncontrolled usage. @default false */
  defaultOpen?: boolean
  /** Called when the drawer opens or closes (Esc, backdrop press, Close). */
  onOpenChange?: (open: boolean) => void
  /**
   * Modal behavior. `true` traps focus, locks page scroll, and disables
   * outside pointer interaction — the right default for a panel that the
   * user should resolve before returning to the page. `"trap-focus"` traps
   * focus without locking scroll; `false` leaves the page interactive.
   * @default true
   */
  modal?: boolean | 'trap-focus'
  /**
   * Prevent presses outside the popup from closing the drawer. Esc and the
   * Close button still work — never remove every close affordance.
   * @default false
   */
  disablePointerDismissal?: boolean
  children?: React.ReactNode
}

/**
 * Drawer root. A drawer is a dialog anchored to an edge of the viewport, so
 * it is built on Base UI's Dialog and inherits its focus trap, Esc-to-close,
 * scroll lock, and focus return to the trigger. Renders no element of its own.
 */
export function Drawer({
  open,
  defaultOpen,
  onOpenChange,
  modal = true,
  disablePointerDismissal,
  children,
}: DrawerProps): React.JSX.Element {
  return (
    <DrawerModalContext.Provider value={modal === true}>
      {/* AmbientDirection makes the drawer (and its portalled popup, since React
          context crosses portals) follow the DOM `dir` — global or a local
          `dir="rtl"` — so the start/end edge anchoring and slide flip to match,
          like the native components; Base UI reads a provider, not the DOM. */}
      <AmbientDirection>
        <BaseDialog.Root
          open={open}
          defaultOpen={defaultOpen}
          onOpenChange={onOpenChange}
          modal={modal}
          disablePointerDismissal={disablePointerDismissal}
        >
          {children}
        </BaseDialog.Root>
      </AmbientDirection>
    </DrawerModalContext.Provider>
  )
}

export interface DrawerTriggerProps extends ButtonProps {
  /**
   * Replace the rendered element (Base UI render prop, the asChild
   * equivalent). When set, the Commons Button styling props (`variant`,
   * `size`, `loading`) are ignored and Base UI merges the drawer trigger
   * props (`aria-haspopup`, `aria-expanded`, click handling) onto your
   * element instead.
   */
  render?: TriggerRenderProp
}

/**
 * Opens the drawer. Renders a Commons `Button` by default; pass `render`
 * to swap in your own element.
 */
export const DrawerTrigger = React.forwardRef<HTMLButtonElement, DrawerTriggerProps>(
  function DrawerTrigger(
    { render, variant, size, loading, loadingLabel, className, children, ...props },
    ref
  ) {
    return (
      <BaseDialog.Trigger
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
      </BaseDialog.Trigger>
    )
  }
)

/**
 * Edge the drawer is anchored to. `start` / `end` are **logical**: they map
 * to the inline-start / inline-end edges and flip in RTL. `top` / `bottom`
 * sit on the block axis (they do not flip with direction).
 */
export type DrawerSide = 'start' | 'end' | 'top' | 'bottom'

export const drawerPopupVariants = cva(
  [
    // Edge-anchored panel. Fixed to the viewport so it slides in over the
    // page; keeps a shadow for depth and a token-driven divider toward the
    // content. Every side scrolls internally (overflow-y-auto + overscroll
    // containment) so it stays usable at 400% zoom / small viewports.
    'fixed z-50 flex flex-col gap-105 bg-background text-foreground shadow-3',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    // Motion: slide (transform) is motion-safe only; reduced-motion users
    // get a plain opacity fade instead of movement. The starting/ending
    // opacity applies in both cases; the transform is gated behind
    // motion-safe so reduced-motion never sees a jump. Easing token comes
    // from the Tailwind bridge (--ease-standard).
    'motion-safe:transition-[transform,opacity] motion-safe:duration-200 motion-safe:ease-standard',
    'motion-reduce:transition-[opacity] motion-reduce:duration-150 motion-reduce:ease-standard',
    'data-starting-style:opacity-0 data-ending-style:opacity-0',
  ],
  {
    variants: {
      side: {
        // Full block height, capped inline width. Slides from the
        // inline-start edge; the transform direction flips in RTL.
        start: [
          'start-0 [inset-block:0] w-80 max-w-[calc(100dvw-3rem)] overflow-y-auto overscroll-contain',
          'border-e border-border p-3',
          'motion-safe:data-starting-style:-translate-x-full motion-safe:data-ending-style:-translate-x-full',
          'rtl:motion-safe:data-starting-style:translate-x-full rtl:motion-safe:data-ending-style:translate-x-full',
        ],
        end: [
          'end-0 [inset-block:0] w-80 max-w-[calc(100dvw-3rem)] overflow-y-auto overscroll-contain',
          'border-s border-border p-3',
          'motion-safe:data-starting-style:translate-x-full motion-safe:data-ending-style:translate-x-full',
          'rtl:motion-safe:data-starting-style:-translate-x-full rtl:motion-safe:data-ending-style:-translate-x-full',
        ],
        // Full inline width, capped block height. Slides from the block edge
        // (top / bottom do not mirror in RTL).
        top: [
          '[inset-inline:0] [inset-block-start:0] max-h-[calc(100dvh-3rem)] overflow-y-auto overscroll-contain',
          'border-b border-border p-3',
          'motion-safe:data-starting-style:-translate-y-full motion-safe:data-ending-style:-translate-y-full',
        ],
        bottom: [
          '[inset-inline:0] [inset-block-end:0] max-h-[calc(100dvh-3rem)] overflow-y-auto overscroll-contain',
          'border-t border-border p-3',
          'motion-safe:data-starting-style:translate-y-full motion-safe:data-ending-style:translate-y-full',
        ],
      },
    },
    defaultVariants: {
      side: 'end',
    },
  }
)

function CloseIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="size-2 shrink-0"
    >
      <path d="m4 4 8 8M12 4l-8 8" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Dev-only guard: a drawer is a dialog, so it must have an accessible name
 * (WCAG 4.1.2) — either a `DrawerTitle` (wired to `aria-labelledby` by Base
 * UI) or an explicit `aria-label`. Rendered inside the popup so it re-checks
 * on every open; deferred a tick so Base UI has applied `aria-labelledby`.
 */
function DrawerNameGuard({ popupRef }: { popupRef: React.RefObject<HTMLDivElement | null> }): null {
  React.useEffect(() => {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
      return undefined
    }
    const id = setTimeout(() => {
      const node = popupRef.current
      if (!node) {
        return
      }
      const hasName = node.hasAttribute('aria-labelledby') || node.hasAttribute('aria-label')
      if (!hasName) {
        console.warn(
          '[commons] <DrawerContent> has no accessible name. Render a ' +
            '<DrawerTitle> inside it (preferred), or set `aria-label` on ' +
            '<DrawerContent> when a visible title is truly impossible.'
        )
      }
    }, 0)
    return () => clearTimeout(id)
  }, [popupRef])
  return null
}

export interface DrawerContentProps
  extends
    Omit<React.ComponentPropsWithoutRef<'div'>, 'children'>,
    VariantProps<typeof drawerPopupVariants> {
  children?: React.ReactNode
  /**
   * Render the icon Close button in the top corner (44px target). Keep it
   * unless the footer already offers an explicit, always-visible way out.
   * @default true
   */
  dismissible?: boolean
  /**
   * Accessible name for the icon Close button.
   * Translation-ready: pass a localized string.
   * @default "Close"
   */
  dismissLabel?: string
  /** Element to focus when the drawer opens (Base UI `initialFocus`). */
  initialFocus?: React.ComponentProps<typeof BaseDialog.Popup>['initialFocus']
  /** Element to focus when the drawer closes (Base UI `finalFocus`). */
  finalFocus?: React.ComponentProps<typeof BaseDialog.Popup>['finalFocus']
  /** Portal container. Defaults to `document.body`. */
  container?: React.ComponentProps<typeof BaseDialog.Portal>['container']
}

/**
 * The drawer surface: portal + backdrop + edge-anchored popup. Base UI's
 * Dialog provides the focus trap (Tab cycles inside), Esc-to-close,
 * backdrop-press-to-close, scroll lock, `role="dialog"` + `aria-modal`, and
 * focus return to the trigger; Commons adds the edge positioning, slide
 * animation, 44px Close button, and a dev warning when there is no
 * accessible name. Anchor the panel with `side` (default `"end"`).
 */
export const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(
  function DrawerContent(
    {
      className,
      side = 'end',
      children,
      dismissible = true,
      dismissLabel = 'Close',
      initialFocus,
      finalFocus,
      container,
      onKeyDown,
      'aria-modal': ariaModal,
      ...props
    },
    ref
  ) {
    const popupRef = React.useRef<HTMLDivElement | null>(null)
    const isModal = React.useContext(DrawerModalContext)

    function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
      onKeyDown?.(event)
      if (event.defaultPrevented || event.key !== 'Tab') {
        return
      }

      const popup = popupRef.current
      if (!popup) {
        return
      }

      const focusable = Array.from(
        popup.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
            'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => element.getAttribute('aria-hidden') !== 'true')

      if (focusable.length === 0) {
        event.preventDefault()
        popup.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    return (
      <BaseDialog.Portal container={container}>
        <BaseDialog.Backdrop
          data-slot="drawer-backdrop"
          className={cn(
            'fixed inset-0 z-50 bg-black',
            // Backdrop translucency is token-driven: --cui-backdrop-opacity
            // (core a11y.css) is 1 by default and 0 under
            // prefers-reduced-transparency, so alpha = 1 − 0.5×token gives
            // 50% black normally and a fully opaque scrim when the user
            // asks for reduced transparency.
            'opacity-[calc(1-0.5*var(--cui-backdrop-opacity,1))]',
            'motion-safe:transition-opacity motion-safe:duration-200 motion-safe:ease-standard',
            'motion-safe:data-starting-style:opacity-0 motion-safe:data-ending-style:opacity-0'
          )}
        />
        <BaseDialog.Viewport data-slot="drawer-viewport" className={cn('fixed inset-0 z-50')}>
          <BaseDialog.Popup
            {...props}
            aria-modal={ariaModal ?? (isModal ? true : undefined)}
            data-side={side}
            onKeyDown={handleKeyDown}
            ref={(node: HTMLDivElement | null) => {
              popupRef.current = node
              if (typeof ref === 'function') {
                ref(node)
              } else if (ref) {
                ref.current = node
              }
            }}
            data-slot="drawer-content"
            initialFocus={initialFocus}
            finalFocus={finalFocus}
            className={cn(drawerPopupVariants({ side }), className)}
          >
            <DrawerNameGuard popupRef={popupRef} />
            {children}
            {dismissible ? (
              <BaseDialog.Close
                data-slot="drawer-dismiss"
                aria-label={dismissLabel}
                className={cn(
                  // 44px (2.75rem) minimum target, tucked into the popup's
                  // padding at the inline-end. Placed after the content in
                  // the DOM so Tab reaches the primary actions first.
                  'absolute top-105 end-105 inline-flex min-h-11 min-w-11 shrink-0 cursor-pointer',
                  'items-center justify-center rounded-sm',
                  'border border-transparent bg-transparent text-foreground',
                  'transition-colors motion-reduce:transition-none hover:bg-muted',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
                )}
              >
                <CloseIcon />
              </BaseDialog.Close>
            ) : null}
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    )
  }
)

export type DrawerHeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export interface DrawerTitleProps extends React.ComponentPropsWithoutRef<'h2'> {
  /**
   * Heading element to render. Pick the level that fits the page outline
   * (no skipped levels).
   * @default "h2"
   */
  headingLevel?: DrawerHeadingLevel
}

/**
 * The drawer's title. Required in every drawer: Base UI wires its id to the
 * popup's `aria-labelledby`, giving the drawer its accessible name.
 */
export const DrawerTitle = React.forwardRef<HTMLHeadingElement, DrawerTitleProps>(
  function DrawerTitle({ headingLevel = 'h2', className, ...props }, ref) {
    const HeadingTag = headingLevel
    return (
      <BaseDialog.Title
        {...props}
        ref={ref}
        data-slot="drawer-title"
        render={<HeadingTag />}
        className={cn(
          // pe-4 keeps a long first line clear of the Close button.
          'pe-4 text-lg font-semibold leading-snug text-foreground',
          className
        )}
      />
    )
  }
)

export type DrawerDescriptionProps = React.ComponentPropsWithoutRef<'p'>

/**
 * Supporting text announced with the drawer. Base UI wires its id to the
 * popup's `aria-describedby`.
 */
export const DrawerDescription = React.forwardRef<HTMLParagraphElement, DrawerDescriptionProps>(
  function DrawerDescription({ className, ...props }, ref) {
    return (
      <BaseDialog.Description
        {...props}
        ref={ref}
        data-slot="drawer-description"
        className={cn('text-sm leading-normal text-muted-foreground', className)}
      />
    )
  }
)

export interface DrawerCloseProps extends ButtonProps {
  /**
   * Replace the rendered element (Base UI render prop). When set, the
   * Commons Button styling props are ignored.
   */
  render?: CloseRenderProp
}

/**
 * Closes the drawer. Renders a Commons `Button` (secondary by default —
 * the safe, non-destructive action).
 */
export const DrawerClose = React.forwardRef<HTMLButtonElement, DrawerCloseProps>(
  function DrawerClose(
    { render, variant = 'secondary', size, loading, loadingLabel, className, children, ...props },
    ref
  ) {
    return (
      <BaseDialog.Close
        {...props}
        ref={ref as React.Ref<HTMLButtonElement>}
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
      </BaseDialog.Close>
    )
  }
)

export type DrawerHeaderProps = React.ComponentPropsWithoutRef<'div'>

/**
 * Title area at the block-start of the drawer. Stacks the title and
 * description with tight rhythm; the icon Close button overlays its
 * inline-end corner (the `pe-4` on `DrawerTitle` reserves room).
 */
export const DrawerHeader = React.forwardRef<HTMLDivElement, DrawerHeaderProps>(
  function DrawerHeader({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-slot="drawer-header"
        className={cn('flex flex-col gap-05', className)}
      />
    )
  }
)

export type DrawerFooterProps = React.ComponentPropsWithoutRef<'div'>

/**
 * Action row pinned to the block-end of the drawer (`mt-auto`). Stacks on
 * narrow panels (primary action first visually), aligns to the inline end on
 * wider ones. Put the confirming Button last in the DOM.
 */
export const DrawerFooter = React.forwardRef<HTMLDivElement, DrawerFooterProps>(
  function DrawerFooter({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-slot="drawer-footer"
        className={cn(
          'mt-auto flex flex-col-reverse gap-105 pt-2 sm:flex-row sm:justify-end',
          className
        )}
      />
    )
  }
)
