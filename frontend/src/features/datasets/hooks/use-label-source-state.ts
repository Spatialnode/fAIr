import { useCallback, useState } from "react";
import { LabelSource } from "@/features/datasets/types/types";

type LabelFetchStatus = Record<Exclude<LabelSource, "">, boolean>;

const INITIAL_FETCH_STATUS: LabelFetchStatus = {
  OSM: false,
  MapSwipe: false,
  "Tasking Manager": false,
  Custom: false,
};

const buildInitialStatus = (labelSource: LabelSource): LabelFetchStatus => {
  if (labelSource === "") return INITIAL_FETCH_STATUS;
  return { ...INITIAL_FETCH_STATUS, [labelSource]: true };
};

export const useLabelSourceState = (initialSource: LabelSource) => {
  const [labelSource, setLabelSource] = useState<LabelSource>(initialSource);
  const [fetchStatus, setFetchStatus] = useState<LabelFetchStatus>(
    buildInitialStatus(initialSource),
  );

  const handleLabelSourceChange = useCallback((source: LabelSource) => {
    setLabelSource(source);
    setFetchStatus(INITIAL_FETCH_STATUS);
  }, []);

  const markFetched = useCallback((source: Exclude<LabelSource, "">) => {
    setFetchStatus((prev) => ({ ...prev, [source]: true }));
  }, []);

  const isFetched = labelSource !== "" && fetchStatus[labelSource];

  return {
    labelSource,
    handleLabelSourceChange,
    markFetched,
    osmFetched: fetchStatus.OSM,
    mapSwipeFetched: fetchStatus.MapSwipe,
    taskingUploaded: fetchStatus["Tasking Manager"],
    customUploaded: fetchStatus.Custom,
    isFetched,
    resetFetchStatus: (source: LabelSource) => {
      setFetchStatus(buildInitialStatus(source));
    },
  };
};
