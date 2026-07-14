// SPDX-License-Identifier: MIT

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SummaryBox } from "@/components/summary-box";
import { axeCheck } from "../../../test/setup.js";

describe("SummaryBox accessibility (axe)", () => {
  it("is axe-clean with a list of requirements", async () => {
    const { container } = render(
      <SummaryBox heading="What you'll need">
        <ul>
          <li>A valid photo ID</li>
          <li>Proof of residency</li>
          <li>Your application number</li>
        </ul>
      </SummaryBox>,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("is axe-clean with plain text children", async () => {
    const { container } = render(
      <SummaryBox heading="Next steps">
        Review your answers, then submit the form.
      </SummaryBox>,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });
});

describe("SummaryBox labelled region", () => {
  it("renders a section labelled by its heading", () => {
    render(
      <SummaryBox heading="What you'll need">
        <p>Documents to gather.</p>
      </SummaryBox>,
    );

    const region = screen.getByRole("region", { name: "What you'll need" });
    expect(region.tagName).toBe("SECTION");
    expect(region).toHaveAttribute("data-slot", "summary-box");
  });

  it("points aria-labelledby at the heading id", () => {
    render(<SummaryBox heading="Key information">Body.</SummaryBox>);

    const region = screen.getByRole("region", { name: "Key information" });
    const heading = screen.getByRole("heading", { name: "Key information" });
    expect(region.getAttribute("aria-labelledby")).toBe(heading.id);
    expect(heading.id).not.toBe("");
  });

  it("uses a supplied headingId", () => {
    render(
      <SummaryBox heading="Required documents" headingId="docs-summary">
        Body.
      </SummaryBox>,
    );

    const region = screen.getByRole("region", { name: "Required documents" });
    expect(region).toHaveAttribute("aria-labelledby", "docs-summary");
    expect(screen.getByRole("heading", { name: "Required documents" })).toHaveAttribute(
      "id",
      "docs-summary",
    );
  });

  it("gives two instances distinct heading ids", () => {
    render(
      <>
        <SummaryBox heading="First">One.</SummaryBox>
        <SummaryBox heading="Second">Two.</SummaryBox>
      </>,
    );

    const [first, second] = screen.getAllByRole("region");
    expect(first.getAttribute("aria-labelledby")).not.toBe(
      second.getAttribute("aria-labelledby"),
    );
  });
});

describe("SummaryBox heading role and level", () => {
  it("renders the heading as an h3 by default", () => {
    render(<SummaryBox heading="What you'll need">Body.</SummaryBox>);

    const heading = screen.getByRole("heading", {
      level: 3,
      name: "What you'll need",
    });
    expect(heading.tagName).toBe("H3");
  });

  it("respects headingLevel", () => {
    render(
      <SummaryBox heading="Next steps" headingLevel="h2">
        Body.
      </SummaryBox>,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "Next steps" }),
    ).toBeInTheDocument();
  });
});

describe("SummaryBox children", () => {
  it("renders children inside the body", () => {
    render(
      <SummaryBox heading="What you'll need">
        <ul>
          <li>A valid photo ID</li>
          <li>Proof of residency</li>
        </ul>
      </SummaryBox>,
    );

    expect(screen.getByText("A valid photo ID")).toBeInTheDocument();
    expect(screen.getByText("Proof of residency")).toBeInTheDocument();
    expect(document.querySelector('[data-slot="summary-box-body"]')).not.toBeNull();
  });

  it("renders no body wrapper when children are omitted", () => {
    render(<SummaryBox heading="Heading only" />);

    expect(document.querySelector('[data-slot="summary-box-body"]')).toBeNull();
    expect(
      screen.getByRole("heading", { name: "Heading only" }),
    ).toBeInTheDocument();
  });

  it("renders a structural border for non-color redundancy", () => {
    render(<SummaryBox heading="Key info">Body.</SummaryBox>);

    const region = screen.getByRole("region");
    expect(region.className).toContain("border");
  });
});

describe("SummaryBox RTL", () => {
  it("renders and stays axe-clean in a dir=rtl document", async () => {
    const { container } = render(
      <div dir="rtl">
        <SummaryBox heading="ما ستحتاج إليه">
          <ul>
            <li>بطاقة هوية بصورة</li>
            <li>إثبات الإقامة</li>
          </ul>
        </SummaryBox>
      </div>,
    );

    expect(
      screen.getByRole("region", { name: "ما ستحتاج إليه" }),
    ).toBeInTheDocument();
    expect(await axeCheck(container)).toHaveNoViolations();
  });
});
