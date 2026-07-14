// SPDX-License-Identifier: MIT

import * as React from 'react'

import { Link } from '@/components/ui/link'
import { cn } from '@/lib/cn'

// Keep the shipped browser source free of a required Node type dependency.
// Bundlers statically replace `process.env.NODE_ENV` when available.
declare const process: { env: { NODE_ENV?: string | undefined } } | undefined

interface CollectionContextValue {
  condensed: boolean
}

const CollectionContext = React.createContext<CollectionContextValue>({ condensed: false })

export interface CollectionProps extends React.HTMLAttributes<HTMLUListElement> {
  /** Reduces vertical whitespace while preserving readable grouping. */
  condensed?: boolean
}

/**
 * Semantic list for related articles, notices, meetings, or service updates.
 * Collection never creates an internal scroll region and works best with six
 * or fewer immediately useful items.
 */
export const Collection = React.forwardRef<HTMLUListElement, CollectionProps>(function Collection(
  { className, condensed = false, style, children, ...props },
  ref
) {
  if (
    (typeof process === 'undefined' || process.env.NODE_ENV !== 'production') &&
    React.Children.count(children) > 6
  ) {
    console.warn(
      '[commons] <Collection> contains more than six items. Consider pagination, filtering, or a dedicated results list.'
    )
  }

  return (
    <CollectionContext.Provider value={{ condensed }}>
      <ul
        {...props}
        ref={ref}
        role="list"
        data-slot="collection"
        data-condensed={condensed ? 'true' : 'false'}
        style={{ paddingInlineStart: 0, ...style }}
        className={cn('m-0 min-w-0 list-none divide-y divide-border', className)}
      >
        {children}
      </ul>
    </CollectionContext.Provider>
  )
})

export type CollectionItemProps = React.LiHTMLAttributes<HTMLLIElement>

/** One independently understandable item in a Collection. */
export const CollectionItem = React.forwardRef<HTMLLIElement, CollectionItemProps>(
  function CollectionItem({ className, ...props }, ref) {
    const { condensed } = React.useContext(CollectionContext)
    return (
      <li
        {...props}
        ref={ref}
        data-slot="collection-item"
        className={cn(
          'grid min-w-0 grid-cols-1 gap-105 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-2',
          condensed ? 'py-105' : 'py-2',
          'first:pt-0 last:pb-0',
          className
        )}
      />
    )
  }
)

export type CollectionMediaProps = React.HTMLAttributes<HTMLDivElement>

/**
 * Optional thumbnail, seal, icon, or CalendarDate. Images keep their own
 * accessible name through alt text; decorative images should use alt="".
 */
export const CollectionMedia = React.forwardRef<HTMLDivElement, CollectionMediaProps>(
  function CollectionMedia({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-slot="collection-media"
        className={cn(
          'min-w-0 self-start sm:w-24',
          '[&_img]:block [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-sm',
          className
        )}
      />
    )
  }
)

export type CollectionContentProps = React.HTMLAttributes<HTMLDivElement>

export const CollectionContent = React.forwardRef<HTMLDivElement, CollectionContentProps>(
  function CollectionContent({ className, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        data-slot="collection-content"
        className={cn('min-w-0 space-y-1', className)}
      />
    )
  }
)

export type CollectionHeadingLevel = 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export interface CollectionTitleProps
  extends Omit<React.HTMLAttributes<HTMLHeadingElement>, 'children'> {
  /** Destination for the item's unique, descriptive title link. */
  href: string
  /** Heading element matching the surrounding document outline. @default "h3" */
  headingLevel?: CollectionHeadingLevel
  children: React.ReactNode
  linkProps?: Omit<React.ComponentPropsWithoutRef<typeof Link>, 'href' | 'children'>
}

