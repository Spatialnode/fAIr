import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BaseModelTableLayout from "@/features/base-models/layouts/table";
import { TBaseModel } from "@/types";

// Mock react-router-dom's navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const makeModel = (id: number, name: string): TBaseModel => ({
  id,
  name,
  description: `Desc ${name}`,
  author: "HOT",
  task: "segmentation",
  keywords: [],
  version: "1",
  lastModified: "6/1/2024",
  accuracy: 0,
});

const models = [makeModel(1, "Alpha Model"), makeModel(2, "Beta Model")];

const renderTable = () =>
  render(
    <MemoryRouter>
      <BaseModelTableLayout models={models} />
    </MemoryRouter>,
  );

describe("BaseModelTableLayout", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  afterEach(cleanup);
  it("renders column headers", () => {
    renderTable();
    expect(screen.getByText("Model Name")).toBeInTheDocument();
    expect(screen.getByText("Task")).toBeInTheDocument();
    expect(screen.getByText("Created by")).toBeInTheDocument();
    expect(screen.getByText("Version")).toBeInTheDocument();
  });

  it("renders a row for each model", () => {
    renderTable();
    // Text can appear both in the cell and the title attribute, so use getAllByText
    expect(screen.getAllByText("Alpha Model")).not.toHaveLength(0);
    expect(screen.getAllByText("Beta Model")).not.toHaveLength(0);
  });

  it("navigates to the detail route when a row is clicked", () => {
    renderTable();
    const row = screen.getByText("Alpha Model").closest("tr")!;
    fireEvent.click(row);
    expect(mockNavigate).toHaveBeenCalledWith("/base-models/1");
  });
});
