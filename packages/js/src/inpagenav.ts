// SPDX-License-Identifier: MIT

/**
 * In-Page Navigation behavior — scroll-spy over on-page anchor links.
 *
 * Works on the component's own markup: each `[data-slot="in-page-navigation-link"]`
 * whose href points to an on-page `#section` is marked active
 * (`cui-in-page-navigation-link--active` + aria-current) when that section is the
 * top-most one in view. Clicking a link also marks it active immediately.
 */

import { all, claim } from './dom.ts'

const ACTIVE = 'cui-in-page-navigation-link--active'

export function enhanceInPageNavigation(root: ParentNode): void {
  for (const nav of claim(root, '[data-slot="in-page-navigation"]', 'in-page-nav')) {
    const links = all<HTMLAnchorElement>(nav, '[data-slot="in-page-navigation-link"]')
    const sectionToLink = new Map<Element, HTMLElement>()
    for (const link of links) {
      const href = link.getAttribute('href')
      if (href?.startsWith('#')) {
        const section = document.getElementById(href.slice(1))
        if (section) sectionToLink.set(section, link)
      }
    }
    if (sectionToLink.size === 0) continue

    const activate = (link: HTMLElement | undefined): void => {
      for (const l of links) {
        const on = l === link
        l.classList.toggle(ACTIVE, on)
        if (on) l.setAttribute('aria-current', 'location')
        else l.removeAttribute('aria-current')
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) activate(sectionToLink.get(visible[0].target))
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0 },
    )
    for (const section of sectionToLink.keys()) observer.observe(section)
    for (const link of links) link.addEventListener('click', () => activate(link))
  }
}
