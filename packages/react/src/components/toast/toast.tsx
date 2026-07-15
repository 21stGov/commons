// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

'use client'

import { Toast as BaseToast } from '@base-ui/react/toast'
import type {
  ToastManagerAddOptions,
  ToastManagerUpdateOptions,
  ToastObject,
  UseToastManagerReturnValue,
} from '@base-ui/react/toast'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { AmbientDirection } from '@/lib/ambient-direction'
import { cn } from '@/lib/cn'

/**
 * A single shared toast manager backs the module-level {@link toast} helper so
 * that toasts can be queued from anywhere — event handlers, data loaders,
 * effects — without threading a React context through. `ToastProvider` wires
 * this same manager into Base UI's `Toast.Provider`, so `toast(...)` and the
 * in-component `useToast()` hook operate on one queue.
 */
const toastManager = BaseToast.createToastManager()

export const toastVariants = cva(
  // Base: a floating card. Non-color redundancy is guaranteed by a per-variant
  // inline SVG icon (see VARIANT_ICON_PATHS) plus the bold title — never color
  // alone (WCAG 1.4.1). `border` is a uniform border on every side, using the
  // variant's border-color token — equal width all around, never a thick
  // inline-start accent. rem-only text, logical spacing only.
  [
    'pointer-events-auto relative flex w-full items-start gap-105',
    'rounded-md border p-205 text-sm shadow-3',
    '[&_a]:underline',
    // Motion: fade + a short vertical slide driven by Base UI's transition
    // states. Vertical translate is direction-neutral, so it is correct in
    // both LTR and RTL. Fully neutralized for reduced-motion users.
    'motion-safe:transition-[opacity,transform] motion-safe:duration-200 motion-safe:ease-standard',
    'motion-safe:data-starting-style:translate-y-2 motion-safe:data-starting-style:opacity-0',
    'motion-safe:data-ending-style:translate-y-2 motion-safe:data-ending-style:opacity-0',
    'motion-reduce:transition-none',
  ],
  {
    variants: {
      variant: {
        info: 'border-info-border bg-info text-info-foreground',
        success: 'border-success-border bg-success text-success-foreground',
        warning: 'border-warning-border bg-warning text-warning-foreground',
        error: 'border-error-border bg-error text-error-foreground',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
)

export type ToastVariant = NonNullable<VariantProps<typeof toastVariants>['variant']>

/**
 * Announcement urgency, forwarded to Base UI:
 * - `"low"` — announced politely (the viewport's `aria-live="polite"` region).
 * - `"high"` — announced immediately via an assertive live region and rendered
 *   as an `alertdialog`. Auto-dismiss is unaffected by priority; pair a high
 *   priority with `duration: 0` for messages the user must act on.
 */
export type ToastPriority = 'low' | 'high'

/** Custom payload attached to a toast, available on the toast object. */
export type ToastData = Record<string, unknown>

/**
 * Per-variant icons. All inline SVG (background-image icons vanish in
 * forced-colors mode), stroked with `currentColor` so they follow the
 * variant's text token, and `aria-hidden` — the variant's meaning is carried
 * by the title text, not an announced icon name.
 */
const VARIANT_ICON_PATHS: Record<ToastVariant, React.JSX.Element> = {
  info: (
    <>
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 7.25v3.75" strokeLinecap="round" />
      <circle cx="8" cy="4.75" r="0.85" fill="currentColor" stroke="none" />
    </>
  ),
  success: (
    <>
      <circle cx="8" cy="8" r="6.5" />
      <path d="m4.9 8.3 2.1 2.1 4.1-4.4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  warning: (
    <>
      <path
        d="M7.13 2.5a1 1 0 0 1 1.74 0l5.63 9.99a1 1 0 0 1-.87 1.49H2.37a1 1 0 0 1-.87-1.49L7.13 2.5Z"
        strokeLinejoin="round"
      />
      <path d="M8 6.25v3" strokeLinecap="round" />
      <circle cx="8" cy="11.4" r="0.85" fill="currentColor" stroke="none" />
    </>
  ),
  error: (
    <>
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 4.5v4.25" strokeLinecap="round" />
      <circle cx="8" cy="11.25" r="0.85" fill="currentColor" stroke="none" />
    </>
  ),
}

function VariantIcon({ variant }: { variant: ToastVariant }): React.JSX.Element {
  return (
    <span
      aria-hidden="true"
      data-slot="toast-icon"
      className="flex h-[calc(1em*1.375)] shrink-0 items-center self-start leading-snug"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="size-3 shrink-0"
      >
        {VARIANT_ICON_PATHS[variant]}
      </svg>
    </span>
  )
}

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

type BaseToastObject = ToastObject<ToastData>

function resolveVariant(type: string | undefined): ToastVariant {
  return type === 'success' || type === 'warning' || type === 'error' ? type : 'info'
}

interface ToastItemProps {
  toast: BaseToastObject
  closeLabel: string
}

/**
 * The visual toast surface: `Toast.Root` (rendered by Base UI as a
 * `dialog`, or `alertdialog` for high-priority toasts) with a variant icon,
 * `Toast.Title`, optional `Toast.Description`, an optional `Toast.Action`, and
 * a 44px `Toast.Close`. Base UI supplies the timer (paused on hover/focus),
 * Esc-to-dismiss, swipe-to-dismiss, `aria-labelledby`/`aria-describedby`
 * wiring, and the live-region announcement.
 */
function ToastItem({ toast, closeLabel }: ToastItemProps): React.JSX.Element {
  const variant = resolveVariant(toast.type)

  // Guarantee an accessible name: Base UI points the toast's
  // `aria-labelledby` at the Title's id, so a Title must always render. When
  // only a message was supplied it becomes the Title; an accompanying
  // description renders below it.
  const hasTitle = toast.title != null
  const titleNode = hasTitle ? toast.title : toast.description
  const descriptionNode = hasTitle ? toast.description : undefined
  const hasAction = toast.actionProps?.children != null

  return (
    <BaseToast.Root
      toast={toast}
      data-slot="toast"
      data-variant={variant}
      className={cn(toastVariants({ variant }))}
    >
      <VariantIcon variant={variant} />
      <div className="flex min-w-0 flex-1 flex-col gap-05 leading-normal">
        <BaseToast.Title
          data-slot="toast-title"
          className="text-sm font-semibold leading-snug"
        >
          {titleNode}
        </BaseToast.Title>
        {descriptionNode != null ? (
          <BaseToast.Description
            data-slot="toast-description"
            className="text-sm leading-normal"
          >
            {descriptionNode}
          </BaseToast.Description>
        ) : null}
        {hasAction ? (
          <BaseToast.Action
            data-slot="toast-action"
            className={cn(
              'mt-05 inline-flex min-h-11 w-fit cursor-pointer items-center justify-center rounded-sm',
              'border border-current bg-transparent px-2 py-05 text-sm font-medium text-current',
              'transition-colors motion-reduce:transition-none hover:bg-background/40',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
            )}
          />
        ) : null}
      </div>
      <BaseToast.Close
        data-slot="toast-close"
        aria-label={closeLabel}
        className={cn(
          // The VISIBLE button is a snug 2rem chip at the top-inline-end
          // corner with the X centered in it — so the hover/focus highlight
          // stays tight around the glyph, not a big rectangle to its side.
          // (NB: our spacing scale is USWDS-based — size-4 = 2rem, not the
          // stock Tailwind 1rem.) The 44px (2.75rem) minimum hit target is
          // restored invisibly with a `::before` that extends the clickable
          // area 0.375rem past the chip on every side (2rem + 2×0.375rem =
          // 2.75rem), so touch users get a full target without the bulk.
          'relative inline-flex size-4 shrink-0 cursor-pointer items-center justify-center',
          'self-start rounded-sm border border-transparent bg-transparent text-current',
          'before:absolute before:-inset-[0.375rem] before:content-[""]',
          'transition-colors motion-reduce:transition-none hover:bg-background/40',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
        )}
      >
        <CloseIcon />
      </BaseToast.Close>
    </BaseToast.Root>
  )
}

interface ToastRegionProps {
  label: string
  closeLabel: string
}

/**
 * Portals the live region to the end of `<body>` and maps the active toasts to
 * visual surfaces. Fixed to the block-end/inline-end corner with logical
 * insets, so it flips to the opposite corner in RTL. Newest toast sits nearest
 * the corner (`flex-col-reverse`).
 */
function ToastRegion({ label, closeLabel }: ToastRegionProps): React.JSX.Element {
  const { toasts } = BaseToast.useToastManager<ToastData>()

  return (
    <BaseToast.Portal>
      <BaseToast.Viewport
        data-slot="toast-viewport"
        aria-label={label}
        className={cn(
          // bottom-0 (block axis, RTL-neutral) + end-0 (inline axis, flips
          // to the left edge in RTL). Note: there is no `inset-block-end-*`
          // Tailwind utility — using one silently drops the inset and the
          // fixed viewport falls to its static position.
          'fixed bottom-0 end-0 z-50 flex flex-col-reverse gap-105',
          'w-[min(100dvw-2rem,24rem)] p-2 outline-none',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
        )}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} closeLabel={closeLabel} />
        ))}
      </BaseToast.Viewport>
    </BaseToast.Portal>
  )
}

