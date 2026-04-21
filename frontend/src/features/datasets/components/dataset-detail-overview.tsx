import Badge from "@/components/ui/badge/badge";
import { BackButton, ButtonWithIcon } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { DropDown } from "@/components/ui/dropdown";
import {
  ChevronDownIcon,
  DatabaseIcon,
  ExternalLinkIcon,
  SettingsIcon,
} from "@/components/ui/icons";
import { APPLICATION_ROUTES, DatasetURLParams } from "@/constants";
import { ButtonVariant } from "@/enums";
import { DatasetAreaButton } from "@/features/datasets/components/dataset-area-button";
import { DatasetDetailItem } from "@/features/datasets/components/dataset-detail-item";
import {
  DUMMY_MAPSWIPE_PROJECTS,
  TDatasetDetailDisplay,
} from "@/features/datasets/utils/dataset-flow-mocks";
import { getDatasetEditRoute } from "@/features/datasets/utils/dataset-routing";
import { useDropdownMenu } from "@/hooks/use-dropdown-menu";
import { formatDate, getTileServerTypeFromURL } from "@/utils";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TTrainingDataset } from "@/types";
import { FolderIcon } from "@/components/ui/icons/folder-icon";
import { DatasetMapSwipeProjectsDropdown } from "@/features/datasets/components/dropdowns/dataset-mapswipe-projects-dropdown";

export type DatasetDetailPublicActions = {
  openDatasetArea: () => void;
  openDatasetFiles: () => void;
};

export type DatasetDetailAuthenticatedActions = {
  openDatasetEdit: () => void;
  openDatasetAoiEdit: () => void;
  openCloneDataset: () => void;
  openPublishDataset: () => void;
};

type DatasetDetailOverviewProps = {
  data: TTrainingDataset;
  datasetDetail: TDatasetDetailDisplay;
  publicActions: DatasetDetailPublicActions;
  authenticatedActions?: DatasetDetailAuthenticatedActions;
};

