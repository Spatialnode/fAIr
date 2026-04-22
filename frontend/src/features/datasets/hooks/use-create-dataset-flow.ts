import { TileServiceType } from "@/enums";
import { useMapInstance } from "@/hooks/use-map-instance";
import { useTileservice } from "@/hooks/use-tileservice";
import { useEffect, useMemo, useRef, useState } from "react";
import { getTileServerTypeFromURL, showErrorToast } from "@/utils";
import {
  DatasetMetadataForm,
  MapOverlayState,
} from "@/features/datasets/types/types";
import { useDatasetMetadataForm } from "./use-dataset-metadata-form";
import { useLabelSourceState } from "./use-label-source-state";
import { useDatasetTrainingAreas } from "./use-dataset-training-areas";
import { useFlowModals } from "./use-flow-modals";
import { useTilePreview } from "./use-tile-preview";
import {
  getStepOneMissingFields,
  isStepOneComplete,
  getNameValidity,
  getDescriptionValidity,
} from "@/features/datasets/utils/validation";
import {
  getDatasetDetailDisplay,
  getDatasetFlowInitialState,
} from "@/features/datasets/utils/dataset-flow-mocks";
import { TTrainingDataset } from "@/types";

// ─── Types ───────────────────────────────────────────────────────────

type UseCreateDatasetFlowOptions = {
  mode: "create" | "edit";
  step: 1 | 2;
  existingDataset?: TTrainingDataset;
  prefilledMetadata?: DatasetMetadataForm;
  onStepChange: (step: 1 | 2) => void;
  onDatasetCreated: (datasetId: number, metadata: DatasetMetadataForm) => void;
};

// ─── Hook ────────────────────────────────────────────────────────────

