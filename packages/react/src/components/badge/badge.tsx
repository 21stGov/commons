// SPDX-License-Identifier: MIT
// Variant structure adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/cn'

export const badgeVariants = cva(
  [
    'inline-flex max-w-full items-center gap-05 rounded-full border font-medium leading-none',
    '[&_svg]:size-[1em] [&_svg]:shrink-0',
    'forced-colors:border-[CanvasText]',
  ],
  {
    variants: {
      variant: {
        neutral: 'border-border bg-muted text-foreground',
        primary: 'border-transparent bg-primary text-primary-foreground',
        info: 'border-info-border bg-info text-info-foreground',
        success: 'border-success-border bg-success text-success-foreground',
        warning: 'border-warning-border bg-warning text-warning-foreground',
        error: 'border-error-border bg-error text-error-foreground',
        outline: 'border-border-strong bg-transparent text-foreground',
      },
      size: {
        sm: 'min-h-3 px-1 py-05 text-xs',
        md: 'min-h-4 px-105 py-05 text-sm',
        lg: 'min-h-5 px-2 py-1 text-base',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  /** Visible text carrying the badge meaning; never rely on color alone. */
  children: React.ReactNode
}

/**
 * Compact, non-interactive status or count label. It always renders a
 * neutral `<span>`—use a Link or Button beside it when an action is needed.
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, variant, size, children, ...props },
  ref
) {
  return (
    <span
      {...props}
      ref={ref}
      data-slot="badge"
      data-variant={variant ?? 'neutral'}
      data-size={size ?? 'md'}
      className={cn(badgeVariants({ variant, size }), className)}
    >
      <span
        data-slot="badge-label"
        className="relative inline-flex min-w-0 items-center gap-05 [inset-block-start:0.0625em]"
      >
        {children}
      </span>
    </span>
  )
})

export const tagVariants = cva(
  [
    'inline-flex max-w-full items-center rounded-sm border border-border bg-muted',
    'font-medium leading-snug text-foreground forced-colors:border-[CanvasText]',
  ],
  {
    variants: {
      size: {
        default: 'min-h-4 px-105 py-05 text-sm',
        big: 'min-h-5 px-2 py-1 text-base',
      },
    },
    defaultVariants: { size: 'default' },
  }
)

export interface TagProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof tagVariants> {
  /** Visible category or taxonomy label. */
  children: React.ReactNode
}

/**
 * Static category label. Tag intentionally has no hover, focus, or active
 * styles so it cannot be mistaken for a filter button.
 */
export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { className, size, children, ...props },
  ref
) {
  return (
    <span
      {...props}
      ref={ref}
      data-slot="tag"
      data-size={size ?? 'default'}
      className={cn(tagVariants({ size }), className)}
    >
      <span data-slot="tag-label" className="relative min-w-0 [inset-block-start:0.0625em]">
        {children}
      </span>
    </span>
  )
})

export interface RemovableTagProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Visible token text. Kept as a string so the default button name is reliable. */
  label: string
  /** Called by the native remove button. */
  onRemove?: React.MouseEventHandler<HTMLButtonElement>
  /**
   * Localized accessible name for the remove button.
   * @default "Remove {label}"
   */
  removeLabel?: string
  /** Prevent removal while preserving the visible token. */
  disabled?: boolean
}

function RemoveIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="size-2"
    >
      <path d="m4 4 8 8M12 4l-8 8" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Removable filter/token pattern. Unlike static Tag, this composite exposes
 * an explicit native button with the Commons 44px target and localized name.
 * The consumer owns removal announcements when a token disappears.
 */
export const RemovableTag = React.forwardRef<HTMLSpanElement, RemovableTagProps>(
  function RemovableTag(
    { className, label, onRemove, removeLabel = `Remove ${label}`, disabled, ...props },
    ref
  ) {
    return (
      <span
        {...props}
        ref={ref}
        data-slot="removable-tag"
        className={cn(
          'inline-flex min-h-11 max-w-full items-center rounded-full border border-border bg-muted',
          'ps-2 text-sm font-medium text-foreground forced-colors:border-[CanvasText]',
          className
        )}
      >
        <span
          data-slot="removable-tag-label"
          className="relative min-w-0 overflow-hidden text-ellipsis whitespace-nowrap [inset-block-start:0.0625em]"
        >
          {label}
        </span>
        <button
          type="button"
          data-slot="removable-tag-remove"
          aria-label={removeLabel}
          disabled={disabled}
          onClick={onRemove}
          className={cn(
            'inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full border border-transparent',
            'bg-transparent text-foreground transition-colors motion-reduce:transition-none',
            'hover:bg-background active:bg-background',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
            'disabled:cursor-not-allowed disabled:text-disabled-foreground'
          )}
        >
          <RemoveIcon />
        </button>
      </span>
    )
  }
)
