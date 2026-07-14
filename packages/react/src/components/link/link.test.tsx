// SPDX-License-Identifier: MIT

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Link, type LinkProps } from "@/components/link";
import { axeCheck } from "../../../test/setup.js";

const VARIANTS = ["default", "subtle", "standalone"] as const satisfies readonly NonNullable<
  LinkProps["variant"]
>[];

describe("Link accessibility (axe)", () => {
  for (const variant of VARIANTS) {
    it(`variant "${variant}" is axe-clean`, async () => {
      const { container } = render(
        <Link href="/services" variant={variant}>
          City services
        </Link>,
      );
      expect(await axeCheck(container)).toHaveNoViolations();
    });
  }

  it("external link is axe-clean", async () => {
    const { container } = render(
      <Link href="https://example.gov" external>
        State portal
      </Link>,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("external standalone link is axe-clean", async () => {
    const { container } = render(
      <Link href="https://example.gov" variant="standalone" external>
        State portal
      </Link>,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("link inside body text is axe-clean", async () => {
    const { container } = render(
      <p>
        Read the <Link href="/plan">accessibility plan</Link> before applying.
      </p>,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });
});

describe("Link name, role, and value", () => {
  it("renders a native anchor with role link and its accessible name", () => {
    render(<Link href="/services">City services</Link>);

    const link = screen.getByRole("link", { name: "City services" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("data-slot", "link");
    expect(link).toHaveAttribute("href", "/services");
  });

  it("appends the default external label to the accessible name", () => {
    render(
      <Link href="https://example.gov" external>
        State portal
      </Link>,
    );

    // \s? — browsers separate element contributions in the accessible
    // name with a space, but dom-accessibility-api (testing-library's
    // engine) joins them directly. The DOM is correct for real AT; the
    // matcher tolerates both engines.
    expect(
      screen.getByRole("link", {
        name: /^State portal\s?\(opens in new tab\)$/,
      }),
    ).toBeInTheDocument();
  });

  it("accepts a translated external label", () => {
    render(
      <Link
        href="https://example.gov"
        external
        externalLabel="(se abre en una pestaña nueva)"
      >
        Portal estatal
      </Link>,
    );

    expect(
      screen.getByRole("link", {
        name: /^Portal estatal\s?\(se abre en una pestaña nueva\)$/,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("(se abre en una pestaña nueva)")).toHaveClass(
      "sr-only",
    );
  });

  it("marks the external icon as decorative (aria-hidden)", () => {
    render(
      <Link href="https://example.gov" external>
        State portal
      </Link>,
    );

    const svg = screen.getByRole("link").querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("marks the standalone arrow icon as decorative (aria-hidden)", () => {
    render(
      <Link href="/services" variant="standalone">
        All services
      </Link>,
    );

    const svg = screen.getByRole("link").querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    // Icon adds nothing to the name.
    expect(
      screen.getByRole("link", { name: "All services" }),
    ).toBeInTheDocument();
  });

  it("does not mark a plain link as external (external is explicit only)", () => {
    render(<Link href="https://example.gov">State portal</Link>);

    const link = screen.getByRole("link", { name: "State portal" });
    expect(link).not.toHaveAttribute("data-external");
    expect(link).not.toHaveAttribute("target");
    expect(link.querySelector("svg")).toBeNull();
  });
});

describe("Link rel enforcement", () => {
  it("external defaults target to _blank and forces rel", () => {
    render(
      <Link href="https://example.gov" external>
        State portal
      </Link>,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    const rel = (link.getAttribute("rel") ?? "").split(/\s+/);
    expect(rel).toContain("noreferrer");
    expect(rel).toContain("noopener");
  });

  it("keeps consumer rel tokens while forcing the security tokens", () => {
    render(
      <Link href="https://example.gov" external rel="me license">
        State portal
      </Link>,
    );

    const rel = (screen.getByRole("link").getAttribute("rel") ?? "").split(
      /\s+/,
    );
    expect(rel).toContain("me");
    expect(rel).toContain("license");
    expect(rel).toContain("noreferrer");
    expect(rel).toContain("noopener");
  });

  it("does not duplicate tokens the consumer already supplied", () => {
    render(
      <Link href="https://example.gov" external rel="noopener">
        State portal
      </Link>,
    );

    const rel = (screen.getByRole("link").getAttribute("rel") ?? "").split(
      /\s+/,
    );
    expect(rel.filter((token) => token === "noopener")).toHaveLength(1);
    expect(rel).toContain("noreferrer");
  });

  it("forces rel on any target=_blank link, external or not", () => {
    render(
      <Link href="https://example.gov" target="_blank">
        State portal
      </Link>,
    );

    const rel = (screen.getByRole("link").getAttribute("rel") ?? "").split(
      /\s+/,
    );
    expect(rel).toContain("noreferrer");
    expect(rel).toContain("noopener");
  });

  it("respects an explicit non-_blank target on an external link", () => {
    render(
      <Link href="https://example.gov" external target="_self" rel="me">
        State portal
      </Link>,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_self");
    expect(link).toHaveAttribute("rel", "me");
  });
});

describe("Link underline", () => {
  for (const variant of VARIANTS) {
    it(`variant "${variant}" is always underlined`, () => {
      render(
        <Link href="/services" variant={variant}>
          City services
        </Link>,
      );
      expect(screen.getByRole("link")).toHaveClass("underline");
    });
  }
});

describe("Link visited state", () => {
  it("default variant styles visited via the link-visited token", () => {
    render(<Link href="/services">City services</Link>);
    expect(screen.getByRole("link")).toHaveClass("visited:text-link-visited");
  });

  it("standalone variant styles visited via the link-visited token", () => {
    render(
      <Link href="/services" variant="standalone">
        City services
      </Link>,
    );
    expect(screen.getByRole("link")).toHaveClass("visited:text-link-visited");
  });
});

describe("Link keyboard contract", () => {
  it("is reachable with Tab", async () => {
    const user = userEvent.setup();
    render(<Link href="/services">City services</Link>);

    await user.tab();
    expect(screen.getByRole("link")).toHaveFocus();
  });

  it("activates with Enter", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
    });
    render(
      <Link href="/services" onClick={onClick}>
        City services
      </Link>,
    );

    await user.tab();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not activate with Space (native anchor contract)", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
    });
    render(
      <Link href="/services" onClick={onClick}>
        City services
      </Link>,
    );

    await user.tab();
    await user.keyboard(" ");
    expect(onClick).not.toHaveBeenCalled();
  });

  it("activates on click", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
    });
    render(
      <Link href="/services" onClick={onClick}>
        City services
      </Link>,
    );

    await user.click(screen.getByRole("link"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("Link RTL", () => {
  it("renders and stays axe-clean in a dir=rtl document", async () => {
    const { container } = render(
      <div dir="rtl">
        <Link href="/services">الخدمات</Link>
      </div>,
    );

    expect(screen.getByRole("link", { name: "الخدمات" })).toBeInTheDocument();
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("mirrors directional icons in RTL (documented choice: rtl:-scale-x-100)", async () => {
    // Both icons are directional (they point toward the destination /
    // "away" to an external site), so per the Commons i18n contract they
    // flip in RTL rather than staying direction-neutral.
    const { container } = render(
      <div dir="rtl">
        <Link href="https://example.gov" variant="standalone" external>
          البوابة الخارجية
        </Link>
      </div>,
    );

    const svgs = screen.getByRole("link").querySelectorAll("svg");
    expect(svgs).toHaveLength(2);
    for (const svg of svgs) {
      expect(svg).toHaveClass("rtl:-scale-x-100");
    }
    expect(await axeCheck(container)).toHaveNoViolations();
  });
});
