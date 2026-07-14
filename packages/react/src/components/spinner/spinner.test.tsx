// SPDX-License-Identifier: MIT

import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Spinner, type SpinnerProps } from "@/components/spinner";
import { axeCheck } from "../../../test/setup.js";

const SIZES = ["sm", "md", "lg"] as const satisfies readonly NonNullable<
  SpinnerProps["size"]
>[];

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Spinner accessibility (axe)", () => {
  it("default spinner is axe-clean", async () => {
    const { container } = render(<Spinner />);
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("aria-label spinner is axe-clean", async () => {
    const { container } = render(<Spinner aria-label="Loading results" />);
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("decorative spinner is axe-clean", async () => {
    const { container } = render(
      <span>
        Saving <Spinner decorative />
      </span>,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  for (const size of SIZES) {
    it(`size "${size}" is axe-clean`, async () => {
      const { container } = render(<Spinner size={size} />);
      expect(await axeCheck(container)).toHaveNoViolations();
    });
  }
});

describe("Spinner status role and accessible name", () => {
  it("renders role=status with the default visually hidden label", () => {
    render(<Spinner />);
    const status = screen.getByRole("status", { name: "Loading" });
    expect(status).toHaveAttribute("data-slot", "spinner");
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("accepts a translated label as visually hidden status text", () => {
    render(<Spinner label="Cargando" />);
    expect(
      screen.getByRole("status", { name: "Cargando" }),
    ).toBeInTheDocument();
  });

  it("can be named via aria-label on the status region", () => {
    render(<Spinner aria-label="Loading results" />);
    const status = screen.getByRole("status", { name: "Loading results" });
    expect(status).toHaveAttribute("aria-label", "Loading results");
    // No duplicate visible/sr-only text when named by aria-label.
    expect(status.textContent).toBe("");
  });
});

describe("Spinner decorative mode", () => {
  it("is aria-hidden with no status role", () => {
    render(<Spinner decorative />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    const spinner = document.querySelector('[data-slot="spinner"]');
    expect(spinner).toHaveAttribute("aria-hidden", "true");
  });

  it("announces nothing (no accessible name) so a sibling can own the wait", () => {
    render(
      <span>
        Saving changes <Spinner decorative />
      </span>,
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

describe("Spinner sizes and motion", () => {
  it("applies the size utility to the icon", () => {
    render(<Spinner size="lg" />);
    const svg = document.querySelector('[data-slot="spinner"] svg');
    expect(svg?.getAttribute("class")).toContain("size-5");
  });

  it("spins only under motion-safe and strokes with currentColor", () => {
    render(<Spinner />);
    const svg = document.querySelector('[data-slot="spinner"] svg');
    expect(svg?.getAttribute("class")).toContain("motion-safe:animate-spin");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    const stroked = svg?.querySelector("[stroke='currentColor']");
    expect(stroked).not.toBeNull();
  });
});

describe("Spinner RTL", () => {
  it("renders and stays axe-clean in dir=rtl", async () => {
    const { container } = render(
      <div dir="rtl">
        <Spinner label="جارٍ التحميل" />
      </div>,
    );
    expect(
      screen.getByRole("status", { name: "جارٍ التحميل" }),
    ).toBeInTheDocument();
    expect(await axeCheck(container)).toHaveNoViolations();
  });
});
