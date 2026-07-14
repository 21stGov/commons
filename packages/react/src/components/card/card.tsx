// SPDX-License-Identifier: MIT
// Compound API adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/cn'

export const cardVariants = cva(
  [
    'min-w-0 overflow-hidden rounded-md border text-sm text-foreground',
    'forced-colors:border-[CanvasText]',
  ],
  {
    variants: {
      appearance: {
        bordered: 'border-border bg-background',
        elevated: 'border-transparent bg-background shadow-2',
        subtle: 'border-border bg-muted',
      },
    },
    defaultVariants: { appearance: 'bordered' },
  }
)

export const cardGroupVariants = cva('m-0 grid list-none gap-2 p-0', {
  variants: {
    columns: {
      auto: 'grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))]',
      one: 'grid-cols-1',
      two: 'grid-cols-1 sm:grid-cols-2',
      three: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    },
  },
  defaultVariants: { columns: 'auto' },
})

export type CardOrientation = 'vertical' | 'horizontal'
export type CardMediaPosition = 'start' | 'end'
export type CardSize = 'sm' | 'default'

interface CardLayoutContextValue {
  orientation: CardOrientation
  mediaPosition: CardMediaPosition
}

const CardLayoutContext = React.createContext<CardLayoutContextValue>({
  orientation: 'vertical',
  mediaPosition: 'start',
})

type CardStyle = React.CSSProperties & { '--card-padding'?: string }

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  /** Stacks content vertically or uses a responsive flag layout. @default "vertical" */
  orientation?: CardOrientation
  /** Logical media side in the horizontal layout. @default "start" */
  mediaPosition?: CardMediaPosition
  /** Controls the shared inset of header, content, and footer. @default "default" */
  size?: CardSize
}

/**
 * Visual container for one self-contained subject. The root is a neutral
 * `<div>`; use CardGroup/CardItem for collections and CardTitle's heading
 * level to integrate with the real page outline.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    className,
    appearance,
    orientation = 'vertical',
    mediaPosition = 'start',
    size = 'default',
    style,
    children,
    ...props
  },
  ref
) {
  const cardStyle: CardStyle = {
    '--card-padding':
      size === 'sm' ? 'var(--cui-spacing-105)' : 'var(--cui-spacing-2)',
    ...style,
  }

  return (
    <CardLayoutContext.Provider value={{ orientation, mediaPosition }}>
      <div
        {...props}
        ref={ref}
        data-slot="card"
        data-orientation={orientation}
        data-media-position={mediaPosition}
        data-size={size}
        style={cardStyle}
        className={cn(
          cardVariants({ appearance }),
          orientation === 'vertical'
            ? 'flex flex-col'
            : cn(
                'flex flex-col sm:grid sm:grid-rows-[auto_minmax(0,1fr)_auto]',
                mediaPosition === 'start'
                  ? 'sm:grid-cols-[minmax(10rem,2fr)_minmax(0,3fr)]'
                  : 'sm:grid-cols-[minmax(0,3fr)_minmax(10rem,2fr)]'
              ),
          className
        )}
      >
        {children}
      </div>
    </CardLayoutContext.Provider>
  )
})

export interface CardGroupProps
  extends React.OlHTMLAttributes<HTMLUListElement>, VariantProps<typeof cardGroupVariants> {}

/** Semantic list and responsive layout for a collection of related cards. */
export const CardGroup = React.forwardRef<HTMLUListElement, CardGroupProps>(function CardGroup(
  { className, columns, style, ...props },
  ref
) {
  return (
    <ul
      {...props}
      ref={ref}
      role="list"
      data-slot="card-group"
      style={{ paddingInlineStart: 0, ...style }}
      className={cn(cardGroupVariants({ columns }), className)}
    />
  )
})

export type CardItemProps = React.LiHTMLAttributes<HTMLLIElement>

/** One list item in a CardGroup. */
export const CardItem = React.forwardRef<HTMLLIElement, CardItemProps>(function CardItem(
  { className, ...props },
  ref
) {
  return (
    <li
      {...props}
      ref={ref}
      data-slot="card-item"
      className={cn('min-w-0 list-none', className)}
    />
  )
})

function contentColumnClasses(position: CardMediaPosition): string {
  return position === 'start' ? 'sm:col-start-2' : 'sm:col-start-1'
}

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>

