import {
  featureIsWithinBounds,
  handleConflation,
  showErrorToast,
  showSuccessToast,
} from "@/utils";
import { Map } from "maplibre-gl";
import { START_MAPPING_PAGE_CONTENT, TOAST_NOTIFICATIONS } from "@/constants";
import {
  BBOX,
  FeatureCollection,
  TModelDetails,
  TModelPredictionFeature,
  TModelPredictionsConfig,
  TQueryParams,
} from "@/types";
import { ToolTip } from "@/components/ui/tooltip";
import { useCallback, useEffect, useState } from "react";
import { useGetModelPredictions } from "@/features/start-mapping/hooks/use-model-predictions";
import { SEARCH_PARAMS } from "@/app/routes/start-mapping";
import { MIN_ZOOM_LEVEL_FOR_START_MAPPING_PREDICTION } from "@/config";
import { useParams } from "react-router-dom";
import { useMapStore } from "@/store/map-store";
import { Feature as GeoJSONFeature } from "geojson";

const ModelAction = ({
  map,
  query,
  modelInfo,
  tileServerURL,
  predictionModelCheckpoint,
  modelPredictions,
  setModelPredictions,
  isOfflineMode = false,
  hasDrawnAOI = false,
  openOfflinePredictionRequestDialog,
}: {
  map: Map | null;
  query: TQueryParams;
  modelInfo: TModelDetails;
  tileServerURL: string | undefined;
  predictionModelCheckpoint: string;
  modelPredictions: TModelPredictionFeature[];
  setModelPredictions: (features: TModelPredictionFeature[]) => void;
  isOfflineMode?: boolean;
  hasDrawnAOI?: boolean;
  openOfflinePredictionRequestDialog?: () => void;
}) => {
  const { modelId } = useParams();
  const [predictionZoomLevel, setPredictionZoomLevel] = useState<number | null>(
    null,
  );
  const currentZoom = useMapStore((state) => state.zoom);
  const consumePendingPredictionBBox = useMapStore(
    (state) => state.consumePendingPredictionBBox,
  );
  const setBoundaryPredictionPending = useMapStore(
    (state) => state.setBoundaryPredictionPending,
  );
  const setBoundaryPredictionEnabled = useMapStore(
    (state) => state.setBoundaryPredictionEnabled,
  );

  const getTrainingConfig = useCallback(
    (bboxOverride?: BBOX | null): TModelPredictionsConfig => {
      const activeMapBounds: BBOX = [
        map?.getBounds().getWest() ?? 0,
        map?.getBounds().getSouth() ?? 0,
        map?.getBounds().getEast() ?? 0,
        map?.getBounds().getNorth() ?? 0,
      ];

      return {
        tolerance: query[SEARCH_PARAMS.tolerance] as number,
        area_threshold: query[SEARCH_PARAMS.area] as number,
        orthogonalize: query[SEARCH_PARAMS.orthogonalize] as boolean,
        confidence: query[SEARCH_PARAMS.confidenceLevel] as number,
        checkpoint: predictionModelCheckpoint,
        ortho_max_angle_change_deg: query[
          SEARCH_PARAMS.maxAngleChange
        ] as number,
        model_id: modelId as string,
        ortho_skew_tolerance_deg: query[SEARCH_PARAMS.skewTolerance] as number,
        source: tileServerURL ?? (modelInfo?.dataset?.source_imagery as string),
        zoom_level: predictionZoomLevel ?? currentZoom,
        bbox: bboxOverride ?? activeMapBounds,
      };
    },
    [
      map,
      query,
      currentZoom,
      modelInfo,
      predictionZoomLevel,
      predictionModelCheckpoint,
      tileServerURL,
    ],
  );

  const filterFeaturesByBBox = useCallback(
    (features: FeatureCollection["features"], bbox: BBOX) =>
      features.filter((feature) =>
        featureIsWithinBounds(bbox, feature as GeoJSONFeature),
      ),
    [],
  );

  const modelPredictionMutation = useGetModelPredictions({
    mutationConfig: {
      onSuccess: (data, predictionConfig) => {
        const filteredFeatures = filterFeaturesByBBox(
          data.features,
          predictionConfig.bbox,
        );
        const constrainedPredictions: FeatureCollection = {
          ...data,
          features: filteredFeatures,
        };

        showSuccessToast(
          TOAST_NOTIFICATIONS.startMapping.modelPrediction.success,
        );
        const conflatedResults = handleConflation(
          modelPredictions,
          constrainedPredictions.features,
          predictionConfig,
        );
        setModelPredictions(conflatedResults);
      },
      onError: (error) => showErrorToast(error),
    },
  });

  const handlePrediction = useCallback(async () => {
    if (!map) return;

    const predictionBBox = consumePendingPredictionBBox();
    const config = getTrainingConfig(predictionBBox);

    setPredictionZoomLevel(currentZoom);
    await modelPredictionMutation.mutateAsync(config);
  }, [
    consumePendingPredictionBBox,
    currentZoom,
    getTrainingConfig,
    modelPredictionMutation,
    map,
  ]);

  const disableBoundaryPredictionButton =
    modelPredictionMutation.isPending ||
    tileServerURL?.length === 0 ||
    predictionModelCheckpoint?.length === 0 ||
    isOfflineMode ||
    hasDrawnAOI;

  useEffect(() => {
    setBoundaryPredictionPending(modelPredictionMutation.isPending);
    setBoundaryPredictionEnabled(!disableBoundaryPredictionButton);
  }, [
    disableBoundaryPredictionButton,
    modelPredictionMutation.isPending,
    setBoundaryPredictionEnabled,
    setBoundaryPredictionPending,
  ]);

  useEffect(
    () => () => {
      setBoundaryPredictionPending(false);
      setBoundaryPredictionEnabled(false);
    },
    [setBoundaryPredictionEnabled, setBoundaryPredictionPending],
  );

  const disablePredictionButton =
    (currentZoom < MIN_ZOOM_LEVEL_FOR_START_MAPPING_PREDICTION ||
      modelPredictionMutation.isPending ||
      tileServerURL?.length === 0 ||
      predictionModelCheckpoint?.length === 0 ||
      isOfflineMode) &&
    !hasDrawnAOI;
  return (
    <div className="flex gap-y-3 flex-col-reverse flex-wrap  md:items-center md:flex-row md:justify-between md:gap-x-2 md:flex-nowrap">
      <ToolTip
        content={
          disablePredictionButton
            ? START_MAPPING_PAGE_CONTENT.buttons.tooltip
            : null
        }
      >
        <button
          type="button"
          data-start-mapping-boundary-generate-button="true"
          disabled={disableBoundaryPredictionButton}
          onClick={handlePrediction}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
        />
        <button
          type="button"
          data-start-mapping-generate-button="true"
          data-start-mapping-predict-online={!hasDrawnAOI}
          disabled={disablePredictionButton}
          onClick={
            hasDrawnAOI ? openOfflinePredictionRequestDialog : handlePrediction
          }
          className={`w-full text-nowrap bg-primary px-3 py-3 md:py-1.5 rounded-md text-white ${disablePredictionButton ? "opacity-50" : ""}`}
        >
          <span className="capitalize text-body-4">
            {modelPredictionMutation.isPending
              ? START_MAPPING_PAGE_CONTENT.buttons.predictionInProgress
              : isOfflineMode
                ? "Request prediction"
                : START_MAPPING_PAGE_CONTENT.buttons.runPrediction}
          </span>
        </button>
      </ToolTip>
    </div>
  );
};

export default ModelAction;
