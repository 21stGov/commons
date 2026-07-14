// SPDX-License-Identifier: MIT

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteAlert, type SiteAlertProps } from "@/components/site-alert";
import { expectNonInteractive } from "../../../test/keyboard.js"
import { axeCheck } from "../../../test/setup.js";

const VARIANTS = [
  "info",
  "emergency",
] as const satisfies readonly NonNullable<SiteAlertProps["variant"]>[];

describe("SiteAlert accessibility (axe)", () => {
  for (const variant of VARIANTS) {
    it(`variant "${variant}" is axe-clean`, async () => {
      const { container } = render(
        <SiteAlert variant={variant} heading="Service notice">
          City offices are closed for the holiday.
        </SiteAlert>,
      );
      expect(await axeCheck(container)).toHaveNoViolations();
    });
  }

  it("slim variant is axe-clean", async () => {
    const { container } = render(
      <SiteAlert variant="info" slim>
        Payments are temporarily unavailable.
      </SiteAlert>,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("live band is axe-clean", async () => {
    const { container } = render(
      <SiteAlert variant="emergency" live="assertive" heading="Evacuation order">
        Leave the area immediately.
      </SiteAlert>,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });
});

describe("SiteAlert region landmark and label", () => {
  it("renders a region landmark named by the default label", () => {
    render(<SiteAlert>Sitewide notice.</SiteAlert>);

    const region = screen.getByRole("region", { name: "Site alert" });
    expect(region.tagName).toBe("SECTION");
    expect(region).toHaveAttribute("data-slot", "site-alert");
  });

  it("accepts a translated label as the region's accessible name", () => {
    render(<SiteAlert label="Alerta del sitio">Aviso general.</SiteAlert>);

    expect(
      screen.getByRole("region", { name: "Alerta del sitio" }),
    ).toBeInTheDocument();
  });

  it("records the variant on the root", () => {
    render(<SiteAlert variant="emergency">Emergency.</SiteAlert>);

    const region = screen.getByRole("region");
    expect(region).toHaveAttribute("data-variant", "emergency");
  });

  it("defaults the variant to info", () => {
    render(<SiteAlert>Notice.</SiteAlert>);

    expect(screen.getByRole("region")).toHaveAttribute("data-variant", "info");
  });
});

describe("SiteAlert heading and non-color redundancy", () => {
  it("renders the heading as an h2 by default", () => {
    render(
      <SiteAlert heading="Boil water notice">Boil water before use.</SiteAlert>,
    );

    const heading = screen.getByRole("heading", {
      level: 2,
      name: "Boil water notice",
    });
    expect(heading.tagName).toBe("H2");
  });

  it("respects headingLevel", () => {
    render(
      <SiteAlert heading="Service disruption" headingLevel="h3">
        Some services are offline.
      </SiteAlert>,
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Service disruption" }),
    ).toBeInTheDocument();
  });

  it("renders no heading element when heading is omitted", () => {
    render(<SiteAlert>Just body text.</SiteAlert>);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("renders a per-variant decorative icon (aria-hidden, currentColor)", () => {
    render(<SiteAlert variant="emergency">Emergency.</SiteAlert>);

    const icon = document.querySelector('[data-slot="site-alert-icon"]');
    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute("aria-hidden", "true");
    const svg = icon?.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("stroke", "currentColor");
  });

  it("renders a full-bleed band with a block-edge border (forced-colors safe)", () => {
    render(<SiteAlert>Notice.</SiteAlert>);

    const region = screen.getByRole("region");
    expect(region.className).toContain("w-full");
    expect(region.className).toContain("border-b");
  });
});

describe("SiteAlert live-region opt-in", () => {
  it("is a region landmark by default (static content is not a live region)", () => {
    render(<SiteAlert heading="Static">Present at page load.</SiteAlert>);

    expect(screen.getByRole("region")).toHaveAttribute(
      "data-slot",
      "site-alert",
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it('live="polite" renders role="status"', () => {
    render(<SiteAlert live="polite">Saved automatically.</SiteAlert>);

    expect(screen.getByRole("status")).toHaveAttribute(
      "data-slot",
      "site-alert",
    );
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it('live="assertive" renders role="alert"', () => {
    render(
      <SiteAlert live="assertive" variant="emergency">
        Evacuate now.
      </SiteAlert>,
    );

    expect(screen.getByRole("alert")).toHaveAttribute(
      "data-slot",
      "site-alert",
    );
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });
});

describe("SiteAlert content", () => {
  it("renders links inside the band with the always-underline rule", () => {
    render(
      <SiteAlert heading="Notice">
        See the <a href="/status">status page</a>.
      </SiteAlert>,
    );

    expect(
      screen.getByRole("link", { name: "status page" }),
    ).toBeInTheDocument();
    const region = screen.getByRole("region");
    expect(region.className).toContain("[&_a]:underline");
  });
});

describe("SiteAlert RTL", () => {
  it("renders and stays axe-clean in a dir=rtl document", async () => {
    const { container } = render(
      <div dir="rtl">
        <SiteAlert variant="emergency" label="تنبيه الموقع" heading="إخلاء">
          غادر المنطقة فوراً.
        </SiteAlert>
      </div>,
    );

    expect(
      screen.getByRole("region", { name: "تنبيه الموقع" }),
    ).toBeInTheDocument();
    expect(await axeCheck(container)).toHaveNoViolations();
  });
});

describe('SiteAlert keyboard contract (verified)', () => {
  // Verifies accessibility.keyboard: this component adds no tab stop / keyboard behavior.
  it('exposes no keyboard focus surface', () => {
    const { container } = render(
      <SiteAlert variant="info" heading="Service notice">
        City offices are closed for the holiday.
      </SiteAlert>,
    )
    expectNonInteractive(container)
  })
})
