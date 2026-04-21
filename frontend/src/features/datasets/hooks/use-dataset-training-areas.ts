import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Polygon } from "geojson";
import { geojsonToWKT } from "@terraformer/wkt";
import {
  createTrainingArea,
  createTrainingDataset,
  updateTrainingDataset,
} from "@/features/model-creation/api/create-trainings";
import { getTrainingAreas } from "@/features/model-creation/api/get-trainings";
import { getTrainingAreasQueryOptions } from "@/features/model-creation/api/factory";
import {
  showErrorToast,
  showSuccessToast,
  snapGeoJSONPolygonToClosestTile,
} from "@/utils";
import { DATASET_DRAFT_STATUS } from "@/features/datasets/utils/dataset-routing";

// ─── Helpers ─────────────────────────────────────────────────────────

const normalizeDatasetOffset = (offset?: number[]): [number, number] => {
  if (Array.isArray(offset) && offset.length === 2) {
    return [Number(offset[0]) || 0, Number(offset[1]) || 0];
  }
  return [0, 0];
};

// ─── Hook ────────────────────────────────────────────────────────────

type UseDatasetTrainingAreasOptions = {
  initialDatasetId: number | null;
  initialOffset: [number, number];
  step: 1 | 2;
};

/**
 * Encapsulates dataset persistence (create/update) and all AOI/training-area
 * operations: paginated query, upload, query invalidation, and bulk ID fetch.
 */
export const useDatasetTrainingAreas = ({
  initialDatasetId,
  initialOffset,
  step,
}: UseDatasetTrainingAreasOptions) => {
  const queryClient = useQueryClient();

  const [createdDatasetId, setCreatedDatasetId] = useState<number | null>(
    initialDatasetId,
  );
  const [createdDatasetOffset, setCreatedDatasetOffset] =
    useState<[number, number]>(initialOffset);
  const [trainingAreasOffset, setTrainingAreasOffset] = useState<number>(0);

  // ── Mutations ──────────────────────────────────────────────────────

  const createDatasetMutation = useMutation({
    mutationFn: createTrainingDataset,
  });

  const updateDatasetMutation = useMutation({
    mutationFn: updateTrainingDataset,
  });

  const createAoiMutation = useMutation({
    mutationFn: createTrainingArea,
  });

  // ── Training areas query ───────────────────────────────────────────

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

  // ── Query invalidation ────────────────────────────────────────────

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

  // ── Dataset save (create or update) ────────────────────────────────

  const ensureDatasetSaved = useCallback(
    async (name: string, sourceImagery: string) => {
      if (createdDatasetId !== null) {
        const updatedDataset = await updateDatasetMutation.mutateAsync({
          id: createdDatasetId,
          name,
          source_imagery: sourceImagery,
        });
        setCreatedDatasetOffset(normalizeDatasetOffset(updatedDataset.offset));
        return createdDatasetId;
      }

      const dataset = await createDatasetMutation.mutateAsync({
        name,
        source_imagery: sourceImagery,
        status: DATASET_DRAFT_STATUS,
      });

      setCreatedDatasetId(dataset.id);
      setCreatedDatasetOffset(normalizeDatasetOffset(dataset.offset));
      showSuccessToast("Training dataset created.");
      return dataset.id;
    },
    [createdDatasetId, createDatasetMutation, updateDatasetMutation],
  );

  // ── Offset update ────────────────────────────────────────────────

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

  // ── AOI upload ────────────────────────────────────────────────────

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

  // ── Fetch all AOI IDs (paginated) ─────────────────────────────────

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

  return {
    createdDatasetId,
    setCreatedDatasetId,
    createdDatasetOffset,
    setCreatedDatasetOffset,
    trainingAreasData,
    trainingAreasOffset,
    setTrainingAreasOffset,
    trainingAreasIsPending,
    trainingAreasIsPlaceholderData,
    createdAoiIds,
    hasDrawnAOI,
    ensureDatasetSaved,
    handleDatasetOffsetChange,
    handleUploadAoi,
    getAllDatasetAoiIds,
    invalidateDatasetAOIQueries,
    createAoiPending: createAoiMutation.isPending,
    datasetSavePending:
      createDatasetMutation.isPending || updateDatasetMutation.isPending,
  };
};
