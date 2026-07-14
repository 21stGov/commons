// SPDX-License-Identifier: MIT

/** Shared primitives for overlay behaviors (dialog, drawer, menu, popover). */

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/** Visible, focusable descendants of `container`, in DOM order. */
export function focusable(container: ParentNode): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  )
}

/** Move focus to the first focusable element inside `container` (or the container). */
export function focusFirst(container: HTMLElement): void {
  const target = focusable(container)[0] ?? container
  target.focus()
}

/**
 * An open overlay's shared machinery: keep Tab within `container`, close on
 * Escape and (optionally) on an outside pointer press, and restore focus to
 * the element that was focused before opening. Returns a teardown function.
 */
export function activateOverlay(
  container: HTMLElement,
  onClose: () => void,
  opts: { dismissOnOutside?: boolean; ignore?: HTMLElement | null } = {},
): () => void {
  const previouslyFocused = document.activeElement as HTMLElement | null

  const onKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onClose()
      return
    }
    if (event.key !== 'Tab') return
    const items = focusable(container)
    if (items.length === 0) {
      event.preventDefault()
      return
    }
    const first = items[0]!
    const last = items[items.length - 1]!
    const active = document.activeElement
    if (event.shiftKey && (active === first || !container.contains(active))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const onPointerDown = (event: PointerEvent): void => {
    const target = event.target as Node
    if (container.contains(target)) return
    if (opts.ignore && opts.ignore.contains(target)) return
    onClose()
  }

  document.addEventListener('keydown', onKeydown, true)
  if (opts.dismissOnOutside) document.addEventListener('pointerdown', onPointerDown, true)

  return () => {
    document.removeEventListener('keydown', onKeydown, true)
    if (opts.dismissOnOutside) document.removeEventListener('pointerdown', onPointerDown, true)
    if (previouslyFocused && previouslyFocused.isConnected) previouslyFocused.focus()
  }
}

let scrollLocks = 0
/** Reference-counted body scroll lock, so nested overlays don't unlock early. */
export function lockScroll(): () => void {
  if (scrollLocks === 0) {
    const width = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (width > 0) document.body.style.paddingRight = `${width}px`
  }
  scrollLocks += 1
  let released = false
  return () => {
    if (released) return
    released = true
    scrollLocks -= 1
    if (scrollLocks === 0) {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }
}
