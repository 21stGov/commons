// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { Button, type ButtonProps } from '@/components/ui/button'
import { AmbientDirection } from '@/lib/ambient-direction'
import { cn } from '@/lib/cn'

// Minimal ambient typing so the dev-only guard compiles without
// @types/node. Bundlers statically replace `process.env.NODE_ENV`.
declare const process: { env: { NODE_ENV?: string | undefined } } | undefined

type BaseRootProps = React.ComponentProps<typeof BaseAlertDialog.Root>
type OpenChangeDetails = Parameters<NonNullable<BaseRootProps['onOpenChange']>>[1]
type TriggerRenderProp = React.ComponentProps<typeof BaseAlertDialog.Trigger>['render']
type CloseRenderProp = React.ComponentProps<typeof BaseAlertDialog.Close>['render']
type InitialFocusProp = React.ComponentProps<typeof BaseAlertDialog.Popup>['initialFocus']

export interface AlertDialogRootProps {
  /** Controlled open state. Leave unset for uncontrolled usage. */
  open?: boolean
  /** Initial open state for uncontrolled usage. @default false */
  defaultOpen?: boolean
  /**
   * Called when the alert dialog opens or closes. The second argument is the
   * Base UI event detail (`reason`, `cancel()`, …), so an owner can inspect
   * *why* the state changed.
   */
  onOpenChange?: (open: boolean, eventDetails: OpenChangeDetails) => void
  /**
   * Allow the Escape key to cancel the alert dialog.
   *
   * An alert dialog interrupts to demand a decision, so — unlike a plain
   * `Dialog` — it never closes on an outside press and, by default, does NOT
   * close on Escape either: the user must choose an action. WAI-ARIA's Alert
   * and Message Dialogs pattern permits Escape as a cancel shortcut, so set
   * this to `true` when a keyboard "escape hatch" that maps to the SAFE
   * (cancelling) outcome is appropriate. Leave it `false` for a truly
   * irreversible confirmation where any accidental dismissal is unwanted.
   * @default false
   */
  dismissOnEscape?: boolean
  children?: React.ReactNode
}

/**
 * Alert-dialog root. Groups a trigger and its content; renders no element of
 * its own. Built on Base UI's Alert Dialog, which supplies `role="alertdialog"`,
 * an always-modal focus trap, scroll lock, focus return to the trigger, and —
 * crucially — NO light dismiss: an outside press never closes it.
 *
 * Base UI does close an alert dialog on Escape by default; Commons intercepts
 * that so the interruption is honored (`dismissOnEscape` re-enables it).
 */
export function AlertDialogRoot({
  open,
  defaultOpen,
  onOpenChange,
  dismissOnEscape = false,
  children,
}: AlertDialogRootProps): React.JSX.Element {
  const handleOpenChange = React.useCallback(
    (nextOpen: boolean, eventDetails: OpenChangeDetails): void => {
      // Escape is the only close affordance Base UI leaves enabled on an alert
      // dialog. Cancel it unless the consumer explicitly opts in, so the dialog
      // can only be dismissed by choosing one of its actions.
      if (!nextOpen && !dismissOnEscape && eventDetails.reason === 'escape-key') {
        eventDetails.cancel()
        return
      }
      onOpenChange?.(nextOpen, eventDetails)
    },
    [dismissOnEscape, onOpenChange]
  )

  return (
    // AmbientDirection makes the alert dialog (and its portalled popup, since
    // React context crosses portals) follow the DOM `dir` — global or a local
    // `dir="rtl"` — like the native components; Base UI reads a provider, not
    // the DOM.
    <AmbientDirection>
      <BaseAlertDialog.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={handleOpenChange}
      >
        {children}
      </BaseAlertDialog.Root>
    </AmbientDirection>
  )
}

export interface AlertDialogTriggerProps extends ButtonProps {
  /**
   * Replace the rendered element (Base UI render prop, the asChild
   * equivalent). When set, the Commons Button styling props (`variant`,
   * `size`, `loading`) are ignored and Base UI merges the trigger props
   * (`aria-haspopup`, `aria-expanded`, click handling) onto your element.
   */
  render?: TriggerRenderProp
}

/**
 * Opens the alert dialog. Renders a Commons `Button` by default; pass `render`
 * to swap in your own element.
 */
