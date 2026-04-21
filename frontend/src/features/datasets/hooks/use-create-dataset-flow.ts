import { TileServiceType } from "@/enums";
import { useMapInstance } from "@/hooks/use-map-instance";
import { useTileservice } from "@/hooks/use-tileservice";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createTrainingArea,
  createTrainingDataset,
  getTrainingAreaLabelsFromOSM,
  updateTrainingDataset,
} from "@/features/model-creation/api/create-trainings";
import { getTrainingAreas } from "@/features/model-creation/api/get-trainings";
import { getTrainingAreasQueryOptions } from "@/features/model-creation/api/factory";
import {
  getTileServerTypeFromURL,
  showErrorToast,
  showSuccessToast,
  snapGeoJSONPolygonToClosestTile,
} from "@/utils";
import {
  DATASET_DESCRIPTION_MAX_LENGTH,
  DATASET_DESCRIPTION_MIN_LENGTH,
  DATASET_NAME_MAX_LENGTH,
  DATASET_NAME_MIN_LENGTH,
  PREVIEW_TMS_LAYER_ID,
  PREVIEW_TMS_SOURCE_ID,
} from "@/features/datasets/components/create-dataset/constants";
import {
  DatasetFlowModal,
  DatasetMetadataForm,
  LabelSource,
  MapOverlayState,
} from "@/features/datasets/components/create-dataset/types";
import { geojsonToWKT } from "@terraformer/wkt";
import { Polygon } from "geojson";
import { useDatasetMetadataForm } from "./use-dataset-metadata-form";
import {
  getDatasetDetailDisplay,
  getDatasetFlowInitialState,
} from "@/features/datasets/utils/dataset-flow-mocks";
import { DATASET_DRAFT_STATUS } from "@/features/datasets/utils/dataset-routing";
import { TTrainingDataset } from "@/types";

type UseCreateDatasetFlowOptions = {
  mode: "create" | "edit";
  step: 1 | 2;
  existingDataset?: TTrainingDataset;
  prefilledMetadata?: DatasetMetadataForm;
  onStepChange: (step: 1 | 2) => void;
  onDatasetCreated: (datasetId: number, metadata: DatasetMetadataForm) => void;
};

const normalizeDatasetOffset = (offset?: number[]) => {
  if (Array.isArray(offset) && offset.length === 2) {
    const [x, y] = offset;
    return [Number(x) || 0, Number(y) || 0] as [number, number];
  }

  return [0, 0] as [number, number];
};

export const getTextFieldValidity = (
  value: string,
  minLength: number,
  maxLength: number,
) => ({
  valid: value.length >= minLength && value.length <= maxLength,
  message:
    value.length >= minLength && value.length <= maxLength
      ? ""
      : `Must be between ${minLength} and ${maxLength} characters.`,
});

