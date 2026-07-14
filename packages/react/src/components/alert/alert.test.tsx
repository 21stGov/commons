// SPDX-License-Identifier: MIT

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Alert, type AlertProps } from "@/components/alert";
import { axeCheck } from "../../../test/setup.js";

const VARIANTS = [
  "info",
  "success",
  "warning",
  "error",
  "emergency",
] as const satisfies readonly NonNullable<AlertProps["variant"]>[];

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Alert accessibility (axe)", () => {
  for (const variant of VARIANTS) {
    it(`variant "${variant}" is axe-clean`, async () => {
      const { container } = render(
        <Alert variant={variant} heading="Status update">
          Something happened that you should know about.
        </Alert>,
      );
      expect(await axeCheck(container)).toHaveNoViolations();
    });
  }

  it("slim variant is axe-clean", async () => {
    const { container } = render(
      <Alert variant="info" slim>
        A slim informational note.
      </Alert>,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("dismissible alert is axe-clean", async () => {
    const { container } = render(
      <Alert variant="warning" heading="Heads up" dismissible>
        You can dismiss this.
      </Alert>,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("live alert is axe-clean", async () => {
    const { container } = render(
      <Alert variant="error" live="assertive" heading="Submission failed">
        Fix the errors below and try again.
      </Alert>,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });
});

describe("Alert structure and non-color redundancy", () => {
  it("renders a data-slot root with the variant recorded", () => {
    render(<Alert variant="success">Saved.</Alert>);

    const alert = document.querySelector('[data-slot="alert"]');
    expect(alert).not.toBeNull();
    expect(alert).toHaveAttribute("data-variant", "success");
  });

  it("renders a per-variant decorative icon (aria-hidden, currentColor)", () => {
    render(<Alert variant="info">Note.</Alert>);

    const icon = document.querySelector('[data-slot="alert-icon"]');
    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute("aria-hidden", "true");
    const svg = icon?.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("stroke", "currentColor");
  });

  it("uses a uniform border on every side (no inline-start accent)", () => {
    render(<Alert>Note.</Alert>);

    const alert = document.querySelector('[data-slot="alert"]');
    // A single uniform `border`, never a thick inline-start accent.
    expect(alert?.className).toContain("border");
    expect(alert?.className).not.toContain("border-s-4");
    // And never a physical side utility.
    expect(alert?.className).not.toMatch(/border-[lr]-4/);
  });
});

describe("Alert heading", () => {
  it("renders the heading as an h2 by default", () => {
    render(<Alert heading="Account created">You can sign in now.</Alert>);

    const heading = screen.getByRole("heading", {
      level: 2,
      name: "Account created",
    });
    expect(heading.tagName).toBe("H2");
  });

  it("respects headingLevel", () => {
    render(
      <Alert heading="Deadline extended" headingLevel="h3">
        Applications close Friday.
      </Alert>,
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Deadline extended" }),
    ).toBeInTheDocument();
  });

  it("renders no heading element when heading is omitted", () => {
    render(<Alert>Just body text.</Alert>);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });
});

describe("Alert live-region opt-in", () => {
  it("has no role by default (static content is not a live region)", () => {
    render(<Alert heading="Static">Present at page load.</Alert>);

    const alert = document.querySelector('[data-slot="alert"]');
    expect(alert).not.toHaveAttribute("role");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it('live="polite" renders role="status"', () => {
    render(<Alert live="polite">Saved automatically.</Alert>);
    expect(screen.getByRole("status")).toHaveAttribute("data-slot", "alert");
  });

  it('live="assertive" renders role="alert"', () => {
    render(
      <Alert live="assertive" variant="error">
        Session expired.
      </Alert>,
    );
    expect(screen.getByRole("alert")).toHaveAttribute("data-slot", "alert");
  });
});

describe("Alert dismiss keyboard contract", () => {
  it("renders no dismiss button unless dismissible", () => {
    render(<Alert heading="Static">Cannot be dismissed.</Alert>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("Tab reaches the dismiss button and Enter activates it", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <Alert dismissible onDismiss={onDismiss}>
        Dismiss me.
      </Alert>,
    );

    await user.tab();
    const button = screen.getByRole("button", { name: "Dismiss" });
    expect(button).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("Space activates the dismiss button", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <Alert dismissible onDismiss={onDismiss}>
        Dismiss me.
      </Alert>,
    );

    await user.tab();
    await user.keyboard(" ");
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("dismiss is a native button with type=button and the default name", () => {
    render(
      <Alert dismissible onDismiss={() => {}}>
        Body.
      </Alert>,
    );

    const button = screen.getByRole("button", { name: "Dismiss" });
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
  });

  it("accepts a translated dismiss label", () => {
    render(
      <Alert dismissible dismissLabel="Descartar" onDismiss={() => {}}>
        Cuerpo.
      </Alert>,
    );

    expect(
      screen.getByRole("button", { name: "Descartar" }),
    ).toBeInTheDocument();
  });

  it("does not remove itself on dismiss — the consumer owns removal", async () => {
    const user = userEvent.setup();
    render(
      <Alert dismissible onDismiss={() => {}}>
        Still here.
      </Alert>,
    );

    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.getByText("Still here.")).toBeInTheDocument();
  });
});

describe("Alert RTL", () => {
  it("renders with a uniform border and stays axe-clean in dir=rtl", async () => {
    const { container } = render(
      <div dir="rtl">
        <Alert variant="warning" heading="تنبيه" dismissible dismissLabel="إغلاق">
          يرجى مراجعة المعلومات أدناه.
        </Alert>
      </div>,
    );

    const alert = container.querySelector('[data-slot="alert"]');
    // Uniform border on every side — no inline-start accent, and never a
    // physical side utility that would fail to mirror.
    expect(alert?.className).toContain("border");
    expect(alert?.className).not.toContain("border-s-4");
    expect(alert?.className).not.toMatch(/border-[lr]-4/);
    expect(
      screen.getByRole("button", { name: "إغلاق" }),
    ).toBeInTheDocument();
    expect(await axeCheck(container)).toHaveNoViolations();
  });
});