/** A real heading containing the collection item's primary link. */
export const CollectionTitle = React.forwardRef<HTMLHeadingElement, CollectionTitleProps>(
  function CollectionTitle(
    { className, href, headingLevel = 'h3', children, linkProps, ...props },
    ref
  ) {
    const HeadingTag = headingLevel
    return (
      <HeadingTag
        {...props}
        ref={ref}
        data-slot="collection-title"
        className={cn('text-md font-semibold leading-snug text-foreground', className)}
      >
        <Link {...linkProps} href={href} className={cn('font-inherit', linkProps?.className)}>
          {children}
        </Link>
      </HeadingTag>
    )
  }
)

export type CollectionDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

export const CollectionDescription = React.forwardRef<
  HTMLParagraphElement,
  CollectionDescriptionProps
>(function CollectionDescription({ className, ...props }, ref) {
  return (
    <p
      {...props}
      ref={ref}
      data-slot="collection-description"
      className={cn('max-w-prose text-sm leading-normal text-muted-foreground', className)}
    />
  )
})

export type CollectionMetaProps = React.HTMLAttributes<HTMLUListElement>

/** Compact metadata list announced as a list by assistive technology. */
export const CollectionMeta = React.forwardRef<HTMLUListElement, CollectionMetaProps>(
  function CollectionMeta({ className, style, ...props }, ref) {
    return (
      <ul
        {...props}
        ref={ref}
        role="list"
        data-slot="collection-meta"
        style={{ paddingInlineStart: 0, ...style }}
        className={cn(
          // items-baseline (not items-center) sits every meta value on a
          // shared text baseline, so a leading time like "6:00 PM" lines up
          // with the label beside it ("Central Library") instead of reading
          // high — and the row stays aligned if a consumer mixes an icon or a
          // differently sized value into the metadata.
          'm-0 flex list-none flex-wrap items-baseline gap-x-105 gap-y-05 text-xs text-muted-foreground',
          className
        )}
      />
    )
  }
)

export type CollectionMetaItemProps = React.LiHTMLAttributes<HTMLLIElement>

export const CollectionMetaItem = React.forwardRef<HTMLLIElement, CollectionMetaItemProps>(
  function CollectionMetaItem({ className, ...props }, ref) {
    return (
      <li
        {...props}
        ref={ref}
        data-slot="collection-meta-item"
        className={cn('min-w-0', className)}
      />
    )
  }
)

export interface CollectionCalendarDateProps
  extends Omit<
    React.TimeHTMLAttributes<HTMLTimeElement>,
    'dateTime' | 'children' | 'aria-label'
  > {
  date: Date
  /** Locale used for visible and accessible date formatting. */
  locale?: string
  /** Use an explicit zone when server and browser output must match. */
  timeZone?: string
  /** Overrides the fully formatted date announced by assistive technology. */
  accessibleLabel?: string
}

/** Calendar-style date with a machine-readable ISO value and full spoken date. */
export const CollectionCalendarDate = React.forwardRef<
  HTMLTimeElement,
  CollectionCalendarDateProps
>(function CollectionCalendarDate(
  { className, date, locale, timeZone, accessibleLabel, ...props },
  ref
) {
  const month = new Intl.DateTimeFormat(locale, { month: 'short', timeZone }).format(date)
  const day = new Intl.DateTimeFormat(locale, { day: 'numeric', timeZone }).format(date)
  const fullDate = new Intl.DateTimeFormat(locale, {
    dateStyle: 'full',
    timeZone,
  }).format(date)

  return (
    <time
      {...props}
      ref={ref}
      dateTime={date.toISOString()}
      data-slot="collection-calendar-date"
      className={cn(
        'inline-grid min-h-11 min-w-11 overflow-hidden rounded-sm border border-border-strong text-center',
        'bg-background text-foreground forced-colors:border-[CanvasText]',
        className
      )}
    >
      <span className="sr-only">{accessibleLabel ?? fullDate}</span>
      <span aria-hidden="true" className="bg-muted px-1 py-025 text-xs font-semibold uppercase">
        {month}
      </span>
      <span aria-hidden="true" className="px-1 py-05 text-md font-semibold leading-none">
        {day}
      </span>
    </time>
  )
})
