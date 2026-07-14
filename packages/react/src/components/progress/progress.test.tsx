// SPDX-License-Identifier: MIT

import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Progress } from "@/components/progress";
import { expectNonInteractive } from "../../../test/keyboard.js"
import { axeCheck } from "../../../test/setup.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Progress accessibility (axe)", () => {
  it("determinate bar is axe-clean", async () => {
    const { container } = render(
      <Progress label="Uploading files" value={40} showValue />,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("indeterminate bar is axe-clean", async () => {
    const { container } = render(<Progress label="Loading" value={null} />);
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("named only by aria-label is axe-clean", async () => {
    const { container } = render(<Progress aria-label="Sync" value={10} />);
    expect(await axeCheck(container)).toHaveNoViolations();
  });
});

describe("Progress role, name, and value (determinate)", () => {
  it("exposes role=progressbar with aria-valuenow/min/max", () => {
    render(<Progress label="Uploading files" value={40} />);
    const bar = screen.getByRole("progressbar", { name: "Uploading files" });
    expect(bar).toHaveAttribute("aria-valuenow", "40");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("derives aria-valuetext from the value template", () => {
    render(<Progress label="Uploading" value={75} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuetext",
      "75%",
    );
  });

  it("honors a custom max in aria-valuemax", () => {
    render(<Progress label="Steps" value={2} max={4} valueTemplate="{value} of {max}" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuemax", "4");
    expect(bar).toHaveAttribute("aria-valuetext", "2 of 4");
  });

  it("renders the visible label and value text", () => {
    render(<Progress label="Uploading files" value={40} showValue />);
    expect(screen.getByText("Uploading files")).toBeInTheDocument();
    // Visible value text is aria-hidden (the value reaches AT via valuetext).
    const valueText = document.querySelector('[data-slot="progress-value"]');
    expect(valueText).toHaveTextContent("40%");
    expect(valueText).toHaveAttribute("aria-hidden", "true");
  });

  it("names the bar with aria-label when no visible label is given", () => {
    render(<Progress aria-label="Background sync" value={10} />);
    expect(
      screen.getByRole("progressbar", { name: "Background sync" }),
    ).toBeInTheDocument();
  });
});

describe("Progress indeterminate semantics", () => {
  it("omits aria-valuenow but keeps busy/progressbar semantics", () => {
    render(<Progress label="Loading" value={null} />);
    const bar = screen.getByRole("progressbar", { name: "Loading" });
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(bar).toHaveAttribute("aria-busy", "true");
  });

  it("announces the indeterminate label as valuetext", () => {
    render(<Progress label="Loading" value={null} indeterminateLabel="Working" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuetext",
      "Working",
    );
  });

  it("a determinate bar is not busy", () => {
    render(<Progress label="Uploading" value={40} />);
    expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-busy");
  });
});

describe("Progress reduced-motion handling", () => {
  it("gates the sweep behind motion-safe and shows a static reduced-motion fill", () => {
    render(<Progress label="Loading" value={null} />);
    const indicator = document.querySelector(
      '[data-slot="progress-indicator"]',
    );
    expect(indicator?.className).toContain(
      "motion-safe:[animation:cui-progress-sweep_1.4s_ease-in-out_infinite]",
    );
    // Reduced motion: static full-width fill, never an animated fake position.
    expect(indicator?.className).toContain("motion-reduce:w-full");
    expect(indicator?.className).toContain("motion-reduce:bg-primary/40");
  });
});

describe("Progress RTL (fill grows inline-start to end)", () => {
  it("uses a logical inline-start-anchored fill and stays axe-clean in dir=rtl", async () => {
    const { container } = render(
      <div dir="rtl">
        <Progress label="جارٍ الرفع" value={40} showValue />
      </div>,
    );

    const indicator = container.querySelector(
      '[data-slot="progress-indicator"]',
    ) as HTMLElement | null;
    // Base UI anchors the determinate fill with inset-inline-start:0 so it
    // grows from the inline-start edge in both LTR and RTL. Never a physical
    // left/right offset.
    const style = indicator?.getAttribute("style") ?? "";
    expect(style).toContain("inset-inline-start");
    expect(style).not.toMatch(/(^|[^-])left/);

    expect(await axeCheck(container)).toHaveNoViolations();
  });
});

describe('Progress keyboard contract (verified)', () => {
  // Verifies accessibility.keyboard: this component adds no tab stop / keyboard behavior.
  it('exposes no keyboard focus surface', () => {
    const { container } = render(
      <Progress label="Uploading files" value={40} showValue />,
    )
    expectNonInteractive(container)
  })
})
