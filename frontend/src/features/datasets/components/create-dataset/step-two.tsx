import FileUploadDialog from "@/components/shared/modals/file-upload-dialog";
import { Button } from "@/components/ui/button";
import { DropDown } from "@/components/ui/dropdown";
import { DropdownMenuItem } from "@/components/ui/dropdown/dropdown";
import { ArrowBackIcon, InfoIcon, YouTubePlayIcon } from "@/components/ui/icons";
import { TOAST_NOTIFICATIONS } from "@/constants";
import { ButtonVariant, DrawingModes } from "@/enums";
import TrainingAreaMap from "@/features/model-creation/components/training-area/training-area-map";
import { useDialog } from "@/hooks/use-dialog";
import { useMapInstance } from "@/hooks/use-map-instance";
import { geoJSONDowloader, showErrorToast, showSuccessToast } from "@/utils";
import { useEffect, useMemo, useState } from "react";
import { LABEL_SOURCES } from "./constants";
import { LabelSource } from "@/features/datasets/components/create-dataset/types";
import { useCreateDatasetFlowContext } from "@/features/datasets/contexts/create-dataset-flow-context";
import { useStepTwoAoiAnchors } from "@/features/datasets/hooks/use-step-two-aoi-anchors";
import { useDeleteTrainingArea } from "@/features/model-creation/hooks/use-training-areas";
import { getTrainingAreaLabels } from "@/features/model-creation/api/get-trainings";
import { OFFSET_STEP } from "@/config";
import {
  StepTwoMapBottomControls,
  StepTwoMapSideControls,
} from "@/features/datasets/components/create-dataset/step-two-map-controls";
import { StepTwoOffsetPanel } from "@/features/datasets/components/create-dataset/step-two-offset-panel";
import {
  StepTwoAoiActionCard,
  StepTwoAoiAnchors,
} from "@/features/datasets/components/create-dataset/step-two-aoi-actions";
import { ToolTip } from "@/components/ui/tooltip";