export const AlertDialogTrigger = React.forwardRef<HTMLButtonElement, AlertDialogTriggerProps>(
  function AlertDialogTrigger(
    { render, variant, size, loading, loadingLabel, className, children, ...props },
    ref
  ) {
    return (
      <BaseAlertDialog.Trigger
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
      </BaseAlertDialog.Trigger>
    )
  }
)

// Popup styling is intentionally identical to `Dialog` so the two read as
// siblings — same surface, same motion, same size caps. The class strings are
// duplicated (rather than imported) to keep alert-dialog's shipped source a
// self-contained registry item.
export const alertDialogPopupVariants = cva(
  [
    'relative flex h-fit w-full flex-col gap-105',
    '[max-block-size:calc(100dvh-2rem)] overflow-y-auto overscroll-contain',
    'rounded-md border border-border bg-background p-3 text-foreground shadow-3',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
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
      size: 'sm',
    },
  }
)

/**
 * Dev-only guard: an alert dialog must have an accessible name (WCAG 4.1.2) —
 * an `AlertDialogTitle` (wired to `aria-labelledby` by Base UI) or an explicit
 * `aria-label`. Rendered inside the popup so it re-checks on every open; the
 * check is deferred a tick so Base UI has applied `aria-labelledby` first.
 */
function AlertDialogNameGuard({
  popupRef,
}: {
  popupRef: React.RefObject<HTMLDivElement | null>
}): null {
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
          '[commons] <AlertDialogContent> has no accessible name. Render an ' +
            '<AlertDialogTitle> inside it (preferred), or set `aria-label` on ' +
            '<AlertDialogContent> when a visible title is truly impossible.'
        )
      }
    }, 0)
    return () => clearTimeout(id)
  }, [popupRef])
  return null
}

export interface AlertDialogContentProps
  extends
    Omit<React.ComponentPropsWithoutRef<'div'>, 'children'>,
    VariantProps<typeof alertDialogPopupVariants> {
  children?: React.ReactNode
  /** Element to focus when the dialog opens (Base UI `initialFocus`). */
  initialFocus?: InitialFocusProp
  /** Element to focus when the dialog closes (Base UI `finalFocus`). */
  finalFocus?: React.ComponentProps<typeof BaseAlertDialog.Popup>['finalFocus']
  /** Portal container. Defaults to `document.body`. */
  container?: React.ComponentProps<typeof BaseAlertDialog.Portal>['container']
}

/**
 * The alert-dialog surface: portal + backdrop + popup. Base UI provides the
 * focus trap (Tab cycles inside), scroll lock, `role="alertdialog"`, and focus
 * return to the trigger; Commons adds the styling and a dev warning when the
 * dialog has no accessible name.
 *
 * Unlike `DialogContent`, there is intentionally NO icon "×" close button:
 * an alert dialog must be resolved by choosing one of its explicit actions,
 * so dismissal lives only in the footer (an `AlertDialogCancel` and an
 * `AlertDialogAction`). Always render both; the cancelling button, being a
 * Base UI `Close`, is what lets touch screen-reader users escape the modal.
 */
export const AlertDialogContent = React.forwardRef<HTMLDivElement, AlertDialogContentProps>(
  function AlertDialogContent(
    { className, size, children, initialFocus, finalFocus, container, onKeyDown, ...props },
    ref
  ) {
    const popupRef = React.useRef<HTMLDivElement | null>(null)

    // Keep Tab focus inside the popup. Base UI traps focus, but wrapping from
    // the last control back to the first (and vice-versa) is enforced here so
    // it is deterministic across environments — the same guard DialogContent
    // uses.
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
      <BaseAlertDialog.Portal container={container}>
        <BaseAlertDialog.Backdrop
          data-slot="alert-dialog-backdrop"
          className={cn(
            'fixed inset-0 z-50 bg-black',
            // Backdrop translucency is token-driven: --cui-backdrop-opacity
            // (core a11y.css) is 1 by default and 0 under
            // prefers-reduced-transparency, so alpha = 1 − 0.5×token gives
            // 50% black normally and a fully opaque scrim when the user asks
            // for reduced transparency.
            'opacity-[calc(1-0.5*var(--cui-backdrop-opacity,1))]',
            'motion-safe:transition-opacity motion-safe:duration-150 motion-safe:ease-standard',
            'motion-safe:data-starting-style:opacity-0 motion-safe:data-ending-style:opacity-0'
          )}
        />
        <BaseAlertDialog.Viewport
          data-slot="alert-dialog-viewport"
          className={cn(
            'fixed inset-0 z-50 grid place-items-center overflow-y-auto overscroll-contain p-2'
          )}
        >
          <BaseAlertDialog.Popup
            {...props}
            // An alert dialog is always modal; expose it explicitly for AT that
            // does not infer aria-modal from role=alertdialog.
            aria-modal
            onKeyDown={handleKeyDown}
            ref={(node: HTMLDivElement | null) => {
              popupRef.current = node
              if (typeof ref === 'function') {
                ref(node)
              } else if (ref) {
                ref.current = node
              }
            }}
            data-slot="alert-dialog-content"
            initialFocus={initialFocus}
            finalFocus={finalFocus}
            className={cn(alertDialogPopupVariants({ size }), className)}
          >
            <AlertDialogNameGuard popupRef={popupRef} />
            {children}
          </BaseAlertDialog.Popup>
        </BaseAlertDialog.Viewport>
      </BaseAlertDialog.Portal>
    )
  }
)

