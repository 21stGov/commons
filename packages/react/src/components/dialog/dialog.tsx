// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

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

const DialogModalContext = React.createContext(true)

export interface DialogProps {
  /** Controlled open state. Leave unset for uncontrolled usage. */
  open?: boolean
  /** Initial open state for uncontrolled usage. @default false */
  defaultOpen?: boolean
  /** Called when the dialog opens or closes (Esc, backdrop press, Close). */
  onOpenChange?: (open: boolean) => void
  /**
   * Modal behavior. `true` traps focus, locks page scroll, and disables
   * outside pointer interaction — the right default for a blocking
   * decision. `"trap-focus"` traps focus without locking scroll; `false`
   * leaves the page interactive.
   * @default true
   */
  modal?: boolean | 'trap-focus'
  /**
   * Prevent presses outside the popup from closing the dialog. Esc and the
   * Close button still work — never remove every close affordance.
   * @default false
   */
  disablePointerDismissal?: boolean
  children?: React.ReactNode
}

/**
 * Modal dialog root. Groups a trigger and its content; renders no element
 * of its own. Built on Base UI, which supplies the focus trap, Esc-to-close,
 * scroll lock, and focus return to the trigger.
 */
export function Dialog({
  open,
  defaultOpen,
  onOpenChange,
  modal = true,
  disablePointerDismissal,
  children,
}: DialogProps): React.JSX.Element {
  return (
    <DialogModalContext.Provider value={modal === true}>
      {/* AmbientDirection makes the dialog (and its portalled popup, since React
          context crosses portals) follow the DOM `dir` — global or a local
          `dir="rtl"` — like the native components; Base UI reads a provider,
          not the DOM. */}
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
    </DialogModalContext.Provider>
  )
}

export interface DialogTriggerProps extends ButtonProps {
  /**
   * Replace the rendered element (Base UI render prop, the asChild
   * equivalent). When set, the Commons Button styling props (`variant`,
   * `size`, `loading`) are ignored and Base UI merges the dialog trigger
   * props (`aria-haspopup`, `aria-expanded`, click handling) onto your
   * element instead.
   */
  render?: TriggerRenderProp
}

/**
 * Opens the dialog. Renders a Commons `Button` by default; pass `render`
 * to swap in your own element.
 */
export const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  function DialogTrigger(
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

export const dialogPopupVariants = cva(
  // Popup: the surrounding Base UI Viewport performs the centering. The
  // popup stays relative so its dismiss button is anchored to the surface,
  // and is capped to the dynamic viewport for 400% zoom/reflow.
  [
    'relative flex h-fit w-full flex-col gap-105',
    '[max-block-size:calc(100dvh-2rem)] overflow-y-auto overscroll-contain',
    'rounded-md border border-border bg-background p-3 text-foreground shadow-3',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    // Motion: fade + slight scale via Base UI transition states
    // (data-starting-style / data-ending-style), fully disabled for
    // reduced-motion users. Easing token comes from the Tailwind bridge
    // (--ease-standard → --cui-motion-easing-standard).
    'motion-safe:transition-[opacity,scale] motion-safe:duration-150 motion-safe:ease-standard',
    'motion-safe:data-starting-style:opacity-0 motion-safe:data-starting-style:scale-95',
    'motion-safe:data-ending-style:opacity-0 motion-safe:data-ending-style:scale-95',
  ],
  {
    variants: {
      size: {
        sm: '[max-inline-size:min(24rem,calc(100dvw-2rem))]',
        md: '[max-inline-size:min(32rem,calc(100dvw-2rem))]',
        lg: '[max-inline-size:min(44rem,calc(100dvw-2rem))]',
      },
    },
    defaultVariants: {
      size: 'md',
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
 * Dev-only guard: a modal dialog must have an accessible name (WCAG
 * 4.1.2) — either a `DialogTitle` (wired to `aria-labelledby` by Base UI)
 * or an explicit `aria-label`. Rendered inside the popup so it re-checks
 * on every open. The check is deferred a tick so Base UI has applied
 * `aria-labelledby` before we look.
 */
function DialogNameGuard({ popupRef }: { popupRef: React.RefObject<HTMLDivElement | null> }): null {
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
          '[commons] <DialogContent> has no accessible name. Render a ' +
            '<DialogTitle> inside it (preferred), or set `aria-label` on ' +
            '<DialogContent> when a visible title is truly impossible.'
        )
      }
    }, 0)
    return () => clearTimeout(id)
  }, [popupRef])
  return null
}

