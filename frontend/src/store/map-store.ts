// store/zoomStore.ts
import { create } from "zustand";
import { BBOX } from "@/types";

type MapState = {
  zoom: number;
  setZoom: (zoom: number) => void;
  pendingPredictionBBox: BBOX | null;
  setPendingPredictionBBox: (bbox: BBOX | null) => void;
  consumePendingPredictionBBox: () => BBOX | null;
  boundarySelectionBBox: BBOX | null;
  setBoundarySelectionBBox: (bbox: BBOX | null) => void;
  boundaryPredictionPending: boolean;
  setBoundaryPredictionPending: (isPending: boolean) => void;
  boundaryPredictionEnabled: boolean;
  setBoundaryPredictionEnabled: (isEnabled: boolean) => void;
};

export const useMapStore = create<MapState>((set, get) => ({
  zoom: 0,
  setZoom: (zoom) => set({ zoom }),
  pendingPredictionBBox: null,
  setPendingPredictionBBox: (bbox) => set({ pendingPredictionBBox: bbox }),
  consumePendingPredictionBBox: () => {
    const bbox = get().pendingPredictionBBox;
    set({ pendingPredictionBBox: null });
    return bbox;
  },
  boundarySelectionBBox: null,
  setBoundarySelectionBBox: (bbox) => set({ boundarySelectionBBox: bbox }),
  boundaryPredictionPending: false,
  setBoundaryPredictionPending: (isPending) =>
    set({ boundaryPredictionPending: isPending }),
  boundaryPredictionEnabled: false,
  setBoundaryPredictionEnabled: (isEnabled) =>
    set({ boundaryPredictionEnabled: isEnabled }),
}));
