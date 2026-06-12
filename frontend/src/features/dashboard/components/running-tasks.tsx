import { Badge } from "@/components/ui/badge";
import { DropDown } from "@/components/ui/dropdown";
import { ChevronDownIcon } from "@/components/ui/icons";
import { DropdownPlacement } from "@/enums";
export const RUNNING_TASKS: RunningTask[] = [
  {
    title: "Banepa Nepal Offline",
    type: "Prediction Request",
    variant: "blue",
  },
  {
    title: "San Jose Buildings - Rooftop",
    type: "MapSwipe Project",
    variant: "yellow",
  },
];

export type RunningTask = {
  title: string;
  type: string;
  variant: "blue" | "yellow";
};

export const RunningTasksCard = () => (
  <article className="rounded-2xl h-full bg-frosted-blue p-5 space-y-4 lg:row-span-2">
    <div className="flex items-center justify-between">
      <h3 className="text-title-3 font-semibold text-dark">Running Tasks</h3>
      <DropDown
        placement={DropdownPlacement.BOTTOM_END}
        distance={8}
        disableCheveronIcon
        menuItems={[{ value: "All" }]}
        triggerComponent={
          <button className="text-body-2base rounded-md bg-off-white px-2 py-1 inline-flex items-center gap-1 text-dark">
            All
            <ChevronDownIcon className="h-3 w-3" />
          </button>
        }
      />
    </div>
    <div className="grid grid-cols-4 gap-3 text-body-2base text-grey border-b border-gray-border pb-2">
      <p className="col-span-2">Title</p>
      <p className="col-span-1">Task Type</p>
      <span />
    </div>
    <div className="space-y-3">
      {RUNNING_TASKS.map((task) => (
        <div
          key={task.title}
          className="grid grid-cols-4 gap-3 items-center py-3"
        >
          <p className="text-sm col-span-2 text-dark truncate">{task.title}</p>
          <div className="flex items-center  justify-between col-span-2">
            <Badge
              variant={task.variant}
              className="px-3 !min-w-0 py-1 !text-xs whitespace-nowrap"
            >
              {task.type}
            </Badge>
            <ChevronDownIcon className="-rotate-90 h-3.5 w-3.5 text-dark" />
          </div>
        </div>
      ))}
    </div>
  </article>
);
