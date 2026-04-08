import {
  LabelSource,
  DatasetMetadataForm,
} from "@/features/datasets/components/create-dataset/types";

export const TASK_TYPES = ["Classification", "Segmentation", "Detection"];
export const GEOMETRY_TYPES = ["Polygon", "Rectangle"];
export const FEATURE_TYPES = ["Rooftops", "Buildings", "Roads"];
export const LABEL_SOURCES: LabelSource[] = [
  "OSM",
  "MapSwipe",
  "Tasking Manager",
  "Custom",
];

export const PREVIEW_TMS_SOURCE_ID = "preview-dataset-tms-source";
export const PREVIEW_TMS_LAYER_ID = "preview-dataset-tms-layer";

export const DATASET_NAME_MIN_LENGTH = 10;
export const DATASET_NAME_MAX_LENGTH = 40;
export const DATASET_DESCRIPTION_MIN_LENGTH = 10;
export const DATASET_DESCRIPTION_MAX_LENGTH = 500;

export const INITIAL_DATASET_METADATA_FORM: DatasetMetadataForm = {
  name: "",
  description: "",
  taskType: "",
  geometryType: "",
  featureType: "",
  keyValues: [""],
  tags: [],
  tagInput: "",
};
