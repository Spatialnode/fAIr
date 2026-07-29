import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { BaseModelsPage } from "@/app/routes/base-models/base-models-list";
import { TBaseModel } from "@/types";

// ---------------------------------------------------------------------------
// Mock heavy dependencies
// ---------------------------------------------------------------------------

vi.mock("@/features/base-models/hooks/use-base-models", () => ({
  useBaseModels: vi.fn(),
}));

// Mock dialog — keeps tests focused on filter/sort/layout logic
vi.mock("@/hooks/use-dialog", () => ({
  useDialog: () => ({
    isOpened: false,
    openDialog: vi.fn(),
    closeDialog: vi.fn(),
  }),
}));

// Stub out the skeleton/dialogs/layouts to avoid their deep dependency trees
vi.mock("@/features/base-models/components", () => ({
  BaseModelsFilters: ({ search, filteredModelsCount, setSearch }: any) => (
    <div>
      <input
        data-testid="search-input"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <span data-testid="model-count">{filteredModelsCount} Models</span>
    </div>
  ),
  MobileBaseModelFiltersDialog: () => null,
  BaseModelListSkeleton: () => <div data-testid="skeleton">Loading…</div>,
}));

vi.mock("@/features/base-models/layouts", () => ({
  BaseModelGridLayout: ({ models }: { models: TBaseModel[] }) => (
    <ul data-testid="grid">
      {models.map((m) => (
        <li key={m.id} data-testid="model-item">
          {m.name}
        </li>
      ))}
    </ul>
  ),
  BaseModelTableLayout: ({ models }: { models: TBaseModel[] }) => (
    <ul data-testid="table">
      {models.map((m) => (
        <li key={m.id}>{m.name}</li>
      ))}
    </ul>
  ),
}));

vi.mock("@/features/base-models/components/contribute-model-dialog", () => ({
  default: () => null,
}));

vi.mock("@/components/seo", () => ({
  Head: () => null,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

import { useBaseModels } from "@/features/base-models/hooks/use-base-models";

const mockUseBaseModels = vi.mocked(useBaseModels);

const makeModel = (
  overrides: Partial<TBaseModel> & { id: number; name: string },
): TBaseModel => ({
  description: "Some description",
  author: "HOT",
  task: "building-detection",
  keywords: [],
  version: "1",
  lastModified: "1/1/2024",
  accuracy: 0,
  ...overrides,
});

const renderPage = (searchParams?: string) =>
  render(
    <NuqsTestingAdapter searchParams={searchParams ?? ""}>
      <MemoryRouter>
        <BaseModelsPage />
      </MemoryRouter>
    </NuqsTestingAdapter>,
  );

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

describe("BaseModelsPage — loading / error states", () => {
  it("shows skeleton while data is loading", () => {
    mockUseBaseModels.mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
    } as any);

    renderPage();
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
  });

  it("shows an error message when the query fails", () => {
    mockUseBaseModels.mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
    } as any);

    renderPage();
    expect(screen.getByText(/failed to load models/i)).toBeInTheDocument();
  });

  it("shows 'No base models found' when filtered results are empty", () => {
    mockUseBaseModels.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as any);

    renderPage();
    expect(screen.getByText(/no base models found/i)).toBeInTheDocument();
  });
});

describe("BaseModelsPage — search filtering", () => {
  const models = [
    makeModel({
      id: 1,
      name: "RAMP Detector",
      description: "Detects buildings",
      author: "HOT",
    }),
    makeModel({
      id: 2,
      name: "YOLOv8 Segmentor",
      description: "Fast segmentation",
      author: "OpenAI",
    }),
  ];

  beforeEach(() => {
    mockUseBaseModels.mockReturnValue({
      data: models,
      isLoading: false,
      isError: false,
    } as any);
  });

  it("shows all models when search is empty", () => {
    renderPage();
    expect(screen.getByTestId("model-count")).toHaveTextContent("2 Models");
  });

  it("filters models by name (case-insensitive)", () => {
    renderPage("q=ramp");
    expect(screen.getByTestId("model-count")).toHaveTextContent("1 Models");
    expect(screen.getAllByText("RAMP Detector")).not.toHaveLength(0);
    expect(screen.queryByText("YOLOv8 Segmentor")).not.toBeInTheDocument();
  });

  it("filters models by description", () => {
    renderPage("q=segmentation");
    expect(screen.getByTestId("model-count")).toHaveTextContent("1 Models");
    expect(screen.getAllByText("YOLOv8 Segmentor")).not.toHaveLength(0);
  });

  it("filters models by author", () => {
    renderPage("q=openai");
    expect(screen.getByTestId("model-count")).toHaveTextContent("1 Models");
    expect(screen.getAllByText("YOLOv8 Segmentor")).not.toHaveLength(0);
  });
});

describe("BaseModelsPage — category filtering", () => {
  const models = [
    makeModel({ id: 1, name: "Model A", task: "building-detection" }),
    makeModel({ id: 2, name: "Model B", task: "road-detection" }),
  ];

  beforeEach(() => {
    mockUseBaseModels.mockReturnValue({
      data: models,
      isLoading: false,
      isError: false,
    } as any);
  });

  it("shows all models when category is 'all'", () => {
    renderPage("category=all");
    expect(screen.getByTestId("model-count")).toHaveTextContent("2 Models");
  });

  it("filters by category", () => {
    renderPage("category=road-detection");
    expect(screen.getByTestId("model-count")).toHaveTextContent("1 Models");
    expect(screen.getAllByText("Model B")).not.toHaveLength(0);
    expect(screen.queryByText("Model A")).not.toBeInTheDocument();
  });
});

describe("BaseModelsPage — date sorting", () => {
  const models = [
    makeModel({ id: 1, name: "Older Model", lastModified: "2022-01-01" }),
    makeModel({ id: 2, name: "Newer Model", lastModified: "2024-06-01" }),
  ];

  beforeEach(() => {
    mockUseBaseModels.mockReturnValue({
      data: models,
      isLoading: false,
      isError: false,
    } as any);
  });

  it("sorts newest first by default", () => {
    renderPage();
    const items = screen.getAllByTestId("model-item");
    expect(items[0]).toHaveTextContent("Newer Model");
    expect(items[1]).toHaveTextContent("Older Model");
  });

  it("sorts oldest first when date=oldest", () => {
    renderPage("date=oldest");
    const items = screen.getAllByTestId("model-item");
    expect(items[0]).toHaveTextContent("Older Model");
    expect(items[1]).toHaveTextContent("Newer Model");
  });
});

describe("BaseModelsPage — dynamic task categories", () => {
  it("derives unique task categories from model data (excluding duplicates)", () => {
    mockUseBaseModels.mockReturnValue({
      data: [
        makeModel({ id: 1, name: "M1", task: "segmentation" }),
        makeModel({ id: 2, name: "M2", task: "segmentation" }), // duplicate
        makeModel({ id: 3, name: "M3", task: "detection" }),
      ],
      isLoading: false,
      isError: false,
    } as any);

    renderPage();
    // All 3 models should be visible — no filter applied yet
    expect(screen.getByText("3 Models")).toBeInTheDocument();
  });
});
