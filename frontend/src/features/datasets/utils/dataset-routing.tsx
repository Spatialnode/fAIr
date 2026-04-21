import { APPLICATION_ROUTES } from "@/constants";

export const DATASET_DRAFT_STATUS = -1;

export const isDatasetDraftStatus = (status: number | string | undefined) =>
  Number(status) === DATASET_DRAFT_STATUS;

export const getDatasetEditRoute = (datasetId: number, step: 1 | 2 = 1) =>
  `${APPLICATION_ROUTES.DATASETS}/${datasetId}/edit${
    step === 2 ? "?step=2" : ""
  }`;
