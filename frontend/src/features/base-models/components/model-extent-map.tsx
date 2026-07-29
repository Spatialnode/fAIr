import { MapComponent } from "@/components/map";
import { useMapInstance } from "@/hooks/use-map-instance";
import { LngLatBoundsLike } from "maplibre-gl";
import { useEffect, useMemo } from "react";

type TModelExtentMapProps = {
  /** [minLng, minLat, maxLng, maxLat] */
  bbox: [number, number, number, number];
};

const SOURCE_ID = "model-extent";
const FILL_ID = "model-extent-fill";
const LINE_ID = "model-extent-outline";
const MAX_LAT = 85.051129; // Web Mercator limit
const COLOR = "#2563EB";

export const ModelExtentMap = ({ bbox }: TModelExtentMapProps) => {
  const { mapContainerRef, map } = useMapInstance();

  // Clamp latitude once; derive corners from the result.
  const [minLng, minLat, maxLng, maxLat] = useMemo(() => {
    const [w, s, e, n] = bbox;
    return [w, Math.max(s, -MAX_LAT), e, Math.min(n, MAX_LAT)];
  }, [bbox]);

  useEffect(() => {
    if (!map) return;

    const bounds: LngLatBoundsLike = [
      [minLng, minLat],
      [maxLng, maxLat],
    ];

    map.setMinZoom(0); // allow the whole world to fit this container
    map.setRenderWorldCopies(true); // repeat basemap + extent horizontally
    map.fitBounds(bounds, { animate: false, padding: 32 });

    map.once("idle", () => {
      if (map.getSource(SOURCE_ID)) return;
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [minLng, minLat],
                [maxLng, minLat],
                [maxLng, maxLat],
                [minLng, maxLat],
                [minLng, minLat],
              ],
            ],
          },
        },
      });
      map.addLayer({
        id: FILL_ID,
        type: "fill",
        source: SOURCE_ID,
        paint: { "fill-color": COLOR, "fill-opacity": 0.12 },
      });
      map.addLayer({
        id: LINE_ID,
        type: "line",
        source: SOURCE_ID,
        paint: { "line-color": COLOR, "line-width": 3 },
      });
      map.triggerRepaint();
    });

    return () => {
      if (!map.getStyle()) return;
      if (map.getLayer(LINE_ID)) map.removeLayer(LINE_ID);
      if (map.getLayer(FILL_ID)) map.removeLayer(FILL_ID);
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
    };
  }, [map, minLng, minLat, maxLng, maxLat]);

  return (
    <div className="w-full max-w-[600px] rounded-lg h-[330px]">
      <MapComponent
        map={map}
        mapContainerRef={mapContainerRef}
        basemaps
        zoomControls
      />
    </div>
  );
};
