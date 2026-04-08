import { ToolTip } from "@/components/ui/tooltip";
import { IconProps } from "@/types";

export type TrainingAreaActionButtonItem = {
  tooltip: string;
  disabled?: boolean;
  onClick: () => void;
  isDelete?: boolean;
  Icon?: React.FC<IconProps>;
  imageSrc?: string;
  imageAlt?: string;
};

export const TrainingAreaActionButtons = ({
  items,
  buttonClassName = "h-8 w-8 p-1.5",
  containerClassName = "flex items-center gap-x-4",
  alignDeleteToEnd = false,
}: {
  items: TrainingAreaActionButtonItem[];
  buttonClassName?: string;
  containerClassName?: string;
  alignDeleteToEnd?: boolean;
}) => (
  <div className={containerClassName}>
    {items.map((item, index) => (
      <ToolTip
        content={item.tooltip}
        key={`training-area-action-item-${index}`}
      >
        <button
          type="button"
          onClick={item.onClick}
          disabled={item.disabled}
          className={`${item.isDelete ? "text-primary bg-secondary" : "bg-off-white"} ${buttonClassName} items-center justify-center flex rounded-md ${alignDeleteToEnd && item.isDelete ? "ml-auto" : ""}`}
        >
          {item.Icon ? (
            <item.Icon className="icon md:icon-lg" />
          ) : item.imageSrc ? (
            <img
              src={item.imageSrc}
              className="icon md:icon-lg"
              alt={item.imageAlt || item.tooltip}
            />
          ) : null}
        </button>
      </ToolTip>
    ))}
  </div>
);
