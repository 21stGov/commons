// SPDX-License-Identifier: MIT

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/table";
import { axeCheck } from "../../../test/setup.js";

// A small, representative gov data table used across the suite.
function PermitTable(
  props: {
    caption?: string;
    variant?: "bordered" | "borderless";
    striped?: boolean;
    density?: "comfortable" | "compact";
    stacked?: boolean;
    useCaptionChild?: boolean;
  } = {},
): React.JSX.Element {
  const { caption = "Building permit requests", useCaptionChild = false, ...rest } = props;
  return (
    <Table {...rest} caption={useCaptionChild ? undefined : caption}>
      {useCaptionChild ? <TableCaption>{caption}</TableCaption> : null}
      <TableHead>
        <TableRow>
          <TableHeaderCell>Permit</TableHeaderCell>
          <TableHeaderCell>Applicant</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableHeaderCell scope="row">BP-1024</TableHeaderCell>
          <TableCell label="Applicant">Rivera Construction</TableCell>
          <TableCell label="Status">Approved</TableCell>
        </TableRow>
        <TableRow>
          <TableHeaderCell scope="row">BP-1025</TableHeaderCell>
          <TableCell label="Applicant">Chen Remodeling</TableCell>
          <TableCell label="Status">Under review</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

// ---------------------------------------------------------------------------
// Structure / roles
// ---------------------------------------------------------------------------

describe("Table structure", () => {
  it("renders a native table with caption, thead, and tbody", () => {
    render(<PermitTable />);

    const table = screen.getByRole("table");
    expect(table.tagName).toBe("TABLE");
    expect(table).toHaveAttribute("data-slot", "table");

    const caption = table.querySelector("caption");
    expect(caption).not.toBeNull();
    expect(caption).toHaveTextContent("Building permit requests");
    expect(table.querySelector("thead")).not.toBeNull();
    expect(table.querySelector("tbody")).not.toBeNull();
  });

  it("names the table by its caption", () => {
    render(<PermitTable />);
    expect(
      screen.getByRole("table", { name: "Building permit requests" }),
    ).toBeInTheDocument();
  });

  it("supports Table.Caption as a child instead of the caption prop", () => {
    render(<PermitTable useCaptionChild />);
    expect(
      screen.getByRole("table", { name: "Building permit requests" }),
    ).toBeInTheDocument();
  });

  it("exposes the compound Table.* namespace", () => {
    expect(Table.Caption).toBe(TableCaption);
    expect(Table.Head).toBe(TableHead);
    expect(Table.Body).toBe(TableBody);
    expect(Table.Row).toBe(TableRow);
    expect(Table.HeaderCell).toBe(TableHeaderCell);
    expect(Table.Cell).toBe(TableCell);
  });
});

// ---------------------------------------------------------------------------
// Header cell scope
// ---------------------------------------------------------------------------

describe("TableHeaderCell scope", () => {
  it("defaults column headers to scope=col", () => {
    render(<PermitTable />);
    const columnHeaders = screen.getAllByRole("columnheader");
    expect(columnHeaders).toHaveLength(3);
    for (const th of columnHeaders) {
      expect(th.tagName).toBe("TH");
      expect(th).toHaveAttribute("scope", "col");
    }
  });

  it("renders scope=row headers as row headers", () => {
    render(<PermitTable />);
    const rowHeaders = screen.getAllByRole("rowheader");
    expect(rowHeaders).toHaveLength(2);
    for (const th of rowHeaders) {
      expect(th).toHaveAttribute("scope", "row");
    }
    expect(screen.getByRole("rowheader", { name: "BP-1024" })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Sortable columns: aria-sort, button, icon, onSort
// ---------------------------------------------------------------------------

function SortableTable(props: {
  sortColumn?: "permit" | "status";
  sortDirection?: "ascending" | "descending" | "none";
  onSort?: (column: "permit" | "status") => void;
}): React.JSX.Element {
  const { sortColumn, sortDirection = "none", onSort } = props;
  const dirFor = (column: "permit" | "status") =>
    sortColumn === column ? sortDirection : "none";
  return (
    <Table caption="Permit requests, sortable">
      <TableHead>
        <TableRow>
          <TableHeaderCell
            sortable
            sortDirection={dirFor("permit")}
            onSort={() => onSort?.("permit")}
          >
            Permit
          </TableHeaderCell>
          <TableHeaderCell>Applicant</TableHeaderCell>
          <TableHeaderCell
            sortable
            sortDirection={dirFor("status")}
            onSort={() => onSort?.("status")}
          >
            Status
          </TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableHeaderCell scope="row">BP-1024</TableHeaderCell>
          <TableCell>Rivera Construction</TableCell>
          <TableCell>Approved</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

describe("Sortable columns", () => {
  it("puts aria-sort on sortable headers and omits it on plain ones", () => {
    render(<SortableTable sortColumn="permit" sortDirection="ascending" />);

    const permit = screen.getByRole("columnheader", { name: /Permit/ });
    expect(permit).toHaveAttribute("aria-sort", "ascending");

    const status = screen.getByRole("columnheader", { name: /Status/ });
    expect(status).toHaveAttribute("aria-sort", "none");

    const applicant = screen.getByRole("columnheader", { name: "Applicant" });
    expect(applicant).not.toHaveAttribute("aria-sort");
  });

  it("reflects each sort direction through aria-sort", () => {
    const { rerender } = render(
      <SortableTable sortColumn="permit" sortDirection="ascending" />,
    );
    expect(screen.getByRole("columnheader", { name: /Permit/ })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );

    rerender(<SortableTable sortColumn="permit" sortDirection="descending" />);
    expect(screen.getByRole("columnheader", { name: /Permit/ })).toHaveAttribute(
      "aria-sort",
      "descending",
    );

    rerender(<SortableTable />);
    expect(screen.getByRole("columnheader", { name: /Permit/ })).toHaveAttribute(
      "aria-sort",
      "none",
    );
  });

  it("renders a button whose accessible name is the column header", () => {
    render(<SortableTable />);
    const button = screen.getByRole("button", { name: "Permit" });
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
  });

  it("includes a decorative (aria-hidden) direction icon", () => {
    render(<SortableTable sortColumn="permit" sortDirection="ascending" />);
    const svg = screen
      .getByRole("button", { name: "Permit" })
      .querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("fires onSort when the header button is clicked", async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(<SortableTable onSort={onSort} />);

    await user.click(screen.getByRole("button", { name: "Status" }));
    expect(onSort).toHaveBeenCalledTimes(1);
    expect(onSort).toHaveBeenCalledWith("status");
  });

  it("toggles sort via keyboard (Enter and Space)", async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(<SortableTable onSort={onSort} />);

    // The focusable scroll region comes first in the tab order, then the
    // first sortable header button.
    await user.tab();
    expect(
      screen.getByRole("region", { name: "Permit requests, sortable" }),
    ).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Permit" })).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onSort).toHaveBeenCalledTimes(2);
    expect(onSort).toHaveBeenNthCalledWith(1, "permit");
  });

  it("gives the sort button a 44px target height", () => {
    render(<SortableTable />);
    expect(screen.getByRole("button", { name: "Permit" })).toHaveClass("min-h-11");
  });
});

// ---------------------------------------------------------------------------
// Variants: striped, density, borders, stacked
// ---------------------------------------------------------------------------

describe("Variants", () => {
  it("applies zebra striping only when striped", () => {
    const { rerender } = render(<PermitTable striped />);
    expect(screen.getByRole("table")).toHaveClass(
      "[&_tbody_tr:nth-child(even)]:bg-muted",
    );

    rerender(<PermitTable striped={false} />);
    expect(screen.getByRole("table")).not.toHaveClass(
      "[&_tbody_tr:nth-child(even)]:bg-muted",
    );
  });

  it("applies compact density padding to cells", () => {
    render(<PermitTable density="compact" />);
    const cell = screen.getByRole("cell", { name: "Rivera Construction" });
    expect(cell).toHaveClass("px-105");
    expect(cell).toHaveClass("py-05");
  });

  it("applies comfortable density padding by default", () => {
    render(<PermitTable />);
    const cell = screen.getByRole("cell", { name: "Rivera Construction" });
    expect(cell).toHaveClass("px-2");
    expect(cell).toHaveClass("py-105");
  });

  it("draws cell borders when bordered and omits them when borderless", () => {
    const { rerender } = render(<PermitTable variant="bordered" />);
    expect(screen.getByRole("table")).toHaveClass("border-border");

    rerender(<PermitTable variant="borderless" />);
    const table = screen.getByRole("table");
    expect(table).not.toHaveClass("[&_td]:border");
    expect(table).toHaveClass("[&_tbody_tr]:border-b");
  });

  it("sets data-label on cells for stacked mode and applies stacked classes", () => {
    render(<PermitTable stacked />);
    expect(screen.getByRole("table")).toHaveClass("max-sm:block");
    expect(screen.getByRole("cell", { name: "Approved" })).toHaveAttribute(
      "data-label",
      "Status",
    );
  });
});

// ---------------------------------------------------------------------------
// Scroll region
// ---------------------------------------------------------------------------

describe("Scroll region", () => {
  it("wraps the table in a focusable region labelled by the caption", () => {
    render(<PermitTable />);
    const region = screen.getByRole("region", { name: "Building permit requests" });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(region).toHaveAttribute("data-slot", "table-scroll-region");
    expect(region).toHaveClass("overflow-x-auto");
    // The table lives inside the region.
    expect(within(region).getByRole("table")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Caption dev-warning
// ---------------------------------------------------------------------------

describe("Caption dev warning", () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    warn.mockRestore();
  });

  it("warns when no caption is provided", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>No caption here</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain("<Table> has no caption");
  });

  it("does not warn when a caption is provided", () => {
    render(<PermitTable />);
    expect(warn).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// axe
// ---------------------------------------------------------------------------

describe("Table accessibility (axe)", () => {
  it("is axe-clean with a caption", async () => {
    const { container } = render(<PermitTable />);
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("is axe-clean when sortable", async () => {
    const { container } = render(
      <SortableTable sortColumn="permit" sortDirection="ascending" />,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("is axe-clean across every variant and density", async () => {
    for (const variant of ["bordered", "borderless"] as const) {
      for (const density of ["comfortable", "compact"] as const) {
        for (const striped of [true, false]) {
          const { container, unmount } = render(
            <PermitTable variant={variant} density={density} striped={striped} />,
          );
          expect(await axeCheck(container)).toHaveNoViolations();
          unmount();
        }
      }
    }
  });

  it("is axe-clean in stacked mode", async () => {
    const { container } = render(<PermitTable stacked />);
    expect(await axeCheck(container)).toHaveNoViolations();
  });
});

// ---------------------------------------------------------------------------
// RTL smoke
// ---------------------------------------------------------------------------

describe("Table RTL", () => {
  it("renders and stays axe-clean in a dir=rtl document", async () => {
    const { container } = render(
      <div dir="rtl">
        <Table caption="طلبات التصاريح">
          <TableHead>
            <TableRow>
              <TableHeaderCell sortable sortDirection="ascending" onSort={() => {}}>
                التصريح
              </TableHeaderCell>
              <TableHeaderCell>الحالة</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableHeaderCell scope="row">BP-1024</TableHeaderCell>
              <TableCell>معتمد</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>,
    );

    expect(screen.getByRole("table", { name: "طلبات التصاريح" })).toBeInTheDocument();
    expect(await axeCheck(container)).toHaveNoViolations();
  });
});