export const CreateDatasetStepTwo = () => {
  const { map, mapContainerRef, drawingMode, setDrawingMode, terraDraw } =
    useMapInstance();
  const flow = useCreateDatasetFlowContext();
  const [offsetPanelOpen, setOffsetPanelOpen] = useState<boolean>(false);
  const [selectedAoiId, setSelectedAoiId] = useState<number | null>(null);

  const {
    isOpened: isAoiUploadDialogOpened,
    openDialog: openAoiUploadDialog,
    closeDialog: closeAoiUploadDialog,
  } = useDialog();

  useEffect(() => {
    if (!map) return;
    map.resize();
  }, [map]);

  const labelSourceItems = useMemo<DropdownMenuItem[]>(
    () =>
      LABEL_SOURCES.map((source) => ({
        value: source,
      })),
    [],
  );
  const trainingAreaFeatures = useMemo(
    () => flow.trainingAreasData?.results.features ?? [],
    [flow.trainingAreasData],
  );

  const aoiAnchors = useStepTwoAoiAnchors({
    map,
    trainingAreaFeatures,
  });

  const deleteTrainingAreaMutation = useDeleteTrainingArea({
    datasetId: flow.createdDatasetId ?? 0,
    offset: flow.trainingAreasOffset,
    mutationConfig: {
      onSuccess: () => {
        setSelectedAoiId(null);
        showSuccessToast(TOAST_NOTIFICATIONS.trainingAreaDeletionSuccess);
      },
      onError: (error) => showErrorToast(error),
    },
  });

  useEffect(() => {
    if (selectedAoiId === null) return;
    const selectedStillExists = trainingAreaFeatures.some(
      (feature) => feature.id === selectedAoiId,
    );
    if (!selectedStillExists) {
      setSelectedAoiId(null);
    }
  }, [selectedAoiId, trainingAreaFeatures]);

  const selectedAnchor = useMemo(
    () => aoiAnchors.find((anchor) => anchor.id === selectedAoiId) ?? null,
    [aoiAnchors, selectedAoiId],
  );

  const handleDrawAoi = () => {
    setDrawingMode(DrawingModes.RECTANGLE);
    showSuccessToast(TOAST_NOTIFICATIONS.drawingModeActivated);
  };

  const handleOffsetNudge = (dx: number, dy: number) => {
    const nextOffset: [number, number] = [
      Number((flow.createdDatasetOffset[0] + dx * OFFSET_STEP).toFixed(2)),
      Number((flow.createdDatasetOffset[1] + dy * OFFSET_STEP).toFixed(2)),
    ];
    void flow.handleDatasetOffsetChange(nextOffset);
  };

  const handleDownloadLabels = async (aoiId: number) => {
    try {
      const labels = await getTrainingAreaLabels(aoiId);
      geoJSONDowloader(labels, `AOI_${aoiId}_Labels`);
      showSuccessToast(TOAST_NOTIFICATIONS.aoiLabelsDownloadSuccess);
    } catch (error) {
      showErrorToast(error);
    }
  };
  if (flow.createdDatasetId === null) return null;

  return (
    <>
      <FileUploadDialog
        isOpened={isAoiUploadDialogOpened}
        closeDialog={closeAoiUploadDialog}
        label={"Upload Training Area(s)"}
        fileUploadHandler={flow.handleUploadAoi}
        successToast={TOAST_NOTIFICATIONS.trainingAreasFileUploadSuccess}
        disabled={flow.createAoiPending}
      />

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-5">
            <h1 className="text-title-1 font-bold text-primary md:text-title-2">
              Create Training Area &amp; Map Data
            </h1>
            <p className="text-body-2 font-medium text-dark">
              Dataset ID: {flow.createdDatasetId}
            </p>
            <button
              type="button"
              className="inline-flex items-center gap-2 text-body-2 font-medium text-dark"
            >
              <YouTubePlayIcon className="h-5 w-5 text-primary" />
              Tutorial
            </button>
          </div>

       <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
              <span className="text-body-3 text-dark">Labels Source</span>
            <div className="">
              <DropDown
                className=" w-48"
                distance={8}
                menuItems={labelSourceItems}
                disableCheveronIcon
                handleMenuSelection={(event) => {
                  const selected = event?.detail?.item?.value as
                    | LabelSource
                    | undefined;
                  if (!selected) return;
                  flow.handleLabelSourceChange(selected);
                }}
                triggerComponent={
                  <div className="flex h-10 w-full items-center rounded-md border border-gray-border bg-off-white px-3 text-body-4">
                    <span
                      className={
                        flow.labelSource === "" ? "text-grey" : "text-dark"
                      }
                    >
                      {flow.labelSource || "Select label source"}
                    </span>
                  </div>
                }
              />
            </div>
            <ToolTip content="Choose where labels should come from for this dataset (OSM, MapSwipe, Tasking Manager, or Custom).">
              <span className="inline-flex items-center text-grey">
                <InfoIcon className="h-4 w-4" />
              </span>
            </ToolTip>
        </div>
            <Button
              className=" !w-fit !rounded-md !text-xs min-w-32"
              uppercase={false}
              size={'medium'}
              spinner={flow.actionPending}
              disabled={flow.actionDisabled}
              onClick={flow.prepareModalForLabelSource}
            >
              {flow.actionButtonLabel}
            </Button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded border border-gray-border bg-white p-2">
          <div className="h-[700px] overflow-hidden rounded bg-off-white">
            <TrainingAreaMap
              tileServiceURL={flow.tileserverURL}
              data={flow.trainingAreasData}
              trainingDatasetId={flow.createdDatasetId}
              offset={flow.trainingAreasOffset}
              map={map}
              showDrawControl={false}
              mapContainerRef={mapContainerRef}
              terraDraw={terraDraw}
              setDrawingMode={setDrawingMode}
              drawingMode={drawingMode}
              trainingAreaIsPending={flow.trainingAreasIsPending}
              tileServiceBounds={flow.tileServiceBounds}
              trainingDatasetOffset={{
                x: flow.createdDatasetOffset[0] ?? 0,
                y: flow.createdDatasetOffset[1] ?? 0,
              }}
            />
          </div>

          <div className="pointer-events-none absolute top-4 z-20">
            <StepTwoMapSideControls
              drawingMode={drawingMode}
              offsetPanelOpen={offsetPanelOpen}
              onDrawClick={handleDrawAoi}
              onUploadClick={openAoiUploadDialog}
              onToggleOffsetPanel={() => setOffsetPanelOpen((prev) => !prev)}
            />

            {offsetPanelOpen ? (
              <StepTwoOffsetPanel
                offset={flow.createdDatasetOffset}
                onNudge={handleOffsetNudge}
              />
            ) : null}

            <StepTwoAoiAnchors
              anchors={aoiAnchors}
              selectedAoiId={selectedAoiId}
              onToggle={(aoiId) =>
                setSelectedAoiId((prev) => (prev === aoiId ? null : aoiId))
              }
            />

            <StepTwoAoiActionCard
              selectedAnchor={selectedAnchor}
              map={map}
              datasetId={flow.createdDatasetId}
              datasetName={flow.datasetMetadataForm.name}
              tileServerURL={flow.tileserverURL}
              deleteIsPending={deleteTrainingAreaMutation.isPending}
              onDownloadLabels={(aoiId) => {
                void handleDownloadLabels(aoiId);
              }}
              onDeleteAoi={(aoiId) =>
                deleteTrainingAreaMutation.mutate({ trainingAreaId: aoiId })
              }
            />
          </div>

          <StepTwoMapBottomControls
            uploadIsPending={flow.createAoiPending}
            onDrawClick={handleDrawAoi}
            onUploadClick={openAoiUploadDialog}
          />
        </div>

        <div className="grid grid-cols-3 items-center gap-4 border-t border-gray-border py-4">
          <div>
            <Button
              variant={ButtonVariant.DEFAULT}
              className="!w-fit min-w-32"
              uppercase={false}
              onClick={() => flow.setStep(1)}
            >
              <span className="inline-flex items-center gap-2">
                <ArrowBackIcon className="h-5 w-5" />
                Back
              </span>
            </Button>
          </div>
          <p className="text-center text-body-2 text-grey">Step 2 of 2</p>
          <div className="flex justify-end">
            <Button
              className="!w-fit min-w-40"
              uppercase={false}
              disabled={!flow.canBuildDataset}
              onClick={flow.handleOpenBuildConfirm}
            >
              {flow.buildCtaLabel}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
