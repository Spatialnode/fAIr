import { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getTrainingAreaLabelsFromOSM } from "@/features/model-creation/api/create-trainings";
import { showErrorToast, showSuccessToast } from "@/utils";
import { DatasetFlowModal, LabelSource } from "@/features/datasets/types/types";
import type { IBuildDatasetPayload } from "@/features/datasets/api/create-dataset";

type UseFlowModalsOptions = {
  hasDrawnAOI: boolean;
  getAllDatasetAoiIds: () => Promise<number[]>;
  markFetched: (source: Exclude<LabelSource, "">) => void;
  onBuildDataset?: (payload: IBuildDatasetPayload) => Promise<unknown>;
};

/**
 * Manages modal state and label-source confirmation handlers.
 */
export const useFlowModals = ({
  hasDrawnAOI,
  getAllDatasetAoiIds,
  markFetched,
  onBuildDataset,
}: UseFlowModalsOptions) => {
  const [flowModal, setFlowModal] = useState<DatasetFlowModal>(null);
  const [osmModalFeatureType, setOsmModalFeatureType] = useState("Rooftops");
  const [osmModalValues, setOsmModalValues] = useState<string[]>(["Zinc"]);

  const [mapSwipeProjectType, setMapSwipeProjectType] = useState<
    "Existing Project" | "New Project"
  >("Existing Project");
  const [mapSwipeProjectIds, setMapSwipeProjectIds] = useState<string[]>([""]);

  const [taskingProjectIds, setTaskingProjectIds] = useState<string[]>([""]);

  const fetchOsmLabelsMutation = useMutation({
    mutationFn: getTrainingAreaLabelsFromOSM,
  });

  const validMapSwipeIds = mapSwipeProjectIds.filter(
    (v) => v.trim().length > 0,
  );
  const validTaskingIds = taskingProjectIds.filter((v) => v.trim().length > 0);

  // ── Open the right modal for the selected label source ─────────────

  const prepareModalForLabelSource = useCallback(
    (labelSource: LabelSource) => {
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

      const modalMap: Record<Exclude<LabelSource, "">, DatasetFlowModal> = {
        OSM: "osm",
        MapSwipe: "mapswipe",
        "Tasking Manager": "tasking-manager",
        Custom: "custom",
      };

      setFlowModal(modalMap[labelSource]);
    },
    [hasDrawnAOI],
  );

  // ── Confirm handlers ──────────────────────────────────────────────

  const handleConfirmOsmFlow = useCallback(async () => {
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
      markFetched("OSM");
      showSuccessToast("OSM label fetch started for all AOIs.");
    } catch (error) {
      showErrorToast(error);
    }
  }, [hasDrawnAOI, getAllDatasetAoiIds, fetchOsmLabelsMutation, markFetched]);

  const handleConfirmMapSwipeFlow = useCallback(() => {
    if (
      mapSwipeProjectType === "Existing Project" &&
      validMapSwipeIds.length === 0
    ) {
      showErrorToast(undefined, "Enter at least one MapSwipe project ID.");
      return;
    }

    setFlowModal(null);
    markFetched("MapSwipe");
    showSuccessToast(
      mapSwipeProjectType === "New Project"
        ? "MapSwipe projects created for your AOIs."
        : "MapSwipe labels attached to the AOI.",
    );
  }, [mapSwipeProjectType, validMapSwipeIds.length, markFetched]);

  const handleConfirmTaskingFlow = useCallback(() => {
    if (validTaskingIds.length === 0) {
      showErrorToast(
        undefined,
        "Enter at least one Tasking Manager project ID.",
      );
      return;
    }

    setFlowModal(null);
    markFetched("Tasking Manager");
    showSuccessToast("Tasking Manager data uploaded successfully.");
  }, [validTaskingIds.length, markFetched]);

  const handleConfirmCustomFlow = useCallback(() => {
    setFlowModal(null);
    markFetched("Custom");
    showSuccessToast("Custom labels uploaded for selected AOIs.");
  }, [markFetched]);

  const handleOpenBuildConfirm = useCallback(() => {
    setFlowModal("build-confirm");
  }, []);

  const buildDatasetMutation = useMutation({
    mutationFn: onBuildDataset ?? (() => Promise.resolve()),
  });

  const handleConfirmBuildDataset = useCallback(async () => {
    if (!onBuildDataset) {
      setFlowModal("build-success");
      return;
    }
    try {
      const aoiIds = await getAllDatasetAoiIds();
      if (aoiIds.length === 0) {
        showErrorToast(
          undefined,
          "No AOIs found. Draw at least one area first.",
        );
        return;
      }
      await buildDatasetMutation.mutateAsync(
        aoiIds as unknown as IBuildDatasetPayload,
      );
      setFlowModal("build-success");
      showSuccessToast("Dataset build job submitted successfully.");
    } catch (error) {
      showErrorToast(error);
    }
  }, [onBuildDataset, getAllDatasetAoiIds, buildDatasetMutation]);

  return {
    flowModal,
    setFlowModal,
    osmModalFeatureType,
    setOsmModalFeatureType,
    osmModalValues,
    setOsmModalValues,
    mapSwipeProjectType,
    setMapSwipeProjectType,
    mapSwipeProjectIds,
    setMapSwipeProjectIds,
    validMapSwipeIds,
    mapSwipeIdsForPanel: validMapSwipeIds,
    taskingProjectIds,
    setTaskingProjectIds,
    validTaskingIds,
    fetchOsmPending: fetchOsmLabelsMutation.isPending,
    actionPending: fetchOsmLabelsMutation.isPending,
    buildDatasetPending: buildDatasetMutation.isPending,
    prepareModalForLabelSource,
    handleConfirmOsmFlow,
    handleConfirmMapSwipeFlow,
    handleConfirmTaskingFlow,
    handleConfirmCustomFlow,
    handleOpenBuildConfirm,
    handleConfirmBuildDataset,
  };
};
