import { describe, it, expect } from "vitest";
import {
  mapStacItemToBaseModel,
  mapStacItemToBaseModelDetail,
} from "@/features/base-models/utils/stac";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeFeature = (overrides: Record<string, unknown> = {}) => ({
  id: "model-abc",
  bbox: [-180, -85, 180, 85],
  assets: {},
  properties: {
    title: "Test Model",
    description: "A description",
    updated: "2024-01-15T00:00:00Z",
    version: "2",
    keywords: ["building-detection", "segmentation"],
    providers: [
      { name: "HOT", roles: ["producer"] },
      { name: "Other", roles: ["host"] },
    ],
    ...overrides,
  },
});

// ---------------------------------------------------------------------------
// mapStacItemToBaseModel
// ---------------------------------------------------------------------------

describe("mapStacItemToBaseModel", () => {
  it("maps title from props.title", () => {
    const model = mapStacItemToBaseModel(makeFeature());
    expect(model.name).toBe("Test Model");
  });

  it("falls back to mlm:name when title is absent", () => {
    const feature = makeFeature({ title: undefined, "mlm:name": "MLM Name" });
    const model = mapStacItemToBaseModel(feature);
    expect(model.name).toBe("MLM Name");
  });

  it("picks the producer provider for author", () => {
    const model = mapStacItemToBaseModel(makeFeature());
    expect(model.author).toBe("HOT");
  });

  it("falls back to the first provider when none has the producer role", () => {
    const feature = makeFeature({
      providers: [{ name: "FallbackOrg", roles: ["host"] }],
    });
    const model = mapStacItemToBaseModel(feature);
    expect(model.author).toBe("FallbackOrg");
  });

  it("returns 'Unknown' when providers is absent", () => {
    const feature = makeFeature({ providers: undefined });
    const model = mapStacItemToBaseModel(feature);
    expect(model.author).toBe("Unknown");
  });

  it("picks the first keyword as task", () => {
    const model = mapStacItemToBaseModel(makeFeature());
    expect(model.task).toBe("building-detection");
  });

  it("defaults task to 'unknown' when keywords is empty", () => {
    const feature = makeFeature({ keywords: [] });
    const model = mapStacItemToBaseModel(feature);
    expect(model.task).toBe("unknown");
  });

  it("defaults version to '1' when absent", () => {
    const feature = makeFeature({ version: undefined });
    const model = mapStacItemToBaseModel(feature);
    expect(model.version).toBe("1");
  });

  it("defaults description to empty string when absent", () => {
    const feature = makeFeature({ description: undefined });
    const model = mapStacItemToBaseModel(feature);
    expect(model.description).toBe("");
  });

  it("includes all keywords in model.keywords", () => {
    const model = mapStacItemToBaseModel(makeFeature());
    expect(model.keywords).toEqual(["building-detection", "segmentation"]);
  });
});

// ---------------------------------------------------------------------------
// mapStacItemToBaseModelDetail
// ---------------------------------------------------------------------------

const makeStacItem = (overrides: Record<string, unknown> = {}, assetOverrides: Record<string, unknown> = {}) => ({
  id: "detail-model-1",
  bbox: [-10, -5, 10, 5] as [number, number, number, number],
  assets: {
    readme: { href: "https://example.com/readme.md", type: "text/markdown", title: "README", roles: ["overview"] },
    ...assetOverrides,
  },
  properties: {
    title: "Detail Model",
    description: "Detailed description",
    created: "2023-06-01T00:00:00Z",
    updated: "2024-01-15T00:00:00Z",
    version: "3",
    datetime: "2023-01-01T00:00:00Z",
    license: "ODbL",
    keywords: ["segmentation"],
    providers: [{ name: "HOT", roles: ["producer"] }],
    "mlm:name": "ramp",
    "mlm:architecture": "ResNet",
    "mlm:framework": "TensorFlow",
    "mlm:tasks": ["segmentation", "detection"],
    "mlm:input": [],
    "mlm:output": [],
    ...overrides,
  },
});

describe("mapStacItemToBaseModelDetail", () => {
  it("maps id and fullTitle", () => {
    const model = mapStacItemToBaseModelDetail(makeStacItem());
    expect(model.id).toBe("detail-model-1");
    expect(model.fullTitle).toBe("Detail Model");
  });

  it("maps bbox from item", () => {
    const model = mapStacItemToBaseModelDetail(makeStacItem());
    expect(model.bbox).toEqual([-10, -5, 10, 5]);
  });

  it("sets bbox to null when absent", () => {
    const item = { ...makeStacItem(), bbox: undefined };
    const model = mapStacItemToBaseModelDetail(item);
    expect(model.bbox).toBeNull();
  });

  it("maps markdownContent and readmeUrl from readme asset", () => {
    const model = mapStacItemToBaseModelDetail(makeStacItem());
    expect(model.markdownContent).toBe("https://example.com/readme.md");
    expect(model.readmeUrl).toBe("https://example.com/readme.md");
  });

  it("sets markdownContent to undefined when readme asset is absent", () => {
    const item = makeStacItem({}, {});
    delete (item as any).assets.readme;
    const model = mapStacItemToBaseModelDetail(item);
    expect(model.markdownContent).toBeUndefined();
  });

  it("maps mlmTasks correctly", () => {
    const model = mapStacItemToBaseModelDetail(makeStacItem());
    expect(model.mlmTasks).toEqual(["segmentation", "detection"]);
  });

  it("maps mlmInput and mlmOutput as empty arrays when absent", () => {
    const model = mapStacItemToBaseModelDetail(makeStacItem());
    expect(model.mlmInput).toEqual([]);
    expect(model.mlmOutput).toEqual([]);
  });

  it("maps architecture fields from STAC properties", () => {
    const model = mapStacItemToBaseModelDetail(makeStacItem());
    expect(model.architecture.baseModel).toBe("ramp");
    expect(model.architecture.architecture).toBe("ResNet");
    expect(model.architecture.framework).toBe("TensorFlow");
  });

  it("maps assets array from item assets", () => {
    const model = mapStacItemToBaseModelDetail(makeStacItem());
    expect(model.assets).toContainEqual(
      expect.objectContaining({ key: "readme", href: "https://example.com/readme.md" }),
    );
  });
});

// ---------------------------------------------------------------------------
// extractAccuracy (tested indirectly via mapStacItemToBaseModel)
// ---------------------------------------------------------------------------

describe("accuracy extraction via mapStacItemToBaseModel", () => {
  it("returns 0 when fair:metrics_spec is absent", () => {
    const model = mapStacItemToBaseModel(makeFeature());
    expect(model.accuracy).toBe(0);
  });

  it("returns 0 when metrics_spec is empty", () => {
    const feature = makeFeature({ "fair:metrics_spec": [] });
    const model = mapStacItemToBaseModel(feature);
    expect(model.accuracy).toBe(0);
  });

  it("returns 0 when fair:accuracy metric is not present", () => {
    const feature = makeFeature({
      "fair:metrics_spec": [{ key: "fair:precision", value: 0.9 }],
    });
    const model = mapStacItemToBaseModel(feature);
    expect(model.accuracy).toBe(0);
  });

  it("returns the metric value when fair:accuracy is present", () => {
    const feature = makeFeature({
      "fair:metrics_spec": [{ key: "fair:accuracy", value: 0.87 }],
    });
    const model = mapStacItemToBaseModel(feature);
    expect(model.accuracy).toBe(0.87);
  });
});
