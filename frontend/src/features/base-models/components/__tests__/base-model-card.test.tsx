import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BaseModelCard from "@/features/base-models/components/base-model-card";
import { TBaseModel } from "@/types";

const mockModel: TBaseModel = {
  id: 42,
  name: "RAMP Building Detector",
  description: "Detects buildings from satellite imagery using RAMP.",
  author: "Humanitarian OpenStreetMap Team",
  task: "building-detection",
  keywords: ["building-detection", "ramp", "segmentation"],
  version: "2",
  lastModified: "1/15/2024",
  accuracy: 0.87,
};

const renderCard = (model: TBaseModel = mockModel) =>
  render(
    <MemoryRouter>
      <BaseModelCard model={model} />
    </MemoryRouter>,
  );

afterEach(cleanup);

describe("BaseModelCard", () => {
  it("renders the model name as a heading", () => {
    renderCard();
    expect(
      screen.getByRole("heading", { name: mockModel.name }),
    ).toBeInTheDocument();
  });

  it("renders the model description", () => {
    renderCard();
    // Description can appear in tooltip/title attrs, so assert at least one element
    expect(screen.getAllByText(mockModel.description)[0]).toBeInTheDocument();
  });

  it("renders the author name", () => {
    renderCard();
    expect(screen.getAllByText(mockModel.author)[0]).toBeInTheDocument();
  });

  it("renders lastModified with label", () => {
    renderCard();
    expect(screen.getAllByText(/Last Modified/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(mockModel.lastModified)[0]).toBeInTheDocument();
  });

  it("links to the correct base model detail route", () => {
    renderCard();
    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", `/base-models/${mockModel.id}`);
  });

  it("renders BaseModelKeywords with the model keywords", () => {
    renderCard();
    // Default visibleLimit is 3 — all 3 keywords should appear
    expect(screen.getAllByText("building-detection")[0]).toBeInTheDocument();
    expect(screen.getAllByText("ramp")[0]).toBeInTheDocument();
    expect(screen.getAllByText("segmentation")[0]).toBeInTheDocument();
  });
});
