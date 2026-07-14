// SPDX-License-Identifier: MIT

import { render, screen, within } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";

import { StepIndicator } from "@/components/step-indicator";
import { axeCheck } from "../../../test/setup.js";

const STEPS = ["Personal information", "Household", "Documents", "Review"];

describe("StepIndicator accessibility (axe)", () => {
  it("is axe-clean at the first step", async () => {
    const { container } = render(
      <StepIndicator steps={STEPS} currentStep={0} />,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("is axe-clean mid-flow with the counter shown", async () => {
    const { container } = render(
      <StepIndicator steps={STEPS} currentStep={2} showCounter />,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });

  it("is axe-clean at the final step", async () => {
    const { container } = render(
      <StepIndicator steps={STEPS} currentStep={STEPS.length - 1} />,
    );
    expect(await axeCheck(container)).toHaveNoViolations();
  });
});

describe("StepIndicator name and structure", () => {
  it("is a navigation landmark with a default accessible name", () => {
    render(<StepIndicator steps={STEPS} currentStep={1} />);
    expect(
      screen.getByRole("navigation", { name: "Progress" }),
    ).toBeInTheDocument();
  });

  it("uses a custom translatable landmark name", () => {
    render(
      <StepIndicator steps={STEPS} currentStep={1} label="Progreso" />,
    );
    expect(
      screen.getByRole("navigation", { name: "Progreso" }),
    ).toBeInTheDocument();
  });

  it("renders an ordered list with one list item per step", () => {
    render(<StepIndicator steps={STEPS} currentStep={1} />);

    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    expect(within(list).getAllByRole("listitem")).toHaveLength(STEPS.length);
  });
});

describe("StepIndicator current step", () => {
  it("marks exactly the current step with aria-current=step", () => {
    render(<StepIndicator steps={STEPS} currentStep={2} />);

    const items = screen.getAllByRole("listitem");
    const current = items.filter(
      (item) => item.getAttribute("aria-current") === "step",
    );
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent("Documents");
  });
});

describe("StepIndicator non-color status indicators", () => {
  it("tags each step with its derived status via data-status", () => {
    render(<StepIndicator steps={STEPS} currentStep={2} />);

    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveAttribute("data-status", "complete");
    expect(items[1]).toHaveAttribute("data-status", "complete");
    expect(items[2]).toHaveAttribute("data-status", "current");
    expect(items[3]).toHaveAttribute("data-status", "incomplete");
  });

  it("renders a checkmark (not a number) inside completed markers", () => {
    render(<StepIndicator steps={STEPS} currentStep={2} />);

    const items = screen.getAllByRole("listitem");
    // Completed steps show an SVG checkmark instead of their number.
    expect(items[0].querySelector("svg")).toBeInTheDocument();
    expect(items[0]).not.toHaveTextContent("1");
    // Current and incomplete steps show their number.
    expect(items[2]).toHaveTextContent("3");
    expect(items[3]).toHaveTextContent("4");
  });

  it("announces a spelled-out status word per step for screen readers", () => {
    render(<StepIndicator steps={STEPS} currentStep={2} />);

    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Personal information, completed");
    expect(items[2]).toHaveTextContent("Documents, current");
    expect(items[3]).toHaveTextContent("Review, not completed");
  });

  it("uses custom translatable status words", () => {
    render(
      <StepIndicator
        steps={STEPS}
        currentStep={1}
        statusLabels={{
          complete: "completado",
          current: "actual",
          incomplete: "pendiente",
        }}
      />,
    );

    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("completado");
    expect(items[1]).toHaveTextContent("actual");
    expect(items[2]).toHaveTextContent("pendiente");
  });
});

describe("StepIndicator counter", () => {
  it("hides the counter by default", () => {
    render(<StepIndicator steps={STEPS} currentStep={1} />);
    expect(screen.queryByText("Step 2 of 4")).not.toBeInTheDocument();
  });

  it("shows a 1-based 'Step X of Y' counter when requested", () => {
    render(<StepIndicator steps={STEPS} currentStep={1} showCounter />);
    expect(screen.getByText("Step 2 of 4")).toBeInTheDocument();
  });

  it("accepts a custom translatable counter formatter", () => {
    render(
      <StepIndicator
        steps={STEPS}
        currentStep={2}
        showCounter
        counterLabel={(current, total) => `Paso ${current} de ${total}`}
      />,
    );
    expect(screen.getByText("Paso 3 de 4")).toBeInTheDocument();
  });
});

describe("StepIndicator RTL", () => {
  it("renders and stays axe-clean in a dir=rtl document", async () => {
    const { container } = render(
      <div dir="rtl" lang="ar">
        <StepIndicator
          steps={["المعلومات", "المستندات", "المراجعة"]}
          currentStep={1}
          label="التقدم"
          showCounter
        />
      </div>,
    );

    expect(
      screen.getByRole("navigation", { name: "التقدم" }),
    ).toBeInTheDocument();
    // Steps are in DOM (reading) order; the inline axis mirrors via CSS.
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(await axeCheck(container)).toHaveNoViolations();
  });
});
