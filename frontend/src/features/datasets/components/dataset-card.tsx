import { CheckIcon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import { APPLICATION_ROUTES } from "@/constants";
import { TTrainingDataset } from "@/types";
import { MapSwipeLogo } from "@/assets/svgs";

import {
  getDatasetDummyTags,
  hasMapSwipeBadge,
} from "@/features/datasets/utils/dataset-flow-mocks";
import Badge from "@/components/ui/badge/badge";
export const DatasetCard = ({
  dataset,
  showUsername = true,
  selectedDatasetId,
  onDatasetSelect,
  navigateOnClick = false,
}: {
  dataset: TTrainingDataset;
  showUsername?: boolean;
  selectedDatasetId?: number;
  onDatasetSelect?: (dataset: TTrainingDataset) => void;
  navigateOnClick?: boolean;
}) => {
  const tags = getDatasetDummyTags(dataset.id);
  const showMapSwipeIndicator = hasMapSwipeBadge(dataset.id);
  const handleClick: React.MouseEventHandler = () => {
    if (navigateOnClick) {
      return;
    }
    onDatasetSelect && onDatasetSelect(dataset);
  };

  const handleKeyDown: React.KeyboardEventHandler = (e) => {
    if ((e.key === "Enter" || e.key === " ") && onDatasetSelect) {
      e.preventDefault();
      onDatasetSelect(dataset);
    }
  };

  return (
    <Link
      disableLinkStyle
      nativeAnchor={false}
      title={dataset.name}
      href={
        navigateOnClick ? `${APPLICATION_ROUTES.DATASETS}/${dataset.id}` : "#"
      }
      onClick={!navigateOnClick ? handleClick : undefined}
      onKeyDown={handleKeyDown}
    >
      <div
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-pressed={selectedDatasetId === dataset.id}
        aria-label={`Dataset ${dataset.name}`}
        className={`relative w-full rounded-md border border-gray-border bg-frosted-blue p-4 transition-colors duration-150 flex min-h-[200px] flex-col justify-between cursor-pointer ${selectedDatasetId === dataset.id ? "outline outline-primary outline-offset-2" : "hover:border-primary"}`}
      >
        <div className={`flex w-full flex-col gap-y-2 `}>
          <div>
            <h1
              className={`overflow-hidden text-ellipsis whitespace-normal font-semibold text-dark h-12 line-clamp-2 text-body-2base`}
            >
              {dataset.name}
            </h1>
          </div>
          <div className="flex items-start justify-between gap-3">
            <Badge
              variant="default"
              className="rounded-[4px] bg-primary text-white font-semibold"
            >
              <span className="text-body-3 uppercase">ID: {dataset.id}</span>
            </Badge>
            {/* This will be replaced when the mapswipe data is being returned */}
            {showMapSwipeIndicator && (
              <img
                src={MapSwipeLogo}
                alt="MapSwipe linked"
                className="h-6 w-6 flex-shrink-0"
              />
            )}
          </div>
        </div>

        <div className={`flex w-full gap-x-4 justify-between`}>
          <div>
            <p className="text-body-4 text-grey">Used by:</p>
            <p className="text-body-3 font-semibold text-dark">
              {dataset.models_count} Model{dataset.models_count ? "s" : ""}
            </p>
          </div>
          {showUsername && (
            <div>
              <p className="text-body-4 text-grey">Created by:</p>
              <p className="text-body-3 font-semibold text-dark truncate">
                {dataset.user.username}
              </p>
            </div>
          )}
        </div>

        <div className={`flex flex-wrap gap-2 `}>
          {tags.map((tag) => (
            <span
              key={`${dataset.id}-${tag}`}
              className="rounded-xl bg-off-white px-2 py-1 text-body-4  text-dark"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};
