// SPDX-License-Identifier: MIT

'use client'

import { SidebarTrigger } from 'fumadocs-ui/layouts/notebook/slots/sidebar'
import {
  FullSearchTrigger,
  SearchTrigger,
} from 'fumadocs-ui/layouts/shared/slots/search-trigger'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as React from 'react'
import type { ComponentProps, JSX, ReactNode } from 'react'
import { createPortal } from 'react-dom'

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

/** Hamburger glyph shared by the docs sidebar trigger and the home menu. */
function MenuIcon(): JSX.Element {
  return (
    <svg
      viewBox="0 0 16 16"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />
    </svg>
  )
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
        // `[grid-area:header]` drops the header into the docs notebook grid's
        // full-width header row. (Spanning the columns with `col-span-full`
        // instead pulls the `1fr` side margins wide via min-content and crushes
        // the article to ~280px.) Inert on the home's non-grid layout.
        'sticky top-0 z-20 [grid-area:header] border-b border-fd-border bg-fd-background/80 backdrop-blur-sm',
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
          className="inline-flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-md border border-fd-border text-fd-foreground"
        >
          <MenuIcon />
        </SidebarTrigger>
      }
    />
  )
}

/** Header for the marketing (home) layout: the shared nav + a links disclosure. */
export function HomeSiteHeader(props: ComponentProps<'header'>): JSX.Element {
  return <SiteNav {...props} mobileMenu={<HomeMobileNav />} />
}

/**
 * Small-screen nav for the home (no page-tree sidebar to hang the links off).
 * A slide-in drawer that mirrors the docs' sidebar drawer, so the two page
 * families feel the same on mobile. Rendered through a portal because the
 * navbar's `backdrop-blur` establishes a containing block that would otherwise
 * trap the `fixed` panel inside the 56px bar. Escape and a backdrop tap close
 * it; opening locks body scroll.
 */
export function HomeMobileNav(): JSX.Element {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-md border border-fd-border text-fd-foreground"
      >
        <MenuIcon />
      </button>

      {open
        ? createPortal(
            <div className="fixed inset-0 z-50">
              <button
                type="button"
                aria-label="Close menu"
                tabIndex={-1}
                onClick={() => setOpen(false)}
                className="absolute inset-0 bg-black/50"
              />
              <div
                role="dialog"
                aria-label="Navigation"
                aria-modal="true"
                className="absolute inset-y-0 end-0 flex w-72 max-w-[85vw] flex-col gap-1 border-s border-fd-border bg-fd-background p-4 shadow-xl"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-md font-bold text-fd-foreground">Commons</span>
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-md text-fd-muted-foreground hover:text-fd-foreground"
                  >
                    <svg viewBox="0 0 16 16" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                      <path d="m4 4 8 8M12 4l-8 8" />
                    </svg>
                  </button>
                </div>
                {NAV_LINKS.map((item) => (
                  <Link
                    key={item.text}
                    href={item.url}
                    {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2 text-sm text-fd-foreground hover:bg-fd-accent"
                  >
                    {item.text}
                  </Link>
                ))}
                <div className="mt-auto border-t border-fd-border pt-3">
                  <DocsPreferences />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