export const useCreateDatasetFlow = ({
  mode,
  step,
  existingDataset,
  prefilledMetadata,
  onStepChange,
  onDatasetCreated,
}: UseCreateDatasetFlowOptions) => {
  const queryClient = useQueryClient();
  const hydratedDatasetIdRef = useRef<number | null>(null);
  const initialFlowState = useMemo(() => {
    const baseState = getDatasetFlowInitialState(existingDataset);

    if (prefilledMetadata) {
      return {
        ...baseState,
        metadataForm: prefilledMetadata,
      };
    }

    return baseState;
  }, [existingDataset, prefilledMetadata]);
  const metadataForm = useDatasetMetadataForm(initialFlowState.metadataForm);

  const [createdDatasetId, setCreatedDatasetId] = useState<number | null>(
    existingDataset?.id ?? null,
  );
  const [createdDatasetOffset, setCreatedDatasetOffset] = useState<
    [number, number]
  >(initialFlowState.offset);
  const [trainingAreasOffset, setTrainingAreasOffset] = useState<number>(0);
  const [labelSource, setLabelSource] = useState<LabelSource>(
    initialFlowState.labelSource,
  );
  const [flowModal, setFlowModal] = useState<DatasetFlowModal>(null);

  const [osmModalFeatureType, setOsmModalFeatureType] = useState("Rooftops");
  const [osmModalValues, setOsmModalValues] = useState<string[]>(["Zinc"]);
  const [osmFetched, setOsmFetched] = useState(
    initialFlowState.labelSource === "OSM",
  );

  const [mapSwipeProjectType, setMapSwipeProjectType] = useState<
    "Existing Project" | "New Project"
  >("Existing Project");
  const [mapSwipeProjectIds, setMapSwipeProjectIds] = useState<string[]>([""]);
  const [mapSwipeFetched, setMapSwipeFetched] = useState(
    initialFlowState.labelSource === "MapSwipe",
  );

  const [taskingProjectIds, setTaskingProjectIds] = useState<string[]>([""]);
  const [taskingUploaded, setTaskingUploaded] = useState(
    initialFlowState.labelSource === "Tasking Manager",
  );

  const [customUploaded, setCustomUploaded] = useState(
    initialFlowState.labelSource === "Custom",
  );
  const [tilePreviewError, setTilePreviewError] = useState("");

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

  const createDatasetMutation = useMutation({
    mutationFn: createTrainingDataset,
  });

  const updateDatasetMutation = useMutation({
    mutationFn: updateTrainingDataset,
  });

  const createAoiMutation = useMutation({
    mutationFn: createTrainingArea,
  });

  const fetchOsmLabelsMutation = useMutation({
    mutationFn: getTrainingAreaLabelsFromOSM,
  });

  const {
    data: trainingAreasData,
    isPending: trainingAreasIsPending,
    isPlaceholderData: trainingAreasIsPlaceholderData,
  } = useQuery({
    ...getTrainingAreasQueryOptions(createdDatasetId ?? 0, trainingAreasOffset),
    enabled: createdDatasetId !== null && step === 2,
    refetchInterval: 10000,
  });

  const createdAoiIds = useMemo(
    () =>
      trainingAreasData?.results.features.map((feature) => feature.id) ?? [],
    [trainingAreasData],
  );

  const hasDrawnAOI = (trainingAreasData?.count ?? 0) > 0;

  useEffect(() => {
    if (!existingDataset) return;
    if (hydratedDatasetIdRef.current === existingDataset.id) return;

    const hydratedFlowState = getDatasetFlowInitialState(existingDataset);
    const metadataToHydrate = prefilledMetadata ?? hydratedFlowState.metadataForm;
    metadataForm.resetDatasetMetadataForm(metadataToHydrate);
    metadataForm.setDatasetNameValidity(
      getTextFieldValidity(
        metadataToHydrate.name,
        DATASET_NAME_MIN_LENGTH,
        DATASET_NAME_MAX_LENGTH,
      ),
    );
    metadataForm.setDatasetDescriptionValidity(
      getTextFieldValidity(
        metadataToHydrate.description,
        DATASET_DESCRIPTION_MIN_LENGTH,
        DATASET_DESCRIPTION_MAX_LENGTH,
      ),
    );
    setCreatedDatasetId(existingDataset.id);
    setCreatedDatasetOffset(hydratedFlowState.offset);
    setLabelSource(hydratedFlowState.labelSource);
    setOsmFetched(hydratedFlowState.labelSource === "OSM");
    setMapSwipeFetched(hydratedFlowState.labelSource === "MapSwipe");
    setTaskingUploaded(hydratedFlowState.labelSource === "Tasking Manager");
    setCustomUploaded(hydratedFlowState.labelSource === "Custom");
    hydratedDatasetIdRef.current = existingDataset.id;
  }, [existingDataset, metadataForm, prefilledMetadata]);

  useEffect(() => {
    if (step !== 1 || !tileServiceTypeValidity.valid || !map || !sourceURL) {
      return;
    }

    const source = map.getSource(PREVIEW_TMS_SOURCE_ID);
    if (source) {
      map.removeLayer(PREVIEW_TMS_LAYER_ID);
      map.removeSource(PREVIEW_TMS_SOURCE_ID);
    }

    setTilePreviewLoading(true);
    setTilePreviewError("");

    try {
      if (isOpenAerialMap || tileServiceType === TileServiceType.TILEJSON) {
        map.addSource(PREVIEW_TMS_SOURCE_ID, {
          type: "raster",
          url: sourceURL,
          tileSize: 256,
        });
      } else {
        map.addSource(PREVIEW_TMS_SOURCE_ID, {
          type: "raster",
          tiles: [sourceURL],
          tileSize: 256,
        });
      }

      map.addLayer({
        id: PREVIEW_TMS_LAYER_ID,
        type: "raster",
        source: PREVIEW_TMS_SOURCE_ID,
        layout: { visibility: "visible" },
      });
    } catch {
      setTilePreviewError(
        "Unable to load the tile server. Please verify the URL and try again.",
      );
    } finally {
      setTilePreviewLoading(false);
    }

    return () => {
      if (!map?.getStyle()) return;
      if (map.getLayer(PREVIEW_TMS_LAYER_ID)) {
        map.removeLayer(PREVIEW_TMS_LAYER_ID);
      }
      if (map.getSource(PREVIEW_TMS_SOURCE_ID)) {
        map.removeSource(PREVIEW_TMS_SOURCE_ID);
      }
    };
  }, [
    map,
    sourceURL,
    step,
    tileServiceType,
    tileServiceTypeValidity.valid,
    isOpenAerialMap,
    setTilePreviewLoading,
  ]);

  useEffect(() => {
    if (!tileJSONMetadata?.bounds || !map) return;
    map.fitBounds(tileJSONMetadata.bounds);
  }, [map, tileJSONMetadata]);

  const missingStepOneRequiredFields = useMemo(() => {
    const missingFields: string[] = [];

    if (!metadataForm.hasValidDatasetName) {
      missingFields.push("Dataset Name");
    }
    if (!metadataForm.hasValidDatasetDescription) {
      missingFields.push("Dataset Description");
    }

    if (tileserverURL.trim().length === 0) {
      missingFields.push("Tile Server URL");
    } else if (!tileServiceTypeValidity.valid) {
      missingFields.push("Valid Tile Server URL");
    }

    if (metadataForm.datasetMetadataForm.taskType === "") {
      missingFields.push("Task Type");
    }
    if (metadataForm.datasetMetadataForm.geometryType === "") {
      missingFields.push("Geometry Type");
    }
    if (metadataForm.datasetMetadataForm.featureType === "") {
      missingFields.push("Feature Type");
    }
    if (
      !metadataForm.datasetMetadataForm.keyValues.some(
        (value) => value.trim().length > 0,
      )
    ) {
      missingFields.push("Key Value");
    }

    return missingFields;
  }, [
    metadataForm.hasValidDatasetName,
    metadataForm.hasValidDatasetDescription,
    metadataForm.datasetMetadataForm.taskType,
    metadataForm.datasetMetadataForm.geometryType,
    metadataForm.datasetMetadataForm.featureType,
    metadataForm.datasetMetadataForm.keyValues,
    tileServiceTypeValidity.valid,
    tileserverURL,
  ]);

  const canContinueStepOne =
    metadataForm.hasValidDatasetName &&
    metadataForm.hasValidDatasetDescription &&
    tileServiceTypeValidity.valid &&
    tileserverURL.trim().length > 0 &&
    metadataForm.datasetMetadataForm.taskType !== "" &&
    metadataForm.datasetMetadataForm.geometryType !== "" &&
    metadataForm.datasetMetadataForm.featureType !== "" &&
    metadataForm.datasetMetadataForm.keyValues.some(
      (value) => value.trim().length > 0,
    );

  const actionButtonLabel =
    labelSource === "Tasking Manager" || labelSource === "Custom"
      ? "Upload Label"
      : "Fetch Labels";

  const actionDisabled = labelSource === "" || createdDatasetId === null;

  const buildCtaLabel =
    labelSource === "Tasking Manager" ? "Continue" : "Build Dataset";

  const canBuildDataset =
    createdDatasetId !== null &&
    hasDrawnAOI &&
    ((labelSource === "OSM" && osmFetched) ||
      (labelSource === "MapSwipe" && mapSwipeFetched) ||
      (labelSource === "Tasking Manager" && taskingUploaded) ||
      (labelSource === "Custom" && customUploaded));

  const mapOverlayState = useMemo<MapOverlayState>(() => {
    return {
      showMapSwipeLabelDetails: labelSource === "MapSwipe" && mapSwipeFetched,
      showTAInfoPanel: hasDrawnAOI,
      showCustomLabelDetails: labelSource === "Custom" && customUploaded,
    };
  }, [labelSource, hasDrawnAOI, mapSwipeFetched, customUploaded]);

  const validMapSwipeIds = mapSwipeProjectIds.filter(
    (value) => value.trim().length > 0,
  );

  const validTaskingIds = taskingProjectIds.filter(
    (value) => value.trim().length > 0,
  );

  const mapSwipeIdsForPanel = validMapSwipeIds;

  const ensureDatasetSaved = async () => {
    if (createdDatasetId !== null) {
      const updatedDataset = await updateDatasetMutation.mutateAsync({
        id: createdDatasetId,
        name: metadataForm.datasetMetadataForm.name,
        source_imagery: tileserverURL,
      });
      setCreatedDatasetOffset(normalizeDatasetOffset(updatedDataset.offset));
      return createdDatasetId;
    }

    const dataset = await createDatasetMutation.mutateAsync({
      name: metadataForm.datasetMetadataForm.name,
      source_imagery: tileserverURL,
      status: DATASET_DRAFT_STATUS,
    });

    setCreatedDatasetId(dataset.id);
    setCreatedDatasetOffset(normalizeDatasetOffset(dataset.offset));
    showSuccessToast("Training dataset created.");
    return dataset.id;
  };

  const handleContinueToStepTwo = async () => {
    try {
      const isNewDataset = createdDatasetId === null;
      const datasetId = await ensureDatasetSaved();

      if (isNewDataset) {
        onDatasetCreated(datasetId, metadataForm.datasetMetadataForm);
        return;
      }

      onStepChange(2);
    } catch (error) {
      showErrorToast(error);
    }
  };

  const handleDatasetOffsetChange = useCallback(
    async (nextOffset: [number, number]) => {
      if (createdDatasetId === null) return;

      setCreatedDatasetOffset(nextOffset);

      try {
        await updateDatasetMutation.mutateAsync({
          id: createdDatasetId,
          offset: nextOffset,
        });
      } catch (error) {
        showErrorToast(error);
      }
    },
    [createdDatasetId, updateDatasetMutation],
  );

  const invalidateDatasetAOIQueries = useCallback(
    (datasetId: number) => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = String(query.queryKey[0] ?? "");
          return queryKey.startsWith(`training-areas-${datasetId}-`);
        },
      });
    },
    [queryClient],
  );

  const handleUploadAoi = useCallback(
    async (polygonGeometry: Polygon) => {
      if (createdDatasetId === null) {
        showErrorToast(
          undefined,
          "Create the dataset first before adding AOIs.",
        );
        return;
      }

      try {
        snapGeoJSONPolygonToClosestTile(polygonGeometry);
        const wkt = geojsonToWKT(polygonGeometry);
        await createAoiMutation.mutateAsync({
          dataset: String(createdDatasetId),
          geom: `SRID=4326;${wkt}`,
        });
        invalidateDatasetAOIQueries(createdDatasetId);
      } catch (error) {
        showErrorToast(error);
        throw error;
      }
    },
    [createAoiMutation, createdDatasetId, invalidateDatasetAOIQueries],
  );

  const getAllDatasetAoiIds = useCallback(async () => {
    if (createdDatasetId === null) return [] as number[];

    const aoiIds = new Set<number>();
    let currentOffset = 0;
    let hasNext = true;
    let guard = 0;

    while (hasNext && guard < 100) {
      const response = await getTrainingAreas(
        createdDatasetId,
        currentOffset,
        100,
      );
      response.results.features.forEach((feature) => aoiIds.add(feature.id));
      hasNext = Boolean(response.next);
      if (!hasNext || response.results.features.length === 0) break;
      currentOffset += response.results.features.length;
      guard += 1;
    }

    return Array.from(aoiIds);
  }, [createdDatasetId]);

  const prepareModalForLabelSource = async () => {
    if (labelSource === "") {
      showErrorToast(undefined, "Select a label source first.");
      return;
    }

    if (!hasDrawnAOI) {
      showErrorToast(
        undefined,
        "Draw or upload at least one AOI before getting labels.",
      );
      return;
    }

    try {
      if (labelSource === "OSM") {
        setFlowModal("osm");
        return;
      }

      if (labelSource === "MapSwipe") {
        setFlowModal("mapswipe");
        return;
      }

      if (labelSource === "Tasking Manager") {
        setFlowModal("tasking-manager");
        return;
      }

      if (labelSource === "Custom") {
        setFlowModal("custom");
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  const handleLabelSourceChange = useCallback((source: LabelSource) => {
    setLabelSource(source);
    setOsmFetched(false);
    setMapSwipeFetched(false);
    setTaskingUploaded(false);
    setCustomUploaded(false);
  }, []);

  const handleConfirmOsmFlow = async () => {
    if (!hasDrawnAOI) {
      showErrorToast(undefined, "Draw or upload an AOI first.");
      return;
    }

    try {
      const allAoiIds = await getAllDatasetAoiIds();
      if (allAoiIds.length === 0) {
        showErrorToast(undefined, "No AOIs found for this dataset.");
        return;
      }

      for (const aoiId of allAoiIds) {
        await fetchOsmLabelsMutation.mutateAsync({ aoiId });
      }
      setFlowModal(null);
      setOsmFetched(true);
      showSuccessToast("OSM label fetch started for all AOIs.");
    } catch (error) {
      showErrorToast(error);
    }
  };

  const handleConfirmMapSwipeFlow = useCallback(() => {
    if (
      mapSwipeProjectType === "Existing Project" &&
      validMapSwipeIds.length === 0
    ) {
      showErrorToast(undefined, "Enter at least one MapSwipe project ID.");
      return;
    }

    setFlowModal(null);
    setMapSwipeFetched(true);
    showSuccessToast(
      mapSwipeProjectType === "New Project"
        ? "MapSwipe projects created for your AOIs."
        : "MapSwipe labels attached to the AOI.",
    );
  }, [mapSwipeProjectType, validMapSwipeIds.length]);

  const handleConfirmTaskingFlow = useCallback(() => {
    if (validTaskingIds.length === 0) {
      showErrorToast(
        undefined,
        "Enter at least one Tasking Manager project ID.",
      );
      return;
    }

    setFlowModal(null);
    setTaskingUploaded(true);
    showSuccessToast("Tasking Manager data uploaded successfully.");
  }, [validTaskingIds.length]);

  const handleConfirmCustomFlow = useCallback(() => {
    setFlowModal(null);
    setCustomUploaded(true);
    showSuccessToast("Custom labels uploaded for selected AOIs.");
  }, []);

  const handleOpenBuildConfirm = useCallback(() => {
    setFlowModal("build-confirm");
  }, []);

  const handleConfirmBuildDataset = useCallback(() => {
    setFlowModal("build-success");
  }, []);

  return {
    mode,
    step,
    setStep: onStepChange,
    goToStep: onStepChange,
    map,
    mapContainerRef,

    ...metadataForm,

    tileServiceType,
    setTileServiceType,
    tileserverURL,
    setTileserverURL,
    tileServiceTypeValidity,
    setTileServiceTypeValidity,
    tilePreviewLoading,
    tilePreviewError,

    canContinueStepOne,
    continueStepOnePending:
      createDatasetMutation.isPending || updateDatasetMutation.isPending,
    handleContinueToStepTwo,
    missingStepOneRequiredFields,
    createdDatasetId,
    createdDatasetOffset,
    handleDatasetOffsetChange,
    trainingAreasData,
    trainingAreasOffset,
    setTrainingAreasOffset,
    trainingAreasIsPending,
    trainingAreasIsPlaceholderData,
    tileServiceBounds: tileJSONMetadata?.bounds,
    createdAoiIds,
    hasDrawnAOI,
    labelSource,
    flowModal,
    setFlowModal,
    handleLabelSourceChange,

    actionButtonLabel,
    actionDisabled,
    buildCtaLabel,
    canBuildDataset,
    mapOverlayState,

    osmFetched,
    osmModalFeatureType,
    setOsmModalFeatureType,
    osmModalValues,
    setOsmModalValues,

    mapSwipeFetched,
    mapSwipeProjectType,
    setMapSwipeProjectType,
    mapSwipeProjectIds,
    setMapSwipeProjectIds,
    validMapSwipeIds,
    mapSwipeIdsForPanel,

    taskingProjectIds,
    setTaskingProjectIds,
    validTaskingIds,

    handleUploadAoi,
    createAoiPending: createAoiMutation.isPending,
    fetchOsmPending: fetchOsmLabelsMutation.isPending,
    actionPending: fetchOsmLabelsMutation.isPending,

    prepareModalForLabelSource,
    handleConfirmOsmFlow,
    handleConfirmMapSwipeFlow,
    handleConfirmTaskingFlow,
    handleConfirmCustomFlow,
    handleOpenBuildConfirm,
    handleConfirmBuildDataset,
    datasetDetail: existingDataset
      ? getDatasetDetailDisplay(existingDataset)
      : null,
  };
};
