import { START_MAPPING_PAGE_CONTENT } from "@/constants";
import { BBOX } from "@/types";
import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Map, MapMouseEvent } from "maplibre-gl";
import { useMapStore } from "@/store/map-store";

const CELL_SIZE = 40;
const MAX_GRID_DIM = 5;

type CellKey = string;

const cellKey = (row: number, col: number): CellKey => `${row},${col}`;
const parseCell = (key: CellKey): [number, number] => {
  const [r, c] = key.split(",").map(Number);
  return [r, c];
};

export const DraggableBoundaryBox = ({
  map,
  mapContainerRef,
}: {
  map: Map | null;
  mapContainerRef: RefObject<HTMLDivElement | null>;
}) => {
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [cells, setCells] = useState<Set<CellKey>>(new Set());
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const hasInitializedGrid = useRef(false);
  const missClickCountRef = useRef(0);

  const setPendingPredictionBBox = useMapStore(
    (state) => state.setPendingPredictionBBox,
  );
  const boundaryPredictionPending = useMapStore(
    (state) => state.boundaryPredictionPending,
  );
  const boundaryPredictionEnabled = useMapStore(
    (state) => state.boundaryPredictionEnabled,
  );

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
    if (hasInitializedGrid.current) return;
    if (!boundaryPredictionEnabled) return;
    if (containerSize.width === 0 || containerSize.height === 0) return;

    const gridPixelSize = MAX_GRID_DIM * CELL_SIZE;
    const originX = Math.max(0, (containerSize.width - gridPixelSize) / 2);
    const originY = Math.max(0, (containerSize.height - gridPixelSize) / 2);

    const initialCells = new Set<CellKey>();
    for (let r = 0; r < MAX_GRID_DIM; r++) {
      for (let c = 0; c < MAX_GRID_DIM; c++) {
        initialCells.add(cellKey(r, c));
      }
    }

    setOrigin({ x: originX, y: originY });
    setCells(initialCells);
    hasInitializedGrid.current = true;
  }, [boundaryPredictionEnabled, containerSize.width, containerSize.height]);

  useEffect(() => {
    if (!map) return;

    const handleMapClick = (event: MapMouseEvent) => {
      if (!boundaryPredictionEnabled) return;
      const { x, y } = event.point;

      if (!origin || cells.size === 0) {
        setOrigin({ x: x - CELL_SIZE / 2, y: y - CELL_SIZE / 2 });
        setCells(new Set([cellKey(0, 0)]));
        missClickCountRef.current = 0;
        return;
      }

      const col = Math.floor((x - origin.x) / CELL_SIZE);
      const row = Math.floor((y - origin.y) / CELL_SIZE);
      const key = cellKey(row, col);

      if (cells.has(key)) {
        const next = new Set(cells);
        next.delete(key);
        setCells(next);
        if (next.size === 0) setOrigin(null);
        missClickCountRef.current = 0;
        return;
      }

      const isAdjacent =
        cells.has(cellKey(row - 1, col)) ||
        cells.has(cellKey(row + 1, col)) ||
        cells.has(cellKey(row, col - 1)) ||
        cells.has(cellKey(row, col + 1));

      const rows = [...cells].map((k) => parseCell(k)[0]).concat(row);
      const cols = [...cells].map((k) => parseCell(k)[1]).concat(col);
      const withinBounds =
        Math.max(...rows) - Math.min(...rows) + 1 <= MAX_GRID_DIM &&
        Math.max(...cols) - Math.min(...cols) + 1 <= MAX_GRID_DIM;

      if (isAdjacent && withinBounds) {
        const next = new Set(cells);
        next.add(key);
        setCells(next);
        missClickCountRef.current = 0;
        return;
      }

      missClickCountRef.current += 1;
      if (missClickCountRef.current >= 3) {
        const gridPixelSize = MAX_GRID_DIM * CELL_SIZE;
        const newOriginX = x - gridPixelSize / 2;
        const newOriginY = y - gridPixelSize / 2;

        const newCells = new Set<CellKey>();
        for (let r = 0; r < MAX_GRID_DIM; r++) {
          for (let c = 0; c < MAX_GRID_DIM; c++) {
            newCells.add(cellKey(r, c));
          }
        }

        setOrigin({ x: newOriginX, y: newOriginY });
        setCells(newCells);
        missClickCountRef.current = 0;
      }
    };

    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [map, boundaryPredictionEnabled, origin, cells]);

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
