import { DirectionIcon } from "@/components/ui/icons";
import { ToolTipPlacement } from "@/enums";
import { DirectionalButton } from "@/features/model-creation/components/training-area/training-labels-offset";

type StepTwoOffsetPanelProps = {
  offset: [number, number];
  onNudge: (dx: number, dy: number) => void;
};

export const StepTwoOffsetPanel = ({
  offset,
  onNudge,
}: StepTwoOffsetPanelProps) => (
  <div className="pointer-events-auto absolute left-16 top-44 w-[230px] rounded-xl bg-white p-4 shadow-lg">
    <p className="text-body-3 text-dark">
      Adjust the fetched result offset, or enter the offset values in meters.
    </p>
    <div className="mt-3 rounded-xl bg-[#e6e6e6] p-2">
      <div className="relative h-24 rounded-lg bg-[#f8f8f8]">
        <DirectionalButton
          positionClasses="absolute left-1/2 top-1 h-6 w-6 -translate-x-1/2 rounded-full text-dark"
          onClick={() => onNudge(0, 1)}
          tooltip="Move offset up"
          icon={<DirectionIcon className="mx-auto h-3 w-3 -rotate-90" />}
        />

        <DirectionalButton
          positionClasses="absolute left-1 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full text-dark"
          onClick={() => onNudge(-1, 0)}
          tooltip="Move offset left"
          toolTipPlacement={ToolTipPlacement.LEFT}
          icon={<DirectionIcon className="mx-auto h-3 w-3 -rotate-180" />}
        />

        <DirectionalButton
          positionClasses="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full text-dark"
          onClick={() => onNudge(1, 0)}
          tooltip="Move offset right"
          toolTipPlacement={ToolTipPlacement.RIGHT}
          icon={<DirectionIcon className="mx-auto h-3 w-3" />}
        />

        <DirectionalButton
          positionClasses="absolute bottom-1 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full text-dark"
          onClick={() => onNudge(0, -1)}
          tooltip="Move offset down"
          toolTipPlacement={ToolTipPlacement.BOTTOM}
          icon={<DirectionIcon className="mx-auto h-3 w-3 rotate-90" />}
        />

        <div className="absolute left-1/2 top-1/2 min-w-[110px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-[#dedede] px-3 py-2 text-center text-body-3 text-dark">
          {offset[0].toFixed(2)}, {offset[1].toFixed(2)}
        </div>
      </div>
    </div>
  </div>
);