export interface ToastProviderProps {
  children?: React.ReactNode
  /**
   * Default auto-dismiss timeout in milliseconds. Base UI pauses the timer on
   * hover, on focus, and while the window is blurred (WCAG 2.2.1). A value of
   * `0` disables auto-dismiss. Keep this comfortably above the time it takes to
   * read a short message; the default matches Base UI.
   * @default 5000
   */
  timeout?: number
  /**
   * Maximum number of toasts shown at once. Older toasts beyond the limit are
   * marked limited rather than removed.
   * @default 3
   */
  limit?: number
  /**
   * Accessible name for the notifications live region.
   * Translation-ready: pass a localized string.
   * @default "Notifications"
   */
  label?: string
  /**
   * Accessible name for every toast's close button (44px target).
   * Translation-ready: pass a localized string.
   * @default "Dismiss"
   */
  closeLabel?: string
}

/**
 * Wraps an app (or the part of it that raises toasts) and renders the live
 * region. Built on Base UI's `Toast.Provider`, which owns the queue, the
 * pausable auto-dismiss timers, Esc/swipe dismissal, and the polite/assertive
 * live-region announcements. Mount once, near the root.
 *
 * The provider is bound to the shared manager, so the module-level
 * {@link toast} helper works without any context wiring. If you mount more than
 * one provider they share that single queue — mount just one.
 */