export type AlertDialogHeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export interface AlertDialogTitleProps extends React.ComponentPropsWithoutRef<'h2'> {
  /**
   * Heading element to render. Pick the level that fits the page outline
   * (no skipped levels).
   * @default "h2"
   */
  headingLevel?: AlertDialogHeadingLevel
}

/**
 * The alert dialog's title. Required in every alert dialog: Base UI wires its
 * id to the popup's `aria-labelledby`, giving the dialog its accessible name.
 */
export const AlertDialogTitle = React.forwardRef<HTMLHeadingElement, AlertDialogTitleProps>(
  function AlertDialogTitle({ headingLevel = 'h2', className, ...props }, ref) {
    const HeadingTag = headingLevel
    return (
      <BaseAlertDialog.Title
        {...props}
        ref={ref}
        data-slot="alert-dialog-title"
        render={<HeadingTag />}
        className={cn('text-lg font-semibold leading-snug text-foreground', className)}
      />
    )
  }
)

export type AlertDialogDescriptionProps = React.ComponentPropsWithoutRef<'p'>

/**
 * Supporting text announced with the alert dialog. Base UI wires its id to the
 * popup's `aria-describedby`. Strongly recommended: it is where you spell out
 * the consequence of the destructive action.
 */
export const AlertDialogDescription = React.forwardRef<
  HTMLParagraphElement,
  AlertDialogDescriptionProps
>(function AlertDialogDescription({ className, ...props }, ref) {
  return (
    <BaseAlertDialog.Description
      {...props}
      ref={ref}
      data-slot="alert-dialog-description"
      className={cn('text-sm leading-normal text-muted-foreground', className)}
    />
  )
})

export interface AlertDialogCancelProps extends ButtonProps {
  /**
   * Replace the rendered element (Base UI render prop). When set, the Commons
   * Button styling props are ignored.
   */
  render?: CloseRenderProp
}

/**
 * The cancelling (safe) action. Renders a Commons `Button` (secondary by
 * default) and, being a Base UI `Close`, dismisses the dialog with no side
 * effect. This is the button that should receive initial focus in a
 * destructive confirmation.
 */
export const AlertDialogCancel = React.forwardRef<HTMLButtonElement, AlertDialogCancelProps>(
  function AlertDialogCancel(
    { render, variant = 'secondary', size, loading, loadingLabel, className, children, ...props },
    ref
  ) {
    return (
      <BaseAlertDialog.Close
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
      </BaseAlertDialog.Close>
    )
  }
)

export interface AlertDialogActionProps extends ButtonProps {
  /**
   * Replace the rendered element (Base UI render prop). When set, the Commons
   * Button styling props are ignored.
   */
  render?: CloseRenderProp
}

/**
 * The confirming action. Renders a Commons `Button` (primary by default; pass
 * `variant="danger"` for a destructive/irreversible action) and, being a Base
 * UI `Close`, runs your `onClick` and then dismisses the dialog. Place it last
 * in the DOM so Tab reaches the safe Cancel button first.
 */
export const AlertDialogAction = React.forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  function AlertDialogAction(
    { render, variant = 'primary', size, loading, loadingLabel, className, children, ...props },
    ref
  ) {
    return (
      <BaseAlertDialog.Close
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
      </BaseAlertDialog.Close>
    )
  }
)

