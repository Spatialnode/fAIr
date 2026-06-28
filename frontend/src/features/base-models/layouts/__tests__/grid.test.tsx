import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BaseModelGridLayout from "@/features/base-models/layouts/grid";
import { TBaseModel } from "@/types";

const makeModel = (id: number, name: string): TBaseModel => ({
  id,
  name,
  description: `Description for ${name}`,
  author: "HOT",
  task: "building-detection",
  keywords: ["detection"],
  version: "1",
  lastModified: "1/1/2024",
  accuracy: 0,
});

const renderGrid = (models: TBaseModel[]) =>
  render(
    <MemoryRouter>
      <BaseModelGridLayout models={models} />
    </MemoryRouter>,
  );

describe("BaseModelGridLayout", () => {
  it("renders a card heading for each model", () => {
    const models = [
      makeModel(1, "Alpha Model"),
      makeModel(2, "Beta Model"),
      makeModel(3, "Gamma Model"),
    ];
    renderGrid(models);
    expect(
      screen.getByRole("heading", { name: "Alpha Model" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Beta Model" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Gamma Model" }),
    ).toBeInTheDocument();
  });

  it("renders nothing when models array is empty", () => {
    const { container } = renderGrid([]);
    // The grid container exists but has no link children
    expect(container.querySelectorAll("a")).toHaveLength(0);
  });
});
