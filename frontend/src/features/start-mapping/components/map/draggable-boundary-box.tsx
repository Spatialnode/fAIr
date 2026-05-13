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
import { LngLatBounds, LngLatBoundsLike, Map } from "maplibre-gl";
import { useMapStore } from "@/store/map-store";

const CELL_SIZE = 70;
const MAX_GRID_DIM = 5;
const GRID_PIXEL_SIZE = CELL_SIZE * MAX_GRID_DIM;

type CellKey = string;

const cellKey = (row: number, col: number): CellKey => `${row},${col}`;
const parseCell = (key: CellKey): [number, number] => {
  const [r, c] = key.split(",").map(Number);
  return [r, c];
};

const clamp = (value: number, min: number, max: number) => {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
};

export const DraggableBoundaryBox = ({
  map,
  mapContainerRef,
  imageryBounds,
}: {
  map: Map | null;
  mapContainerRef: RefObject<HTMLDivElement | null>;
  imageryBounds?: LngLatBoundsLike;
}) => {
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [cells, setCells] = useState<Set<CellKey>>(new Set());
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [mapViewTick, setMapViewTick] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef<{ dx: number; dy: number } | null>(null);
  const hasInitializedGrid = useRef(false);

  const setPendingPredictionBBox = useMapStore(
    (state) => state.setPendingPredictionBBox,
  );
  const boundaryPredictionPending = useMapStore(
    (state) => state.boundaryPredictionPending,
  );
  const boundaryPredictionEnabled = useMapStore(
    (state) => state.boundaryPredictionEnabled,
  );
  const currentZoom = useMapStore((state) => state.zoom);
  const isAtPredictionZoom = currentZoom >= 18;

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const sync = () => {
      const rect = container.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    };

    sync();

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(sync);
      ro.observe(container);
      return () => ro.disconnect();
    }

    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [mapContainerRef]);

  useEffect(() => {
    if (!map) return;
    const handler = () => setMapViewTick((t) => t + 1);
    map.on("move", handler);
    map.on("zoom", handler);
    return () => {
      map.off("move", handler);
      map.off("zoom", handler);
    };
  }, [map]);

  const getOriginLimits = useCallback(() => {
    const minX = 0;
    const minY = 0;
    let maxX = Math.max(0, containerSize.width - GRID_PIXEL_SIZE);
    let maxY = Math.max(0, containerSize.height - GRID_PIXEL_SIZE);

    let imageryMinX = minX;
    let imageryMinY = minY;
    let imageryMaxX = maxX;
    let imageryMaxY = maxY;

    if (map && imageryBounds) {
      const b = LngLatBounds.convert(imageryBounds);
      const nw = map.project([b.getWest(), b.getNorth()]);
      const se = map.project([b.getEast(), b.getSouth()]);
      const imgLeft = Math.min(nw.x, se.x);
      const imgRight = Math.max(nw.x, se.x);
      const imgTop = Math.min(nw.y, se.y);
      const imgBottom = Math.max(nw.y, se.y);

      imageryMinX = imgLeft;
      imageryMinY = imgTop;
      imageryMaxX = imgRight - GRID_PIXEL_SIZE;
      imageryMaxY = imgBottom - GRID_PIXEL_SIZE;
    }

    return {
      minX: Math.max(minX, imageryMinX),
      minY: Math.max(minY, imageryMinY),
      maxX: Math.min(maxX, imageryMaxX),
      maxY: Math.min(maxY, imageryMaxY),
    };
  }, [containerSize.width, containerSize.height, map, imageryBounds]);

  const clampOrigin = useCallback(
    (x: number, y: number) => {
      const limits = getOriginLimits();
      return {
        x: clamp(x, limits.minX, limits.maxX),
        y: clamp(y, limits.minY, limits.maxY),
      };
    },
    [getOriginLimits],
  );

  useEffect(() => {
    if (hasInitializedGrid.current) return;
    if (!isAtPredictionZoom) return;
    if (containerSize.width === 0 || containerSize.height === 0) return;

    const initialOrigin = clampOrigin(
      (containerSize.width - GRID_PIXEL_SIZE) / 2,
      (containerSize.height - GRID_PIXEL_SIZE) / 2,
    );

    const initialCells = new Set<CellKey>();
    for (let r = 0; r < MAX_GRID_DIM; r++) {
      for (let c = 0; c < MAX_GRID_DIM; c++) {
        initialCells.add(cellKey(r, c));
      }
    }

    setOrigin(initialOrigin);
    setCells(initialCells);
    hasInitializedGrid.current = true;
  }, [
    isAtPredictionZoom,
    containerSize.width,
    containerSize.height,
    clampOrigin,
  ]);

  useEffect(() => {
    if (!origin) return;
    void mapViewTick;
    const clamped = clampOrigin(origin.x, origin.y);
    if (clamped.x !== origin.x || clamped.y !== origin.y) {
      setOrigin(clamped);
    }
  }, [mapViewTick, clampOrigin, origin]);

  useEffect(() => {
    if (!isDragging) return;

    const onPointerMove = (event: PointerEvent) => {
      const container = mapContainerRef.current;
      if (!container || !dragOffsetRef.current) return;
      const rect = container.getBoundingClientRect();
      const nextX = event.clientX - rect.left - dragOffsetRef.current.dx;
      const nextY = event.clientY - rect.top - dragOffsetRef.current.dy;
      setOrigin(clampOrigin(nextX, nextY));
    };

    const onPointerUp = () => {
      setIsDragging(false);
      dragOffsetRef.current = null;
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [isDragging, clampOrigin, mapContainerRef]);

  const handleDragStart = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!origin) return;
    const container = mapContainerRef.current;
    if (!container) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = container.getBoundingClientRect();
    dragOffsetRef.current = {
      dx: event.clientX - rect.left - origin.x,
      dy: event.clientY - rect.top - origin.y,
    };
    setIsDragging(true);
  };

  const cellRects = useMemo(() => {
    if (!origin) return [];
    return [...cells].map((key) => {
      const [r, c] = parseCell(key);
      return {
        key,
        x: origin.x + c * CELL_SIZE,
        y: origin.y + r * CELL_SIZE,
      };
    });
  }, [origin, cells]);

  const gridBounds = useMemo(() => {
    if (!origin || cells.size === 0) return null;
    const rows = [...cells].map((k) => parseCell(k)[0]);
    const cols = [...cells].map((k) => parseCell(k)[1]);
    const minR = Math.min(...rows);
    const maxR = Math.max(...rows);
    const minC = Math.min(...cols);
    const maxC = Math.max(...cols);
    return {
      x: origin.x + minC * CELL_SIZE,
      y: origin.y + minR * CELL_SIZE,
      width: (maxC - minC + 1) * CELL_SIZE,
      height: (maxR - minR + 1) * CELL_SIZE,
    };
  }, [origin, cells]);

  const triggerGenerate = useCallback(() => {
    if (
      !boundaryPredictionEnabled ||
      boundaryPredictionPending ||
      !gridBounds ||
      !map
    )
      return;

    const topLeft = map.unproject([gridBounds.x, gridBounds.y]);
    const bottomRight = map.unproject([
      gridBounds.x + gridBounds.width,
      gridBounds.y + gridBounds.height,
    ]);

    const bboxValue: BBOX = [
      Math.min(topLeft.lng, bottomRight.lng),
      Math.min(topLeft.lat, bottomRight.lat),
      Math.max(topLeft.lng, bottomRight.lng),
      Math.max(topLeft.lat, bottomRight.lat),
    ];

    setPendingPredictionBBox(bboxValue);

    const boundaryProxyButton = document.querySelector<HTMLButtonElement>(
      '[data-start-mapping-boundary-generate-button="true"]',
    );
    if (boundaryProxyButton && !boundaryProxyButton.disabled) {
      boundaryProxyButton.click();
      return;
    }

    const buttons = Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        '[data-start-mapping-generate-button="true"]',
      ),
    );
    const target =
      buttons.find(
        (b) =>
          b.dataset.startMappingPredictOnline === "true" &&
          !b.disabled &&
          b.offsetParent !== null,
      ) ||
      buttons.find(
        (b) => b.dataset.startMappingPredictOnline === "true" && !b.disabled,
      ) ||
      buttons.find((b) => !b.disabled && b.offsetParent !== null) ||
      buttons.find((b) => !b.disabled) ||
      null;

    target?.click();
  }, [
    boundaryPredictionEnabled,
    boundaryPredictionPending,
    gridBounds,
    map,
    setPendingPredictionBBox,
  ]);

  if (containerSize.width === 0 || containerSize.height === 0) return null;
  if (!isAtPredictionZoom) return null;

  return (
    <div className="absolute inset-0 map-elements-z-index pointer-events-none">
      <svg
        className="absolute inset-0"
        width={containerSize.width}
        height={containerSize.height}
      >
        <defs>
          <mask id="start-mapping-grid-cutout">
            <rect width="100%" height="100%" fill="white" />
            {cellRects.map((cell) => (
              <rect
                key={`mask-${cell.key}`}
                x={cell.x}
                y={cell.y}
                width={CELL_SIZE}
                height={CELL_SIZE}
                fill="black"
              />
            ))}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(75, 85, 99, 0.55)"
          mask="url(#start-mapping-grid-cutout)"
        />
        {cellRects.map((cell) => (
          <rect
            key={`border-${cell.key}`}
            x={cell.x}
            y={cell.y}
            width={CELL_SIZE}
            height={CELL_SIZE}
            fill="none"
            stroke="rgb(239, 68, 68)"
            strokeWidth={2}
          />
        ))}
      </svg>

      {gridBounds && (
        <button
          type="button"
          onPointerDown={handleDragStart}
          title="Move grid"
          aria-label="Move grid"
          style={{
            left: `${gridBounds.x + gridBounds.width}px`,
            top: `${gridBounds.y}px`,
            transform: "translate(-50%, -50%)",
          }}
          className={`absolute pointer-events-auto rounded-full bg-white border border-red-500 p-1.5 ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          <ArrowMoveIcon className="w-4 h-4 text-red-600" />
        </button>
      )}

      {gridBounds && (
        <button
          type="button"
          disabled={!boundaryPredictionEnabled || boundaryPredictionPending}
          onClick={triggerGenerate}
          style={{
            left: `${gridBounds.x + gridBounds.width}px`,
            top: `${gridBounds.y + gridBounds.height + 8}px`,
            transform: "translateX(-100%)",
          }}
          className={`absolute pointer-events-auto text-nowrap px-3 py-2 rounded-md text-white ${
            !boundaryPredictionEnabled || boundaryPredictionPending
              ? "bg-primary/60 cursor-not-allowed"
              : "bg-primary"
          }`}
        >
          <span className="capitalize text-body-4">
            {boundaryPredictionPending
              ? "Generating..."
              : START_MAPPING_PAGE_CONTENT.buttons.runPrediction}
          </span>
        </button>
      )}
    </div>
  );
};
