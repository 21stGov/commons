// SPDX-License-Identifier: MIT

/** Small typed DOM helpers shared by the behaviors. */

const ENHANCED = 'data-cui-enhanced'

/** Query all elements matching `selector` under `root` as a typed array. */
export function all<E extends Element = HTMLElement>(root: ParentNode, selector: string): E[] {
  return Array.from(root.querySelectorAll<E>(selector))
}

/**
 * Elements matching `selector` under `root` that haven't been enhanced for
 * `key` yet — marks each as enhanced so a repeated `enhance()` is a no-op.
 * `key` namespaces the guard so different behaviors can each claim one element.
 */
export function claim(root: ParentNode, selector: string, key: string): HTMLElement[] {
  const claimed: HTMLElement[] = []
  for (const el of all<HTMLElement>(root, selector)) {
    const done = (el.getAttribute(ENHANCED) ?? '').split(/\s+/)
    if (done.includes(key)) continue
    el.setAttribute(ENHANCED, [...done, key].filter(Boolean).join(' '))
    claimed.push(el)
  }
  return claimed
}
