// SPDX-License-Identifier: MIT

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/breadcrumb";
import { axeCheck } from "../../../test/setup.js";

/** Canonical three-level trail used across the suite. */
function Trail(props: { label?: string }): React.JSX.Element {
  return (
    <Breadcrumb label={props.label}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/services">Services</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>Trash pickup</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

describe("Breadcrumb accessibility (axe)", () => {
  it("a full trail is axe-clean", async () => {
    const { container } = render(<Trail />);
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("a single-link trail is axe-clean", async () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>Services</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });
});

describe("Breadcrumb name, role, and structure", () => {
  it("renders a nav landmark with the default label", () => {
    render(<Trail />);

    const nav = screen.getByRole("navigation", { name: "Breadcrumbs" });
    expect(nav.tagName).toBe("NAV");
    expect(nav).toHaveAttribute("data-slot", "breadcrumb");
  });

  it("accepts a translated label", () => {
    render(<Trail label="Miga de pan" />);

    expect(
      screen.getByRole("navigation", { name: "Miga de pan" }),
    ).toBeInTheDocument();
  });

  it("renders an ol with one li per crumb", () => {
    render(<Trail />);

    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    expect(list).toHaveAttribute("role", "list");
    expect(list).toHaveStyle({ paddingInlineStart: "0" });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    for (const item of items) {
      expect(item.tagName).toBe("LI");
    }
  });

  it("lets an explicit consumer inline indent override the flush default", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList style={{ paddingInlineStart: "1rem" }}>
          <BreadcrumbItem><BreadcrumbPage>Services</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    expect(screen.getByRole("list")).toHaveStyle({ paddingInlineStart: "1rem" });
  });

  it("ancestor crumbs are links with their hrefs", () => {
    render(<Trail />);

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute(
      "href",
      "/services",
    );
  });

  it("breadcrumb links render the Commons Link (underlined, documented choice)", () => {
    render(<Trail />);

    const link = screen.getByRole("link", { name: "Home" });
    // BreadcrumbLink delegates to Link, whose data-slot survives as the
    // outermost marker of the delegation, and keeps the mandatory
    // underline (WCAG 1.4.1).
    expect(link).toHaveAttribute("data-slot", "breadcrumb-link");
    expect(link).toHaveClass("underline");
  });
});

describe("BreadcrumbPage (current page)", () => {
  it("carries aria-current=page", () => {
    render(<Trail />);

    const page = screen.getByText("Trash pickup");
    expect(page).toHaveAttribute("aria-current", "page");
    expect(page).toHaveAttribute("data-slot", "breadcrumb-page");
  });

  it("is a span, not a link, and is not focusable", () => {
    render(<Trail />);

    const page = screen.getByText("Trash pickup");
    expect(page.tagName).toBe("SPAN");
    expect(page).not.toHaveAttribute("href");
    expect(page).not.toHaveAttribute("tabindex");
    expect(
      screen.queryByRole("link", { name: "Trash pickup" }),
    ).not.toBeInTheDocument();
  });

  it("is distinguished non-color-only (weight + no underline)", () => {
    render(<Trail />);

    const page = screen.getByText("Trash pickup");
    expect(page).toHaveClass("font-medium");
    expect(page).toHaveClass("text-foreground");
    expect(page).not.toHaveClass("underline");
  });
});

describe("Breadcrumb separators", () => {
  it("every item renders an aria-hidden separator (never announced)", () => {
    const { container } = render(<Trail />);

    const separators = container.querySelectorAll(
      '[data-slot="breadcrumb-separator"]',
    );
    expect(separators).toHaveLength(3);
    for (const separator of separators) {
      expect(separator).toHaveAttribute("aria-hidden", "true");
      expect(separator.tagName).toBe("SPAN");
      // Hidden on the last item via CSS so the current page has no
      // trailing chevron.
      expect(separator).toHaveClass("group-last:hidden");
    }
  });

  it("separators contribute nothing to the accessibility tree", () => {
    render(<Trail />);

    // Every listitem's accessible content is exactly its crumb — the
    // separator adds no text.
    const items = screen.getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "Home",
      "Services",
      "Trash pickup",
    ]);
  });
});

describe("Breadcrumb keyboard contract", () => {
  it("Tab moves through the links in order and skips the current page", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Trail />
        <button type="button">after</button>
      </>,
    );

    await user.tab();
    expect(screen.getByRole("link", { name: "Home" })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("link", { name: "Services" })).toHaveFocus();

    // The current page span is not focusable — focus leaves the trail.
    await user.tab();
    expect(screen.getByRole("button", { name: "after" })).toHaveFocus();
  });

  it("Shift+Tab moves backwards through the links", async () => {
    const user = userEvent.setup();
    render(<Trail />);

    await user.tab();
    await user.tab();
    expect(screen.getByRole("link", { name: "Services" })).toHaveFocus();

    await user.tab({ shift: true });
    expect(screen.getByRole("link", { name: "Home" })).toHaveFocus();
  });
});

describe("Breadcrumb RTL", () => {
  it("renders and stays axe-clean in a dir=rtl document", async () => {
    const { container } = render(
      <div dir="rtl">
        <Breadcrumb label="مسار التنقل">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">الرئيسية</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage>الخدمات</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>,
    );

    expect(
      screen.getByRole("navigation", { name: "مسار التنقل" }),
    ).toBeInTheDocument();
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("mirrors the directional chevron in RTL (rtl:-scale-x-100)", () => {
    const { container } = render(
      <div dir="rtl">
        <Trail />
      </div>,
    );

    const svgs = container.querySelectorAll(
      '[data-slot="breadcrumb-separator"] svg',
    );
    expect(svgs.length).toBeGreaterThan(0);
    for (const svg of svgs) {
      expect(svg).toHaveClass("rtl:-scale-x-100");
    }
  });
});
