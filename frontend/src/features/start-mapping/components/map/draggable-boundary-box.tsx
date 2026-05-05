import { START_MAPPING_PAGE_CONTENT } from "@/constants";
import { ArrowMoveIcon } from "@/components/ui/icons";
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
import { Map } from "maplibre-gl";
import { useMapStore } from "@/store/map-store";

const BOUNDARY_WIDTH = 320;
const BOUNDARY_HEIGHT = 200;
const MIN_BOUNDARY_WIDTH = 180;
const MIN_BOUNDARY_HEIGHT = 120;
const BOUNDARY_MARGIN = 16;
const BUTTON_OFFSET_Y = 56;

type Position = {
  x: number;
  y: number;
};

type BoundaryRect = Position & {
  width: number;
  height: number;
};

type ResizeEdge = "top" | "right" | "bottom" | "left";

type InteractionState =
  | {
      mode: "idle";
    }
  | {
      mode: "drag";
      offsetX: number;
      offsetY: number;
    }
  | {
      mode: "resize";
      edge: ResizeEdge;
      startClientX: number;
      startClientY: number;
      startRect: BoundaryRect;
    };

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getBoundaryLimits = (containerWidth: number, containerHeight: number) => {
  const maxWidth = Math.max(
    MIN_BOUNDARY_WIDTH,
    containerWidth - BOUNDARY_MARGIN,
  );
  const maxHeight = Math.max(
    MIN_BOUNDARY_HEIGHT,
    containerHeight - BUTTON_OFFSET_Y - BOUNDARY_MARGIN,
  );

  return { maxWidth, maxHeight };
};

