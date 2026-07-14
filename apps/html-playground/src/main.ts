// SPDX-License-Identifier: MIT

/**
 * The Commons HTML playground — a framework-free mirror of apps/playground.
 * Every section is real component markup (generated from the React demos into
 * `.cui-*` HTML) styled by commons.css alone. The preferences bar drives the
 * same [data-theme] / dir / font-size levers the React playground does, so the
 * same theming (light / dark / high contrast), direction, and text-size
 * behaviour can be verified with no React in sight.
 */

import './style.css'

import { enhance } from '@21stgov/commons-js'

import manifest from './generated/demos.json'

interface DemoEntry {
  slug: string
  title: string
  ok: boolean
  error?: string
}

const demos = manifest as DemoEntry[]

// Raw HTML fragment for every generated demo, keyed by slug.
const fragments = import.meta.glob('./generated/demos/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

// Hand-authored canonical markup for interactive components whose content React
// unmounts/portals (so it can't come from SSR). These override the generated
// fragment and are wired up by @21stgov/commons-js `enhance()`.
const authored = import.meta.glob('./authored/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const isAuthored = (slug: string): boolean => `./authored/${slug}.html` in authored

const htmlFor = (slug: string): string =>
  authored[`./authored/${slug}.html`] ?? fragments[`./generated/demos/${slug}.html`] ?? ''

// ---------------------------------------------------------------------------
// Display preferences — same contract as the React playground.
// ---------------------------------------------------------------------------

interface Pref {
  key: string
  label: string
  fallback: string
  options: { value: string; label: string }[]
  apply: (value: string) => void
}

const root = document.documentElement

const PREFS: Pref[] = [
  {
    key: 'commons-html-playground:theme',
    label: 'Theme',
    fallback: 'auto',
    options: [
      { value: 'auto', label: 'Auto (system)' },
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
      { value: 'high-contrast', label: 'High contrast' },
    ],
    apply(value) {
      if (value === 'auto') {
        // The token CSS keys its prefers-color-scheme / prefers-contrast
        // fallbacks on :root:not([data-theme]) — dropping the attribute hands
        // control back to the operating system.
        root.removeAttribute('data-theme')
        root.style.removeProperty('color-scheme')
        return
      }
      root.setAttribute('data-theme', value)
      // High contrast is a black-on-white (light) scheme.
      root.style.colorScheme = value === 'dark' ? 'dark' : 'light'
    },
  },
  {
    key: 'commons-html-playground:direction',
    label: 'Direction',
    fallback: 'ltr',
    options: [
      { value: 'ltr', label: 'Left to right (LTR)' },
      { value: 'rtl', label: 'Right to left (RTL)' },
    ],
    apply(value) {
      root.dir = value
    },
  },
  {
    key: 'commons-html-playground:font-scale',
    label: 'Text size',
    fallback: '100',
    options: [
      { value: '100', label: '100% (default)' },
      { value: '125', label: '125%' },
      { value: '150', label: '150%' },
      { value: '200', label: '200%' },
    ],
    apply(value) {
      // Commons type is rem-only, so scaling the root font-size scales the
      // whole system — exactly what raising the browser font size does.
      root.style.fontSize = `${value}%`
    },
  },
]

function readPref(pref: Pref): string {
  try {
    const stored = window.localStorage.getItem(pref.key)
    if (stored !== null && pref.options.some((o) => o.value === stored)) return stored
  } catch {
    /* storage unavailable (private browsing) — fall through to default */
  }
  return pref.fallback
}

function writePref(pref: Pref, value: string): void {
  try {
    window.localStorage.setItem(pref.key, value)
  } catch {
    /* non-fatal: the preference still applies for this session */
  }
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  children: (Node | string)[] = [],
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v)
  for (const c of children) node.append(c)
  return node
}

function buildPrefsBar(): HTMLElement {
  const bar = el('div', { class: 'pg-prefs', role: 'group', 'aria-label': 'Display preferences' })
  for (const pref of PREFS) {
    const select = el('select')
    for (const opt of pref.options) {
      select.append(el('option', { value: opt.value }, [opt.label]))
    }
    const current = readPref(pref)
    select.value = current
    pref.apply(current)
    select.addEventListener('change', () => {
      pref.apply(select.value)
      writePref(pref, select.value)
    })
    bar.append(el('label', { class: 'pg-field' }, [el('span', {}, [pref.label]), select]))
  }
  return bar
}

function render(): void {
  const app = document.getElementById('root')!

  const skip = el('a', { class: 'pg-skip', href: '#main' }, ['Skip to main content'])

  const header = el('header', { class: 'pg-header' })
  const headerInner = el('div', { class: 'pg-wrap' })
  const title = el('div', { class: 'pg-title' }, [
    el('h1', {}, ['Commons HTML playground']),
    el('p', { class: 'pg-tagline' }, [
      'every component as plain HTML + one stylesheet — no React, no Tailwind',
    ]),
  ])
  headerInner.append(title, buildPrefsBar())
  header.append(headerInner)

  const body = el('div', { class: 'pg-body' })

  const nav = el('nav', { class: 'pg-nav', 'aria-label': 'Components' })
  const navList = el('ul')
  for (const d of demos) {
    navList.append(el('li', {}, [el('a', { href: `#demo-${d.slug}` }, [d.title])]))
  }
  nav.append(el('h2', {}, ['Components']), navList)

  const main = el('main', { class: 'pg-main', id: 'main', tabindex: '-1' })
  for (const d of demos) {
    const section = el('section', {
      class: 'pg-demo',
      id: `demo-${d.slug}`,
      'data-ok': String(d.ok),
      'aria-labelledby': `demo-${d.slug}-heading`,
    })
    const heading = el('h2', { id: `demo-${d.slug}-heading` }, [d.title])
    if (isAuthored(d.slug)) heading.append(el('span', { class: 'pg-tag' }, ['interactive']))
    section.append(heading)
    if (d.ok || isAuthored(d.slug)) {
      const holder = el('div')
      holder.innerHTML = htmlFor(d.slug)
      section.append(holder)
    } else {
      section.append(el('p', { class: 'pg-error' }, [`Could not render: ${d.error ?? 'unknown'}`]))
    }
    main.append(section)
  }

  body.append(nav, main)

  const footer = el('footer', { class: 'pg-footer' })
  footer.append(
    el('div', { class: 'pg-wrap' }, [
      el('p', {}, [
        'Built with Commons — MIT licensed. Every section above is the exact markup a non-React site ships; the theme, direction, and text-size controls drive it through commons.css alone.',
      ]),
    ]),
  )

  app.replaceChildren(skip, header, body, footer)

  // Progressively enhance the interactive components (accordion, collapsible…).
  enhance(main)

  // Demo forms have no backend; the React demos preventDefault in onSubmit,
  // which the static rewrite strips. Without it a submit navigates to the
  // current URL and jumps the page. Neutralize submits inside the demo area.
  main.addEventListener('submit', (event) => {
    event.preventDefault()
  })
}

render()
