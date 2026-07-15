// SPDX-License-Identifier: MIT

/**
 * Live Progress behavior — step buttons that nudge a determinate progress bar.
 *
 * Contract: a button whose text reads like `+10%` / `−10%` (or that carries an
 * explicit `data-progress-step="10"` / `"-10"`) adjusts the nearest
 * `[data-slot="progress"]` in its section — updating `aria-valuenow`,
 * `aria-valuetext`, the `[data-slot="progress-value"]` text, and the
 * `[data-slot="progress-indicator"]` fill width.
 */

const STEP = /^\s*([+−-])\s*(\d+(?:\.\d+)?)\s*%?/

export function enhanceProgress(root: ParentNode): void {
  for (const btn of Array.from(root.querySelectorAll<HTMLButtonElement>('button'))) {
    if (btn.dataset.cuiProgressWired === '1') continue
    const attr = btn.getAttribute('data-progress-step')
    const m = btn.textContent?.match(STEP)
    let delta: number | null = null
    if (attr != null && attr !== '') delta = Number(attr)
    else if (m) delta = (m[1] === '+' ? 1 : -1) * Number(m[2])
    if (delta == null || Number.isNaN(delta)) continue

    const scope = btn.closest('section') ?? btn.parentElement?.parentElement ?? null
    const progress = scope?.querySelector<HTMLElement>('[data-slot="progress"]')
    if (!progress) continue
    btn.dataset.cuiProgressWired = '1'

    btn.addEventListener('click', () => {
      const max = Number(progress.getAttribute('aria-valuemax')) || 100
      const cur = Number(progress.getAttribute('aria-valuenow')) || 0
      const next = Math.min(max, Math.max(0, cur + delta))
      progress.setAttribute('aria-valuenow', String(next))
      progress.setAttribute('aria-valuetext', `${next}%`)
      const indicator = progress.querySelector<HTMLElement>('[data-slot="progress-indicator"]')
      if (indicator) indicator.style.width = `${(next / max) * 100}%`
      const valueEl = progress.querySelector<HTMLElement>('[data-slot="progress-value"]')
      if (valueEl) valueEl.textContent = `${next}%`
    })
  }
}
