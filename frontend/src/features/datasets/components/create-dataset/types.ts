export type LabelSource =
  | ""
  | "OSM"
  | "MapSwipe"
  | "Tasking Manager"
  | "Custom";

export type DatasetFlowModal =
  | null
  | "osm"
  | "mapswipe"
  | "tasking-manager"
  | "custom"
  | "build-confirm"
  | "build-success";

export type DatasetMetadataForm = {
  name: string;
  description: string;
  taskType: string;
  geometryType: string;
  featureType: string;
  keyValues: string[];
  tags: string[];
  tagInput: string;
};

export type DatasetValidityState = {
  valid: boolean;
  message: string;
};

export type MapOverlayState = {
  showMapSwipeLabelDetails: boolean;
  showTAInfoPanel: boolean;
  showCustomLabelDetails: boolean;
};
