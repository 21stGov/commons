// SPDX-License-Identifier: MIT

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
  paginationRange,
} from "@/components/pagination";
import { axeCheck } from "../../../test/setup.js";

// ---------------------------------------------------------------------------
// paginationRange
// ---------------------------------------------------------------------------

describe("paginationRange", () => {
  it("returns [] for zero or negative totals", () => {
    expect(paginationRange(1, 0)).toEqual([]);
    expect(paginationRange(1, -5)).toEqual([]);
  });

  it("returns a single page for total 1", () => {
    expect(paginationRange(1, 1)).toEqual([1]);
  });

  it("returns every page when they all fit (no ellipsis)", () => {
    expect(paginationRange(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(paginationRange(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(paginationRange(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("collapses the tail when current is at the start", () => {
    expect(paginationRange(1, 10)).toEqual([1, 2, 3, 4, 5, "ellipsis", 10]);
    expect(paginationRange(2, 10)).toEqual([1, 2, 3, 4, 5, "ellipsis", 10]);
    expect(paginationRange(3, 10)).toEqual([1, 2, 3, 4, 5, "ellipsis", 10]);
  });

  it("collapses the head when current is at the end", () => {
    expect(paginationRange(10, 10)).toEqual([1, "ellipsis", 6, 7, 8, 9, 10]);
    expect(paginationRange(9, 10)).toEqual([1, "ellipsis", 6, 7, 8, 9, 10]);
    expect(paginationRange(8, 10)).toEqual([1, "ellipsis", 6, 7, 8, 9, 10]);
  });

  it("collapses both sides when current is in the middle", () => {
    expect(paginationRange(5, 10)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 10]);
    expect(paginationRange(50, 100)).toEqual([1, "ellipsis", 49, 50, 51, "ellipsis", 100]);
  });

  it("honors siblingCount", () => {
    expect(paginationRange(10, 20, 2)).toEqual([
      1,
      "ellipsis",
      8,
      9,
      10,
      11,
      12,
      "ellipsis",
      20,
    ]);
    expect(paginationRange(5, 10, 0)).toEqual([1, "ellipsis", 5, "ellipsis", 10]);
  });

  it("clamps current into [1, total]", () => {
    expect(paginationRange(99, 10)).toEqual(paginationRange(10, 10));
    expect(paginationRange(0, 10)).toEqual(paginationRange(1, 10));
    expect(paginationRange(-3, 10)).toEqual(paginationRange(1, 10));
  });

  it("keeps a constant slot count once total exceeds the window", () => {
    for (let current = 1; current <= 30; current += 1) {
      expect(paginationRange(current, 30)).toHaveLength(7);
    }
    for (let current = 1; current <= 30; current += 1) {
      expect(paginationRange(current, 30, 2)).toHaveLength(9);
    }
  });

  it("always starts at 1, ends at total, and includes current (sweep)", () => {
    for (let total = 1; total <= 15; total += 1) {
      for (let current = 1; current <= total; current += 1) {
        const range = paginationRange(current, total);
        expect(range[0]).toBe(1);
        expect(range[range.length - 1]).toBe(total);
        expect(range).toContain(current);
        // No adjacent ellipses, and numbers strictly increase.
        const numbers = range.filter((slot): slot is number => slot !== "ellipsis");
        expect([...numbers].sort((a, b) => a - b)).toEqual(numbers);
        for (let index = 1; index < range.length; index += 1) {
          expect(range[index] === "ellipsis" && range[index - 1] === "ellipsis").toBe(
            false,
          );
        }
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Rendered component
// ---------------------------------------------------------------------------

/**
 * The documented composition: link-based pages from paginationRange,
 * Previous hidden on the first page and Next hidden on the last
 * (USWDS bounds behavior).
 */
function LinkPagination(props: { current: number; total: number }): React.JSX.Element {
  const { current, total } = props;
  return (
    <Pagination>
      <PaginationList>
        {current > 1 ? (
          <PaginationItem>
            <PaginationPrevious href={`?page=${current - 1}`} />
          </PaginationItem>
        ) : null}
        {paginationRange(current, total).map((slot, index) =>
          slot === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={slot}>
              <PaginationPage
                href={`?page=${slot}`}
                current={slot === current}
                aria-label={`Page ${slot}`}
              >
                {slot}
              </PaginationPage>
            </PaginationItem>
          ),
        )}
        {current < total ? (
          <PaginationItem>
            <PaginationNext href={`?page=${current + 1}`} />
          </PaginationItem>
        ) : null}
      </PaginationList>
    </Pagination>
  );
}

describe("Pagination accessibility (axe)", () => {
  it("link-based pagination is axe-clean", async () => {
    const { container } = render(<LinkPagination current={5} total={10} />);
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("button-based pagination is axe-clean", async () => {
    const { container } = render(
      <Pagination>
        <PaginationList>
          <PaginationItem>
            <PaginationPage onClick={() => {}} current>
              1
            </PaginationPage>
          </PaginationItem>
          <PaginationItem>
            <PaginationPage onClick={() => {}}>2</PaginationPage>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext onClick={() => {}} />
          </PaginationItem>
        </PaginationList>
      </Pagination>,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("first-page and last-page states are axe-clean", async () => {
    const first = render(<LinkPagination current={1} total={10} />);
    expect(await axeCheck(first.container)).toHaveNoViolations();
    first.unmount();

    const last = render(<LinkPagination current={10} total={10} />);
    expect(await axeCheck(last.container)).toHaveNoViolations();
  });
});

describe("Pagination name, role, and structure", () => {
  it("renders a nav landmark with the default label", () => {
    render(<LinkPagination current={2} total={5} />);

    const nav = screen.getByRole("navigation", { name: "Pagination" });
    expect(nav.tagName).toBe("NAV");
    expect(nav).toHaveAttribute("data-slot", "pagination");
  });

  it("accepts a translated landmark label", () => {
    render(
      <Pagination label="Paginación">
        <PaginationList>
          <PaginationItem>
            <PaginationPage href="?page=1" current>
              1
            </PaginationPage>
          </PaginationItem>
        </PaginationList>
      </Pagination>,
    );

    expect(
      screen.getByRole("navigation", { name: "Paginación" }),
    ).toBeInTheDocument();
  });

  it("renders an ol with one li per slot", () => {
    render(<LinkPagination current={2} total={3} />);

    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    // Previous + 3 pages + Next.
    expect(within(list).getAllByRole("listitem")).toHaveLength(5);
  });

  it("renders pages as links when href is given", () => {
    render(<LinkPagination current={2} total={3} />);

    const page = screen.getByRole("link", { name: "Page 3" });
    expect(page.tagName).toBe("A");
    expect(page).toHaveAttribute("href", "?page=3");
  });

  it("renders pages as type=button buttons when only onClick is given", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Pagination>
        <PaginationList>
          <PaginationItem>
            <PaginationPage onClick={onClick} aria-label="Page 2">
              2
            </PaginationPage>
          </PaginationItem>
        </PaginationList>
      </Pagination>,
    );

    const page = screen.getByRole("button", { name: "Page 2" });
    expect(page.tagName).toBe("BUTTON");
    expect(page).toHaveAttribute("type", "button");
    await user.click(page);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("marks only the current page with aria-current=page", () => {
    render(<LinkPagination current={2} total={3} />);

    expect(screen.getByRole("link", { name: "Page 2" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Page 1" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(screen.getByRole("link", { name: "Page 3" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("distinguishes the current page non-color-only (border + weight)", () => {
    render(<LinkPagination current={2} total={3} />);

    const current = screen.getByRole("link", { name: "Page 2" });
    expect(current).toHaveClass("border-border-strong");
    expect(current).toHaveClass("font-semibold");

    const other = screen.getByRole("link", { name: "Page 1" });
    expect(other).toHaveClass("border-transparent");
    expect(other).not.toHaveClass("font-semibold");
  });

  it("meets the 44px project target on every control", () => {
    render(<LinkPagination current={5} total={10} />);

    for (const control of screen.getAllByRole("link")) {
      expect(control).toHaveClass("min-h-11");
    }
    expect(screen.getByRole("link", { name: "Page 5" })).toHaveClass("min-w-11");
  });
});

describe("PaginationPrevious / PaginationNext", () => {
  it("have visible default labels as their accessible names", () => {
    render(<LinkPagination current={5} total={10} />);

    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      "?page=4",
    );
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
      "href",
      "?page=6",
    );
  });

  it("accept translated labels", () => {
    render(
      <Pagination label="Paginación">
        <PaginationList>
          <PaginationItem>
            <PaginationPrevious href="?page=1" label="Anterior" />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="?page=3" label="Siguiente" />
          </PaginationItem>
        </PaginationList>
      </Pagination>,
    );

    expect(screen.getByRole("link", { name: "Anterior" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Siguiente" })).toBeInTheDocument();
  });

  it("their icons are decorative and add nothing to the name", () => {
    render(<LinkPagination current={5} total={10} />);

    for (const name of ["Previous", "Next"]) {
      const svg = screen.getByRole("link", { name }).querySelector("svg");
      expect(svg).not.toBeNull();
      expect(svg).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("Previous is hidden on the first page (USWDS bounds behavior)", () => {
    render(<LinkPagination current={1} total={10} />);

    expect(screen.queryByRole("link", { name: "Previous" })).not.toBeInTheDocument();
    expect(screen.queryByText("Previous")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Next" })).toBeInTheDocument();
  });

  it("Next is hidden on the last page (USWDS bounds behavior)", () => {
    render(<LinkPagination current={10} total={10} />);

    expect(screen.queryByRole("link", { name: "Next" })).not.toBeInTheDocument();
    expect(screen.queryByText("Next")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Previous" })).toBeInTheDocument();
  });
});

describe("PaginationEllipsis", () => {
  it("is an aria-hidden span and never focusable", () => {
    const { container } = render(<LinkPagination current={5} total={10} />);

    const ellipses = container.querySelectorAll('[data-slot="pagination-ellipsis"]');
    expect(ellipses).toHaveLength(2);
    for (const ellipsis of ellipses) {
      expect(ellipsis.tagName).toBe("SPAN");
      expect(ellipsis).toHaveAttribute("aria-hidden", "true");
      expect(ellipsis).not.toHaveAttribute("tabindex");
      expect(ellipsis).toHaveTextContent("…");
    }
  });
});

describe("Pagination keyboard contract", () => {
  it("Tab moves Previous → pages → Next in order, skipping ellipses", async () => {
    const user = userEvent.setup();
    render(<LinkPagination current={5} total={10} />);

    const expectedOrder = [
      "Previous",
      "Page 1",
      "Page 4",
      "Page 5",
      "Page 6",
      "Page 10",
      "Next",
    ];
    for (const name of expectedOrder) {
      await user.tab();
      expect(screen.getByRole("link", { name })).toHaveFocus();
    }
  });

  it("the current page stays focusable", async () => {
    const user = userEvent.setup();
    render(<LinkPagination current={1} total={3} />);

    await user.tab();
    const current = screen.getByRole("link", { name: "Page 1" });
    expect(current).toHaveFocus();
    expect(current).toHaveAttribute("aria-current", "page");
  });

  it("button pages activate with Enter and Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Pagination>
        <PaginationList>
          <PaginationItem>
            <PaginationPage onClick={onClick} aria-label="Page 2">
              2
            </PaginationPage>
          </PaginationItem>
        </PaginationList>
      </Pagination>,
    );

    await user.tab();
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});

describe("Pagination RTL", () => {
  it("renders and stays axe-clean in a dir=rtl document", async () => {
    const { container } = render(
      <div dir="rtl">
        <Pagination label="ترقيم الصفحات">
          <PaginationList>
            <PaginationItem>
              <PaginationPrevious href="?page=1" label="السابق" />
            </PaginationItem>
            <PaginationItem>
              <PaginationPage href="?page=2" current>
                2
              </PaginationPage>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="?page=3" label="التالي" />
            </PaginationItem>
          </PaginationList>
        </Pagination>
      </div>,
    );

    expect(
      screen.getByRole("navigation", { name: "ترقيم الصفحات" }),
    ).toBeInTheDocument();
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("mirrors the directional chevrons in RTL (rtl:-scale-x-100)", () => {
    render(<LinkPagination current={5} total={10} />);

    for (const name of ["Previous", "Next"]) {
      const svg = screen.getByRole("link", { name }).querySelector("svg");
      expect(svg).toHaveClass("rtl:-scale-x-100");
    }
  });
});
