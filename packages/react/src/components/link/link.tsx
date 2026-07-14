// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/cn";

export const linkVariants = cva(
  // Base: native <a> + Commons accessibility defaults.
  // - ALWAYS underlined: color alone never conveys link-ness (WCAG 1.4.1).
  // - Focus ring: 2px outline with offset, token-driven.
  // - Icons size with the link's own text (1em) so they scale with user
  //   text enlargement, and never intercept pointer events.
  [
    "rounded-sm underline underline-offset-2",
    "transition-colors motion-reduce:transition-none",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "[&_svg]:pointer-events-none [&_svg]:size-[1em] [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        // Body-text link: link color, visited via the link-visited token.
        default: "text-link visited:text-link-visited hover:text-link-hover",
        // Inherits the surrounding text color (nav rails, footers) but
        // keeps the mandatory underline; hover restores the link color.
        subtle: "text-foreground hover:text-link-hover",
        // Standalone call to action with a trailing arrow. Not inline in
        // a sentence, so it also meets the 44px project target size.
        standalone:
          "inline-flex min-h-11 items-center gap-1 font-medium text-link visited:text-link-visited hover:text-link-hover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

/**
 * Merge a consumer-supplied `rel` with the security tokens required for
 * `target="_blank"`. Consumer tokens are kept; `noreferrer noopener` are
 * always present and cannot be removed.
 */
function mergeRel(rel: string | undefined): string {
  const tokens = (rel ?? "").split(/\s+/).filter(Boolean);
  for (const required of ["noreferrer", "noopener"]) {
    if (!tokens.includes(required)) {
      tokens.push(required);
    }
  }
  return tokens.join(" ");
}

/**
 * External-link indicator (arrow leaving a box). Decorative — the
 * accessible announcement comes from the visually hidden `externalLabel`.
 * Directional, so it mirrors in RTL (`rtl:-scale-x-100`): the arrow
 * points "away" toward the reading-direction end.
 */
function ExternalIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="inline-block size-[0.85em] shrink-0 align-[-0.05em] rtl:-scale-x-100"
    >
      <path d="M6.5 3.5h-3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3" />
      <path d="M9.5 2.5h4v4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.5 2.5 7.5 8.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Trailing arrow for the standalone variant. Decorative and directional:
 * it points toward the destination, so it mirrors in RTL
 * (`rtl:-scale-x-100`) per the Commons internationalization contract.
 */
function ArrowIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="inline-block size-[0.85em] shrink-0 align-[-0.05em] rtl:-scale-x-100"
    >
      <path d="M2.5 8h11" strokeLinecap="round" />
      <path d="m9.5 4 4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  /** Stable styling/inspection hook used by composed Commons components. */
  "data-slot"?: string;
  /**
   * Mark the link as pointing to an external site. Always explicit —
   * Commons never infers this from the href. Adds a decorative external
   * icon, announces `externalLabel`, defaults `target` to `"_blank"`,
   * and (whenever the resolved target is `"_blank"`) forces
   * `rel="noreferrer noopener"` on top of any consumer-supplied `rel`.
   */
  external?: boolean;
  /**
   * Visually hidden text appended to the accessible name of an
   * `external` link. Translation-ready: pass a localized string.
   * @default "(opens in new tab)"
   */
  externalLabel?: string;
}

/**
 * Navigates to another page, view, or site. Renders a native `<a>` and is
 * always underlined — link-ness is never conveyed by color alone.
 * Visited state uses the `link-visited` theme token.
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function Link(
    {
      className,
      variant,
      external = false,
      externalLabel = "(opens in new tab)",
      target,
      rel,
      children,
      "data-slot": dataSlot,
      ...props
    },
    ref,
  ) {
    // `external` opens in a new tab unless the consumer explicitly says
    // otherwise. Any _blank target — external or not — gets the forced
    // security rel; consumers can add tokens but never remove these two.
    const resolvedTarget = target ?? (external ? "_blank" : undefined);
    const resolvedRel = resolvedTarget === "_blank" ? mergeRel(rel) : rel;
    // The "(opens in new tab)" announcement must describe real behavior:
    // an external link whose consumer overrides target (e.g. "_self")
    // keeps the icon but must not claim a new tab.
    const announceNewTab = external && resolvedTarget === "_blank";

    return (
      <a
        {...props}
        ref={ref}
        data-slot={dataSlot ?? "link"}
        data-external={external ? "" : undefined}
        target={resolvedTarget}
        rel={resolvedRel}
        className={cn(linkVariants({ variant }), className)}
      >
        {children}
        {external ? (
          /* One nowrap span binds a real space + the decorative icon +
             the hidden label to the last word: no whitespace precedes the
             span (so the icon can never wrap to its own line), the inner
             space is a normal text node (so the accessible name keeps a
             separator: "Portal (opens in new tab)"), and the icon itself
             is aria-hidden. */
          <span className="whitespace-nowrap">
            {" "}
            <ExternalIcon />
            {announceNewTab ? <span className="sr-only">{externalLabel}</span> : null}
          </span>
        ) : null}
        {/* Standalone is inline-flex: gap-1 spaces the arrow (an nbsp
            would become a stray flex item). */}
        {variant === "standalone" ? <ArrowIcon /> : null}
      </a>
    );
  },
);
