// SPDX-License-Identifier: MIT
// Compound-component structure adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import * as React from "react";

import { Link, type LinkProps } from "@/components/ui/link";
import { cn } from "@/lib/cn";

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Accessible name for the breadcrumb landmark, announced by screen
   * readers ("Breadcrumbs, navigation"). Translation-ready: pass a
   * localized string.
   * @default "Breadcrumbs"
   */
  label?: string;
}

/**
 * Shows where the current page sits in the site hierarchy as a trail of
 * links. Renders a `<nav>` landmark; the current page is a plain
 * `<span aria-current="page">` (see `BreadcrumbPage`), never a link.
 *
 * Long trails wrap onto new lines (`flex-wrap` on `BreadcrumbList`).
 * Collapsing/truncating overflow items is intentionally not in v1.
 */
export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  function Breadcrumb({ label = "Breadcrumbs", className, ...props }, ref) {
    return (
      <nav
        {...props}
        ref={ref}
        aria-label={label}
        data-slot="breadcrumb"
        className={cn(className)}
      />
    );
  },
);

export interface BreadcrumbListProps
  extends React.OlHTMLAttributes<HTMLOListElement> {}

/**
 * The ordered list inside a `Breadcrumb`. An `<ol>` because the trail is
 * a sequence — screen readers announce "list, N items", giving users the
 * depth of the hierarchy for free.
 */
export const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  BreadcrumbListProps
>(function BreadcrumbList({ className, style, ...props }, ref) {
  return (
    <ol
      {...props}
      ref={ref}
      role="list"
      data-slot="breadcrumb-list"
      // Component geometry must remain flush even inside prose containers
      // that add list indentation. Keep consumer inline styles composable.
      style={{ paddingInlineStart: 0, ...style }}
      className={cn(
        // flex-wrap: long trails wrap to new lines instead of clipping or
        // forcing horizontal scroll (WCAG 1.4.10 reflow).
        "m-0 flex list-none flex-wrap items-center gap-x-1 gap-y-05 p-0",
        "text-sm text-muted-foreground",
        className,
      )}
    />
  );
});

/**
 * Chevron separator between crumbs. Purely visual:
 * - Lives inside the `<li>` after the link, wrapped in an
 *   `aria-hidden` span, so it is never announced and never focusable.
 * - `group-last:hidden` removes it on the last item (the current page),
 *   so the item markup stays uniform.
 * - Directional (points toward the deeper level), so it mirrors in RTL
 *   (`rtl:-scale-x-100`) per the Commons internationalization contract.
 * - Inline SVG with `currentColor` so it stays visible in forced-colors
 *   mode (background-image icons vanish there).
 * - Nudged up by an em-relative hair (`inset-block-start:-0.0625em`): the
 *   chevron centers geometrically on the line box, but Atkinson
 *   Hyperlegible's letterforms sit high in that box, so an un-nudged chevron
 *   reads low. This lifts it onto the text's optical center so links,
 *   separators, and the current page share one clean line.
 */
function SeparatorChevron(): React.JSX.Element {
  return (
    <span
      aria-hidden="true"
      data-slot="breadcrumb-separator"
      className="pointer-events-none select-none group-last:hidden"
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="relative block size-[0.75em] shrink-0 rtl:-scale-x-100 [inset-block-start:-0.0625em]"
      >
        <path d="m6 3.5 4.5 4.5L6 12.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export interface BreadcrumbItemProps
  extends React.LiHTMLAttributes<HTMLLIElement> {}

/**
 * One crumb. Renders its child (a `BreadcrumbLink` or `BreadcrumbPage`)
 * followed by a decorative separator; CSS hides the separator on the
 * last item, and `aria-hidden` keeps it out of the accessibility tree
 * everywhere.
 */
export const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  BreadcrumbItemProps
>(function BreadcrumbItem({ className, children, ...props }, ref) {
  return (
    <li
      {...props}
      ref={ref}
      data-slot="breadcrumb-item"
      className={cn("group inline-flex items-center gap-1", className)}
    >
      {children}
      <SeparatorChevron />
    </li>
  );
});

export interface BreadcrumbLinkProps extends LinkProps {}

/**
 * A link to an ancestor page.
 *
 * Documented choice: this renders the Commons `Link` (default variant)
 * rather than a bare `<a>`, so breadcrumb links keep the system-wide
 * link contract for free — mandatory underline (WCAG 1.4.1), visited
 * state via the `link-visited` token, focus ring, and forced-colors
 * behavior. Pass `variant="subtle"` to inherit the muted trail color
 * instead of the link color.
 */
export const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  BreadcrumbLinkProps
>(function BreadcrumbLink({ className, ...props }, ref) {
  return (
    <Link
      {...props}
      ref={ref}
      data-slot="breadcrumb-link"
      className={cn(className)}
    />
  );
});

export interface BreadcrumbPageProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

/**
 * The current page — the last crumb. A `<span aria-current="page">`,
 * deliberately NOT a link: linking a page to itself confuses focus and
 * history, and `aria-current` is how AT announces "you are here".
 * Distinguished from links non-color-only: no underline, heavier weight,
 * foreground color.
 */
export const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  BreadcrumbPageProps
>(function BreadcrumbPage({ className, ...props }, ref) {
  return (
    <span
      {...props}
      ref={ref}
      aria-current="page"
      data-slot="breadcrumb-page"
      className={cn("font-medium text-foreground", className)}
    />
  );
});
