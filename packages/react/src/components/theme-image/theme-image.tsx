// SPDX-License-Identifier: MIT

import * as React from 'react'

import { cn } from '@/lib/cn'

export interface ThemeImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** Source for the light theme (and the fallback for the others). */
  light: string
  /** Source for the dark theme. Falls back to `light`. */
  dark?: string
  /**
   * Source for the high-contrast theme. Falls back to `dark`, then `light`.
   * High contrast is light-based, so this is usually the color or black mark —
   * not the white one.
   */
  highContrast?: string
}

/**
 * An image that swaps with the active Commons theme — a seal or logo drawn for
 * a light page often disappears on a dark one. Give it up to three sources
 * (`light`, `dark`, `highContrast`) and the one matching the theme is shown:
 * an explicit `data-theme` on the root wins, with a `prefers-color-scheme` /
 * `prefers-contrast` fallback for the "system" setting. Omit a variant to
 * reuse another, so a single `light` works everywhere.
 *
 * All variants render; the `.cui-theme-image` rules in `@21stgov/commons-core`
 * display exactly one (they mirror the token themes' own selectors). Hidden
 * variants are `display: none` — out of the accessibility tree — so the alt
 * text is announced once. Decorative by default (`alt=""`); pass a real `alt`
 * when the image carries meaning that isn't in adjacent text.
 */
export function ThemeImage({
  light,
  dark,
  highContrast,
  alt = '',
  className,
  ...props
}: ThemeImageProps): React.JSX.Element {
  const darkSrc = dark ?? light
  const highContrastSrc = highContrast ?? darkSrc
  return (
    <>
      <img
        {...props}
        data-slot="theme-image"
        src={light}
        alt={alt}
        className={cn('cui-theme-image cui-theme-image--light', className)}
      />
      <img
        {...props}
        data-slot="theme-image"
        src={darkSrc}
        alt={alt}
        className={cn('cui-theme-image cui-theme-image--dark', className)}
      />
      <img
        {...props}
        data-slot="theme-image"
        src={highContrastSrc}
        alt={alt}
        className={cn('cui-theme-image cui-theme-image--high-contrast', className)}
      />
    </>
  )
}
