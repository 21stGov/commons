// SPDX-License-Identifier: MIT

'use client'

import { SidebarTrigger } from 'fumadocs-ui/layouts/notebook/slots/sidebar'
import {
  FullSearchTrigger,
  SearchTrigger,
} from 'fumadocs-ui/layouts/shared/slots/search-trigger'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ComponentProps, JSX, ReactNode } from 'react'

import { DocsPreferences } from '@/components/docs-preferences'

/** Top-level site links — the same set on every page. */
const NAV_LINKS: { text: string; url: string; external?: boolean }[] = [
  { text: 'Docs', url: '/docs' },
  { text: 'Components', url: '/docs/components' },
  { text: 'GitHub', url: 'https://github.com/21stgov/commons', external: true },
]

function cx(...parts: (string | false | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}

function isActive(url: string, pathname: string): boolean {
  if (url === '/docs') {
    // "Docs" covers /docs and its non-component subpaths; "Components" owns
    // /docs/components so the two don't both light up.
    return (
      pathname === '/docs' ||
      (pathname.startsWith('/docs/') && !pathname.startsWith('/docs/components'))
    )
  }
  return pathname === url || pathname.startsWith(`${url}/`)
}

/**
 * The site's single navbar. It is rendered into BOTH the marketing (home) and
 * the docs (notebook) layouts via each layout's `slots.header`, so the top
 * navbar is one identical component across the whole site — fumadocs' built-in
 * home and docs navbars are different components that arrange the brand, search,
 * and links differently, which read as "jumping to a new site". The search
 * triggers and preference selectors are the real fumadocs / docs ones (this
 * renders inside the layout's search provider), so nothing is reimplemented.
 *
 * `mobileMenu` is the layout-specific small-screen control: the docs pass the
 * sidebar trigger (opens the page tree); the home passes a links disclosure.
 */
export function SiteNav({
  mobileMenu,
  className,
  ...props
}: ComponentProps<'header'> & { mobileMenu?: ReactNode }): JSX.Element {
  const pathname = usePathname()
  return (
    <header
      {...props}
      className={cx(
        // `col-span-full` spans every column of the docs notebook grid (its
        // header slot otherwise lands in the content column, ~250px short on the
        // right); it's inert on the home's non-grid layout.
        'sticky top-0 z-20 col-span-full border-b border-fd-border bg-fd-background/80 backdrop-blur-sm',
        className,
      )}
    >
      <div className="flex h-14 items-center gap-3 px-4 md:px-6">
        <Link
          href="/"
          aria-label="Commons home"
          className="shrink-0 text-md font-bold text-fd-foreground"
        >
          Commons
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-4 md:flex">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.text}
              href={item.url}
              {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
              className={cx(
                'text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground',
                !item.external && isActive(item.url, pathname) && 'font-medium text-fd-foreground',
              )}
            >
              {item.text}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        <FullSearchTrigger className="hidden w-full max-w-56 md:inline-flex" />
        <SearchTrigger aria-label="Search" className="md:hidden" />

        <div className="hidden md:flex">
          <DocsPreferences />
        </div>

        {mobileMenu ? <div className="md:hidden">{mobileMenu}</div> : null}
      </div>
    </header>
  )
}

/**
 * Header for the docs (notebook) layout: the shared nav with the sidebar
 * trigger as its small-screen control. A named client component so the server
 * layout can pass it to `slots.header` by reference (an inline function would
 * fail the RSC "functions can't cross to Client Components" boundary).
 */
export function DocsSiteHeader(props: ComponentProps<'header'>): JSX.Element {
  return (
    <SiteNav
      {...props}
      mobileMenu={
        <SidebarTrigger
          aria-label="Open navigation"
          className="inline-flex size-10 items-center justify-center rounded-md border border-fd-border text-fd-foreground"
        />
      }
    />
  )
}

/** Header for the marketing (home) layout: the shared nav + a links disclosure. */
export function HomeSiteHeader(props: ComponentProps<'header'>): JSX.Element {
  return <SiteNav {...props} mobileMenu={<HomeMobileNav />} />
}

/**
 * Small-screen nav for the home (no sidebar to hang the links off). A native
 * `<details>` disclosure — keyboard- and screen-reader-complete with no JS —
 * holding the same links plus the viewing preferences.
 */
export function HomeMobileNav(): JSX.Element {
  return (
    <details className="relative">
      <summary
        aria-label="Menu"
        className="inline-flex size-10 list-none items-center justify-center rounded-md border border-fd-border text-fd-foreground [&::-webkit-details-marker]:hidden"
      >
        <svg viewBox="0 0 16 16" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
          <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />
        </svg>
      </summary>
      <div className="absolute end-0 top-full z-50 mt-2 flex min-w-48 flex-col gap-1 rounded-md border border-fd-border bg-fd-popover p-1 shadow-lg">
        {NAV_LINKS.map((item) => (
          <Link
            key={item.text}
            href={item.url}
            {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
            className="rounded-md px-3 py-2 text-sm text-fd-popover-foreground hover:bg-fd-accent"
          >
            {item.text}
          </Link>
        ))}
        <div className="border-t border-fd-border px-3 pt-2">
          <DocsPreferences />
        </div>
      </div>
    </details>
  )
}
