import { TTrainingAreaFeature } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { Map } from "maplibre-gl";
import {
  getTrainingAreaAnchors,
  TAAnchor,
} from "@/features/datasets/utils/step-two-utils";

type UseStepTwoAoiAnchorsProps = {
  map: Map | null;
  trainingAreaFeatures: TTrainingAreaFeature[];
};

export const useStepTwoAoiAnchors = ({
  map,
  trainingAreaFeatures,
}: UseStepTwoAoiAnchorsProps) => {
  const [aoiAnchors, setAoiAnchors] = useState<TAAnchor[]>([]);

  const updateAnchorPositions = useCallback(() => {
    setAoiAnchors(getTrainingAreaAnchors(map, trainingAreaFeatures));
  }, [map, trainingAreaFeatures]);

  useEffect(() => {
    updateAnchorPositions();
  }, [updateAnchorPositions]);

  useEffect(() => {
    if (!map) return;

    map.on("move", updateAnchorPositions);
    map.on("zoom", updateAnchorPositions);
    map.on("resize", updateAnchorPositions);

    return () => {
      map.off("move", updateAnchorPositions);
      map.off("zoom", updateAnchorPositions);
      map.off("resize", updateAnchorPositions);
    };
  }, [map, updateAnchorPositions]);

  return aoiAnchors;
};
