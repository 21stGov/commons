// SPDX-License-Identifier: MIT

'use client'

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import * as React from 'react'

import { AmbientDirection } from '@/lib/ambient-direction'
import { cn } from '@/lib/cn'

declare const process: { env: { NODE_ENV?: string | undefined } } | undefined

interface TooltipDescriptionContextValue {
  id: string
  open: boolean
}

const TooltipDescriptionContext = React.createContext<TooltipDescriptionContextValue | null>(null)

export interface TooltipProviderProps extends React.ComponentProps<typeof BaseTooltip.Provider> {}

/**
 * Shares opening and closing delays across a group of tooltips. The short
 * close delay gives the pointer time to cross from the trigger into the
 * popup, which is required for hoverable content under WCAG 1.4.13.
 */
export function TooltipProvider({
  delay = 500,
  closeDelay = 150,
  ...props
}: TooltipProviderProps): React.JSX.Element {
  return <BaseTooltip.Provider delay={delay} closeDelay={closeDelay} {...props} />
}

export interface TooltipProps extends React.ComponentProps<typeof BaseTooltip.Root> {}

/**
 * Groups one trigger and one popup. Escape dismisses the popup without
 * moving focus; the popup remains open while its trigger is focused or
 * while the pointer is over either the trigger or popup.
 */
export function Tooltip({
  disableHoverablePopup = false,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  ...props
}: TooltipProps): React.JSX.Element {
  const descriptionId = React.useId()
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const open = controlledOpen ?? uncontrolledOpen

  return (
    <TooltipDescriptionContext.Provider value={{ id: descriptionId, open }}>
      {/* AmbientDirection wraps the Root (not the Provider): the Root owns the
          portalled Positioner/Popup, and React context crosses portals, so the
          popup's logical positioning sides follow the DOM `dir` — global or a
          local `dir="rtl"` — like the native components; Base UI reads a
          provider, not the DOM. */}
      <AmbientDirection>
        <BaseTooltip.Root
          {...props}
          open={controlledOpen}
          defaultOpen={defaultOpen}
          disableHoverablePopup={disableHoverablePopup}
          onOpenChange={(nextOpen, details) => {
            if (controlledOpen === undefined) {
              setUncontrolledOpen(nextOpen)
            }
            onOpenChange?.(nextOpen, details)
          }}
        />
      </AmbientDirection>
    </TooltipDescriptionContext.Provider>
  )
}

export interface TooltipTriggerProps
  extends Omit<React.ComponentProps<typeof BaseTooltip.Trigger>, 'className'> {
  className?: string
}

/**
 * The element described by the tooltip. Renders a native button by default;
 * use Base UI's `render` prop to merge the behavior onto an existing control.
 */
export const TooltipTrigger = React.forwardRef<HTMLElement, TooltipTriggerProps>(
  function TooltipTrigger({ className, 'aria-describedby': describedBy, ...props }, ref) {
    const description = React.useContext(TooltipDescriptionContext)
    return (
      <BaseTooltip.Trigger
        {...props}
        ref={ref as never}
        aria-describedby={describedBy ?? (description?.open ? description.id : undefined)}
        data-slot="tooltip-trigger"
        className={cn(
          'inline-flex min-h-11 items-center justify-center rounded-sm border-0 bg-transparent px-05',
          'cursor-help text-inherit underline decoration-dotted underline-offset-2',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          className
        )}
      />
    )
  }
)

type TooltipPopupProps = React.ComponentPropsWithoutRef<typeof BaseTooltip.Popup>
type TooltipPositionerProps = React.ComponentPropsWithoutRef<typeof BaseTooltip.Positioner>

export interface TooltipContentProps extends Omit<TooltipPopupProps, 'className'> {
  className?: string
  /** Preferred side; collision handling may flip it. @default "top" */
  side?: TooltipPositionerProps['side']
  /** Alignment relative to the trigger. @default "center" */
  align?: TooltipPositionerProps['align']
  /** Gap between trigger and popup, in CSS pixels. @default 8 */
  sideOffset?: TooltipPositionerProps['sideOffset']
  alignOffset?: TooltipPositionerProps['alignOffset']
  collisionPadding?: TooltipPositionerProps['collisionPadding']
  /** Portal container. Defaults to document.body. */
  container?: React.ComponentProps<typeof BaseTooltip.Portal>['container']
}

function hasInteractiveContent(node: HTMLElement): boolean {
  return Boolean(
    node.querySelector(
      'a[href], button, input, select, textarea, details, [contenteditable="true"], ' +
        '[tabindex]:not([tabindex="-1"])'
    )
  )
}

/**
 * Dev-only authoring guard. Tooltips describe a trigger; they are not small
 * popovers. Interactive descendants cannot be reached reliably while also
 * preserving the tooltip dismissal and persistence contract.
 */
function TooltipContentGuard({ node }: { node: HTMLDivElement | null }): null {
  React.useEffect(() => {
    if (
      !node ||
      (typeof process !== 'undefined' && process.env.NODE_ENV === 'production')
    ) {
      return undefined
    }

    let warned = false
    const check = (): void => {
      if (!warned && hasInteractiveContent(node)) {
        warned = true
        console.warn(
          '[commons] <TooltipContent> contains interactive content. Tooltips must contain ' +
            'brief, non-interactive supporting text. Use a popover or dialog for links, ' +
            'buttons, form controls, or other actions.'
        )
      }
    }

    check()
    const observer = new MutationObserver(check)
    observer.observe(node, { childList: true, subtree: true, attributes: true })
    return () => observer.disconnect()
  }, [node])

  return null
}

/**
 * Brief, nonessential supporting text. It is portalled, collision-aware,
 * hoverable, dismissible with Escape, and persistent while the trigger keeps
 * focus. Never put actions or critical instructions here.
 */
export const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  function TooltipContent(
    {
      className,
      side = 'top',
      align = 'center',
      sideOffset = 8,
      alignOffset,
      collisionPadding = 8,
      container,
      children,
      id,
      role,
      ...props
    },
    forwardedRef
  ) {
    const description = React.useContext(TooltipDescriptionContext)
    const [popupNode, setPopupNode] = React.useState<HTMLDivElement | null>(null)
    const composedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        setPopupNode(node)
        if (typeof forwardedRef === 'function') {
          forwardedRef(node)
        } else if (forwardedRef) {
          forwardedRef.current = node
        }
      },
      [forwardedRef]
    )

    return (
      <BaseTooltip.Portal container={container}>
        <BaseTooltip.Positioner
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          collisionPadding={collisionPadding}
          data-slot="tooltip-positioner"
          className="z-50 outline-none"
        >
          <BaseTooltip.Popup
            {...props}
            ref={composedRef}
            id={id ?? description?.id}
            role={role ?? 'tooltip'}
            data-slot="tooltip-content"
            className={cn(
              'max-w-64 rounded-sm border border-foreground bg-foreground px-105 py-05',
              'text-xs leading-normal text-background shadow-2',
              'motion-safe:origin-[var(--transform-origin)] motion-safe:transition-[opacity,scale]',
              'motion-safe:duration-100 motion-safe:ease-standard',
              'motion-safe:data-starting-style:scale-95 motion-safe:data-starting-style:opacity-0',
              'motion-safe:data-ending-style:scale-95 motion-safe:data-ending-style:opacity-0',
              'forced-colors:border-[CanvasText] forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]',
              className
            )}
          >
            <TooltipContentGuard node={popupNode} />
            {children}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    )
  }
)
