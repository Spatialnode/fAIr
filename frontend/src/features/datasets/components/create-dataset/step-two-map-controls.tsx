import { Button } from "@/components/ui/button";
import { ArrowMoveIcon, UploadIcon } from "@/components/ui/icons";
import { NewDrawIcon } from "@/components/ui/icons/new-draw-icon";
import { ButtonVariant, DrawingModes } from "@/enums";

type StepTwoMapSideControlsProps = {
  drawingMode: DrawingModes;
  offsetPanelOpen: boolean;
  onDrawClick: () => void;
  onUploadClick: () => void;
  onToggleOffsetPanel: () => void;
};

export const StepTwoMapSideControls = ({
  drawingMode,
  offsetPanelOpen,
  onDrawClick,
  onUploadClick,
  onToggleOffsetPanel,
}: StepTwoMapSideControlsProps) => {
  const drawIsActive = drawingMode === DrawingModes.RECTANGLE;

  return (
    <div className="pointer-events-auto absolute left-3 top-24 flex flex-col gap-3">
      <div className="flex w-10 gap-2 flex-col overflow-hidden  shadow-sm">
        <button
          type="button"
          className={`flex size-[36px] items-center justify-center ${
            drawIsActive ? " bg-white text-primary" : "bg-primary text-white"
          }`}
          onClick={onDrawClick}
          aria-label="Draw AOI"
        >
          
          <NewDrawIcon className="h-4 w-4" />
        </button>

        <button
          type="button"
          className="flex size-[36px] items-center justify-center border-t border-white/35 bg-primary text-white"
          onClick={onUploadClick}
          aria-label="Upload AOI"
        >
                  <UploadIcon className="h-4 w-4" />

        </button>
      </div>

      <button
        type="button"
        className={`flex size-[36px] items-center justify-center rounded-sm border border-gray-border ${
          offsetPanelOpen ? "bg-primary text-white" : "bg-white text-dark"
        }`}
        onClick={onToggleOffsetPanel}
        aria-label="Adjust offset"
      >
        <ArrowMoveIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

type StepTwoMapBottomControlsProps = {
  uploadIsPending: boolean;
  onDrawClick: () => void;
  onUploadClick: () => void;
};

export const StepTwoMapBottomControls = ({
  uploadIsPending,
  onDrawClick,
  onUploadClick,
}: StepTwoMapBottomControlsProps) => (
  <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
    <div className="flex items-center gap-2 rounded-xl border border-gray-border bg-white px-3 py-2 ">
      <Button
        className="!w-fit min-w-28"
        uppercase={false}
        onClick={onDrawClick}
      >
        <span className="inline-flex items-center gap-2">
          Draw AOI
          <NewDrawIcon className="h-4 w-4 text-white" />
        </span>
      </Button>
      <Button
        variant={ButtonVariant.DARK}
        className="!w-fit min-w-28"
        uppercase={false}
        spinner={uploadIsPending}
        onClick={onUploadClick}
      >
        <span className="inline-flex items-center gap-2">
          Upload AOI
            <UploadIcon className="h-4 w-4" />
        </span>
      </Button>
    </div>
  </div>
);