export interface DialogContentProps
  extends
    Omit<React.ComponentPropsWithoutRef<'div'>, 'children'>,
    VariantProps<typeof dialogPopupVariants> {
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
  /** Element to focus when the dialog opens (Base UI `initialFocus`). */
  initialFocus?: React.ComponentProps<typeof BaseDialog.Popup>['initialFocus']
  /** Element to focus when the dialog closes (Base UI `finalFocus`). */
  finalFocus?: React.ComponentProps<typeof BaseDialog.Popup>['finalFocus']
  /** Portal container. Defaults to `document.body`. */
  container?: React.ComponentProps<typeof BaseDialog.Portal>['container']
}

/**
 * The dialog surface: portal + backdrop + popup. Base UI provides the
 * focus trap (Tab cycles inside), Esc-to-close, backdrop-press-to-close,
 * scroll lock, `role="dialog"` + `aria-modal`, and focus return to the
 * trigger; Commons adds the styling, the 44px Close button, and a dev
 * warning when the dialog has no accessible name.
 */
export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent(
    {
      className,
      size,
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
    const isModal = React.useContext(DialogModalContext)

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
          data-slot="dialog-backdrop"
          className={cn(
            'fixed inset-0 z-50 bg-black',
            // Backdrop translucency is token-driven: --cui-backdrop-opacity
            // (core a11y.css) is 1 by default and 0 under
            // prefers-reduced-transparency, so alpha = 1 − 0.5×token gives
            // 50% black normally and a fully opaque scrim when the user
            // asks for reduced transparency.
            'opacity-[calc(1-0.5*var(--cui-backdrop-opacity,1))]',
            'motion-safe:transition-opacity motion-safe:duration-150 motion-safe:ease-standard',
            'motion-safe:data-starting-style:opacity-0 motion-safe:data-ending-style:opacity-0'
          )}
        />
        <BaseDialog.Viewport
          data-slot="dialog-viewport"
          className={cn(
            'fixed inset-0 z-50 grid place-items-center overflow-y-auto overscroll-contain p-2'
          )}
        >
          <BaseDialog.Popup
            {...props}
            aria-modal={ariaModal ?? (isModal ? true : undefined)}
            onKeyDown={handleKeyDown}
            ref={(node: HTMLDivElement | null) => {
              popupRef.current = node
              if (typeof ref === 'function') {
                ref(node)
              } else if (ref) {
                ref.current = node
              }
            }}
            data-slot="dialog-content"
            initialFocus={initialFocus}
            finalFocus={finalFocus}
            className={cn(dialogPopupVariants({ size }), className)}
          >
            <DialogNameGuard popupRef={popupRef} />
            {children}
            {dismissible ? (
              <BaseDialog.Close
                data-slot="dialog-dismiss"
                aria-label={dismissLabel}
                className={cn(
                  // 44px (2.75rem) minimum target, tucked into the popup's
                  // padding. Placed after the content in the DOM so Tab
                  // reaches the primary actions first.
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

export type DialogHeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export interface DialogTitleProps extends React.ComponentPropsWithoutRef<'h2'> {
  /**
   * Heading element to render. Pick the level that fits the page outline
   * (no skipped levels).
   * @default "h2"
   */
  headingLevel?: DialogHeadingLevel
}

/**
 * The dialog's title. Required in every dialog: Base UI wires its id to
 * the popup's `aria-labelledby`, giving the dialog its accessible name.
 */
export const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  function DialogTitle({ headingLevel = 'h2', className, ...props }, ref) {
    const HeadingTag = headingLevel
    return (
      <BaseDialog.Title
        {...props}
        ref={ref}
        data-slot="dialog-title"
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

export type DialogDescriptionProps = React.ComponentPropsWithoutRef<'p'>

/**
 * Supporting text announced with the dialog. Base UI wires its id to the
 * popup's `aria-describedby`.
 */
export const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  function DialogDescription({ className, ...props }, ref) {
    return (
      <BaseDialog.Description
        {...props}
        ref={ref}
        data-slot="dialog-description"
        className={cn('text-sm leading-normal text-muted-foreground', className)}
      />
    )
  }
)

export interface DialogCloseProps extends ButtonProps {
  /**
   * Replace the rendered element (Base UI render prop). When set, the
   * Commons Button styling props are ignored.
   */
  render?: CloseRenderProp
}

/**
 * Closes the dialog. Renders a Commons `Button` (secondary by default —
 * the safe, non-destructive action in a confirm pattern).
 */
export const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  function DialogClose(
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

export type DialogFooterProps = React.ComponentPropsWithoutRef<'div'>

/**
 * Action row. Stacks on narrow viewports (primary action first visually),
 * aligns to the inline end on wider ones. Put the confirming Button last
 * in the DOM and the cancelling DialogClose before it.
 */
export const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  function DialogFooter({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-slot="dialog-footer"
        className={cn('flex flex-col-reverse gap-105 pt-05 sm:flex-row sm:justify-end', className)}
      />
    )
  }
)
