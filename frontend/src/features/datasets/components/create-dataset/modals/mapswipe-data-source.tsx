import { Button } from "@/components/ui/button";
import { MapSwipeProjectStatusBadge } from "@/features/mapswipe/components/project-status-badge";
import { MapswipeProjectStatusDialog } from "@/features/mapswipe/components/project-status-dialog";
import { getMapSwipeProjectStatusQueryOptions } from "@/features/mapswipe/hooks/factory";
import { MapSwipeProcessingStatus } from "@/enums";
import { useQueries } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { TabGroup } from "@/components/ui/tab-group";
import { useDialog } from "@/hooks/use-dialog";
import { InputClassName, ModalShell } from "../shared";
import { SourceIcon } from "@/components/ui/icons/source-icon";

const READY_STATUSES = new Set([
  MapSwipeProcessingStatus.PUBLISHED,
  MapSwipeProcessingStatus.FINISHED,
]);

type CreateDatasetMapSwipeFlowProps = {
  closeFlowModal: () => void;
  mapSwipeProjectType: "Existing Project" | "New Project";
  setMapSwipeProjectType: (tab: "Existing Project" | "New Project") => void;
  mapSwipeProjectIds: string[];
  setMapSwipeProjectIds: (values: string[]) => void;
  validMapSwipeIds: string[];
  handleConfirmMapSwipeFlow: () => void;
  openNewProjectModal: () => void;
};

export const CreateDatasetMapSwipeFlow = ({
  closeFlowModal,
  mapSwipeProjectType,
  setMapSwipeProjectType,
  mapSwipeProjectIds,
  setMapSwipeProjectIds,
  validMapSwipeIds,
  handleConfirmMapSwipeFlow,
  openNewProjectModal,
}: CreateDatasetMapSwipeFlowProps) => {
  const {
    isOpened: isProjectStatusDialogOpen,
    openDialog: openProjectStatusDialog,
    closeDialog: closeProjectStatusDialog,
  } = useDialog();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const normalizedProjectIds = useMemo(
    () =>
      Array.from(
        new Set(validMapSwipeIds.map((value) => value.trim()).filter(Boolean)),
      ),
    [validMapSwipeIds],
  );

  const statusQueries = useQueries({
    queries: normalizedProjectIds.map((projectId) => ({
      ...getMapSwipeProjectStatusQueryOptions(projectId),
      enabled: mapSwipeProjectType === "Existing Project",
      refetchInterval: 15000,
    })),
  });

  const projectStatusRows = normalizedProjectIds.map((projectId, index) => ({
    projectId,
    query: statusQueries[index],
  }));

  const canUseExistingProjectData =
    normalizedProjectIds.length > 0 &&
    projectStatusRows.every((row) => {
      const status = row.query.data?.status as
        | MapSwipeProcessingStatus
        | undefined;
      return status ? READY_STATUSES.has(status) : false;
    });

  const updateIndexedArrayValue = (index: number, value: string) => {
    const next = [...mapSwipeProjectIds];
    next[index] = value;
    setMapSwipeProjectIds(next);
  };

  const removeIndexedArrayValue = (index: number) => {
    if (mapSwipeProjectIds.length === 1) return;
    setMapSwipeProjectIds(
      mapSwipeProjectIds.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  return (
    <>
      <MapswipeProjectStatusDialog
        isOpen={isProjectStatusDialogOpen}
        onClose={closeProjectStatusDialog}
        mapSwipeProjectId={selectedProjectId}
        handleMapSwipeProjectResultMapModal={() => undefined}
      />

      <ModalShell className="flex space-y-6 flex-col" onClose={closeFlowModal}>
        <div className="justify-center  items-center flex">
          <SourceIcon />
        </div>

        <h3 className=" text-center text-sm  text-dark">
          Get Labels from MapSwipe project
        </h3>

        <div className="mb-5 flex justify-center">
          <TabGroup
            tabs={["Existing Project", "New Project"]}
            activeTab={mapSwipeProjectType}
            variant="pill"
            setActiveTab={(tab) =>
              setMapSwipeProjectType(tab as "Existing Project" | "New Project")
            }
            className="rounded-full border border-gray-border bg-white"
          />
        </div>

        {mapSwipeProjectType === "Existing Project" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              {mapSwipeProjectIds.map((value, index) => (
                <div key={`mapswipe-id-${index}`} className="flex gap-3">
                  <input
                    className={InputClassName}
                    placeholder="Enter project ID"
                    value={value}
                    onChange={(event) =>
                      updateIndexedArrayValue(index, event.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="h-12 w-12 rounded border border-gray-border bg-secondary text-title-3 text-grey"
                    onClick={() => removeIndexedArrayValue(index)}
                  >
                    -
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="text-body-3 font-medium text-primary"
              onClick={() => setMapSwipeProjectIds([...mapSwipeProjectIds, ""])}
            >
              + Add another ID
            </button>

            {normalizedProjectIds.length > 0 ? (
              <div className="space-y-3">
                {projectStatusRows.map((row) => {
                  const { query } = row;
                  const statusData = query.data;

                  return (
                    <div
                      key={`mapswipe-result-${row.projectId}`}
                      className="rounded border border-gray-border bg-white p-3"
                    >
                      {query.isLoading ? (
                        <p className="text-body-4 text-grey">
                          Loading project {row.projectId}...
                        </p>
                      ) : query.isError ? (
                        <p className="text-body-4 text-primary">
                          Could not load project {row.projectId}. Please verify
                          the ID.
                        </p>
                      ) : statusData ? (
                        <>
                          <p className="line-clamp-2 text-body-2 font-medium text-dark">
                            {statusData.name}
                          </p>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <MapSwipeProjectStatusBadge
                              status={statusData.status}
                              isRefetching={query.isRefetching}
                            />
                            <span className="text-body-4 text-grey">
                              ID: {row.projectId}
                            </span>
                            <button
                              type="button"
                              className="text-body-4 text-grey underline-offset-2 hover:text-dark hover:underline"
                              onClick={() => {
                                setSelectedProjectId(row.projectId);
                                openProjectStatusDialog();
                              }}
                            >
                              {READY_STATUSES.has(
                                statusData.status as MapSwipeProcessingStatus,
                              )
                                ? "View Project"
                                : "View"}
                            </button>
                          </div>
                        </>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}

            <Button
              className="mt-2"
              uppercase={false}
              disabled={!canUseExistingProjectData}
              onClick={handleConfirmMapSwipeFlow}
            >
              Use Data
            </Button>
            {!canUseExistingProjectData ? (
              <p className="text-body-4 text-grey">
                You can use these project IDs only when all of them are
                published or finished.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-6 text-center">
            <p className="mx-auto max-w-md text-body-3 italic text-grey">
              To create a new MapSwipe Locate Project, continue to the project
              setup form.
            </p>
            <Button uppercase={false} onClick={openNewProjectModal}>
              Continue
            </Button>
          </div>
        )}
      </ModalShell>
    </>
  );
};