export const DatasetDetailOverview = ({
  data,
  datasetDetail,
  publicActions,
  authenticatedActions,
}: DatasetDetailOverviewProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dropdownRef, onDropdownHide } = useDropdownMenu();
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);

  const closeSettingsDropdown = () => {
    onDropdownHide();
    setSettingsDropdownOpen(false);
  };

  const settingsMenuItems = [
    {
      value: "Edit Details",
      onClick: () => {
        if (datasetDetail.isDraft) {
          navigate(getDatasetEditRoute(data.id, 1), {
            state: { from: location.pathname },
          });
        } else if (authenticatedActions) {
          authenticatedActions.openDatasetEdit();
        }
        closeSettingsDropdown();
      },
    },
    {
      value: "Edit Training Area",
      onClick: () => {
        if (datasetDetail.isDraft) {
          navigate(getDatasetEditRoute(data.id, 2), {
            state: { from: location.pathname },
          });
        } else if (authenticatedActions) {
          authenticatedActions.openDatasetAoiEdit();
        }
        closeSettingsDropdown();
      },
    },
    {
      value: "Clone Dataset",
      onClick: () => {
        authenticatedActions?.openCloneDataset();
        closeSettingsDropdown();
      },
    },
    {
      value: "Publish",
      onClick: () => {
        authenticatedActions?.openPublishDataset();
        closeSettingsDropdown();
      },
    },
  ];

  return (
    <>
      <BackButton className="my-6" />
      <p className="text-grey text-body-2base">Dataset ID: {data.id}</p>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start my-4 w-full ">
        <div className="flex flex-col gap-y-8 col-span-4 ">
          <div className="flex flex-wrap items-center gap-4">
            <h1
              className="font-semibold text-dark text-title-2 md:text-large-title leading-tight"
              title={data.name}
            >
              {data.name}
            </h1>
            <Badge variant={"green"}>{datasetDetail.statusLabel}</Badge>
          </div>
          <p className="max-w-3xl text-body-2base text-dark">
            {datasetDetail.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {datasetDetail.tags.map((tag) => (
              <span
                key={`${data.id}-detail-tag-${tag}`}
                className="rounded-xl bg-off-white px-2 py-1 text-body-4  text-dark"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-x-10 gap-y-4 md:grid-cols-2 xl:grid-cols-4">
            <DatasetDetailItem
              label="Task Type"
              value={datasetDetail.taskType}
            />
            <DatasetDetailItem
              label="Geometry Type"
              value={datasetDetail.geometryType}
            />
            <DatasetDetailItem
              label="Feature Type"
              value={datasetDetail.featureType}
            />
            <DatasetDetailItem
              label="Key Values"
              value={
                datasetDetail.keyValues.length > 0
                  ? datasetDetail.keyValues.join(", ")
                  : "N/A"
              }
            />
            <DatasetDetailItem
              label="Used by"
              value={`${data.models_count} ${data.models_count > 1 ? "Models" : "Model"}`}
            />
            <DatasetDetailItem label="Created by" value={data.user.username} />
            <DatasetDetailItem
              label="Last Modified"
              value={formatDate(data.last_modified)}
            />
            <p className="text-body-2 text-dark">
              <span className="text-grey">Version:</span>{" "}
              <span className="font-semibold">{datasetDetail.version}</span>
              {datasetDetail.versionSecondary && (
                <>
                  {"  "}
                  <span className="font-semibold">
                    {datasetDetail.versionSecondary}
                  </span>
                </>
              )}
              {datasetDetail.isInProgress && (
                <Badge
                  variant="yellow"
                  className="!ml-2 !inline-flex !h-5 !rounded-full !px-2 !py-0.5 !text-[10px]"
                >
                  In progress
                </Badge>
              )}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-x-10 gap-y-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="flex items-center gap-x-4 text-body-2 text-dark">
              <span className="text-grey">Source Imagery:</span>
              <span className=" ">
                {getTileServerTypeFromURL(data?.source_imagery)}
              </span>
              <CopyButton text={data.source_imagery} />
            </div>
            {datasetDetail.labelsSource === "MapSwipe" ? (
              <DatasetMapSwipeProjectsDropdown
                mapswipeProjects={DUMMY_MAPSWIPE_PROJECTS}
              />
            ) : (
              <div className="flex items-center gap-x-2 text-body-2 text-dark">
                <span className="text-grey">Label Source:</span>
                <span>{datasetDetail.labelsSource}</span>
              </div>
            )}
         

            <button
              onClick={publicActions.openDatasetFiles}
              className="flex items-center gap-x-2 text-body-2 text-dark"
            >
              <FolderIcon />
              <span className="text-dark">Dataset files</span>
              <ExternalLinkIcon className="size-4" />
            </button>
          </div>
        </div>
        <div className="col-span-1 flex w-fit flex-col gap-y-8 lg:w-full lg:items-end">
          <ButtonWithIcon
            label="Use Dataset"
            variant={ButtonVariant.PRIMARY}
            size="medium"
            prefixIcon={DatabaseIcon}
            disabled={!datasetDetail.canUse}
            onClick={() => {
              if (!datasetDetail.canUse) return;
              navigate(
                `${APPLICATION_ROUTES.CREATE_NEW_MODEL}/?${DatasetURLParams.DATASET_ID}=${data.id}&${DatasetURLParams.DATASET_NAME}=${data.name}&${DatasetURLParams.DATASET_SOURCE_IMAGERY}=${data.source_imagery}`,
              );
            }}
            className="!w-fit"
          />

          <DatasetAreaButton
            onClick={publicActions.openDatasetArea}
            disabled={false}
          />

          {authenticatedActions ? (
            <div className="flex items-start justify-start lg:justify-end">
              <DropDown
                ref={dropdownRef}
                className="bg-white"
                onDropdownShow={() => setSettingsDropdownOpen(true)}
                onDropdownHide={() => setSettingsDropdownOpen(false)}
                disableCheveronIcon
                triggerComponent={
                  <button
                    className={`inline-flex items-center gap-2 text-nowrap text-body-3 md:text-body-2 text-dark`}
                  >
                    <SettingsIcon className="icon" />
                    <span>Settings</span>
                    <ChevronDownIcon
                      className={`icon transition-transform ${settingsDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                }
                menuItems={settingsMenuItems}
              />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};
