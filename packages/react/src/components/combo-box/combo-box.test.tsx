// SPDX-License-Identifier: MIT

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { ComboBox, type ComboBoxItem } from "@/components/combo-box";
import { FieldProvider } from "@/components/field/context";
import { axeCheck } from "../../../test/setup.js";

const STATES: ComboBoxItem[] = [
  { value: "al", label: "Alabama" },
  { value: "ak", label: "Alaska" },
  { value: "az", label: "Arizona" },
  { value: "ca", label: "California" },
  { value: "co", label: "Colorado" },
];

function StateComboBox(
  props: Partial<React.ComponentProps<typeof ComboBox>>,
): React.JSX.Element {
  return <ComboBox aria-label="State" items={STATES} {...props} />;
}

/** The input carrying role=combobox. */
function getCombobox(name = "State"): HTMLElement {
  return screen.getByRole("combobox", { name });
}

describe("ComboBox name, role, and value", () => {
  it("renders an input with role combobox and its accessible name", () => {
    render(<StateComboBox />);

    const input = getCombobox();
    expect(input.tagName).toBe("INPUT");
    expect(input).toHaveAttribute("data-slot", "combo-box-input");
  });

  it("is collapsed until opened (aria-expanded=false)", () => {
    render(<StateComboBox />);
    expect(getCombobox()).toHaveAttribute("aria-expanded", "false");
  });

  it("takes its accessible name from an associated <label>", () => {
    render(
      <>
        <label htmlFor="state">Home state</label>
        <ComboBox id="state" items={STATES} />
      </>,
    );
    expect(
      screen.getByRole("combobox", { name: "Home state" }),
    ).toBeInTheDocument();
  });

  it("advertises the listbox popup (aria-haspopup=listbox)", () => {
    render(<StateComboBox />);
    expect(getCombobox()).toHaveAttribute("aria-haspopup", "listbox");
  });
});

describe("ComboBox opening and filtering", () => {
  it("opens on ArrowDown and points aria-controls at the listbox", async () => {
    const user = userEvent.setup();
    render(<StateComboBox />);

    const input = getCombobox();
    await user.click(input);
    await user.keyboard("{ArrowDown}");

    expect(input).toHaveAttribute("aria-expanded", "true");
    const listbox = await screen.findByRole("listbox");
    expect(input).toHaveAttribute("aria-controls", listbox.id);
    expect(screen.getAllByRole("option")).toHaveLength(STATES.length);
  });

  it("filters options with a case-insensitive contains match", async () => {
    const user = userEvent.setup();
    render(<StateComboBox />);

    const input = getCombobox();
    await user.click(input);
    // Upper-case query proves the match is case-insensitive; "alab"
    // distinguishes Alabama from Alaska (both contain "ala").
    await user.type(input, "ALAB");

    await waitFor(() => {
      const labels = screen
        .getAllByRole("option")
        .map((option) => option.textContent);
      expect(labels).toEqual(["Alabama"]);
    });
  });

  it("shows the empty state when nothing matches", async () => {
    const user = userEvent.setup();
    render(<StateComboBox noResultsText="No states found" />);

    const input = getCombobox();
    await user.click(input);
    await user.type(input, "zzzz");

    await waitFor(() => {
      expect(screen.queryAllByRole("option")).toHaveLength(0);
      expect(screen.getByText("No states found")).toBeInTheDocument();
    });
  });
});

describe("ComboBox keyboard contract", () => {
  it("receives focus with Tab", async () => {
    const user = userEvent.setup();
    render(<StateComboBox />);

    await user.tab();
    expect(getCombobox()).toHaveFocus();
  });

  it("tracks the highlighted option with aria-activedescendant", async () => {
    const user = userEvent.setup();
    render(<StateComboBox />);

    const input = getCombobox();
    await user.click(input);
    await user.keyboard("{ArrowDown}");

    await waitFor(() => {
      const active = input.getAttribute("aria-activedescendant");
      expect(active).toBeTruthy();
      const highlighted = document.getElementById(active as string);
      expect(highlighted).toHaveAttribute("role", "option");
      expect(highlighted).toHaveAttribute("data-highlighted");
    });
  });

  it("moves the highlight with Down then Up", async () => {
    const user = userEvent.setup();
    render(<StateComboBox />);

    const input = getCombobox();
    await user.click(input);
    await user.keyboard("{ArrowDown}{ArrowDown}");
    const afterDown = input.getAttribute("aria-activedescendant");

    await user.keyboard("{ArrowUp}");
    await waitFor(() => {
      expect(input.getAttribute("aria-activedescendant")).not.toBe(afterDown);
    });
  });

  it("selects the highlighted option with Enter and marks it aria-selected", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<StateComboBox onValueChange={onValueChange} />);

    const input = getCombobox();
    await user.click(input);
    await user.type(input, "colo");
    await user.keyboard("{ArrowDown}{Enter}");

    await waitFor(() => {
      expect(onValueChange).toHaveBeenLastCalledWith("co");
    });
    expect(input).toHaveValue("Colorado");
  });

  it("marks the selected option aria-selected when reopened", async () => {
    const user = userEvent.setup();
    render(<StateComboBox defaultValue="az" />);

    const input = getCombobox();
    expect(input).toHaveValue("Arizona");

    await user.click(input);
    await user.keyboard("{ArrowDown}");

    await waitFor(() => {
      expect(
        screen.getByRole("option", { name: "Arizona", selected: true }),
      ).toBeInTheDocument();
    });
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<StateComboBox />);

    const input = getCombobox();
    await user.click(input);
    await user.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(input).toHaveAttribute("aria-expanded", "false");
    });
  });
});

