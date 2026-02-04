import useScreenSize from "@/hooks/use-screen-size";
import {
  APPLICATION_ROUTES,
  START_MAPPING_PAGE_CONTENT,
  TOAST_NOTIFICATIONS,
} from "@/constants";
import {
  DrawControl,
  FitToBounds,
  LayerControl,
  ZoomLevel,
} from "@/components/map";
import { Head } from "@/components/seo";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMapInstance } from "@/hooks/use-map-instance";
import { useModelDetails } from "@/features/models/hooks/use-models";
import { useNavigate, useParams } from "react-router-dom";
import { UserProfile } from "@/components/layouts";
import { Feature } from "@/types";
import {
  BrandLogoWithDropDown,
  Legend,
  StartMappingHeader,
  StartMappingMapComponent,
  StartMappingMobileDrawer,
} from "@/features/start-mapping/components";
import FileUploadDialog from "@/components/shared/modals/file-upload-dialog";
import {
  constructModelCheckpointPath,
  featureIsWithinBounds,
  geoJSONDowloader,
  openInJOSM,
  showSuccessToast,
  showWarningToast,
  uuid4,
} from "@/utils";
import {
  parseAsBoolean,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";
import {
  MapMode,
  PredictedFeatureStatus,
  PredictionImagerySource,
  PredictionModel,
} from "@/enums/start-mapping";
import { Dialog } from "@/components/ui/dialog";
import { ImagerySourceSelector } from "@/features/start-mapping/components/replicable-models/imagery-source-selector";
import { useDialog } from "@/hooks/use-dialog";
import { useModelPredictionStore } from "@/store/model-prediction-store";
import { ModelSelector } from "@/features/start-mapping/components/replicable-models/model-selector";
import {
  BASE_MODELS,
  DrawingModes,
  TileServiceType,
  ToolTipPlacement,
} from "@/enums";
import { useTileservice } from "@/hooks/use-tileservice";
import {
  ALL_MODEL_PREDICTIONS_FILL_LAYER_ID,
  ALL_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
  FAIR_BASE_MODELS_PATH,
  OPENAERIALMAP_MOSAIC_TILES_URL,
} from "@/config";
import { OfflinePredictionRequestDialog } from "@/features/start-mapping/components/dialogs/offline-prediction-request-dialog";
import { GeoJSONStoreFeatures } from "terra-draw";
import { FileUploadIcon } from "@/components/ui/icons";
import { ToolTip } from "@/components/ui/tooltip";

export type TDownloadOptions = {
  name: string;
  value: string;
  onClick: () => void;
  showOnMobile: boolean;
}[];

export const SEARCH_PARAMS = {
  orthogonalize: "orthogonalize",
  confidenceLevel: "confidenceLevel",
  tolerance: "tolerance",
  area: "area",
  model: "model",
  imagery: "imagery",
  predictionModelCheckpoint: "checkpoint",
  tileserver: "tileserver",
  mode: "mode",
  skewTolerance: "ortho_skew_tolerance_deg",
  maxAngleChange: "ortho_max_angle_change_deg",
};

export type TQueryParams = {
  [x: string]: string | number | boolean | undefined;
};

const defaultQuery = {
  [SEARCH_PARAMS.orthogonalize]: true,
  [SEARCH_PARAMS.confidenceLevel]: 50,
  [SEARCH_PARAMS.tolerance]: 0.3,
  [SEARCH_PARAMS.area]: 3,
  [SEARCH_PARAMS.skewTolerance]: 15,
  [SEARCH_PARAMS.maxAngleChange]: 15,
};

export const StartMappingPage = () => {
  const { modelId } = useParams();
  const { map, mapContainerRef, setDrawingMode, terraDraw } = useMapInstance(
    false,
    true,
  );

  const { isSmallViewport } = useScreenSize();

  const {
    features: modelPredictions,
    setFeatures: setModelPredictions,
    updateFeatureStatus,
  } = useModelPredictionStore();

  const [offlinePredictionAOI, setOfflinePredictionAOI] =
    useState<Feature | null>(null);

  const acceptedFeatures = useMemo(
    () =>
      modelPredictions.filter(
        (f) => f.properties.status === PredictedFeatureStatus.ACCEPTED,
      ),
    [modelPredictions],
  );

  const navigate = useNavigate();

  const [openMobileDrawer, setOpenMobileDrawer] =
    useState<boolean>(isSmallViewport);

  useEffect(() => {
    setOpenMobileDrawer(isSmallViewport);
  }, [isSmallViewport]);

  const [query, setQuery] = useQueryStates({
    [SEARCH_PARAMS.orthogonalize]: parseAsBoolean.withDefault(
      defaultQuery[SEARCH_PARAMS.orthogonalize] as boolean,
    ),
    [SEARCH_PARAMS.confidenceLevel]: parseAsInteger.withDefault(
      defaultQuery[SEARCH_PARAMS.confidenceLevel] as number,
    ),
    [SEARCH_PARAMS.tolerance]: parseAsFloat.withDefault(
      defaultQuery[SEARCH_PARAMS.tolerance] as number,
    ),
    [SEARCH_PARAMS.area]: parseAsInteger.withDefault(
      defaultQuery[SEARCH_PARAMS.area] as number,
    ),
    [SEARCH_PARAMS.skewTolerance]: parseAsInteger.withDefault(
      defaultQuery[SEARCH_PARAMS.skewTolerance] as number,
    ),
    [SEARCH_PARAMS.maxAngleChange]: parseAsInteger.withDefault(
      defaultQuery[SEARCH_PARAMS.maxAngleChange] as number,
    ),
    [SEARCH_PARAMS.model]: parseAsString.withDefault(PredictionModel.DEFAULT),
    [SEARCH_PARAMS.tileserver]: parseAsString.withDefault(""),
    [SEARCH_PARAMS.mode]: parseAsString.withDefault(MapMode.ONLINE),
    [SEARCH_PARAMS.imagery]: parseAsString.withDefault(""),
    [SEARCH_PARAMS.predictionModelCheckpoint]: parseAsString.withDefault(""),
  });


  const updateQuery = useCallback(
    (patch: Partial<typeof query>) => {
      setQuery(patch);
    },
    [setQuery],
  );

  const currentMode = query[SEARCH_PARAMS.mode];
  const customPredictionModelCheckpointPath =
    query[SEARCH_PARAMS.predictionModelCheckpoint];
  const imagery = query[SEARCH_PARAMS.imagery];
  const customTileServerURL = query[SEARCH_PARAMS.tileserver];
  const predictionModel = query[SEARCH_PARAMS.model];
  const predictionModelCheckpoint = query[SEARCH_PARAMS.predictionModelCheckpoint];

  const predictionImagerySource = useMemo(() => {
    if (imagery) {
      return imagery as PredictionImagerySource;
    }

    if (customTileServerURL) {
      return PredictionImagerySource.CustomImagery;
    }

    return PredictionImagerySource.ModelDefault;
  }, [imagery, customTileServerURL]);
  
  const setPredictionImagerySource = (newValue: PredictionImagerySource) => {
    updateQuery({ [SEARCH_PARAMS.imagery]: newValue });
  };

  const setPredictionModelCheckpoint = (newValue: string) => {
    updateQuery({ [SEARCH_PARAMS.predictionModelCheckpoint]: newValue });
  };

  const setCustomPredictionModelCheckpointPath = (newValue: string) => {
    updateQuery({ [SEARCH_PARAMS.predictionModelCheckpoint]: newValue });
  };

  const setPredictionModel = (newValue: string) => {
    updateQuery({ [SEARCH_PARAMS.model]: newValue });
  };

  const { openDialog, isOpened, closeDialog } = useDialog();
  const {
    openDialog: openModelSelectionDialog,
    isOpened: isModelSelectionDialogOpened,
    closeDialog: closeModelSelectionDialog,
  } = useDialog();

  const {
    openDialog: openOfflinePredictionRequestDialog,
    isOpened: isOfflinePredictionRequestDialogOpened,
    closeDialog: closeOfflinePredictionDialog,
  } = useDialog();

  const {
    openDialog: openFileUploadDialog,
    isOpened: isFileUploadDialogOpened,
    closeDialog: closeFileUploadDialog,
  } = useDialog();
  const {
    isError,
    isPending: modelInfoRequestIspending,
    data: modelInfo,
    error,
  } = useModelDetails(modelId as string, !!modelId);

  const {
    tileServiceType,
    setTileServiceType,
    tileserverURL,
    setTileserverURL,
    tileServiceTypeValidity,
    setTileServiceTypeValidity,
    loading,
    tileJSONMetadata,
  } = useTileservice(TileServiceType.XYZ, customTileServerURL as string);


   /**
   * Update the default model checkpoint.
   */
  useEffect(() => {
    if (!modelInfo||predictionModelCheckpoint) return;

    if (!predictionModel || predictionModel === PredictionModel.DEFAULT) {
      setPredictionModelCheckpoint(constructModelCheckpointPath(modelInfo));
      return;
    }

  }, [predictionModel, modelInfo,predictionModelCheckpoint]);

  

  /**
   * Update the tileserver.
   */
  useEffect(() => {
    if (
      modelInfo?.dataset?.source_imagery &&
      predictionImagerySource === PredictionImagerySource.ModelDefault
    ) {
    setTileserverURL(modelInfo.dataset.source_imagery);
      
    }else if (predictionImagerySource === PredictionImagerySource.Kontour) {
      setTileserverURL(OPENAERIALMAP_MOSAIC_TILES_URL);
    }else{
      // setTileserverURL(customTileServerURL as string)
      updateQuery({[SEARCH_PARAMS.tileserver]:customTileServerURL})
    }
  }, [modelInfo?.dataset?.source_imagery, predictionImagerySource,customTileServerURL]);

  /**
   * Navigate to the not found page if there is an error
   * while fetching the model info.
   */
  useEffect(() => {
    if (isError) {
      navigate(APPLICATION_ROUTES.NOTFOUND, {
        state: {
          from: window.location.pathname,
          // @ts-expect-error: might not be typed
          error: error?.response?.data?.detail,
        },
      });
    }
  }, [isError, error, navigate]);

  /**
   * Set the drawing mode based on the current mode.
   * If the current mode is OFFLINE, set the drawing mode to POLYGON.
   * If the current mode is ONLINE, set the drawing mode to STATIC.
   */
  useEffect(() => {
    if (currentMode === MapMode.OFFLINE) {
      setDrawingMode(DrawingModes.POLYGON);
    } else {
      setDrawingMode(DrawingModes.STATIC);
    }
  }, [currentMode, setDrawingMode]);

  /**
   * Check if the user has drawn an AOI in offline mode.
   */
  const hasDrawnAOI = useMemo(() => {
    return offlinePredictionAOI !== null;
  }, [currentMode, offlinePredictionAOI]);

  /**
   * Check if the offline prediction AOI is valid.
   */
  const isOfflineMode = useMemo(
    () => currentMode === MapMode.OFFLINE,
    [currentMode],
  );

  /**
   * Handle the finish event of the TerraDraw instance.
   * It checks if the drawn feature is within the bounds of the OAM imagery if it exists.
   * If the feature is valid, it sets the offline prediction AOI state.
   * If there are multiple features drawn, it removes all but the first one.
   */
  const handleDrawFinish = useCallback(
    (feature?: Feature) => {
      if (!terraDraw) return;

      let features: Feature[] = [];

      if (feature) {
        // If a geometry is provided, wrap it as a Feature
        features = [feature];
      } else {
        // Otherwise, get features from terraDraw
        features = terraDraw.getSnapshot();
      }

      if (!features || features.length === 0) return;

      // Check if the feature is within the bounds of the OAM imagery if it exists
      if (tileJSONMetadata?.bounds) {
        if (!featureIsWithinBounds(tileJSONMetadata.bounds, features[0])) {
          showWarningToast(
            "The drawn polygon extends beyond the imagery bounds. Please ensure the polygon AOI is within the imagery bounds.",
          );
          if (!feature && terraDraw) {
            terraDraw.removeFeatures(
              features
                .slice(0)
                .map((f) => f.id)
                .filter((id): id is string | number => id !== undefined),
            );
          }
          return;
        }
      }
      if (features.length > 1) {
        showWarningToast(
          "Only one polygon can be drawn at a time. Please delete the existing polygon before drawing a new one.",
        );
        // Remove the last drawn feature, keeping only the first one
        if (!feature && terraDraw) {
          terraDraw.removeFeatures(
            features
              .slice(1)
              .map((f) => f.id)
              .filter((id): id is string | number => id !== undefined),
          );
        }
        return;
      }
      // If a feature is provided, add it to the TerraDraw instance
      if (feature) {
        terraDraw.addFeatures([features[0]] as GeoJSONStoreFeatures[]);
      }
      setOfflinePredictionAOI(features[0]);
      showSuccessToast("AOI drawn successfully.");
    },
    [terraDraw, tileJSONMetadata],
  );

  /**
   * Effect to handle the completion of drawing in TerraDraw.
   * It listens for changes in the TerraDraw instance and updates the drawn feature state.
   * If a feature is drawn, it clears previous features except the last one.
   */
  useEffect(() => {
    if (!terraDraw) return;

    const onFinish = () => {
      handleDrawFinish();
    };

    terraDraw.on("finish", onFinish);

    return () => {
      terraDraw.off("finish", onFinish);
    };
  }, [terraDraw, handleDrawFinish]);

  /**
   * Effect to set the current mode to OFFLINE if an AOI has been drawn.
   * This is to ensure that the user can start prediction requests after drawing an AOI.
   */
  useEffect(() => {
    if (hasDrawnAOI && currentMode !== MapMode.OFFLINE) {
      updateQuery({
        [SEARCH_PARAMS.mode]: MapMode.OFFLINE,
      });
    }
  }, [hasDrawnAOI, currentMode, updateQuery]);
  /**
   * Handle the drawing state change.
   * If the user starts drawing, set the current mode to OFFLINE.
   * If the user stops drawing, set the current mode to ONLINE and reset the drawing mode to STATIC.
   */
  const handleDrawingStateChange = useCallback(
    (isDrawing: boolean) => {
      if (isDrawing && currentMode !== MapMode.OFFLINE) {
        updateQuery({
          [SEARCH_PARAMS.mode]: MapMode.OFFLINE,
        });
      } else if (!isDrawing && currentMode !== MapMode.ONLINE) {
        updateQuery({
          [SEARCH_PARAMS.mode]: MapMode.ONLINE,
        });
        setDrawingMode(DrawingModes.STATIC);
      }
    },
    [updateQuery, setDrawingMode, currentMode],
  );

  useEffect(() => {
  if (!modelInfo) return 
    if (!query[SEARCH_PARAMS.imagery] && modelInfo?.dataset?.source_imagery) {
      updateQuery({
        [SEARCH_PARAMS.imagery]: PredictionImagerySource.ModelDefault,
      });
    }
  }, [query, modelInfo, updateQuery]);

  

  /**
   * Check if the model predictions exist.
   */
  const modelPredictionsExist = useMemo(() => {
    if (!modelPredictions) return false;
    return modelPredictions.length > 0;
  }, [modelPredictions]);

  const mapLayers = useMemo(
    () => [
      ...(modelPredictions.length > 0
        ? [
            {
              value:
                START_MAPPING_PAGE_CONTENT.map.controls.legendControl
                  .predictionResults,
              subLayers: [
                ALL_MODEL_PREDICTIONS_FILL_LAYER_ID,
                ALL_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
              ],
            },
          ]
        : []),
    ],
    [modelPredictions],
  );

  const handleAllFeaturesDownload = useCallback(async () => {
    geoJSONDowloader(
      {
        type: "FeatureCollection",
        features: modelPredictions,
      },
      `all_predictions_${modelInfo.dataset.id}`,
    );
    showSuccessToast(TOAST_NOTIFICATIONS.startMapping.fileDownloadSuccess);
  }, [modelPredictions, modelInfo]);

  /**
   * Handle the deletion of the AOI.
   * It clears the TerraDraw instance and sets the offline prediction AOI state to null.
   * It also shows a success toast message.
   */
  const handleAOIDelete = useCallback(() => {
    if (!terraDraw) return;
    terraDraw.clear();
    setOfflinePredictionAOI(null);
    showSuccessToast("AOI cleared successfully.");
  }, [terraDraw]);

  /**
   * Reset the offline prediction mode state.
   * It sets the drawing mode to STATIC, clears the TerraDraw instance,
   * and sets the current mode to ONLINE.
   */
  const resetOfflinePredictionModeState = useCallback(() => {
    setDrawingMode(DrawingModes.STATIC);
    setOfflinePredictionAOI(null);
    terraDraw?.clear();
    updateQuery({
      [SEARCH_PARAMS.mode]: MapMode.ONLINE,
    });
  }, [setDrawingMode, updateQuery, terraDraw]);

  /**
   * Handle the download of accepted features.
   * It creates a GeoJSON file with the accepted features and triggers a download.
   * It also shows a success toast message.
   */
  const handleAcceptedFeaturesDownload = useCallback(async () => {
    geoJSONDowloader(
      { type: "FeatureCollection", features: acceptedFeatures },
      `accepted_predictions_${modelInfo.dataset.id}`,
    );
    showSuccessToast(TOAST_NOTIFICATIONS.startMapping.fileDownloadSuccess);
  }, [acceptedFeatures, modelInfo]);

  /**
   * Handle the download of features to JOSM.
   * It opens the features in JOSM with the provided dataset name and source imagery.
   */
  const handleFeaturesDownloadToJOSM = useCallback(
    (features: Feature[]) => {
      if (!map || !modelInfo?.dataset) return;
      openInJOSM(
        modelInfo.dataset.name,
        modelInfo.dataset.source_imagery,
        features,
        true,
      );
    },
    [map, modelInfo],
  );

  /**
   * Handle the download of all features to JOSM.
   * It calls the handleFeaturesDownloadToJOSM function with the model predictions.
   */
  const handleAllFeaturesDownloadToJOSM = useCallback(() => {
    handleFeaturesDownloadToJOSM(modelPredictions);
  }, [handleFeaturesDownloadToJOSM, modelPredictions]);

  /**
   * Handle the download of accepted features to JOSM.
   * It calls the handleFeaturesDownloadToJOSM function with the accepted features.
   */
  const handleAcceptedFeaturesDownloadToJOSM = useCallback(() => {
    handleFeaturesDownloadToJOSM(acceptedFeatures);
  }, [handleFeaturesDownloadToJOSM, acceptedFeatures]);

  const downloadOptions: TDownloadOptions = [
    {
      name: START_MAPPING_PAGE_CONTENT.buttons.download.options.allFeatures(
        isSmallViewport ? "All" : "Download all",
      ),
      value: START_MAPPING_PAGE_CONTENT.buttons.download.options.allFeatures(
        isSmallViewport ? "All" : "Download all",
      ),
      onClick: handleAllFeaturesDownload,
      showOnMobile: true,
    },
    {
      name: START_MAPPING_PAGE_CONTENT.buttons.download.options.acceptedFeatures(
        isSmallViewport ? "Accepted" : "Download accepted",
      ),
      value:
        START_MAPPING_PAGE_CONTENT.buttons.download.options.acceptedFeatures(
          isSmallViewport ? "Accepted" : "Download accepted",
        ),
      onClick: handleAcceptedFeaturesDownload,
      showOnMobile: true,
    },
    {
      name: START_MAPPING_PAGE_CONTENT.buttons.download.options
        .openAllFeaturesInJOSM,
      value:
        START_MAPPING_PAGE_CONTENT.buttons.download.options
          .openAllFeaturesInJOSM,
      onClick: handleAllFeaturesDownloadToJOSM,
      showOnMobile: false,
    },
    {
      name: START_MAPPING_PAGE_CONTENT.buttons.download.options
        .openAcceptedFeaturesInJOSM,
      value:
        START_MAPPING_PAGE_CONTENT.buttons.download.options
          .openAcceptedFeaturesInJOSM,
      onClick: handleAcceptedFeaturesDownloadToJOSM,
      showOnMobile: false,
    },
  ];

  /**
   * Handle the opening of the prediction imagery dialog.
   * It closes the mobile drawer to prevent focus trapping issues with vaul.
   */
  const handlePredictionImageryDialogOpen = useCallback(() => {
    /**
     * Close the mobile drawer when the prediction imagery dialog is opened to prevent focus trapping issues with vaul.
     */
    setOpenMobileDrawer(false);
    openDialog();
  }, [openDialog, setOpenMobileDrawer]);

  /**
   * Handle the closing of the prediction imagery dialog.
   * It reopens the mobile drawer to allow the user to interact with it again.
   */
  const handlePredictionImageryDialogClose = useCallback(() => {
    setOpenMobileDrawer(true);
    closeDialog();
  }, [closeDialog, setOpenMobileDrawer]);

  /**
   * Handle the opening of the prediction model dialog.
   * It closes the mobile drawer to prevent focus trapping issues with vaul.
   */
  const handlePredictionModelDialogOpen = useCallback(() => {
    /**
     * Close the mobile drawer when the model selection dialog is opened to prevent focus trapping issues with vaul.
     */
    setOpenMobileDrawer(false);
    openModelSelectionDialog();
  }, [openModelSelectionDialog, setOpenMobileDrawer]);

  /**
   * Handle the closing of the prediction model dialog.
   * It reopens the mobile drawer to allow the user to interact with it again.
   */
  const handlePredictionModelDialogClose = useCallback(() => {
    setOpenMobileDrawer(true);
    closeModelSelectionDialog();
  }, [closeModelSelectionDialog, setOpenMobileDrawer]);

  /**
   * Handle the opening of the offline prediction request dialog.
   * It closes the mobile drawer to prevent focus trapping issues with vaul.
   */
  const handleOfflinePredictionRequestDialogOpen = useCallback(() => {
    /**
     * Close the mobile drawer when the model selection dialog is opened to prevent focus trapping issues with vaul.
     */
    setOpenMobileDrawer(false);
    openOfflinePredictionRequestDialog();
  }, [openOfflinePredictionRequestDialog, setOpenMobileDrawer]);

  /**
   * Handle the closing of the offline prediction request form dialog.
   * It reopens the mobile drawer to allow the user to interact with it again.
   */
  const handleOfflinePredictionRequestDialogClose = useCallback(() => {
    setOpenMobileDrawer(true);
    closeOfflinePredictionDialog();
  }, [closeOfflinePredictionDialog, setOpenMobileDrawer]);

  return (
    <>
      <Head title={START_MAPPING_PAGE_CONTENT.pageTitle(modelInfo?.name)} />
      <FileUploadDialog
        isOpened={isFileUploadDialogOpened}
        closeDialog={closeFileUploadDialog}
        label="Upload Polygon AOI"
        additionalInstruction={
          "Ensure the GeoJSON file contains only a single polygon to define your area of interest (AOI)."
        }
        fileUploadHandler={async (polygon) => {
          handleDrawFinish({
            type: "Feature",
            geometry: polygon,
            id: uuid4(),
            properties: {
              mode: DrawingModes.POLYGON,
            },
          });
          await new Promise((resolve) => setTimeout(resolve, 200)); // Simulate a delay
          closeFileUploadDialog();
        }}
        disabled={false}
        maxFiles={1}
        buttonText="Add to Map"
      />
      <OfflinePredictionRequestDialog
        onClose={handleOfflinePredictionRequestDialogClose}
        isOpen={isOfflinePredictionRequestDialogOpened}
        query={query}
        updateQuery={updateQuery}
        drawnAOI={offlinePredictionAOI}
        modelInfo={modelInfo}
        predictionModelCheckpoint={predictionModelCheckpoint as string}
        tileServerURL={tileserverURL}
        resetOfflinePredictionModeState={resetOfflinePredictionModeState}
        predictionImagerySource={predictionImagerySource}
        predictionModel={predictionModel as string}
      />
      <div className="h-screen flex flex-col fullscreen">
        {/* Base model dialog */}
        <Dialog
          label="Model"
          isOpened={isModelSelectionDialogOpened}
          closeDialog={handlePredictionModelDialogClose}
        >
          {modelInfo && (
            <ModelSelector
              modelInfo={modelInfo}
              predictionModel={predictionModel as string}
              setPredictionModel={setPredictionModel}
              predictionModelCheckpoint={predictionModelCheckpoint as string}
                 // @ts-expect-error bad type definition
              setPredictionModelCheckpoint={setPredictionModelCheckpoint}
              customPredictionModelCheckpointPath={
                customPredictionModelCheckpointPath as string
              }
              // @ts-expect-error bad type definition
              setCustomPredictionModelCheckpointPath={
                setCustomPredictionModelCheckpointPath
              }
              defaultPredictionModel={modelInfo?.name}
              isMobile
            />
          )}
        </Dialog>
        {/* Prediction Imagery Dialog */}
        <Dialog
          label="Prediction imagery"
          isOpened={isOpened}
          closeDialog={handlePredictionImageryDialogClose}
        >
          <ImagerySourceSelector
            predictionImagerySource={predictionImagerySource}
            setPredictionImagerySource={setPredictionImagerySource}
            modelDefaultImageryURL={modelInfo?.dataset?.source_imagery}
            isMobile
            onDropdownHide={handlePredictionImageryDialogClose}
            setTileServiceType={setTileServiceType}
            setTileserverURL={setTileserverURL}
            tileServiceTypeValidity={tileServiceTypeValidity}
            setTileServiceTypeValidity={setTileServiceTypeValidity}
            loading={loading}
            tileServerURL={tileserverURL}
            tileServiceType={tileServiceType}
          />
        </Dialog>
        {openMobileDrawer && (
          <StartMappingMobileDrawer
            isOpen={openMobileDrawer}
            map={map}
            downloadOptions={downloadOptions}
            query={query}
            updateQuery={updateQuery}
            modelInfo={modelInfo}
            modelInfoRequestIsPending={modelInfoRequestIspending}
            modelInfoRequestIsError={isError}
            predictionImagerySource={predictionImagerySource}
            setPredictionImagerySource={setPredictionImagerySource}
            modelDefaultImageryURL={modelInfo?.dataset?.source_imagery}
            openMobileDialog={handlePredictionImageryDialogOpen}
            predictionModel={predictionModel as string}
            setPredictionModel={setPredictionModel}
            predictionModelCheckpoint={predictionModelCheckpoint as string}
               // @ts-expect-error bad type definition
            setPredictionModelCheckpoint={setPredictionModelCheckpoint}
            customPredictionModelCheckpointPath={
              customPredictionModelCheckpointPath as string
            }
            // @ts-expect-error bad type definition
            setCustomPredictionModelCheckpointPath={
              setCustomPredictionModelCheckpointPath
            }
            openModelSelectionDialog={handlePredictionModelDialogOpen}
            setTileServiceType={setTileServiceType}
            setTileserverURL={setTileserverURL}
            tileServiceTypeValidity={tileServiceTypeValidity}
            setTileServiceTypeValidity={setTileServiceTypeValidity}
            loading={loading}
            tileServerURL={tileserverURL}
            tileServiceType={tileServiceType}
            modelPredictions={modelPredictions}
            setModelPredictions={setModelPredictions}
            isSmallViewport={isSmallViewport}
            isOfflineMode={isOfflineMode}
            hasDrawnAOI={hasDrawnAOI}
            openOfflinePredictionRequestDialog={
              handleOfflinePredictionRequestDialogOpen
            }
          />
        )}
        {/* Mobile bottom sheet */}

        <div className="sticky top-0 bg-white z-10 px-4 xl:px-large py-1 hidden md:block">
          {/* Web Header */}
          <StartMappingHeader
            modelInfo={modelInfo}
            modelInfoRequestIsPending={modelInfoRequestIspending}
            modelPredictionsExist={modelPredictionsExist}
            modelInfoRequestIsError={isError}
            query={query}
            updateQuery={updateQuery}
            map={map}
            downloadOptions={downloadOptions}
            predictionImagerySource={predictionImagerySource}
            setPredictionImagerySource={setPredictionImagerySource}
            modelDefaultImageryURL={modelInfo?.dataset?.source_imagery}
            predictionModel={predictionModel as string}
            setPredictionModel={setPredictionModel}
            predictionModelCheckpoint={predictionModelCheckpoint as string}
               // @ts-expect-error bad type definition
            setPredictionModelCheckpoint={setPredictionModelCheckpoint}
            customPredictionModelCheckpointPath={
              customPredictionModelCheckpointPath as string
            }
            // @ts-expect-error bad type definition
            setCustomPredictionModelCheckpointPath={
              setCustomPredictionModelCheckpointPath
            }
            setTileServiceType={setTileServiceType}
            setTileserverURL={setTileserverURL}
            tileServiceTypeValidity={tileServiceTypeValidity}
            setTileServiceTypeValidity={setTileServiceTypeValidity}
            loading={loading}
            tileServerURL={tileserverURL}
            tileServiceType={tileServiceType}
            modelPredictions={modelPredictions}
            setModelPredictions={setModelPredictions}
            isSmallViewport={isSmallViewport}
            isOfflineMode={isOfflineMode}
            hasDrawnAOI={hasDrawnAOI}
            openOfflinePredictionRequestDialog={
              handleOfflinePredictionRequestDialogOpen
            }
          />
        </div>
        <div className="col-span-12 h-[70vh] md:h-full md:border-8 md:border-off-white flex-grow relative map-elements-z-index">
          {/* Mobile Header and Map Controls */}
          <div className="md:hidden">
            <div className="absolute top-4 right-4  z-[10]">
              <UserProfile hideFullName />
            </div>
            <div className="absolute top-4 left-4  z-[10]">
              <BrandLogoWithDropDown />
            </div>
            <div className={"absolute top-[10vh] left-3 map-elements-z-index"}>
              {terraDraw && map && (
                <DrawControl
                  terraDraw={terraDraw}
                  drawingMode={DrawingModes.POLYGON}
                  setDrawingMode={setDrawingMode}
                  onDrawingStateChange={handleDrawingStateChange}
                  drawingIsActive={isOfflineMode}
                  showDeleteButton={hasDrawnAOI}
                  onDelete={handleAOIDelete}
                />
              )}
            </div>
            {terraDraw && map && (
              <div
                className={`absolute ${hasDrawnAOI ? "top-[20vh]" : "top-[16vh]"} left-3 map-elements-z-index`}
              >
                <ToolTip
                  content={
                    !hasDrawnAOI
                      ? "Upload AOI"
                      : "AOI already uploaded, delete to upload a new one"
                  }
                  placement={ToolTipPlacement.RIGHT}
                >
                  <button
                    className={`p-1.5 flex items-center justify-center transition-colors duration-200 bg-white`}
                    onClick={openFileUploadDialog}
                    disabled={hasDrawnAOI}
                  >
                    <FileUploadIcon
                      className={`icon-lg transition-colors duration-200`}
                    />
                  </button>
                </ToolTip>
              </div>
            )}
            <div className="absolute top-[10vh] right-4 z-[2] flex flex-col gap-y-4 items-end">
              <ZoomLevel />
              <LayerControl
                layers={mapLayers}
                map={map}
                hasTileServiceLayer
                basemaps
                rounded
              />
            </div>
            <div className="absolute bottom-[30vh] flex flex-col gap-y-4 right-4 z-[1] items-end">
              <FitToBounds bounds={tileJSONMetadata?.bounds} map={map} />
              <div>{modelPredictionsExist && <Legend />}</div>
            </div>
          </div>
          {/* Map Component */}
          <StartMappingMapComponent
            mapContainerRef={mapContainerRef}
            map={map}
            layers={mapLayers}
            trainingId={modelInfo?.published_training}
            modelInfoRequestIsPending={modelInfoRequestIspending}
            predictionImagerySource={predictionImagerySource}
            predictionImageryType={tileServiceType}
            tileJSONMetadata={tileJSONMetadata}
            modelPredictionsExist={modelPredictionsExist}
            modelPredictions={modelPredictions}
            updateFeatureStatus={updateFeatureStatus}
            tileServerURL={tileserverURL as string}
            handleDrawingStateChange={handleDrawingStateChange}
            setDrawingMode={setDrawingMode}
            terraDraw={terraDraw}
            isOfflineMode={isOfflineMode}
            hasDrawnAOI={hasDrawnAOI}
            handleAOIDelete={handleAOIDelete}
            openFileUploadDialog={openFileUploadDialog}
          />
        </div>
      </div>
    </>
  );
};
