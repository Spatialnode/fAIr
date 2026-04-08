import { JOSMLogo, OSMLogo } from "@/assets/svgs";
import {
  CloudDownloadIcon,
  DeleteIcon,
  ElipsisIcon,
} from "@/components/ui/icons";
import { TOAST_NOTIFICATIONS } from "@/constants";

import {
  calculateGeoJSONArea,
  formatAreaInAppropriateUnit,
  formatDuration,
  geoJSONDowloader,
  openInIDEditor,
  openInJOSM,
  showSuccessToast,
} from "@/utils";
import { Map } from "maplibre-gl";
import { TAAnchor } from "@/features/datasets/utils/step-two-utils";
import {
  TrainingAreaActionButtonItem,
  TrainingAreaActionButtons,
} from "@/features/datasets/components/create-dataset/training-area-buttons";

type StepTwoAoiAnchorsProps = {
  anchors: TAAnchor[];
  selectedAoiId: number | null;
  onToggle: (aoiId: number) => void;
};

export const StepTwoAoiAnchors = ({
  anchors,
  selectedAoiId,
  onToggle,
}: StepTwoAoiAnchorsProps) => (
  <>
    {anchors.map((anchor) => (
      <button
        key={`aoi-action-anchor-${anchor.id}`}
        type="button"
        className={`pointer-events-auto absolute z-30 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 shadow ${
          selectedAoiId === anchor.id
            ? "border-primary bg-primary text-white"
            : "border-gray-border bg-white text-dark"
        }`}
        style={{ left: anchor.x, top: anchor.y }}
        onClick={(event) => {
          event.stopPropagation();
          onToggle(anchor.id);
        }}
        aria-label={`Open actions for training area ${anchor.id}`}
      >
        <ElipsisIcon className="h-4 w-4" />
      </button>
    ))}
  </>
);

type StepTwoAoiActionCardProps = {
  selectedAnchor: TAAnchor | null;
  map: Map | null;
  datasetId: number;
  datasetName: string;
  tileServerURL: string;
  deleteIsPending: boolean;
  onDownloadLabels: (aoiId: number) => void;
  onDeleteAoi: (aoiId: number) => void;
};

export const StepTwoAoiActionCard = ({
  selectedAnchor,
  map,
  datasetId,
  datasetName,
  tileServerURL,
  deleteIsPending,
  onDownloadLabels,
  onDeleteAoi,
}: StepTwoAoiActionCardProps) => {
  if (!selectedAnchor) return null;

  const mapContainerWidth = map?.getContainer().clientWidth ?? 0;
  const mapContainerHeight = map?.getContainer().clientHeight ?? 0;
  const actionItems: TrainingAreaActionButtonItem[] = [
    {
      tooltip: "Open in JOSM",
      imageSrc: JOSMLogo,
      imageAlt: "JOSM",
      onClick: () => {
        void openInJOSM(datasetName, tileServerURL, [selectedAnchor.feature]);
      },
    },
    {
      tooltip: "Open in iD editor",
      imageSrc: OSMLogo,
      imageAlt: "OSM",
      onClick: () =>
        openInIDEditor(
          [selectedAnchor.feature],
          tileServerURL,
          String(datasetId),
          selectedAnchor.feature.id,
        ),
    },
    {
      tooltip: "Download AOI",
      Icon: CloudDownloadIcon,
      onClick: () => {
        geoJSONDowloader(
          selectedAnchor.feature,
          `AOI_${selectedAnchor.feature.id}`,
        );
        showSuccessToast(TOAST_NOTIFICATIONS.aoiDownloadSuccess);
      },
    },
    {
      tooltip: "Download labels",
      Icon: CloudDownloadIcon,
      onClick: () => onDownloadLabels(selectedAnchor.feature.id),
    },
    {
      tooltip: "Delete AOI",
      Icon: DeleteIcon,
      isDelete: true,
      disabled: deleteIsPending,
      onClick: () => onDeleteAoi(selectedAnchor.feature.id),
    },
  ];

  return (
    <div
      className="pointer-events-auto absolute z-40 w-[200px] rounded-2xl bg-white p-3 shadow-lg"
      style={{
        left: Math.max(
          12,
          Math.min(selectedAnchor.x + 12, mapContainerWidth - 212),
        ),
        top: Math.max(
          12,
          Math.min(selectedAnchor.y + 12, mapContainerHeight - 160),
        ),
      }}
    >
      <p className="text-body-3 font-semibold text-dark">
        TA id {selectedAnchor.feature.id}
      </p>
      <p className="text-body-4 text-grey">
        Area:{" "}
        {formatAreaInAppropriateUnit(
          calculateGeoJSONArea(selectedAnchor.feature),
        )}
      </p>
      <p className="mb-2 text-body-4 text-grey">
        Created{" "}
        {formatDuration(
          new Date(selectedAnchor.feature.properties.created_at),
          new Date(),
          1,
        )}{" "}
        ago
      </p>

      <TrainingAreaActionButtons
        items={actionItems}
        buttonClassName="h-7 w-7"
        containerClassName="flex items-center gap-2"
        alignDeleteToEnd
      />
    </div>
  );
};
