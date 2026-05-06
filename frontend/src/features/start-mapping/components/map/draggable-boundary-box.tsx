import { START_MAPPING_PAGE_CONTENT } from "@/constants";
import { BBOX } from "@/types";
import {
  PointerEvent as ReactPointerEvent,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { LngLatBoundsLike, Map } from "maplibre-gl";
import { useMapStore } from "@/store/map-store";
import { calculateGeoJSONArea, distance, featureIsWithinBounds } from "@/utils";
import { Feature } from "geojson";

const DEFAULT_BOUNDARY_WIDTH = 620;
const DEFAULT_BOUNDARY_HEIGHT = 420;
const MIN_BOUNDARY_WIDTH = 240;
const MIN_BOUNDARY_HEIGHT = 180;
const BOUNDARY_HORIZONTAL_GUTTER = 18;
const BOUNDARY_VERTICAL_GUTTER = 84;
const LARGE_BOUNDARY_OFFLINE_AREA_THRESHOLD_SQM = 50_000_000;

type BoundarySize = {
  width: number;
  height: number;
};

type BoundaryRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ResizeHandle =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left";

type InteractionState =
  | {
      mode: "idle";
    }
  | {
      mode: "resize";
      handle: ResizeHandle;
      startClientX: number;
      startClientY: number;
      startSize: BoundarySize;
    };

type BoundaryMetrics = {
  bbox: BBOX | null;
  widthKm: number;
  heightKm: number;
  areaSqM: number;
  isWithinImageryBounds: boolean;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getBoundaryLimits = (containerWidth: number, containerHeight: number) => {
  const maxWidth = Math.max(
    MIN_BOUNDARY_WIDTH,
    containerWidth - BOUNDARY_HORIZONTAL_GUTTER * 2,
  );
  const maxHeight = Math.max(
    MIN_BOUNDARY_HEIGHT,
    containerHeight - BOUNDARY_VERTICAL_GUTTER * 2,
  );

  return { maxWidth, maxHeight };
};

const clampSizeToContainer = (
  nextSize: BoundarySize,
  width: number,
  height: number,
): BoundarySize => {
  const { maxWidth, maxHeight } = getBoundaryLimits(width, height);

  return {
    width: clamp(nextSize.width, MIN_BOUNDARY_WIDTH, maxWidth),
    height: clamp(nextSize.height, MIN_BOUNDARY_HEIGHT, maxHeight),
  };
};

const getCenteredBoundaryRect = (
  containerWidth: number,
  containerHeight: number,
  size: BoundarySize,
): BoundaryRect => ({
  width: size.width,
  height: size.height,
  x: Math.max(0, (containerWidth - size.width) / 2),
  y: Math.max(0, (containerHeight - size.height) / 2),
});

const bboxToFeature = (bbox: BBOX): Feature => {
  const [west, south, east, north] = bbox;

  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [west, south],
          [east, south],
          [east, north],
          [west, north],
          [west, south],
        ],
      ],
    },
  };
};

const formatKm = (value: number) =>
  Number.isFinite(value) && value > 0 ? `${value.toFixed(2)} km` : "-- km";

