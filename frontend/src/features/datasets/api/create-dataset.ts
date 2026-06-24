import { API_ENDPOINTS, newApiClient } from "@/services";
import type { DatasetMetadataForm } from "@/features/datasets/types/types";

// ─── Shared enums ──────────────────────────────────────────────────────────────

export type LabelTaskEnum =
  | "semantic-segmentation"
  | "object-detection"
  | "classification";
export type LabelTypeEnum = "vector" | "raster";
export type GeometryTypeEnum =
  | "point"
  | "linestring"
  | "polygon"
  | "multipolygon";

export interface ILabelClass {
  [key: string]: string;
}

// ─── Shared mapping helpers ────────────────────────────────────────────────────

/**
 * Maps the form's human-readable taskType (e.g. "Segmentation") to the API
 * `label_tasks` enum value (e.g. "semantic-segmentation").
 */
export const mapTaskTypeToLabelTasks = (taskType: string): LabelTaskEnum[] => {
  const map: Record<string, LabelTaskEnum> = {
    segmentation: "semantic-segmentation",
    classification: "classification",
    detection: "object-detection",
  };
  const key = taskType.toLowerCase();
  return [map[key] ?? "semantic-segmentation"];
};

/**
 * Maps the form's geometryType (e.g. "Polygon") to the API `geometry_type`
 * enum value (e.g. "polygon").
 */
export const mapGeometryType = (geometryType: string): GeometryTypeEnum => {
  const map: Record<string, GeometryTypeEnum> = {
    polygon: "polygon",
    rectangle: "polygon",
    point: "point",
    linestring: "linestring",
    multipolygon: "multipolygon",
  };
  return map[geometryType.toLowerCase()] ?? "polygon";
};

/**
 * Builds the `label_classes` array from the form's featureType + keyValues.
 * e.g. featureType="Rooftops", keyValues=["Zinc", "Aluminium"]
 * → [{ Rooftops: "Rooftops", Zinc: "Zinc", Aluminium: "Aluminium" }]
 */
export const buildLabelClasses = (
  featureType: string,
  keyValues: string[],
): ILabelClass[] => {
  const labelClass: ILabelClass = {};
  if (featureType) labelClass[featureType] = featureType;
  keyValues.filter(Boolean).forEach((v) => {
    labelClass[v] = v;
  });
  return [labelClass];
};

/**
 * Assembles a complete dataset payload from a `DatasetMetadataForm` + source
 * imagery URL. Used by both create and build endpoints so field mapping is
 * always consistent.
 */
export const buildDatasetPayloadFromForm = (
  form: DatasetMetadataForm,
  sourceImagery: string,
  aoiIds: number[] = [],
  zoom = 20,
) => ({
  title: form.name,
  description: form.description,
  source_imagery: sourceImagery,
  zoom,
  aoi_ids: aoiIds,
  label_tasks: mapTaskTypeToLabelTasks(form.taskType),
  label_classes: buildLabelClasses(form.featureType, form.keyValues),
  keywords: form.tags.length > 0 ? form.tags : undefined,
  label_type: "vector" as LabelTypeEnum,
  geometry_type: mapGeometryType(form.geometryType),
});

// ─── Create Dataset (POST /datasets/) ─────────────────────────────────────────

export interface ICreateDatasetPayload {
  title: string;
  description: string;
  source_imagery: string;
  zoom?: number;
  label_tasks?: LabelTaskEnum[];
  label_classes?: ILabelClass[];
  keywords?: string[];
  label_type?: LabelTypeEnum;
  geometry_type?: GeometryTypeEnum;
}

export interface ICreateDatasetResponse {
  id: number;
  stac_id: string;
  title: string;
  source_imagery: string;
  build_status: string;
  stac_url: string;
  user: {
    osm_id: number;
    username: string;
  };
  star_count: number;
  is_starred: boolean;
  created_at: string;
  last_modified: string;
}

export const createDataset = async (
  payload: ICreateDatasetPayload,
): Promise<ICreateDatasetResponse> => {
  const response = await newApiClient.post<ICreateDatasetResponse>(
    API_ENDPOINTS.CREATE_DATASET,
    payload,
  );
  return response.data;
};

// ─── Edit Dataset (PATCH /datasets/{id}/) ─────────────────────────────────────

export interface IEditDatasetPayload {
  title?: string;
  description?: string;
  source_imagery?: string;
  zoom?: number;
  label_tasks?: LabelTaskEnum[];
  label_classes?: ILabelClass[];
  keywords?: string[];
  label_type?: LabelTypeEnum;
  geometry_type?: GeometryTypeEnum;
}

export interface IEditDataset {
  id: number;
  dataset: IEditDatasetPayload;
}

export const editDataset = async ({
  id,
  dataset,
}: IEditDataset): Promise<ICreateDatasetResponse> => {
  const response = await newApiClient.patch<ICreateDatasetResponse>(
    API_ENDPOINTS.EDIT_DATASET(id),
    dataset,
  );
  return response.data;
};

// ─── Build Dataset (POST /datasets/build/) ────────────────────────────────────

export interface IBuildDatasetPayload {
  title: string;
  description: string;
  source_imagery: string;
  zoom: number;
  aoi_ids: number[];
  label_tasks: LabelTaskEnum[];
  label_classes: ILabelClass[];
  keywords?: string[];
  label_type: LabelTypeEnum;
  geometry_type: GeometryTypeEnum;
}

export interface IBuildDatasetResponse {
  id: number;
  stac_id: string;
  title: string;
  source_imagery: string;
  build_status: "draft" | "processing" | "completed" | "failed";
  stac_url: string;
  user: {
    osm_id: number;
    username: string;
  };
  star_count: number;
  is_starred: boolean;
  assets: {
    chips: string;
    labels: string;
  };
  created_at: string;
  last_modified: string;
}

export const buildDataset = async (
  payload: IBuildDatasetPayload,
): Promise<IBuildDatasetResponse> => {
  const response = await newApiClient.post<IBuildDatasetResponse>(
    API_ENDPOINTS.BUILD_DATASET,
    payload,
  );
  return response.data;
};
