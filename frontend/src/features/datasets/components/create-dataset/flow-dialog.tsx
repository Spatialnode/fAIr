import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/form";
import { CheckIcon, InfoIcon } from "@/components/ui/icons";
import { APPLICATION_ROUTES } from "@/constants";
import { TabGroup } from "@/components/ui/tab-group";
import { ButtonVariant, SHOELACE_SIZES } from "@/enums";
import { useNavigate } from "react-router-dom";
import { FEATURE_TYPES } from "./constants";
import {
  createSelectOptions,
  FieldLabel,
  InputClassName,
  ModalShell,
} from "@/features/datasets/components/create-dataset/shared";
import "./flow-dialog.css";
import { useCreateDatasetFlowContext } from "@/features/datasets/contexts/create-dataset-flow-context";
import { SourceIcon } from "@/components/ui/icons/source-icon";

export const CreateDatasetFlowDialog = () => {
  const flow = useCreateDatasetFlowContext();
  const navigate = useNavigate();

  const closeFlowModal = () => flow.setFlowModal(null);

  const updateIndexedArrayValue = (
    items: string[],
    setItems: (values: string[]) => void,
    index: number,
    value: string,
  ) => {
    const next = [...items];
    next[index] = value;
    setItems(next);
  };

  const removeIndexedArrayValue = (
    items: string[],
    setItems: (values: string[]) => void,
    index: number,
  ) => {
    if (items.length === 1) return;
    setItems(items.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <Dialog
      isOpened={flow.flowModal !== null}
      closeDialog={closeFlowModal}
      noHeader
      size={SHOELACE_SIZES.SMALL}
      preventClose={flow.flowModal === "build-success"}
    >
      {flow.flowModal === "osm" && (
        <ModalShell
          onClose={closeFlowModal}
          className="dataset-flow-osm-modal"
          closeButtonClassName="dataset-flow-osm-close"
        >
          <SourceIcon />
          <h3 className="mx-auto mb-8 max-w-xs text-center text-title-3 font-medium leading-snug text-dark">
            Select the feature you want to get the data from OSM
          </h3>

          <div className="space-y-5">
            <div>
              <FieldLabel label="Feature Type" showInfoIcon={false} />
              <Select
                defaultValue={flow.osmModalFeatureType}
                placeholder="Select feature"
                options={createSelectOptions(FEATURE_TYPES)}
                handleChange={(value) =>
                  flow.setOsmModalFeatureType(String(value))
                }
                className="dataset-flow-modal-select"
              />
            </div>

            <div>
              <FieldLabel label="Key Values" showInfoIcon={false} />
              <p className="mb-3 text-body-4 text-grey">
                Here are some standard key values for rooftop - value 1, value
                2, value 3, value 4, value 5...
              </p>
              <div className="space-y-2">
                {flow.osmModalValues.map((value, index) => (
                  <div key={`osm-modal-value-${index}`} className="flex gap-3">
                    <input
                      className={InputClassName}
                      placeholder="Enter key value"
                      value={value}
                      onChange={(event) =>
                        updateIndexedArrayValue(
                          flow.osmModalValues,
                          flow.setOsmModalValues,
                          index,
                          event.target.value,
                        )
                      }
                    />
                    <button
                      type="button"
                      className="h-12 w-12 rounded-md border border-gray-border bg-[#e4e4e4] text-title-3 text-grey"
                      onClick={() =>
                        removeIndexedArrayValue(
                          flow.osmModalValues,
                          flow.setOsmModalValues,
                          index,
                        )
                      }
                    >
                      -
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="mt-2 text-body-3 font-medium text-primary"
                onClick={() =>
                  flow.setOsmModalValues([...flow.osmModalValues, ""])
                }
              >
                + Add key value
              </button>
            </div>
          </div>

          <Button
            className="mt-10"
            uppercase={false}
            spinner={flow.fetchOsmPending}
            onClick={flow.handleConfirmOsmFlow}
          >
            Confirm
          </Button>
        </ModalShell>
      )}

      {flow.flowModal === "mapswipe" && (
        <ModalShell onClose={closeFlowModal}>
          <div className="justify-center items-center flex">
            <SourceIcon />
          </div>

          <h3 className="mx-auto mb-6 max-w-xs text-center text-title-3 font-semibold text-dark">
            Get Labels from MapSwipe project
          </h3>

          <div className="mb-5 flex justify-center">
            <TabGroup
              tabs={["Existing Project", "New Project"]}
              activeTab={flow.mapSwipeProjectType}
              setActiveTab={(tab) =>
                flow.setMapSwipeProjectType(
                  tab as "Existing Project" | "New Project",
                )
              }
              className="rounded-full border border-gray-border bg-white"
            />
          </div>

          {flow.mapSwipeProjectType === "New Project" ? (
            <p className="mx-auto mb-5 max-w-xs text-center text-body-2 italic text-grey">
              To create a new MapSwipe project, one or more training area must
              be drawn.
            </p>
          ) : (
            <div>
              <FieldLabel label="Project ID" />
              <div className="space-y-2">
                {flow.mapSwipeProjectIds.map((value, index) => (
                  <div key={`mapswipe-id-${index}`} className="flex gap-3">
                    <input
                      className={InputClassName}
                      placeholder="Enter project ID"
                      value={value}
                      onChange={(event) =>
                        updateIndexedArrayValue(
                          flow.mapSwipeProjectIds,
                          flow.setMapSwipeProjectIds,
                          index,
                          event.target.value,
                        )
                      }
                    />
                    <button
                      type="button"
                      className="h-12 w-12 rounded border border-gray-border bg-secondary text-title-3 text-grey"
                      onClick={() =>
                        removeIndexedArrayValue(
                          flow.mapSwipeProjectIds,
                          flow.setMapSwipeProjectIds,
                          index,
                        )
                      }
                    >
                      -
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="mt-3 text-body-3 font-medium text-primary"
                onClick={() =>
                  flow.setMapSwipeProjectIds([...flow.mapSwipeProjectIds, ""])
                }
              >
                + Add another ID
              </button>
            </div>
          )}

          <Button
            className="mt-7"
            uppercase={false}
            disabled={
              flow.mapSwipeProjectType === "Existing Project" &&
              flow.validMapSwipeIds.length === 0
            }
            onClick={flow.handleConfirmMapSwipeFlow}
          >
            Confirm
          </Button>
        </ModalShell>
      )}

      {flow.flowModal === "tasking-manager" && (
        <ModalShell onClose={closeFlowModal}>
          <div className="justify-center items-center flex">
            <SourceIcon />
          </div>
          <h3 className="mx-auto mb-6 max-w-xs text-center text-title-3 font-semibold text-dark">
            Get Labels from Tasking Manager Project
          </h3>

          <div>
            <FieldLabel label="Project ID" />
            <div className="space-y-2">
              {flow.taskingProjectIds.map((value, index) => (
                <div key={`tasking-id-${index}`} className="flex gap-3">
                  <input
                    className={InputClassName}
                    placeholder="Enter project ID"
                    value={value}
                    onChange={(event) =>
                      updateIndexedArrayValue(
                        flow.taskingProjectIds,
                        flow.setTaskingProjectIds,
                        index,
                        event.target.value,
                      )
                    }
                  />
                  <button
                    type="button"
                    className="h-12 w-12 rounded border border-gray-border bg-secondary text-title-3 text-grey"
                    onClick={() =>
                      removeIndexedArrayValue(
                        flow.taskingProjectIds,
                        flow.setTaskingProjectIds,
                        index,
                      )
                    }
                  >
                    -
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mt-3 text-body-3 font-medium text-primary"
              onClick={() =>
                flow.setTaskingProjectIds([...flow.taskingProjectIds, ""])
              }
            >
              + Add another ID
            </button>
          </div>

          <Button
            className="mt-7"
            uppercase={false}
            disabled={flow.validTaskingIds.length === 0}
            onClick={flow.handleConfirmTaskingFlow}
          >
            Confirm
          </Button>
        </ModalShell>
      )}

      {flow.flowModal === "custom" && (
        <ModalShell onClose={closeFlowModal}>
          <div className="justify-center items-center flex">
            <SourceIcon />
          </div>
          <h3 className="mx-auto mb-3 max-w-xs text-center text-title-3 font-semibold text-dark">
            Get Labels from Custom source
          </h3>
          <p className="mx-auto mb-6 max-w-xs text-center text-body-2 italic text-grey">
            Upload label for each Training Area (TA) individually.
          </p>
          <Button uppercase={false} onClick={flow.handleConfirmCustomFlow}>
            Continue
          </Button>
        </ModalShell>
      )}

      {flow.flowModal === "build-confirm" && (
        <ModalShell onClose={closeFlowModal}>
          <div className="mx-auto mb-5 mt-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF8E6] text-[#C69102]">
            <InfoIcon className="h-5 w-5" />
          </div>
          <p className="mx-auto max-w-xs text-center text-body-2base text-dark">
            Confirm you are ready to build this dataset
          </p>
          <div className="mt-7 flex gap-3">
            <Button
              variant={ButtonVariant.TERTIARY}
              uppercase={false}
              onClick={closeFlowModal}
            >
              Cancel
            </Button>
            <Button uppercase={false} onClick={flow.handleConfirmBuildDataset}>
              Confirm
            </Button>
          </div>
        </ModalShell>
      )}

      {flow.flowModal === "build-success" && (
        <ModalShell onClose={() => undefined} showClose={false}>
          <div className="mx-auto mb-5 mt-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#ECFCE5] text-[#198155]">
            <CheckIcon className="h-5 w-5" />
          </div>
          <p className="mx-auto max-w-xs text-center text-body-2base font-semibold text-dark">
            Dataset building in progress!
          </p>
          <div className="mt-7 flex gap-3">
            <Button
              variant={ButtonVariant.TERTIARY}
              uppercase={false}
              onClick={() => {
                flow.setFlowModal(null);
                navigate(APPLICATION_ROUTES.DATASETS);
              }}
            >
              Explore Datasets
            </Button>
            <Button
              uppercase={false}
              onClick={() => {
                flow.setFlowModal(null);
                navigate(APPLICATION_ROUTES.PROFILE_DATASETS);
              }}
            >
              Go to my Datasets
            </Button>
          </div>
        </ModalShell>
      )}
    </Dialog>
  );
};
