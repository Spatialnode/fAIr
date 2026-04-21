import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormLabel, Input, Select, TextArea } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons";
import Dialog from "@/components/ui/dialog/dialog";
import {
  DATASET_DESCRIPTION_MAX_LENGTH,
  DATASET_DESCRIPTION_MIN_LENGTH,
  DATASET_NAME_MAX_LENGTH,
  DATASET_NAME_MIN_LENGTH,
  FEATURE_TYPES,
  GEOMETRY_TYPES,
  TASK_TYPES,
} from "@/features/datasets/utils/constants";
import {
  createSelectOptions,
  InputClassName,
} from "@/features/datasets/components/create-dataset/shared";
import { useDatasetMetadataForm } from "@/features/datasets/hooks/use-dataset-metadata-form";
import { getDatasetFlowInitialState } from "@/features/datasets/utils/dataset-flow-mocks";
import { updateTrainingDataset } from "@/features/model-creation/api/create-trainings";
import { showErrorToast, showSuccessToast } from "@/utils";
import { TTrainingDataset } from "@/types";
import { getTextFieldValidity } from "@/features/datasets/utils/validation";

type DatasetEditDialogProps = {
  isOpened: boolean;
  closeDialog: () => void;
  data: TTrainingDataset;
};

export const DatasetEditDialog: React.FC<DatasetEditDialogProps> = ({
  isOpened,
  closeDialog,
  data,
}) => {
  const queryClient = useQueryClient();
  const tagsInputRef = useRef<HTMLInputElement>(null);
  const metadataForm = useDatasetMetadataForm(
    getDatasetFlowInitialState(data).metadataForm,
  );

  useEffect(() => {
    if (!isOpened) return;

    const initialMetadata = getDatasetFlowInitialState(data).metadataForm;
    metadataForm.resetDatasetMetadataForm(initialMetadata);
    metadataForm.setDatasetNameValidity(
      getTextFieldValidity(
        initialMetadata.name,
        DATASET_NAME_MIN_LENGTH,
        DATASET_NAME_MAX_LENGTH,
      ),
    );
    metadataForm.setDatasetDescriptionValidity(
      getTextFieldValidity(
        initialMetadata.description,
        DATASET_DESCRIPTION_MIN_LENGTH,
        DATASET_DESCRIPTION_MAX_LENGTH,
      ),
    );
  }, [data, isOpened]);

  const updateDatasetMutation = useMutation({
    mutationFn: updateTrainingDataset,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["training-dataset", data.id],
      });
      showSuccessToast("Dataset details updated successfully.");
      closeDialog();
    },
    onError: (error) => showErrorToast(error),
  });

  const handleSave = () => {
    // updateDatasetMutation.mutate({
    //   id: data.id,
    //   name: metadataForm.datasetMetadataForm.name,
    // });
  };

  const canSave =
    metadataForm.hasValidDatasetName && metadataForm.hasValidDatasetDescription;

  return (
    <Dialog isOpened={isOpened} closeDialog={closeDialog} noPadding noHeader>
      <div
        className="relative] py-[30px] px-[24px] hide-scrollbar overflow-hidden rounded-[11px] bg-white"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="justify-end flex w-full">
          <button
            type="button"
            onClick={closeDialog}
            className="z-10 rounded-full bg-[#F2F4F7] p-2 text-grey transition-colors hover:text-dark"
            aria-label="Close edit dataset modal"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="">
          <div className="space-y-6">
            <h2 className="text-title-3 font-semibold text-dark">
              Edit Training Dataset
            </h2>

            <Input
              value={metadataForm.datasetMetadataForm.name}
              handleInput={(event) =>
                metadataForm.updateDatasetMetadataField(
                  "name",
                  event.target.value,
                )
              }
              showBorder
              label="Dataset Name"
              labelWithTooltip
              toolTipContent="Update the dataset name shown to other users."
              minLength={DATASET_NAME_MIN_LENGTH}
              maxLength={DATASET_NAME_MAX_LENGTH}
              validationStateUpdateCallback={
                metadataForm.setDatasetNameValidity
              }
              isValid={metadataForm.hasValidDatasetName}
              helpText={
                metadataForm.datasetNameValidity.message ||
                `Must be at least ${DATASET_NAME_MIN_LENGTH} characters`
              }
            />

            <TextArea
              label="Dataset Description"
              value={metadataForm.datasetMetadataForm.description}
              handleChange={(event) =>
                metadataForm.updateDatasetMetadataField(
                  "description",
                  event.target.value,
                )
              }
              labelWithTooltip
              toolTipContent="Describe the source imagery and what this dataset contains."
              minLength={DATASET_DESCRIPTION_MIN_LENGTH}
              maxLength={DATASET_DESCRIPTION_MAX_LENGTH}
              validationStateUpdateCallback={
                metadataForm.setDatasetDescriptionValidity
              }
              isValid={metadataForm.hasValidDatasetDescription}
              helpText={
                metadataForm.datasetDescriptionValidity.message ||
                "Description instructions"
              }
            />

            <Select
              label="Task Type"
              defaultValue={metadataForm.datasetMetadataForm.taskType}
              placeholder="Select task type"
              labelWithTooltip
              toolTipContent="Choose the task this dataset supports."
              options={createSelectOptions(TASK_TYPES)}
              handleChange={(value) =>
                metadataForm.updateDatasetMetadataField(
                  "taskType",
                  String(value),
                )
              }
            />

            <Select
              label="Geometry Type"
              defaultValue={metadataForm.datasetMetadataForm.geometryType}
              placeholder="Select geometry type"
              options={createSelectOptions(GEOMETRY_TYPES)}
              labelWithTooltip
              toolTipContent="Choose the label geometry type."
              handleChange={(value) =>
                metadataForm.updateDatasetMetadataField(
                  "geometryType",
                  String(value),
                )
              }
            />

            <Select
              label="Feature Type"
              defaultValue={metadataForm.datasetMetadataForm.featureType}
              placeholder="Select feature type"
              options={createSelectOptions(FEATURE_TYPES)}
              labelWithTooltip
              toolTipContent="Choose the main mapped feature."
              handleChange={(value) =>
                metadataForm.updateDatasetMetadataField(
                  "featureType",
                  String(value),
                )
              }
            />

            <div>
              <FormLabel
                label="Key Value"
                withTooltip
                toolTipContent="Label values used to identify mapped features."
              />
              <div className="space-y-2">
                {metadataForm.datasetMetadataForm.keyValues.map(
                  (value, index) => (
                    <div
                      key={`dataset-key-value-${index}`}
                      className="flex gap-3"
                    >
                      <Input
                        value={value}
                        handleInput={(event) =>
                          metadataForm.handleKeyValueUpdate(
                            index,
                            event.target.value,
                          )
                        }
                        showBorder
                        placeholder="Enter key value"
                        className="w-full"
                      />
                      <button
                        type="button"
                        className="h-12 w-12 rounded-md bg-[#FFF1F1] text-title-3 text-primary transition-opacity hover:opacity-80"
                        onClick={() => metadataForm.handleKeyValueDelete(index)}
                      >
                        -
                      </button>
                    </div>
                  ),
                )}
              </div>
              <button
                type="button"
                className="mt-3 text-body-3 font-medium text-primary"
                onClick={metadataForm.addKeyValue}
              >
                + Add key value
              </button>
            </div>

            <div>
              <FormLabel
                label="Tags"
                withTooltip
                toolTipContent="Add searchable labels for this dataset."
              />
              <div
                className={`${InputClassName} min-h-12 py-2`}
                onClick={() => tagsInputRef.current?.focus()}
              >
                <div className="flex flex-wrap items-center gap-2">
                  {metadataForm.datasetMetadataForm.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-xl bg-off-white px-2 py-1 text-body-4  text-dark"
                    >
                      {tag}
                    </span>
                  ))}
                  <input
                    ref={tagsInputRef}
                    className="min-w-40 flex-1 border-none bg-transparent outline-none"
                    placeholder={
                      metadataForm.datasetMetadataForm.tags.length === 0
                        ? "Enter Tags"
                        : ""
                    }
                    value={metadataForm.datasetMetadataForm.tagInput}
                    onChange={(event) =>
                      metadataForm.updateDatasetMetadataField(
                        "tagInput",
                        event.target.value,
                      )
                    }
                    onKeyDown={metadataForm.handleTagKeyDown}
                  />
                </div>
              </div>
              <p className="mt-2 text-body-4 text-grey">
                Separate tags with comma
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                className="!w-fit min-w-36"
                uppercase={false}
                spinner={updateDatasetMutation.isPending}
                disabled={!canSave}
                onClick={handleSave}
              >
                Save Change
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
