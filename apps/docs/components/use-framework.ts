// SPDX-License-Identifier: MIT

'use client'

import * as React from 'react'

/**
 * The docs have two audiences: React/CLI consumers and framework-agnostic
 * ("vanilla") consumers who use `commons.css` + `commons-js` directly. A single
 * page-wide preference reshapes each component page for the reader's stack —
 * the demo, its copyable code, and the Installation/Usage prose all follow it.
 *
 * The source of truth is `document.documentElement.dataset.framework`, seeded
 * before paint by an inline script in the root layout (so CSS-driven content
 * swaps have no flash) and mirrored to localStorage so the choice persists.
 */
export type Framework = 'react' | 'html'

export const FRAMEWORK_STORAGE_KEY = 'commons-framework'
const FRAMEWORK_EVENT = 'commons-frameworkchange'

export function getFramework(): Framework {
  if (typeof document === 'undefined') return 'react'
  return document.documentElement.dataset.framework === 'html' ? 'html' : 'react'
}

export function setFramework(framework: Framework): void {
  document.documentElement.dataset.framework = framework
  try {
    localStorage.setItem(FRAMEWORK_STORAGE_KEY, framework)
  } catch {
    // Private mode / storage disabled — the in-memory dataset value still works
    // for this session.
  }
  window.dispatchEvent(new CustomEvent(FRAMEWORK_EVENT))
}

/** Subscribe a component to the current framework preference. */
export function useFramework(): [Framework, (framework: Framework) => void] {
  const subscribe = React.useCallback((onChange: () => void) => {
    window.addEventListener(FRAMEWORK_EVENT, onChange)
    window.addEventListener('storage', onChange)
    return () => {
      window.removeEventListener(FRAMEWORK_EVENT, onChange)
      window.removeEventListener('storage', onChange)
    }
  }, [])
  // Server render (and the first client render, before hydration) must agree,
  // so the SSR snapshot is always 'react' — the default the inline script also
  // seeds when no preference is stored.
  const getServerSnapshot = React.useCallback((): Framework => 'react', [])
  const framework = React.useSyncExternalStore(subscribe, getFramework, getServerSnapshot)
  return [framework, setFramework]
}
