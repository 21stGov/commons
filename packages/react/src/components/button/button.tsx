// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/cn'

// Minimal ambient typing so the dev-only guard compiles without
// @types/node. Bundlers statically replace `process.env.NODE_ENV`.
declare const process: { env: { NODE_ENV?: string | undefined } } | undefined

export const buttonVariants = cva(
  // Base: native-first button reset + Commons accessibility defaults.
  // - Every variant keeps a border so the control has a visible boundary
  //   in forced-colors mode (transparent borders are painted there).
  // - Focus ring: 2px outline with offset, token-driven.
  // - rem-only font sizes; logical properties only (no ml-/pl-/left-).
  [
    'relative inline-flex min-w-0 items-center justify-center text-center',
    'rounded-sm border text-sm font-medium leading-snug',
    'transition-colors motion-reduce:transition-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    'disabled:cursor-not-allowed disabled:border-disabled-border disabled:bg-disabled disabled:text-disabled-foreground',
    'aria-disabled:cursor-not-allowed',
    '[&_svg]:pointer-events-none [&_svg]:size-2 [&_svg]:shrink-0',
    // While loading, hide the label (the centered spinner shows instead). The
    // React content span also does this inline; expressing it here keeps the
    // framework-agnostic CSS in sync (data-loading is on the button).
    '[&[data-loading]_[data-slot=button-content]]:invisible',
  ],
  {
    variants: {
      variant: {
        primary:
          'border-transparent bg-primary text-primary-foreground shadow-1 hover:bg-primary-hover active:bg-primary-active active:shadow-none disabled:shadow-none',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground shadow-1 hover:bg-secondary-hover active:bg-secondary-active active:shadow-none disabled:shadow-none',
        outline:
          'border-border-strong bg-transparent text-foreground hover:bg-muted active:bg-muted',
        ghost: 'border-transparent bg-transparent text-foreground hover:bg-muted active:bg-muted',
        danger:
          'border-transparent bg-danger text-danger-foreground shadow-1 hover:bg-danger-hover active:bg-danger-active active:shadow-none disabled:shadow-none',
      },
      // Every size meets the 44px (2.75rem) Commons target-size default:
      // min-h-11 = 2.75rem, min-h-12 = 3rem, min-h-14 = 3.5rem.
      size: {
        sm: 'min-h-11 px-105 py-05 text-sm',
        md: 'min-h-12 px-2 py-1 text-sm',
        lg: 'min-h-14 px-3 py-105 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Internal composition marker; defaults to `button`. */
  'data-slot'?: string
  /**
   * Show a loading state. The button stays focusable and keeps its
   * accessible name; activation is suppressed and `aria-busy` /
   * `aria-disabled` are set instead of the `disabled` attribute so
   * screen-reader and keyboard users do not lose focus mid-flow.
   */
  loading?: boolean
  /**
   * Visually hidden text announced while `loading` is true.
   * Translation-ready: pass a localized string.
   * @default "Loading"
   */
  loadingLabel?: string
}

function Spinner(): React.JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="motion-safe:animate-spin">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path
        d="M14.5 8a6.5 6.5 0 0 0-6.5-6.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * Initiates an immediate action. Renders a native `<button>` with
 * `type="button"` by default so it never submits a form accidentally.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant,
    size,
    type = 'button',
    loading = false,
    loadingLabel = 'Loading',
    onClick,
    children,
    'data-slot': dataSlot = 'button',
    ...props
  },
  ref
) {
  const innerRef = React.useRef<HTMLButtonElement | null>(null)
  const warnedRef = React.useRef(false)

  // Dev-only guard: an icon-only button must still have an accessible
  // name (WCAG 4.1.2). Checked after render against the rendered node.
  React.useEffect(() => {
    if (
      (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') ||
      warnedRef.current
    ) {
      return
    }
    const node = innerRef.current
    if (!node) {
      return
    }
    const hasName =
      (node.textContent ?? '').trim().length > 0 ||
      node.hasAttribute('aria-label') ||
      node.hasAttribute('aria-labelledby') ||
      node.hasAttribute('title')
    if (!hasName) {
      warnedRef.current = true
      console.warn(
        '[commons] <Button> has no accessible name. Icon-only buttons ' +
          'must set `aria-label` (e.g. <Button aria-label="Search">).'
      )
    }
  })

  const ariaDisabled = props['aria-disabled'] === true || props['aria-disabled'] === 'true'

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Suppress activation while loading (covers pointer, Enter, and
    // Space — native buttons route all of them through click).
    if (loading || ariaDisabled) {
      event.preventDefault()
      event.stopPropagation()
      return
    }
    onClick?.(event)
  }

  return (
    <button
      {...props}
      ref={(node) => {
        innerRef.current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      }}
      type={type}
      data-slot={dataSlot}
      data-loading={loading ? '' : undefined}
      aria-busy={loading || undefined}
      aria-disabled={loading ? true : props['aria-disabled']}
      onClick={handleClick}
      className={cn(buttonVariants({ variant, size }), className)}
    >
      {loading ? (
        <span
          aria-hidden="true"
          data-slot="button-spinner"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <Spinner />
        </span>
      ) : null}
      <span
        data-slot="button-content"
        className={cn(
          'relative inline-flex items-center justify-center gap-1 [inset-block-start:0.0625em]',
          '[&:has(>svg:only-child)]:[inset-block-start:0]',
          loading && 'invisible'
        )}
      >
        {children}
      </span>
      {loading ? <span className="sr-only">{loadingLabel}</span> : null}
    </button>
  )
})