export type AlertDialogFooterProps = React.ComponentPropsWithoutRef<'div'>

/**
 * Action row. Stacks on narrow viewports (confirming action first visually),
 * aligns to the inline end on wider ones. Put the confirming
 * `AlertDialogAction` last in the DOM and the cancelling `AlertDialogCancel`
 * before it.
 */
export const AlertDialogFooter = React.forwardRef<HTMLDivElement, AlertDialogFooterProps>(
  function AlertDialogFooter({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-slot="alert-dialog-footer"
        className={cn('flex flex-col-reverse gap-105 pt-05 sm:flex-row sm:justify-end', className)}
      />
    )
  }
)

export interface AlertDialogProps extends AlertDialogRootProps {
  /**
   * Trigger content. Renders a default Commons `Button` that opens the dialog.
   * Omit it for a fully controlled dialog opened from elsewhere (pass `open`).
   */
  trigger?: React.ReactNode
  /** Variant/size/loading for the default trigger Button. Ignored if `trigger` is omitted. */
  triggerProps?: Omit<AlertDialogTriggerProps, 'children'>
  /** The dialog's accessible name and visible heading. Required. */
  title: React.ReactNode
  /** Heading element for the title. @default "h2" */
  headingLevel?: AlertDialogHeadingLevel
  /** Supporting text linked via `aria-describedby`. Strongly recommended. */
  description?: React.ReactNode
  /** Label for the confirming action. @default "Confirm" */
  confirmLabel?: React.ReactNode
  /** Label for the cancelling action. @default "Cancel" */
  cancelLabel?: React.ReactNode
  /** Called when the confirming action is chosen (before the dialog closes). */
  onConfirm?: () => void
  /** Called when the cancelling action is chosen. */
  onCancel?: () => void
  /**
   * Style the confirming action as destructive (Button `danger` variant) AND
   * move initial focus to the safer Cancel button, per WAI-ARIA guidance for
   * irreversible actions. @default false
   */
  destructive?: boolean
  /** Show a loading state on the confirming action. */
  confirmLoading?: boolean
  /** Width cap of the popup surface. @default "sm" */
  size?: AlertDialogContentProps['size']
}

/**
 * Convenience alert dialog — a full confirm/cancel surface assembled from the
 * primitives. Use it for the common case (a title, a consequence, two
 * actions); drop to the primitive parts when you need custom content.
 *
 * Accessibility notes baked in:
 * - `role="alertdialog"`, focus trapped, focus returns to the trigger.
 * - Never closes on an outside press; does not close on Escape unless
 *   `dismissOnEscape` is set (WAI-ARIA Alert/Message Dialog pattern).
 * - When `destructive`, initial focus lands on the SAFE Cancel button and the
 *   confirming button is styled `danger` — an accidental Enter cancels rather
 *   than deletes.
 * - Both actions are full Commons `Button`s (44px min target) and reachable by
 *   keyboard; a visible border in every state keeps them WHCM-safe.
 */
export function AlertDialog({
  trigger,
  triggerProps,
  title,
  headingLevel,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
  confirmLoading,
  size = 'sm',
  ...rootProps
}: AlertDialogProps): React.JSX.Element {
  const cancelRef = React.useRef<HTMLButtonElement | null>(null)
  const actionRef = React.useRef<HTMLButtonElement | null>(null)

  // Destructive → focus the safe Cancel so a stray Enter dismisses harmlessly.
  // Non-destructive → focus the primary confirm, the expected default action.
  const initialFocus = destructive ? cancelRef : actionRef

  return (
    <AlertDialogRoot {...rootProps}>
      {trigger != null ? (
        <AlertDialogTrigger {...triggerProps}>{trigger}</AlertDialogTrigger>
      ) : null}
      <AlertDialogContent size={size} initialFocus={initialFocus}>
        <AlertDialogTitle headingLevel={headingLevel}>{title}</AlertDialogTitle>
        {description != null ? (
          <AlertDialogDescription>{description}</AlertDialogDescription>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel ref={cancelRef} onClick={onCancel}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            ref={actionRef}
            variant={destructive ? 'danger' : 'primary'}
            loading={confirmLoading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogRoot>
  )
}