export const useCreateDatasetFlow = ({
  mode,
  step,
  existingDataset,
  prefilledMetadata,
  onStepChange,
  onDatasetCreated,
}: UseCreateDatasetFlowOptions) => {
  const hydratedDatasetIdRef = useRef<number | null>(null);

  // ── Derive initial state from existing dataset ─────────────────────

  const initialFlowState = useMemo(() => {
    const baseState = getDatasetFlowInitialState(existingDataset);
    if (prefilledMetadata) {
      return { ...baseState, metadataForm: prefilledMetadata };
    }
    return baseState;
  }, [existingDataset, prefilledMetadata]);

  // ── Compose sub-hooks ──────────────────────────────────────────────

  const metadataForm = useDatasetMetadataForm(initialFlowState.metadataForm);

  const labelSourceState = useLabelSourceState(initialFlowState.labelSource);

  const { mapContainerRef, map } = useMapInstance();

  const {
    tileServiceType,
    setTileServiceType,
    tileserverURL,
    setTileserverURL,
    tileJSONMetadata,
    tileServiceTypeValidity,
    setTileServiceTypeValidity,
    isOpenAerialMap,
    sourceURL,
    loading: tilePreviewLoading,
    setLoading: setTilePreviewLoading,
  } = useTileservice(
    existingDataset
      ? getTileServerTypeFromURL(existingDataset.source_imagery)
      : TileServiceType.TMS,
    existingDataset?.source_imagery ?? "",
  );

  const [tilePreviewError, setTilePreviewError] = useState("");

  const trainingAreas = useDatasetTrainingAreas({
    initialDatasetId: existingDataset?.id ?? 42, // Temporary dataset ID to allow using the hook's logic for new datasets
    initialOffset: initialFlowState.offset,
    step,
  });

  const flowModals = useFlowModals({
    hasDrawnAOI: trainingAreas.hasDrawnAOI,
    getAllDatasetAoiIds: trainingAreas.getAllDatasetAoiIds,
    markFetched: labelSourceState.markFetched,
  });

  // ── Tile preview (map layer management) ────────────────────────────

  useTilePreview({
    map,
    sourceURL,
    step,
    tileServiceType,
    isValid: tileServiceTypeValidity.valid,
    isOpenAerialMap,
    setLoading: setTilePreviewLoading,
    setError: setTilePreviewError,
    bounds: tileJSONMetadata?.bounds,
  });

  // ──  existing dataset changes ─────────────────────

  useEffect(() => {
    if (!existingDataset) return;
    if (hydratedDatasetIdRef.current === existingDataset.id) return;

    const hydratedFlowState = getDatasetFlowInitialState(existingDataset);
    const metadataToHydrate =
      prefilledMetadata ?? hydratedFlowState.metadataForm;

    metadataForm.resetDatasetMetadataForm(metadataToHydrate);
    metadataForm.setDatasetNameValidity(
      getNameValidity(metadataToHydrate.name),
    );
    metadataForm.setDatasetDescriptionValidity(
      getDescriptionValidity(metadataToHydrate.description),
    );

    trainingAreas.setCreatedDatasetId(existingDataset.id);
    trainingAreas.setCreatedDatasetOffset(hydratedFlowState.offset);

    labelSourceState.handleLabelSourceChange(hydratedFlowState.labelSource);
    labelSourceState.resetFetchStatus(hydratedFlowState.labelSource);

    hydratedDatasetIdRef.current = existingDataset.id;
  }, [
    existingDataset,
    metadataForm,
    prefilledMetadata,
    trainingAreas,
    labelSourceState,
  ]);

  // ── Step-one validation ────────────────────────────────────────────

  const stepOneFields = useMemo(
    () => ({
      hasValidName: metadataForm.hasValidDatasetName,
      hasValidDescription: metadataForm.hasValidDatasetDescription,
      tileserverURL,
      tileServiceValid: tileServiceTypeValidity.valid,
      taskType: metadataForm.datasetMetadataForm.taskType,
      geometryType: metadataForm.datasetMetadataForm.geometryType,
      featureType: metadataForm.datasetMetadataForm.featureType,
      keyValues: metadataForm.datasetMetadataForm.keyValues,
    }),
    [
      metadataForm.hasValidDatasetName,
      metadataForm.hasValidDatasetDescription,
      metadataForm.datasetMetadataForm.taskType,
      metadataForm.datasetMetadataForm.geometryType,
      metadataForm.datasetMetadataForm.featureType,
      metadataForm.datasetMetadataForm.keyValues,
      tileServiceTypeValidity.valid,
      tileserverURL,
    ],
  );

  const missingStepOneRequiredFields = useMemo(
    () => getStepOneMissingFields(stepOneFields),
    [stepOneFields],
  );

  const canContinueStepOne = useMemo(
    () => isStepOneComplete(stepOneFields),
    [stepOneFields],
  );

  // ── Derived UI labels / flags ──────────────────────────────────────

  const { labelSource } = labelSourceState;

  const actionButtonLabel =
    labelSource === "Tasking Manager" || labelSource === "Custom"
      ? "Upload Label"
      : "Fetch Labels";

  const actionDisabled =
    labelSource === "" || trainingAreas.createdDatasetId === null;

  const buildCtaLabel =
    labelSource === "Tasking Manager" ? "Continue" : "Build Dataset";

  const canBuildDataset =
    trainingAreas.createdDatasetId !== null &&
    trainingAreas.hasDrawnAOI &&
    labelSourceState.isFetched;

  const mapOverlayState = useMemo<MapOverlayState>(
    () => ({
      showMapSwipeLabelDetails:
        labelSource === "MapSwipe" && labelSourceState.mapSwipeFetched,
      showTAInfoPanel: trainingAreas.hasDrawnAOI,
      showCustomLabelDetails:
        labelSource === "Custom" && labelSourceState.customUploaded,
    }),
    [
      labelSource,
      trainingAreas.hasDrawnAOI,
      labelSourceState.mapSwipeFetched,
      labelSourceState.customUploaded,
    ],
  );

  // ── Step transition handler ────────────────────────────────────────

  const handleContinueToStepTwo = async () => {
    // Temporary bypass: skip dataset create/update API calls in create mode
    // so we can still access step two while authentication is unavailable.
    if (mode === "create") {
      onStepChange(2);
      return;
    }

    try {
      const isNewDataset = trainingAreas.createdDatasetId === null;
      const datasetId = await trainingAreas.ensureDatasetSaved(
        metadataForm.datasetMetadataForm.name,
        tileserverURL,
      );

      if (isNewDataset) {
        onDatasetCreated(datasetId, metadataForm.datasetMetadataForm);
        return;
      }

      onStepChange(2);
    } catch (error) {
      showErrorToast(error);
    }
  };

  // ── Public API ─────────────────────────────────────────────────────

  return {
    mode,
    step,
    setStep: onStepChange,
    goToStep: onStepChange,
    map,
    mapContainerRef,

    ...metadataForm,

    // Tile service
    tileServiceType,
    setTileServiceType,
    tileserverURL,
    setTileserverURL,
    tileServiceTypeValidity,
    setTileServiceTypeValidity,
    tilePreviewLoading,
    tilePreviewError,

    // Step-one
    canContinueStepOne,
    continueStepOnePending: trainingAreas.datasetSavePending,
    handleContinueToStepTwo,
    missingStepOneRequiredFields,

    // Training areas & AOI
    createdDatasetId: trainingAreas.createdDatasetId,
    createdDatasetOffset: trainingAreas.createdDatasetOffset,
    handleDatasetOffsetChange: trainingAreas.handleDatasetOffsetChange,
    trainingAreasData: trainingAreas.trainingAreasData,
    trainingAreasOffset: trainingAreas.trainingAreasOffset,
    setTrainingAreasOffset: trainingAreas.setTrainingAreasOffset,
    trainingAreasIsPending: trainingAreas.trainingAreasIsPending,
    trainingAreasIsPlaceholderData:
      trainingAreas.trainingAreasIsPlaceholderData,
    tileServiceBounds: tileJSONMetadata?.bounds,
    createdAoiIds: trainingAreas.createdAoiIds,
    hasDrawnAOI: trainingAreas.hasDrawnAOI,
    handleUploadAoi: trainingAreas.handleUploadAoi,
    createAoiPending: trainingAreas.createAoiPending,

    // Label source
    labelSource: labelSourceState.labelSource,
    handleLabelSourceChange: labelSourceState.handleLabelSourceChange,
    osmFetched: labelSourceState.osmFetched,
    mapSwipeFetched: labelSourceState.mapSwipeFetched,

    // UI labels / flags
    actionButtonLabel,
    actionDisabled,
    buildCtaLabel,
    canBuildDataset,
    mapOverlayState,

    // Flow modals (spread for backward compat)
    ...flowModals,

    // Misc
    datasetDetail: existingDataset
      ? getDatasetDetailDisplay(existingDataset)
      : null,

    // Prepare modal (needs labelSource from this scope)
    prepareModalForLabelSource: () =>
      flowModals.prepareModalForLabelSource(labelSourceState.labelSource),
  };
};
