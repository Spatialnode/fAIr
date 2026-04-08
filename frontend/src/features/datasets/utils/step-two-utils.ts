import { TTrainingAreaFeature } from "@/types";
import { Geometry, Position } from "geojson";
import { Map } from "maplibre-gl";

export type TAAnchor = {
  id: number;
  x: number;
  y: number;
  feature: TTrainingAreaFeature;
};

const MAP_EDGE_PADDING = 16;
const ANCHOR_MIN_SPACING = 24;
const ANCHOR_PLACEMENT_GUARD = 20;

const getTopRightCoordinate = (geometry: Geometry): Position | null => {
  const points: Position[] = [];

  if (geometry.type === "Polygon") {
    geometry.coordinates.forEach((ring) => {
      ring.forEach((point) => points.push(point));
    });
  }

  if (geometry.type === "MultiPolygon") {
    geometry.coordinates.forEach((polygon) => {
      polygon.forEach((ring) => {
        ring.forEach((point) => points.push(point));
      });
    });
  }

  if (points.length === 0) return null;

  const [maxLng, maxLat] = points.reduce<[number, number]>(
    (acc, point) => [Math.max(acc[0], point[0]), Math.max(acc[1], point[1])],
    [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
  );

  return [maxLng, maxLat];
};

const clampCoordinate = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const getTrainingAreaAnchors = (
  map: Map | null,
  features: TTrainingAreaFeature[],
): TAAnchor[] => {
  if (!map) return [];

  const container = map.getContainer();
  const minX = MAP_EDGE_PADDING;
  const minY = MAP_EDGE_PADDING;
  const maxX = Math.max(
    MAP_EDGE_PADDING,
    container.clientWidth - MAP_EDGE_PADDING,
  );
  const maxY = Math.max(
    MAP_EDGE_PADDING,
    container.clientHeight - MAP_EDGE_PADDING,
  );

  const rawAnchors = features
    .map((feature) => {
      const topRight = getTopRightCoordinate(feature.geometry);
      if (!topRight) return null;

      const projected = map.project([topRight[0], topRight[1]]);
      return {
        id: feature.id,
        x: clampCoordinate(projected.x, minX, maxX),
        y: clampCoordinate(projected.y, minY, maxY),
        feature,
      } as TAAnchor;
    })
    .filter((anchor): anchor is TAAnchor => anchor !== null);

  const placedAnchors: TAAnchor[] = [];

  rawAnchors
    .sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y))
    .forEach((anchor) => {
      let nextY = anchor.y;
      let guard = 0;

      while (
        placedAnchors.some(
          (placed) =>
            Math.abs(placed.x - anchor.x) < ANCHOR_MIN_SPACING &&
            Math.abs(placed.y - nextY) < ANCHOR_MIN_SPACING,
        ) &&
        guard < ANCHOR_PLACEMENT_GUARD
      ) {
        nextY = Math.min(maxY, nextY + ANCHOR_MIN_SPACING);
        guard += 1;
      }

      placedAnchors.push({
        ...anchor,
        y: nextY,
      });
    });

  return placedAnchors;
};