export function ToastProvider({
  children,
  timeout = 5000,
  limit = 3,
  label = 'Notifications',
  closeLabel = 'Dismiss',
}: ToastProviderProps): React.JSX.Element {
  return (
    // AmbientDirection makes the toasts (and the portalled viewport, since React
    // context crosses portals) follow the DOM `dir` — global or a local
    // `dir="rtl"` — so the viewport's logical corner insets flip, like the
    // native components; Base UI reads a provider, not the DOM.
    <AmbientDirection>
      <BaseToast.Provider toastManager={toastManager} timeout={timeout} limit={limit}>
        {children}
        <ToastRegion label={label} closeLabel={closeLabel} />
      </BaseToast.Provider>
    </AmbientDirection>
  )
}

/**
 * Options for raising or updating a toast. All copy is caller-supplied so it
 * can be translated.
 */
export interface ToastOptions {
  /**
   * Short, bold headline — the toast's accessible name. When omitted, the
   * `description` is promoted to the title so the toast is never nameless.
   */
  title?: React.ReactNode
  /** Supporting message rendered below the title. */
  description?: React.ReactNode
  /** State variant. Selects the icon and color tokens. @default "info" */
  variant?: ToastVariant
  /**
   * Auto-dismiss timeout in milliseconds; overrides the provider default.
   * `0` keeps the toast until it is dismissed. The timer pauses on
   * hover/focus.
   */
  duration?: number
  /** Announcement urgency. @default "low" ("high" for the error helper) */
  priority?: ToastPriority
  /**
   * Label for an optional action button. The button does not auto-dismiss;
   * call `dismiss` from `onAction` if you want it to close the toast.
   */
  actionLabel?: React.ReactNode
  /** Called when the action button is activated. */
  onAction?: () => void
  /** Called when the toast is dismissed (timeout, Esc, swipe, or Close). */
  onClose?: () => void
  /** Provide to update an existing toast in place instead of adding a new one. */
  id?: string
  /** Arbitrary payload carried on the toast object. */
  data?: ToastData
}

type ManagerLike = Pick<
  UseToastManagerReturnValue<ToastData>,
  'add' | 'close' | 'update' | 'promise'
