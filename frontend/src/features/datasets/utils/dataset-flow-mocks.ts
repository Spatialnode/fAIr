export const DATASET_TAG_GROUPS = [
  ["Classification", "Rooftops", "Zinc"],
  ["Classification", "Rooftops", "Aluminium"],
  ["Footprints", "Buildings", "Urban"],
  ["Annotation", "Validation", "QA"],
  ["Training", "Residential", "Settlement"],
] as const;

export type TMapSwipeDummyStatus = "In progress" | "Completed";

export type TMapSwipeDummyProject = {
  id: string;
  name: string;
  status: TMapSwipeDummyStatus;
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

export const getDatasetDummyTags = (datasetId: number): string[] => {
  if (!Number.isFinite(datasetId)) return [];
  return [...DATASET_TAG_GROUPS[datasetId % DATASET_TAG_GROUPS.length]];
};

export const hasMapSwipeBadge = (datasetId: number): boolean => {
  if (!Number.isFinite(datasetId)) return false;
  return datasetId % 2 === 0;
};
