// SPDX-License-Identifier: MIT
// cva variant pattern adapted from shadcn/ui (https://github.com/shadcn-ui/ui)
// Original work Copyright (c) 2023 shadcn — MIT License
// Modifications Copyright 2026 21st Gov — MIT License

import { cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/cn";

type StepStatus = "complete" | "current" | "incomplete";

/**
 * Screen-reader status words appended to each step, so progress is
 * conveyed without relying on color or marker shape. Every string is
 * translatable.
 */
export interface StepIndicatorStatusLabels {
  /** Steps before the current one. @default "completed" */
  complete?: string;
  /** The step the user is on. @default "current" */
  current?: string;
  /** Steps after the current one. @default "not completed" */
  incomplete?: string;
}

// Marker: a numbered circle, or a checkmark once complete. A real border on
// every status keeps the marker visible in forced-colors mode; status is
// never carried by color alone — complete adds a checkmark, current is a
// thicker ring, and the label text + a visually hidden status word spell it
// out for assistive technology.
export const stepMarkerVariants = cva(
  [
    "flex size-8 shrink-0 items-center justify-center rounded-full border",
    "text-sm font-medium leading-none tabular-nums",
    "transition-colors motion-reduce:transition-none",
  ],
  {
    variants: {
      status: {
        complete: "border-transparent bg-primary text-primary-foreground",
        current: "border-2 border-primary bg-background text-primary",
        incomplete: "border-border bg-background text-muted-foreground",
      },
    },
    defaultVariants: { status: "incomplete" },
  },
);

function CheckIcon(): React.JSX.Element {
  // Inline SVG with currentColor so it survives forced-colors mode.
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      className="size-4"
    >
      <path
        d="m3.5 8.5 3 3 6-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface StepIndicatorProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  /** Ordered step labels (one per step). Translatable. */
  steps: readonly React.ReactNode[];
  /**
   * Zero-based index of the current step. Steps before it are complete,
   * steps after it are incomplete.
   */
  currentStep: number;
  /**
   * Accessible name for the navigation landmark. Translatable.
   * @default "Progress"
   */
  label?: string;
  /** Screen-reader status words appended to each step. Translatable. */
  statusLabels?: StepIndicatorStatusLabels;
  /** Show the "Step X of Y" counter above the steps. @default false */
  showCounter?: boolean;
  /**
   * Builds the counter text (1-based current, total). Translatable — return
   * a localized string. @default `Step ${current} of ${total}`
   */
  counterLabel?: (current: number, total: number) => string;
}

/**
 * A multi-step progress indicator: a `<nav>` landmark wrapping an ordered
 * list of steps. The current step carries `aria-current="step"`; every step
 * also carries a visually hidden status word (completed / current / not
 * completed) so screen-reader users hear progress without relying on the
 * marker color or shape (WCAG 1.4.1).
 *
 * Status is derived from `currentStep`. This is the USWDS step-indicator
 * pattern. On narrow screens only the current step's label stays visible
 * (the others collapse to `sr-only`, so assistive technology still reads
 * them); pair with `showCounter` so a sighted user keeps "Step X of Y"
 * context there.
 */
export const StepIndicator = React.forwardRef<HTMLElement, StepIndicatorProps>(
  function StepIndicator(
    {
      steps,
      currentStep,
      label = "Progress",
      statusLabels,
      showCounter = false,
      counterLabel = (current, total) => `Step ${current} of ${total}`,
      className,
      ...props
    },
    ref,
  ) {
    const words = {
      complete: statusLabels?.complete ?? "completed",
      current: statusLabels?.current ?? "current",
      incomplete: statusLabels?.incomplete ?? "not completed",
    };

    const total = steps.length;

    return (
      <nav
        {...props}
        ref={ref}
        aria-label={label}
        data-slot="step-indicator"
        className={cn("flex flex-col gap-2", className)}
      >
        {showCounter ? (
          <p
            data-slot="step-indicator-counter"
            className="text-sm font-medium text-muted-foreground"
          >
            {counterLabel(Math.min(currentStep + 1, total), total)}
          </p>
        ) : null}

        <ol data-slot="step-indicator-list" className="flex items-start">
          {steps.map((step, index) => {
            const status: StepStatus =
              index < currentStep
                ? "complete"
                : index === currentStep
                  ? "current"
                  : "incomplete";
            const isCurrent = status === "current";
            const filled = index <= currentStep;

            return (
              <li
                key={index}
                aria-current={isCurrent ? "step" : undefined}
                data-slot="step-indicator-step"
                data-status={status}
                className="relative flex flex-1 flex-col items-center gap-1 text-center"
              >
                {/* Connector into this marker (decorative). One continuous
                    bar per gap — it spans from the previous marker's center
                    to this marker's center (start:-50% + w-full over an
                    equal-width step), so adjacent segments never leave a
                    sub-pixel gap. Positioned on the block-axis center of the
                    size-8 marker (top-4) and tucked behind the markers, which
                    carry their own background. Omitted for the first step. */}
                {index > 0 ? (
                  <span
                    aria-hidden="true"
                    data-slot="step-indicator-connector"
                    className={cn(
                      "pointer-events-none absolute top-4 h-05 w-full -translate-y-1/2 start-[-50%]",
                      filled ? "bg-primary" : "bg-border",
                    )}
                  />
                ) : null}
                <span
                  className={cn(stepMarkerVariants({ status }), "relative z-10")}
                >
                  {status === "complete" ? <CheckIcon /> : index + 1}
                </span>

                <span
                  data-slot="step-indicator-label"
                  className={cn(
                    "text-sm leading-snug",
                    // The current label always shows; others collapse to
                    // sr-only on narrow screens (still read by AT) and
                    // reappear at sm+.
                    isCurrent
                      ? "font-medium text-foreground"
                      : "text-muted-foreground sr-only sm:not-sr-only",
                  )}
                >
                  {step}
                  {/* Spelled-out, translatable status for screen readers. The
                      leading comma keeps the name unambiguous. */}
                  <span className="sr-only">, {words[status]}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </nav>
    );
  },
);