export const DraggableBoundaryBox = ({
  map,
  mapContainerRef,
}: {
  map: Map | null;
  mapContainerRef: RefObject<HTMLDivElement | null>;
}) => {
  const [boundaryRect, setBoundaryRect] = useState<BoundaryRect>({
    x: 48,
    y: 90,
    width: BOUNDARY_WIDTH,
    height: BOUNDARY_HEIGHT,
  });
  const [interactionState, setInteractionState] = useState<InteractionState>({
    mode: "idle",
  });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const handleRef = useRef<HTMLButtonElement | null>(null);
  const setPendingPredictionBBox = useMapStore(
    (state) => state.setPendingPredictionBBox,
  );

  const clampRectToContainer = useCallback(
    (nextRect: BoundaryRect, width: number, height: number): BoundaryRect => {
      const { maxWidth, maxHeight } = getBoundaryLimits(width, height);
      const nextWidth = clamp(nextRect.width, MIN_BOUNDARY_WIDTH, maxWidth);
      const nextHeight = clamp(nextRect.height, MIN_BOUNDARY_HEIGHT, maxHeight);
      const maxX = Math.max(0, width - nextWidth);
      const maxY = Math.max(0, height - nextHeight - BUTTON_OFFSET_Y);

      return {
        x: clamp(nextRect.x, 0, maxX),
        y: clamp(nextRect.y, 0, maxY),
        width: nextWidth,
        height: nextHeight,
      };
    },
    [],
  );

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const syncSize = () => {
      const rect = container.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
      setBoundaryRect((prev) =>
        clampRectToContainer(prev, rect.width, rect.height),
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
  }, [clampRectToContainer, mapContainerRef]);

  useEffect(() => {
    if (interactionState.mode === "idle") return;

    const handlePointerMove = (event: PointerEvent) => {
      const container = mapContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();

      if (interactionState.mode === "drag") {
        setBoundaryRect((prev) =>
          clampRectToContainer(
            {
              ...prev,
              x: event.clientX - rect.left - interactionState.offsetX,
              y: event.clientY - rect.top - interactionState.offsetY,
            },
            rect.width,
            rect.height,
          ),
        );
        return;
      }

      const dx = event.clientX - interactionState.startClientX;
      const dy = event.clientY - interactionState.startClientY;
      const { edge, startRect } = interactionState;
      const { maxWidth, maxHeight } = getBoundaryLimits(
        rect.width,
        rect.height,
      );
      let nextRect: BoundaryRect = { ...startRect };

      if (edge === "right") {
        const rightMaxWidth = Math.min(maxWidth, rect.width - startRect.x);
        nextRect.width = clamp(
          startRect.width + dx,
          MIN_BOUNDARY_WIDTH,
          rightMaxWidth,
        );
      }

      if (edge === "left") {
        const right = startRect.x + startRect.width;
        const minX = Math.max(0, right - maxWidth);
        const maxX = right - MIN_BOUNDARY_WIDTH;
        nextRect.x = clamp(startRect.x + dx, minX, maxX);
        nextRect.width = right - nextRect.x;
      }

      if (edge === "bottom") {
        const bottomMaxHeight = Math.min(
          maxHeight,
          rect.height - BUTTON_OFFSET_Y - startRect.y,
        );
        nextRect.height = clamp(
          startRect.height + dy,
          MIN_BOUNDARY_HEIGHT,
          bottomMaxHeight,
        );
      }

      if (edge === "top") {
        const bottom = startRect.y + startRect.height;
        const minY = Math.max(0, bottom - maxHeight);
        const maxY = bottom - MIN_BOUNDARY_HEIGHT;
        nextRect.y = clamp(startRect.y + dy, minY, maxY);
        nextRect.height = bottom - nextRect.y;
      }

      setBoundaryRect(clampRectToContainer(nextRect, rect.width, rect.height));
    };

    const handlePointerUp = () => {
      setInteractionState({ mode: "idle" });
      handleRef.current?.blur();
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [clampRectToContainer, interactionState, mapContainerRef]);

  const handleDragStart = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const container = mapContainerRef.current;
    if (!container) return;

    event.preventDefault();
    event.stopPropagation();

    const rect = container.getBoundingClientRect();
    setInteractionState({
      mode: "drag",
      offsetX: event.clientX - rect.left - boundaryRect.x,
      offsetY: event.clientY - rect.top - boundaryRect.y,
    });
  };

  const handleResizeStart =
    (edge: ResizeEdge) => (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      setInteractionState({
        mode: "resize",
        edge,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startRect: boundaryRect,
      });
    };

  const triggerMainGenerateButton = useCallback(() => {
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

    if (targetOnlineButton && map) {
      const topLeft = map.unproject([boundaryRect.x, boundaryRect.y]);
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

      setPendingPredictionBBox(bbox);
    }

    const targetButton =
      targetOnlineButton ||
      buttons.find((button) => !button.disabled && button.offsetParent !== null) ||
      buttons.find((button) => !button.disabled) ||
      null;

    targetButton?.click();
  }, [boundaryRect, map, setPendingPredictionBBox]);

  const canRender = useMemo(
    () => containerSize.width > 0 && containerSize.height > 0,
    [containerSize.height, containerSize.width],
  );

  if (!canRender) return null;

  const isDragging = interactionState.mode === "drag";

  return (
    <div className="absolute inset-0 map-elements-z-index pointer-events-none">
      <div
        className="absolute border-2 border-red-500 rounded-sm shadow-[0_0_0_1px_rgba(239,68,68,0.25)]"
        style={{
          width: `${boundaryRect.width}px`,
          height: `${boundaryRect.height}px`,
          left: `${boundaryRect.x}px`,
          top: `${boundaryRect.y}px`,
        }}
      >
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
          ref={handleRef}
          type="button"
          onPointerDown={handleDragStart}
          title="Move boundary"
          className={`absolute -top-4 -right-4 pointer-events-auto rounded-full bg-white border border-red-500 p-1.5 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        >
          <ArrowMoveIcon className="w-4 h-4 text-red-600" />
        </button>

        <button
          type="button"
          onClick={triggerMainGenerateButton}
          className="absolute -bottom-12 right-0 pointer-events-auto text-nowrap bg-primary px-3 py-2 rounded-md text-white"
        >
          <span className="capitalize text-body-4">
            {START_MAPPING_PAGE_CONTENT.buttons.runPrediction}
          </span>
        </button>
      </div>
    </div>
  );
};
