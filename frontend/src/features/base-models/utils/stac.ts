import { TBaseModel } from "@/types";

export const mapStacItemToBaseModel = (feature: any): TBaseModel => {
  const props = feature.properties;

  const provider =
    props.providers?.find((p: any) => p.roles?.includes("producer")) ||
    props.providers?.[0];
  return {
    id: feature.id,

    name: props.title || props["mlm:name"],

    description: props.description || "",

    author: provider?.name || "Unknown",

    task: props?.keywords?.[0] || "unknown",

    keywords: props?.keywords ?? [],

    version: props.version || "1",

    lastModified: new Date(props.updated).toLocaleDateString(),

    accuracy: extractAccuracy(props),
  };
};

export const mapStacItemToBaseModelDetail = (item: any) => {
  const p = item.properties ?? {};
  const assets = item.assets ?? {};
  const getAsset = (key: string) => assets[key];
  return {
    id: item.id,

    // header
    fullTitle: p.title,

    dataId: item.id,

    // geographic extent [minLng, minLat, maxLng, maxLat]
    bbox: (item.bbox ?? null) as [number, number, number, number] | null,

    // metadata
    createdBy:
      p.providers?.find((p: any) => p.roles?.includes("producer"))?.name ??
      "Unknown",

    generatedOn: p.created,
    lastModified: p.updated,
    version: p.version,
    dataDatetime: p.datetime,

    modelWeightsLicense: p.license,
    datasetLicense: p.license,

    task: (p.keywords ?? [])[0] ?? "unknown",
    keywords: p.keywords ?? [],
    accuracy: p["fair:metrics_spec"] ?? null,

    markdownContent: getAsset("readme")?.href,
    readmeUrl: getAsset("readme")?.href,

    dataInfo: {
      sensor: p.mlm?.input?.[0]?.name ?? "Unknown",
      crs: "EPSG:4326",
      spatialExtent: "Global",
      temporalExtent: `${p.created} → ${p.updated}`,
    },

    architecture: {
      baseModel: p["mlm:name"],
      architecture: p["mlm:architecture"],
      framework: p["mlm:framework"],
      pretrained: p["mlm:pretrained"] != null ? (p["mlm:pretrained"] ? "Yes" : "No") : undefined,
      accelerator: p["mlm:accelerator"],
      cpuRequest: p["fair:cpu_request"],
      memoryLimit: p["fair:memory_limit"],
      acceleratorCount: p["mlm:accelerator_count"] != null ? String(p["mlm:accelerator_count"]) : undefined,
      frameworkVersion: p["mlm:framework_version"],
      pretrainedSource: p["mlm:pretrained_source"],
      tileSizePx: "640",
      processing: "preprocess pipeline",
      resize: "640x640",
      scaling: "0–1 normalization",
      outputDescription: p.description,
      variants: [],
    },

   
    mlmTasks: (p["mlm:tasks"] ?? []) as string[],

    mlmInput: (p["mlm:input"] ?? []) as {
      name: string;
      bands: { name: string }[];
      input: { shape: number[]; data_type: string; dim_order: string[] };
      pre_processing_function?: { format: string; expression: string };
    }[],

    mlmOutput: (p["mlm:output"] ?? []) as {
      name: string;
      bands: { name: string }[];
      tasks: string[];
      result: { shape: number[]; data_type: string; dim_order: string[] };
      "classification:classes"?: { name: string; value: number; description: string }[];
      post_processing_function?: { format: string; expression: string };
    }[],

    assets: Object.entries(assets).map(([key, value]: any) => ({
      key,
      href: value.href,
      type: value.type,
      title: value.title,
      roles: value.roles,
    })),
  };
};

const extractAccuracy = (properties: any): number => {
  const metrics = properties["fair:metrics_spec"];

  if (!metrics?.length) {
    return 0;
  }

  const accuracyMetric = metrics.find(
    (metric: any) => metric.key === "fair:accuracy",
  );

  if (!accuracyMetric) {
    return 0;
  }

  return 0;
};