>

function toAddOptions(options: ToastOptions): ToastManagerAddOptions<ToastData> {
  const { title, description, variant, duration, priority, actionLabel, onAction, onClose, id, data } =
    options
  return {
    id,
    title,
    description,
    type: variant,
    priority,
    timeout: duration,
    onClose,
    data,
    actionProps:
      actionLabel != null
        ? { children: actionLabel, onClick: () => onAction?.() }
        : undefined,
  }
}

/**
 * The imperative toast API returned by {@link useToast} and exposed as the
 * module-level {@link toast} helper. Callable to raise an `info` toast, with
 * variant shortcuts and lifecycle methods.
 */
export interface ToastApi {
  /** Raise a toast (info variant unless `variant` is set). Returns its id. */
  (options: ToastOptions): string
  /** Raise an `info` toast. Returns its id. */
  info: (options: ToastOptions) => string
  /** Raise a `success` toast. Returns its id. */
  success: (options: ToastOptions) => string
  /** Raise a `warning` toast. Returns its id. */
  warning: (options: ToastOptions) => string
  /**
   * Raise an `error` toast. Defaults to high priority and no auto-dismiss
   * (`duration: 0`) so a user is never rushed past an error they must read or
   * act on (WCAG 2.2.1). Override `priority`/`duration` to change this.
   * Returns its id.
   */
  error: (options: ToastOptions) => string
  /** Update an existing toast in place and refresh its timer. */
  update: (id: string, options: ToastOptions) => void
  /** Dismiss a toast by id, or all toasts when called with no id. */
  dismiss: (id?: string) => void
  /**
   * Bind a toast's lifecycle to a promise: shows `loading`, then swaps to
   * `success` or `error` when it settles. Resolves with the promise's value.
   */
  promise: <Value>(
    promise: Promise<Value>,
    options: {
      loading: string | ToastOptions
      success: string | ToastOptions | ((value: Value) => string | ToastOptions)
      error: string | ToastOptions | ((error: unknown) => string | ToastOptions)
    }
  ) => Promise<Value>
}

function toPromiseStage(
  stage: string | ToastOptions
): ToastManagerUpdateOptions<ToastData> {
  return typeof stage === 'string' ? { title: stage } : toAddOptions(stage)
}

function createToastApi(manager: ManagerLike): ToastApi {
  const api = ((options: ToastOptions) => manager.add(toAddOptions(options))) as ToastApi

  api.info = (options) => manager.add(toAddOptions({ ...options, variant: 'info' }))
  api.success = (options) => manager.add(toAddOptions({ ...options, variant: 'success' }))
  api.warning = (options) => manager.add(toAddOptions({ ...options, variant: 'warning' }))
  api.error = (options) =>
    manager.add(
      toAddOptions({ variant: 'error', priority: 'high', duration: 0, ...options })
    )
  api.update = (id, options) => manager.update(id, toAddOptions(options))
  api.dismiss = (id) => manager.close(id)
  api.promise = (promise, options) =>
    manager.promise(promise, {
      loading: toPromiseStage(options.loading),
      success:
        typeof options.success === 'function'
          ? (value) => toPromiseStage((options.success as (v: unknown) => string | ToastOptions)(value))
          : toPromiseStage(options.success),
      error:
        typeof options.error === 'function'
          ? (error) => toPromiseStage((options.error as (e: unknown) => string | ToastOptions)(error))
          : toPromiseStage(options.error),
    })

  return api
}

/**
 * Module-level imperative API bound to the shared manager. Import and call from
 * anywhere — no hook, no context — as long as a `ToastProvider` is mounted.
 *
 * ```ts
 * import { toast } from "@21stgov/commons-react";
 * toast.success({ title: "Saved" });
 * ```
 */
export const toast: ToastApi = createToastApi(toastManager)

/**
 * Hook form of the imperative API for use inside components. Returns the same
 * `toast` helper plus the reactive list of active toasts. Bound to the toast
 * context, so it works with any provider.
 */
export function useToast(): { toast: ToastApi; toasts: BaseToastObject[] } {
  const manager = BaseToast.useToastManager<ToastData>()
  const api = React.useMemo(() => createToastApi(manager), [manager])
  return { toast: api, toasts: manager.toasts }
}
