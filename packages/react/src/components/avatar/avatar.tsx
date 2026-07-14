// SPDX-License-Identifier: MIT
// Compound API and variant pattern adapted from shadcn/ui
// (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { Avatar as BaseAvatar } from '@base-ui/react/avatar'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/cn'

export const avatarVariants = cva(
  [
    'relative inline-flex shrink-0 rounded-full bg-muted align-middle text-muted-foreground',
    'ring-1 ring-border',
  ],
  {
    variants: {
      size: {
        sm: 'size-3 text-xs',
        default: 'size-4 text-sm',
        lg: 'size-6 text-base',
      },
    },
    defaultVariants: { size: 'default' },
  }
)

type BaseRootProps = React.ComponentProps<typeof BaseAvatar.Root>
type BaseImageProps = React.ComponentProps<typeof BaseAvatar.Image>
type BaseFallbackProps = React.ComponentProps<typeof BaseAvatar.Fallback>

export interface AvatarProps
  extends Omit<BaseRootProps, 'className' | 'render'>,
    VariantProps<typeof avatarVariants> {
  className?: string
}

export interface AvatarImageProps extends Omit<BaseImageProps, 'alt' | 'className' | 'render'> {
  /**
   * Text alternative for the image. Use a person's name when the avatar is
   * the only name present, or `alt=""` when adjacent visible text already
   * identifies them so assistive technology does not hear the name twice.
   */
  alt: string
  className?: string
}

export interface AvatarFallbackProps extends Omit<BaseFallbackProps, 'className' | 'render'> {
  className?: string
}

export interface AvatarBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Accessible status text, such as "Available". Without a label the badge
   * is decorative and hidden from assistive technology.
   */
  label?: string
}

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional accessible name when the collection needs to be announced as a group. */
  ariaLabel?: string
}

export interface AvatarGroupCountProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Number of additional people not shown in the group. */
  count: number
  /** Localizable accessible name. Defaults to “{count} more people”. */
  label?: string
  /** Optional visible content. Defaults to “+{count}”. */
  children?: React.ReactNode
}

/**
 * A compact visual identity for a person or organization. The root is a
 * neutral `<span>`: the image owns image semantics, while adjacent text or
 * the image's `alt` text supplies the name.
 */
export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { className, size, ...props },
  ref
) {
  return (
    <BaseAvatar.Root
      {...props}
      ref={ref}
      data-slot="avatar"
      data-size={size ?? 'default'}
      className={cn(avatarVariants({ size }), className)}
    />
  )
})

/** The avatar image. A fallback is shown until this image loads or if it fails. */
export const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  function AvatarImage({ className, alt, ...props }, ref) {
    return (
      <BaseAvatar.Image
        {...props}
        ref={ref}
        alt={alt}
        data-slot="avatar-image"
        className={cn('absolute inset-0 size-full rounded-full object-cover', className)}
      />
    )
  }
)

/** Initials, an icon, or another short substitute shown while the image is unavailable. */
export const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  function AvatarFallback({ className, ...props }, ref) {
    return (
      <BaseAvatar.Fallback
        {...props}
        ref={ref}
        data-slot="avatar-fallback"
        className={cn(
          // leading-none removes font leading from the centering box; the
          // small logical block-start inset then nudges the initials down by
          // an em-relative hair (scales with each avatar size) because
          // Atkinson Hyperlegible's cap-height reads high in the line box and
          // otherwise looks lifted off the circle's optical center.
          'relative flex size-full items-center justify-center overflow-hidden rounded-full font-medium leading-none uppercase [inset-block-start:0.04em]',
          className
        )}
      />
    )
  }
)

/**
 * Small status marker pinned to the logical block/end corner. Provide
 * `label` whenever the status matters; color alone never carries meaning.
 */
export const AvatarBadge = React.forwardRef<HTMLSpanElement, AvatarBadgeProps>(
  function AvatarBadge({ className, label, ...props }, ref) {
    const accessibleLabel = props['aria-label'] ?? label
    return (
      <span
        {...props}
        ref={ref}
        data-slot="avatar-badge"
        role={accessibleLabel ? 'img' : undefined}
        aria-label={accessibleLabel}
        aria-hidden={accessibleLabel ? undefined : true}
        className={cn(
          // Pin the marker to the block-end/inline-end corner so it sits on
          // the ring at the circle's lower edge. The 2px background-colored
          // border carves it cleanly out of the avatar's own ring; flush
          // logical insets (not positive ones) keep it on the circumference
          // instead of floating inward above the stroke.
          'absolute bottom-0 end-0 size-105 rounded-full border-2 border-background bg-foreground',
          'forced-colors:border-[Canvas] forced-colors:bg-[CanvasText]',
          className
        )}
      />
    )
  }
)

/**
 * Overlapping avatar collection. Overlap uses logical margin so the stack
 * reverses naturally in RTL. Add `ariaLabel` only when grouping semantics
 * add useful context.
 */
export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  function AvatarGroup({ className, ariaLabel, ...props }, ref) {
    const accessibleLabel = props['aria-label'] ?? ariaLabel
    return (
      <div
        {...props}
        ref={ref}
        data-slot="avatar-group"
        role={accessibleLabel ? 'group' : undefined}
        aria-label={accessibleLabel}
        className={cn(
          'flex items-center',
          '[&>[data-slot=avatar]+[data-slot=avatar]]:-ms-1',
          '[&>[data-slot=avatar]]:ring-2 [&>[data-slot=avatar]]:ring-background',
          className
        )}
      />
    )
  }
)

/** Visible and announced count of people omitted from an avatar group. */
export const AvatarGroupCount = React.forwardRef<HTMLSpanElement, AvatarGroupCountProps>(
  function AvatarGroupCount(
    { className, count, label, children, ...props },
    ref
  ) {
    if (!Number.isInteger(count) || count < 1) {
      throw new RangeError('[commons] <AvatarGroupCount> `count` must be a positive integer.')
    }
    const accessibleLabel = props['aria-label'] ?? label ?? `${count} more people`

    return (
      <span
        {...props}
        ref={ref}
        data-slot="avatar-group-count"
        role="img"
        aria-label={accessibleLabel}
        className={cn(
          '-ms-1 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground',
          'ring-2 ring-background forced-colors:border forced-colors:border-[CanvasText]',
          className
        )}
      >
        <span aria-hidden="true">{children ?? `+${count}`}</span>
      </span>
    )
  }
)
