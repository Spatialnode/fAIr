import { START_MAPPING_PAGE_CONTENT } from "@/constants";
import { ArrowMoveIcon } from "@/components/ui/icons";
import {
  PointerEvent as ReactPointerEvent,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

type DragState = {
  isDragging: boolean;
  offsetX: number;
  offsetY: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getBoundarySize = (containerWidth: number, containerHeight: number) => {
  const maxWidth = Math.max(MIN_BOUNDARY_WIDTH, containerWidth - BOUNDARY_MARGIN);
  const maxHeight = Math.max(
    MIN_BOUNDARY_HEIGHT,
    containerHeight - BUTTON_OFFSET_Y - BOUNDARY_MARGIN,
  );

  return {
    width: Math.min(BOUNDARY_WIDTH, maxWidth),
    height: Math.min(BOUNDARY_HEIGHT, maxHeight),
  };
};

export const DraggableBoundaryBox = ({
  mapContainerRef,
}: {
  mapContainerRef: RefObject<HTMLDivElement | null>;
}) => {
  const [position, setPosition] = useState<Position>({ x: 48, y: 90 });
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    offsetX: 0,
    offsetY: 0,
  });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const handleRef = useRef<HTMLButtonElement | null>(null);

  const boundarySize = useMemo(
    () => getBoundarySize(containerSize.width, containerSize.height),
    [containerSize.height, containerSize.width],
  );

  const clampPosition = useCallback(
    (
      nextPosition: Position,
      width: number,
      height: number,
      boundaryWidth: number,
      boundaryHeight: number,
    ): Position => {
      const maxX = Math.max(0, width - boundaryWidth);
      const maxY = Math.max(0, height - boundaryHeight - BUTTON_OFFSET_Y);
      return {
        x: clamp(nextPosition.x, 0, maxX),
        y: clamp(nextPosition.y, 0, maxY),
      };
    },
    [],
  );

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const syncSize = () => {
      const rect = container.getBoundingClientRect();
      const nextBoundarySize = getBoundarySize(rect.width, rect.height);
      setContainerSize({ width: rect.width, height: rect.height });
      setPosition((prev) =>
        clampPosition(
          prev,
          rect.width,
          rect.height,
          nextBoundarySize.width,
          nextBoundarySize.height,
        ),
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
  }, [clampPosition, mapContainerRef]);

  useEffect(() => {
    if (!dragState.isDragging) return;

    const handlePointerMove = (event: PointerEvent) => {
      const container = mapContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const nextPosition = {
        x: event.clientX - rect.left - dragState.offsetX,
        y: event.clientY - rect.top - dragState.offsetY,
      };

      setPosition(
        clampPosition(
          nextPosition,
          rect.width,
          rect.height,
          boundarySize.width,
          boundarySize.height,
        ),
      );
    };

    const handlePointerUp = () => {
      setDragState((prev) => ({ ...prev, isDragging: false }));
      handleRef.current?.blur();
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [
    boundarySize.height,
    boundarySize.width,
    clampPosition,
    dragState.isDragging,
    dragState.offsetX,
    dragState.offsetY,
    mapContainerRef,
  ]);

  const handleDragStart = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const container = mapContainerRef.current;
    if (!container) return;

    event.preventDefault();
    event.stopPropagation();

    const rect = container.getBoundingClientRect();
    setDragState({
      isDragging: true,
      offsetX: event.clientX - rect.left - position.x,
      offsetY: event.clientY - rect.top - position.y,
    });
  };

  const triggerMainGenerateButton = useCallback(() => {
    const buttons = Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        '[data-start-mapping-generate-button="true"]',
      ),
    );

    const targetButton =
      buttons.find((button) => !button.disabled && button.offsetParent !== null) ||
      buttons.find((button) => !button.disabled) ||
      null;

    targetButton?.click();
  }, []);

  const canRender = useMemo(
    () => containerSize.width > 0 && containerSize.height > 0,
    [containerSize.height, containerSize.width],
  );

  if (!canRender) return null;

  return (
    <div className="absolute inset-0 map-elements-z-index pointer-events-none">
      <div
        className="absolute border-2 border-red-500 rounded-sm shadow-[0_0_0_1px_rgba(239,68,68,0.25)]"
        style={{
          width: `${boundarySize.width}px`,
          height: `${boundarySize.height}px`,
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <button
          ref={handleRef}
          type="button"
          onPointerDown={handleDragStart}
          title="Move boundary"
          className={`absolute -top-4 -right-4 pointer-events-auto rounded-full bg-white border border-red-500 p-1.5 ${dragState.isDragging ? "cursor-grabbing" : "cursor-grab"}`}
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
