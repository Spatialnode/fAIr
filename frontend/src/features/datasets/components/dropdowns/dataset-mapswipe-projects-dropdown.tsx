import { DropDown } from "@/components/ui/dropdown";
import { MapswipeResultDropdownIcon } from "@/components/ui/icons/mapswipe-result-dropdown-icon";
import { ExternalLinkIcon } from "@/components/ui/icons";
import { DropdownPlacement } from "@/enums";
import { TMapSwipeDummyProject } from "@/features/datasets/utils/dataset-flow-mocks";
import { DatasetDetailItem } from "@/features/datasets/components/dataset-detail-item";

export const DatasetMapSwipeProjectsDropdown = ({mapswipeProjects}: { mapswipeProjects: TMapSwipeDummyProject[] }) => {
  return (
    <DropDown
      disableCheveronIcon
      className="bg-transparent border-none p-0"
      placement={DropdownPlacement.BOTTOM_START}
      distance={8}
      triggerComponent={
        <div className="group/trigger flex items-center gap-x-2 text-body-2 text-dark transition-colors hover:text-primary">
          <DatasetDetailItem
            label="Label Source"
            value="MapSwipe"
          />

          <MapswipeResultDropdownIcon />
        </div>
      }
    >
      <div className="mt-1 min-w-[220px] rounded-2xl border border-off-white bg-white p-2">
        <p className="px-2 pb-2 text-body-4 text-grey">MapSwipe Projects</p>
        <div className="flex flex-col gap-1">
          {mapswipeProjects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between rounded-xl px-2 py-2"
            >
              <span className="text-body-3 font-medium text-dark">
                {project.id}
              </span>
              <ExternalLinkIcon className="size-4" />
            </div>
          ))}
        </div>
      </div>
    </DropDown>
  );
};
