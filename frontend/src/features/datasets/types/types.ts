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
  | "create-mapswipe"
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

export type MapswipeLocateProjectForm = {
  projectTopic: string;
  projectRegion: string;
  projectDescription: string;
  instruction: string;
  lookFor: string;
  tutorial: string;
  imageryCredits: string;
  minZoom: string;
  verificationNumber: string;
  groupSize: string;
  maxTasksPerUser: string;
  zoomLevel: string;
  subGridSize: string;
  coverImageName: string;
};

export type UseMapswipeLocateProjectFormModelArgs = {
  datasetName: string;
  datasetDescription: string;
  featureType: string;
  keyValues: string[];
};
