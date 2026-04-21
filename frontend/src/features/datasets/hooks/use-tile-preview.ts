import { useEffect } from "react";
import { TileServiceType } from "@/enums";
import {
  PREVIEW_TMS_LAYER_ID,
  PREVIEW_TMS_SOURCE_ID,
} from "@/features/datasets/utils/constants";
import type maplibregl from "maplibre-gl";

type UseTilePreviewOptions = {
  map: maplibregl.Map | null;
  sourceURL: string;
  step: 1 | 2;
  tileServiceType: TileServiceType;
  isValid: boolean;
  isOpenAerialMap: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  bounds?: maplibregl.LngLatBoundsLike;
};

/**
 * Manages the TMS/TileJSON preview layer on the map during step one.
 * Adds the raster source + layer when valid, cleans up on unmount or URL change.
 */
export const useTilePreview = ({
  map,
  sourceURL,
  step,
  tileServiceType,
  isValid,
  isOpenAerialMap,
  setLoading,
  setError,
  bounds,
}: UseTilePreviewOptions) => {
  // Add / swap the preview raster layer
  useEffect(() => {
    if (step !== 1 || !isValid || !map || !sourceURL) return;

    const source = map.getSource(PREVIEW_TMS_SOURCE_ID);
    if (source) {
      map.removeLayer(PREVIEW_TMS_LAYER_ID);
      map.removeSource(PREVIEW_TMS_SOURCE_ID);
    }

    setLoading(true);
    setError("");

    try {
      const useTileJSON =
        isOpenAerialMap || tileServiceType === TileServiceType.TILEJSON;

      map.addSource(
        PREVIEW_TMS_SOURCE_ID,
        useTileJSON
          ? { type: "raster", url: sourceURL, tileSize: 256 }
          : { type: "raster", tiles: [sourceURL], tileSize: 256 },
      );

      map.addLayer({
        id: PREVIEW_TMS_LAYER_ID,
        type: "raster",
        source: PREVIEW_TMS_SOURCE_ID,
        layout: { visibility: "visible" },
      });
    } catch {
      setError(
        "Unable to load the tile server. Please verify the URL and try again.",
      );
    } finally {
      setLoading(false);
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
    isValid,
    isOpenAerialMap,
    setLoading,
    setError,
  ]);

  // Fit to TileJSON bounds when available
  useEffect(() => {
    if (!bounds || !map) return;
    map.fitBounds(bounds);
  }, [map, bounds]);
};