export const DraggableBoundaryBox = ({
  map,
  mapContainerRef,
  imageryBounds,
}: {
  map: Map | null;
  mapContainerRef: RefObject<HTMLDivElement | null>;
  imageryBounds?: LngLatBoundsLike | null;
}) => {
  const [boundarySize, setBoundarySize] = useState<BoundarySize>({
    width: DEFAULT_BOUNDARY_WIDTH,
    height: DEFAULT_BOUNDARY_HEIGHT,
  });
  const [interactionState, setInteractionState] = useState<InteractionState>({
    mode: "idle",
  });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [boundaryMetrics, setBoundaryMetrics] = useState<BoundaryMetrics>({
    bbox: null,
    widthKm: 0,
    heightKm: 0,
    areaSqM: 0,
    isWithinImageryBounds: true,
  });
  const hasInitializedBoundarySize = useRef<boolean>(false);

  const setPendingPredictionBBox = useMapStore(
    (state) => state.setPendingPredictionBBox,
  );
  const setBoundarySelectionBBox = useMapStore(
    (state) => state.setBoundarySelectionBBox,
  );
  const boundaryPredictionPending = useMapStore(
    (state) => state.boundaryPredictionPending,
  );
  const boundaryPredictionEnabled = useMapStore(
    (state) => state.boundaryPredictionEnabled,
  );

  const boundaryRect = useMemo(
    () =>
      getCenteredBoundaryRect(
        containerSize.width,
        containerSize.height,
        boundarySize,
      ),
    [boundarySize, containerSize.height, containerSize.width],
  );

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const syncSize = () => {
      const rect = container.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });

      if (!hasInitializedBoundarySize.current) {
        hasInitializedBoundarySize.current = true;
        setBoundarySize(
          clampSizeToContainer(
            {
              width: DEFAULT_BOUNDARY_WIDTH,
              height: DEFAULT_BOUNDARY_HEIGHT,
            },
            rect.width,
            rect.height,
          ),
        );
        return;
      }

      setBoundarySize((prev) =>
        clampSizeToContainer(prev, rect.width, rect.height),
      );
    };

    syncSize();

    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(container);
      return () => resizeObserver.disconnect();
    }

    window.addEventListener("resize", syncSize);
    return () => window.removeEventListener("resize", syncSize);
  }, [mapContainerRef]);

  useEffect(() => {
    if (interactionState.mode === "idle") return;

    const handlePointerMove = (event: PointerEvent) => {
      const container = mapContainerRef.current;
      if (!container || interactionState.mode !== "resize") return;

      const rect = container.getBoundingClientRect();
      const dx = event.clientX - interactionState.startClientX;
      const dy = event.clientY - interactionState.startClientY;
      const { handle, startSize } = interactionState;

      let nextWidth = startSize.width;
      let nextHeight = startSize.height;

      if (handle.includes("right")) {
        nextWidth = startSize.width + dx * 2;
      }

      if (handle.includes("left")) {
        nextWidth = startSize.width - dx * 2;
      }

      if (handle.includes("bottom")) {
        nextHeight = startSize.height + dy * 2;
      }

      if (handle.includes("top")) {
        nextHeight = startSize.height - dy * 2;
      }

      if (handle === "top") {
        nextHeight = startSize.height - dy * 2;
      }

      if (handle === "bottom") {
        nextHeight = startSize.height + dy * 2;
      }

      if (handle === "left") {
        nextWidth = startSize.width - dx * 2;
      }

      if (handle === "right") {
        nextWidth = startSize.width + dx * 2;
      }

      setBoundarySize(
        clampSizeToContainer(
          {
            width: nextWidth,
            height: nextHeight,
          },
          rect.width,
          rect.height,
        ),
      );
    };

    const handlePointerUp = () => {
      setInteractionState({ mode: "idle" });
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [interactionState, mapContainerRef]);

  const refreshBoundaryMetrics = useCallback(() => {
    if (!map || containerSize.width <= 0 || containerSize.height <= 0) {
      setBoundaryMetrics({
        bbox: null,
        widthKm: 0,
        heightKm: 0,
        areaSqM: 0,
        isWithinImageryBounds: true,
      });
      setBoundarySelectionBBox(null);
      return;
    }

    const topLeft = map.unproject([boundaryRect.x, boundaryRect.y]);
    const topRight = map.unproject([
      boundaryRect.x + boundaryRect.width,
      boundaryRect.y,
    ]);
    const bottomLeft = map.unproject([
      boundaryRect.x,
      boundaryRect.y + boundaryRect.height,
    ]);
    const bottomRight = map.unproject([
      boundaryRect.x + boundaryRect.width,
      boundaryRect.y + boundaryRect.height,
    ]);

    const bbox: BBOX = [
      Math.min(topLeft.lng, bottomRight.lng),
      Math.min(topLeft.lat, bottomRight.lat),
      Math.max(topLeft.lng, bottomRight.lng),
      Math.max(topLeft.lat, bottomRight.lat),
    ];

    const widthKm = distance(
      topLeft.lat,
      topLeft.lng,
      topRight.lat,
      topRight.lng,
      "K",
    );
    const heightKm = distance(
      topLeft.lat,
      topLeft.lng,
      bottomLeft.lat,
      bottomLeft.lng,
      "K",
    );
    const areaSqM = calculateGeoJSONArea(bboxToFeature(bbox));
    const isWithinImageryBounds = imageryBounds
      ? featureIsWithinBounds(imageryBounds, bboxToFeature(bbox))
      : true;

    setBoundarySelectionBBox(bbox);
    setBoundaryMetrics({
      bbox,
      widthKm,
      heightKm,
      areaSqM,
      isWithinImageryBounds,
    });
  }, [
    boundaryRect.height,
    boundaryRect.width,
    boundaryRect.x,
    boundaryRect.y,
    containerSize.height,
    containerSize.width,
    imageryBounds,
    map,
    setBoundarySelectionBBox,
  ]);

  useEffect(() => {
    refreshBoundaryMetrics();
  }, [refreshBoundaryMetrics]);

  useEffect(() => {
    if (!map) return;

    map.on("move", refreshBoundaryMetrics);
    map.on("zoom", refreshBoundaryMetrics);

    return () => {
      map.off("move", refreshBoundaryMetrics);
      map.off("zoom", refreshBoundaryMetrics);
    };
  }, [map, refreshBoundaryMetrics]);

  const handleResizeStart =
    (handle: ResizeHandle) => (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      setInteractionState({
        mode: "resize",
        handle,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startSize: boundarySize,
      });
    };

  const shouldUseOfflinePrediction =
    boundaryMetrics.areaSqM >= LARGE_BOUNDARY_OFFLINE_AREA_THRESHOLD_SQM;
  const isMappableSelection = boundaryMetrics.isWithinImageryBounds;

  const triggerMainGenerateButton = useCallback(() => {
    if (!boundaryPredictionEnabled || !boundaryMetrics.bbox || !isMappableSelection)
      return;

    if (shouldUseOfflinePrediction) {
      const offlineBoundaryProxyButton =
        document.querySelector<HTMLButtonElement>(
          '[data-start-mapping-boundary-request-offline-button="true"]',
        );

      offlineBoundaryProxyButton?.click();
      return;
    }

    if (boundaryPredictionPending) return;

    const boundaryProxyButton = document.querySelector<HTMLButtonElement>(
      '[data-start-mapping-boundary-generate-button="true"]',
    );

    if (boundaryProxyButton && !boundaryProxyButton.disabled) {
      setPendingPredictionBBox(boundaryMetrics.bbox);
      boundaryProxyButton.click();
      return;
    }

    const buttons = Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        '[data-start-mapping-generate-button="true"]',
      ),
    );

    const targetOnlineButton =
      buttons.find(
        (button) =>
          button.dataset.startMappingPredictOnline === "true" &&
          !button.disabled &&
          button.offsetParent !== null,
      ) ||
      buttons.find(
        (button) =>
          button.dataset.startMappingPredictOnline === "true" &&
          !button.disabled,
      ) ||
      null;

    if (targetOnlineButton) {
      setPendingPredictionBBox(boundaryMetrics.bbox);
    }

    const targetButton =
      targetOnlineButton ||
      buttons.find(
        (button) => !button.disabled && button.offsetParent !== null,
      ) ||
      buttons.find((button) => !button.disabled) ||
      null;

    targetButton?.click();
  }, [
    boundaryMetrics.bbox,
    boundaryPredictionEnabled,
    boundaryPredictionPending,
    isMappableSelection,
    setPendingPredictionBBox,
    shouldUseOfflinePrediction,
  ]);

  const canRender = useMemo(
    () => containerSize.width > 0 && containerSize.height > 0,
    [containerSize.height, containerSize.width],
  );

  if (!canRender) return null;

  const isButtonDisabled =
    !isMappableSelection ||
    !boundaryPredictionEnabled ||
    (boundaryPredictionPending && !shouldUseOfflinePrediction);

  return (
    <div className="absolute inset-0 map-elements-z-index pointer-events-none">
      <div
        className="absolute bg-black/35"
        style={{ top: 0, left: 0, width: "100%", height: `${boundaryRect.y}px` }}
      />
      <div
        className="absolute bg-black/35"
        style={{
          top: `${boundaryRect.y + boundaryRect.height}px`,
          left: 0,
          width: "100%",
          height: `${Math.max(0, containerSize.height - (boundaryRect.y + boundaryRect.height))}px`,
        }}
      />
      <div
        className="absolute bg-black/35"
        style={{
          top: `${boundaryRect.y}px`,
          left: 0,
          width: `${boundaryRect.x}px`,
          height: `${boundaryRect.height}px`,
        }}
      />
      <div
        className="absolute bg-black/35"
        style={{
          top: `${boundaryRect.y}px`,
          left: `${boundaryRect.x + boundaryRect.width}px`,
          width: `${Math.max(0, containerSize.width - (boundaryRect.x + boundaryRect.width))}px`,
          height: `${boundaryRect.height}px`,
        }}
      />

      <div
        className="absolute border-[3px] border-primary rounded-sm shadow-[0_0_0_1px_var(--hot-fair-color-primary)]"
        style={{
          width: `${boundaryRect.width}px`,
          height: `${boundaryRect.height}px`,
          left: `${boundaryRect.x}px`,
          top: `${boundaryRect.y}px`,
        }}
      >
        <div className="absolute inset-0 bg-white/30" />

        <button
          type="button"
          onPointerDown={handleResizeStart("top")}
          title="Resize boundary top edge"
          className="absolute -top-1 left-0 w-full h-2 pointer-events-auto cursor-ns-resize"
          aria-label="Resize top edge"
        />
        <button
          type="button"
          onPointerDown={handleResizeStart("right")}
          title="Resize boundary right edge"
          className="absolute top-0 -right-1 h-full w-2 pointer-events-auto cursor-ew-resize"
          aria-label="Resize right edge"
        />
        <button
          type="button"
          onPointerDown={handleResizeStart("bottom")}
          title="Resize boundary bottom edge"
          className="absolute -bottom-1 left-0 w-full h-2 pointer-events-auto cursor-ns-resize"
          aria-label="Resize bottom edge"
        />
        <button
          type="button"
          onPointerDown={handleResizeStart("left")}
          title="Resize boundary left edge"
          className="absolute top-0 -left-1 h-full w-2 pointer-events-auto cursor-ew-resize"
          aria-label="Resize left edge"
        />

        <button
          type="button"
          onPointerDown={handleResizeStart("top-left")}
          title="Resize boundary from top-left"
          className="absolute -top-2 -left-2 h-4 w-4 pointer-events-auto cursor-nwse-resize"
          aria-label="Resize top-left corner"
        />
        <button
          type="button"
          onPointerDown={handleResizeStart("top-right")}
          title="Resize boundary from top-right"
          className="absolute -top-2 -right-2 h-4 w-4 pointer-events-auto cursor-nesw-resize"
          aria-label="Resize top-right corner"
        />
        <button
          type="button"
          onPointerDown={handleResizeStart("bottom-left")}
          title="Resize boundary from bottom-left"
          className="absolute -bottom-2 -left-2 h-4 w-4 pointer-events-auto cursor-nesw-resize"
          aria-label="Resize bottom-left corner"
        />
        <button
          type="button"
          onPointerDown={handleResizeStart("bottom-right")}
          title="Resize boundary from bottom-right"
          className="absolute -bottom-2 -right-2 h-4 w-4 pointer-events-auto cursor-nwse-resize"
          aria-label="Resize bottom-right corner"
        />

        <div className="absolute -top-4 -left-4 h-7 w-7 rounded-lg bg-primary" />
        <div className="absolute -top-4 -right-4 h-7 w-7 rounded-lg bg-primary" />
        <div className="absolute -bottom-4 -left-4 h-7 w-7 rounded-lg bg-primary" />
        <div className="absolute -bottom-4 -right-4 h-7 w-7 rounded-lg bg-primary" />

        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-xl bg-[#e6edf7] px-3 py-1 text-body-3 font-semibold text-[#1f2937]">
          {formatKm(boundaryMetrics.widthKm)}
        </div>

        <div
          className="absolute top-1/2 -left-4 -translate-y-1/2 rounded-xl bg-[#e6edf7] px-2 py-2 text-body-3 font-semibold text-[#1f2937]"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          {formatKm(boundaryMetrics.heightKm)}
        </div>

        <button
          type="button"
          disabled={isButtonDisabled}
          onClick={triggerMainGenerateButton}
          className={`absolute -bottom-12 right-0 pointer-events-auto text-nowrap px-3 py-2 rounded-md text-white ${isButtonDisabled ? "bg-primary/60 cursor-not-allowed" : "bg-primary"}`}
        >
          <span className="capitalize text-body-4">
            {boundaryPredictionPending && !shouldUseOfflinePrediction
              ? "Generating..."
              : shouldUseOfflinePrediction
                ? "Generate Offline"
                : START_MAPPING_PAGE_CONTENT.buttons.runPrediction}
          </span>
        </button>

        {!isMappableSelection && (
          <div className="absolute -bottom-12 left-0 rounded-md bg-[#7f1d1d] px-3 py-2 text-body-4 text-white">
            Area outside imagery is not mappable
          </div>
        )}
      </div>
    </div>
  );
};