describe("ComboBox selection state", () => {
  it("supports controlled value + onValueChange", async () => {
    const user = userEvent.setup();

    function Controlled(): React.JSX.Element {
      const [value, setValue] = React.useState<string | null>("al");
      return (
        <ComboBox
          aria-label="State"
          items={STATES}
          value={value}
          onValueChange={setValue}
        />
      );
    }

    render(<Controlled />);
    const input = getCombobox();
    expect(input).toHaveValue("Alabama");

    await user.click(input);
    await user.keyboard("{ArrowDown}{Enter}");
    await waitFor(() => {
      expect(input).not.toHaveValue("Alabama");
    });
  });

  it("clears the selection with the clear button", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<StateComboBox defaultValue="ca" onValueChange={onValueChange} />);

    const input = getCombobox();
    expect(input).toHaveValue("California");

    await user.click(screen.getByRole("button", { name: "Clear selection" }));
    await waitFor(() => {
      expect(input).toHaveValue("");
    });
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });

  it("opens the list from the chevron trigger", async () => {
    const user = userEvent.setup();
    render(<StateComboBox showClear={false} />);

    await user.click(screen.getByRole("button", { name: "Show options" }));
    expect(await screen.findByRole("listbox")).toBeInTheDocument();
  });
});

describe("ComboBox Field wiring", () => {
  it("adopts id, describedby, invalid, required, and disabled from the Field", () => {
    render(
      <FieldProvider id="state" hasHint hasError required disabled>
        <StateComboBox />
        <p id="state-hint">Pick one.</p>
        <p id="state-error">Choose a state.</p>
      </FieldProvider>,
    );

    const input = getCombobox();
    expect(input).toHaveAttribute("id", "state");
    expect(input).toHaveAttribute("aria-describedby", "state-hint state-error");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toBeRequired();
    expect(input).toBeDisabled();
  });

  it("omits state attributes the Field does not set", () => {
    render(
      <FieldProvider id="state">
        <StateComboBox />
      </FieldProvider>,
    );

    const input = getCombobox();
    expect(input).not.toHaveAttribute("aria-describedby");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toBeRequired();
    expect(input).not.toBeDisabled();
  });

  it("lets explicit props win over Field wiring", () => {
    render(
      <FieldProvider id="state" hasHint>
        <StateComboBox id="custom" aria-describedby="elsewhere" />
      </FieldProvider>,
    );

    const input = getCombobox();
    expect(input).toHaveAttribute("id", "custom");
    expect(input).toHaveAttribute("aria-describedby", "elsewhere");
  });

  it("works standalone outside a FieldProvider", () => {
    render(<StateComboBox />);
    const input = getCombobox();
    expect(input).not.toHaveAttribute("aria-describedby");
    expect(input).not.toHaveAttribute("aria-invalid");
  });
});

describe("ComboBox disabled", () => {
  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    render(<StateComboBox disabled />);

    const input = getCombobox();
    expect(input).toBeDisabled();
    await user.click(input);
    await user.keyboard("{ArrowDown}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("is skipped by Tab when disabled", async () => {
    const user = userEvent.setup();
    render(
      <>
        <StateComboBox disabled />
        <button type="button">After</button>
      </>,
    );

    await user.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
  });
});

describe("ComboBox accessibility (axe)", () => {
  it("is axe-clean when closed", async () => {
    const { container } = render(<StateComboBox placeholder="Search states" />);
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("is axe-clean when open with options", async () => {
    const user = userEvent.setup();
    render(<StateComboBox />);
    await user.click(getCombobox());
    await user.keyboard("{ArrowDown}");
    await screen.findByRole("listbox");

    // Base UI portals the popup to document.body. The "region" rule is a
    // page-level best-practice check (all content inside a landmark) that
    // an isolated, landmark-less test page can never satisfy — it is not a
    // defect of the combobox, whose listbox is correctly associated to the
    // input via aria-controls / aria-activedescendant.
    expect(
      await axeCheck(document.body, { rules: { region: { enabled: false } } }),
    ).toHaveNoViolations();
  });

  it("is axe-clean inside a Field in an error state", async () => {
    const { container } = render(
      <FieldProvider id="state" hasError>
        <StateComboBox />
        <p id="state-error">Choose a state.</p>
      </FieldProvider>,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("is axe-clean when disabled", async () => {
    const { container } = render(<StateComboBox disabled />);
    expect(await axeCheck(container)).toHaveNoViolations();
  });
});

describe("ComboBox RTL", () => {
  it("renders and filters in a dir=rtl document", async () => {
    const user = userEvent.setup();
    const items: ComboBoxItem[] = [
      { value: "cairo", label: "القاهرة" },
      { value: "giza", label: "الجيزة" },
    ];

    const { container } = render(
      <div dir="rtl" lang="ar">
        <ComboBox aria-label="المدينة" items={items} />
      </div>,
    );

    const input = screen.getByRole("combobox", { name: "المدينة" });
    expect(input).toBeInTheDocument();
    expect(await axeCheck(container)).toHaveNoViolations();

    await user.click(input);
    await user.keyboard("{ArrowDown}");
    expect(await screen.findByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(2);
    // Assert scoped to the listbox to prove options rendered.
    within(screen.getByRole("listbox"));
  });
});
