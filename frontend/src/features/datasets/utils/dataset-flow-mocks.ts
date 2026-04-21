import { INITIAL_DATASET_METADATA_FORM } from "@/features/datasets/utils/constants";
import {
  DatasetMetadataForm,
  LabelSource,
} from "@/features/datasets/types/types";
import { TBadgeVariants, TTrainingDataset } from "@/types";

export const DATASET_TAG_GROUPS = [
  ["Classification", "Rooftops", "Zinc"],
  ["Classification", "Rooftops", "Aluminium", "Sub-Saharan", "Survey"],
  ["Footprints", "Buildings", "Urban", "High-Res"],
  ["Annotation", "Validation", "QA", "Manual", "Review", "2024"],
  ["Training", "Residential", "Settlement", "Rural", "Mapping", "HOT"],
] as const;

export type TMapSwipeDummyStatus = "In progress" | "Completed";

export type TMapSwipeDummyProject = {
  id: string;
  name: string;
  status: TMapSwipeDummyStatus;
};

export type TDatasetDummyFile = {
  name: string;
  size: string;
};

export type TDatasetDummyFileVersion = {
  version: string;
  isLatest: boolean;
  files: TDatasetDummyFile[];
};

export type TDatasetDummyDetails = {
  description: string;
  tags: string[];
  taskType: string;
  geometryType: string;
  featureType: string;
  keyValues: string[];
  labelsSource: "OSM" | "MapSwipe";
  showMapSwipeIndicator: boolean;
  version: string;
  versionSecondary: string | null;
};

export type TDatasetDetailDisplay = TDatasetDummyDetails & {
  isDraft: boolean;
  isInProgress: boolean;
  isPublished: boolean;
  canUse: boolean;
  statusLabel: "Draft" | "Published" | "In progress" | "Completed";
  statusBadgeVariant: TBadgeVariants;
};

export type TDatasetFlowInitialState = {
  metadataForm: DatasetMetadataForm;
  labelSource: LabelSource;
  offset: [number, number];
};

export const DUMMY_MAPSWIPE_PROJECTS: TMapSwipeDummyProject[] = [
  {
    id: "MS28646GH",
    name: "San Jose Buildings - Rooftops - Zinc",
    status: "In progress",
  },
  {
    id: "MS87646RT",
    name: "San Jose Buildings - Rooftops - Aluminium",
    status: "Completed",
  },
];

const DATASET_FILE_ENTRIES: TDatasetDummyFile[] = [
  { name: "Labels", size: "150kb" },
  { name: "Image", size: "20mb" },
  { name: "AOI.geojson", size: "23kb" },
];

export const getDatasetDummyTags = (datasetId: number): string[] => {
  if (!Number.isFinite(datasetId)) return [];
  return [...DATASET_TAG_GROUPS[datasetId % DATASET_TAG_GROUPS.length]];
};

export const hasMapSwipeBadge = (datasetId: number): boolean => {
  if (!Number.isFinite(datasetId)) return false;
  return datasetId % 2 === 0;
};

export const getDatasetDummyDescription = () =>
  "Description Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.";

export const getDatasetDummyDetails = (
  datasetId: number,
  {
    isInProgress = false,
  }: {
    isInProgress?: boolean;
  } = {},
): TDatasetDummyDetails => {
  const tags = getDatasetDummyTags(datasetId);
  const showMapSwipeIndicator = hasMapSwipeBadge(datasetId);

  return {
    description: getDatasetDummyDescription(),
    tags,
    taskType: tags[0] ?? "Classification",
    geometryType: "Polygon",
    featureType: tags[1] ?? "Rooftops",
    keyValues: tags.slice(2),
    labelsSource: showMapSwipeIndicator ? "MapSwipe" : "OSM",
    showMapSwipeIndicator,
    version: isInProgress ? "1.0" : "5.0",
    versionSecondary: isInProgress ? "2.0" : null,
  };
};

export const getDatasetDetailDisplay = (
  dataset: Pick<TTrainingDataset, "id" | "status">,
): TDatasetDetailDisplay => {
  const isInProgress = Number(dataset.status) === 1;
  const isPublished = Number(dataset.status) === 0;
  const isDraft = Number(dataset.status) === -1;

  return {
    ...getDatasetDummyDetails(dataset.id, { isInProgress }),
    isDraft,
    isInProgress,
    isPublished,
    canUse: !isInProgress && !isDraft,
    statusLabel: isDraft
      ? "Draft"
      : isPublished
        ? "Published"
        : isInProgress
          ? "In progress"
          : "Completed",
    statusBadgeVariant: isDraft
      ? "blue"
      : isPublished
        ? "green"
        : isInProgress
          ? "yellow"
          : "blue",
  };
};

export const getDatasetDummyFileVersions = (
  dataset: Pick<TTrainingDataset, "id" | "status">,
): TDatasetDummyFileVersion[] => {
  const datasetDetail = getDatasetDetailDisplay(dataset);
  const versionCandidates = [
    datasetDetail.version,
    datasetDetail.versionSecondary,
  ]
    .filter(Boolean)
    .map((value) =>
      Math.max(1, Math.round(Number.parseFloat(value as string) || 1)),
    );

  const latestVersion = Math.max(...versionCandidates, 1);

  return Array.from({ length: latestVersion }, (_, index) => {
    const versionNumber = latestVersion - index;

    return {
      version: `${versionNumber}.0`,
      isLatest: index === 0,
      files: [...DATASET_FILE_ENTRIES],
    };
  });
};

export const getDatasetFlowInitialState = (
  dataset?: Pick<TTrainingDataset, "id" | "name" | "status" | "offset">,
): TDatasetFlowInitialState => {
  if (!dataset) {
    return {
      metadataForm: INITIAL_DATASET_METADATA_FORM,
      labelSource: "",
      offset: [0, 0],
    };
  }

  const datasetDetail = getDatasetDetailDisplay(dataset);
  const offset =
    Array.isArray(dataset.offset) && dataset.offset.length === 2
      ? ([Number(dataset.offset[0]) || 0, Number(dataset.offset[1]) || 0] as [
          number,
          number,
        ])
      : ([0, 0] as [number, number]);

  return {
    metadataForm: {
      name: dataset.name,
      description: datasetDetail.description,
      taskType: datasetDetail.taskType,
      geometryType: datasetDetail.geometryType,
      featureType: datasetDetail.featureType,
      keyValues:
        datasetDetail.keyValues.length > 0 ? datasetDetail.keyValues : [""],
      tags: datasetDetail.tags,
      tagInput: "",
    },
    labelSource: datasetDetail.labelsSource,
    offset,
  };
};