/** Title, description, and optional CardAction. */
export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { className, ...props },
  ref
) {
  const layout = React.useContext(CardLayoutContext)
  return (
    <div
      {...props}
      ref={ref}
      data-slot="card-header"
      className={cn(
        'grid grid-cols-[minmax(0,1fr)_auto] gap-x-2 gap-y-05 [padding:var(--card-padding)]',
        '[padding-block-end:0] last:[padding-block-end:var(--card-padding)]',
        // Header-first media: when media immediately follows the header in the
        // stacked layout, the header's flush block-end otherwise leaves the
        // heading text crowding the media. Restore a full inset of breathing
        // room below it. Scoped away from the horizontal grid, where the media
        // lives in its own column and needs no extra header padding.
        layout.orientation !== 'horizontal' &&
          '[&:has(+[data-slot=card-media])]:[padding-block-end:var(--card-padding)]',
        layout.orientation === 'horizontal' &&
          cn('sm:row-start-1', contentColumnClasses(layout.mediaPosition)),
        className
      )}
    />
  )
})

export type CardHeadingLevel = 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Heading element matching the surrounding document outline. @default "h3" */
  headingLevel?: CardHeadingLevel
}

/** Visible card heading. */
export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle(
  { className, headingLevel = 'h3', ...props },
  ref
) {
  const HeadingTag = headingLevel
  return (
    <HeadingTag
      {...props}
      ref={ref}
      data-slot="card-title"
      className={cn('min-w-0 text-md font-semibold leading-snug text-foreground', className)}
    />
  )
})

export type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  function CardDescription({ className, ...props }, ref) {
    return (
      <p
        {...props}
        ref={ref}
        data-slot="card-description"
        className={cn('col-start-1 text-sm leading-normal text-muted-foreground', className)}
      />
    )
  }
)

export type CardActionProps = React.HTMLAttributes<HTMLDivElement>

/** Optional control or compact metadata aligned to the header's inline end. */
export const CardAction = React.forwardRef<HTMLDivElement, CardActionProps>(function CardAction(
  { className, ...props },
  ref
) {
  return (
    <div
      {...props}
      ref={ref}
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start', className)}
    />
  )
})

export type CardContentProps = React.HTMLAttributes<HTMLDivElement>

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(function CardContent(
  { className, ...props },
  ref
) {
  const layout = React.useContext(CardLayoutContext)
  return (
    <div
      {...props}
      ref={ref}
      data-slot="card-content"
      className={cn(
        'min-w-0 [padding:var(--card-padding)]',
        layout.orientation === 'horizontal' &&
          cn('sm:row-start-2', contentColumnClasses(layout.mediaPosition)),
        className
      )}
    />
  )
})

export type CardFooterProps = React.HTMLAttributes<HTMLDivElement>

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(function CardFooter(
  { className, ...props },
  ref
) {
  const layout = React.useContext(CardLayoutContext)
  return (
    <div
      {...props}
      ref={ref}
      data-slot="card-footer"
      className={cn(
        'mt-auto flex flex-wrap items-center gap-1 [padding:var(--card-padding)] [padding-block-start:0]',
        layout.orientation === 'horizontal' &&
          cn('sm:row-start-3', contentColumnClasses(layout.mediaPosition)),
        className
      )}
    />
  )
})

export interface CardMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Insets media from the card boundary instead of using a full-bleed edge. */
  inset?: boolean
}

/**
 * Responsive media wrapper. Child images retain their own alt semantics;
 * CardMedia adds no role or accessible name.
 */
export const CardMedia = React.forwardRef<HTMLDivElement, CardMediaProps>(function CardMedia(
  { className, inset = false, ...props },
  ref
) {
  const layout = React.useContext(CardLayoutContext)
  return (
    <div
      {...props}
      ref={ref}
      data-slot="card-media"
      data-inset={inset ? '' : undefined}
      className={cn(
        'min-h-0 min-w-0 overflow-hidden bg-muted',
        '[&_img]:size-full [&_img]:object-cover',
        layout.orientation === 'horizontal' &&
          cn(
            'sm:row-start-1 sm:row-end-4',
            layout.mediaPosition === 'start' ? 'sm:col-start-1' : 'sm:col-start-2'
          ),
        inset && 'm-[var(--card-padding)] rounded-sm',
        className
      )}
    />
  )
})
