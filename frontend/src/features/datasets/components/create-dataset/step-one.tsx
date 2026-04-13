import { useRef } from "react";
import { MapComponent } from "@/components/map";
import { XYZTileServerInput } from "@/components/shared/form/xyz-tile-server-input";
import { Button } from "@/components/ui/button";
import { Input, Select, TextArea } from "@/components/ui/form";
import { ArrowBackIcon, MapIcon } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/spinner";
import { APPLICATION_ROUTES, MODELS_CONTENT } from "@/constants";
import { ButtonVariant, TileServiceType } from "@/enums";
import { StepHeading } from "@/features/model-creation/components";
import { useNavigate } from "react-router-dom";
import {
  DATASET_DESCRIPTION_MAX_LENGTH,
  DATASET_DESCRIPTION_MIN_LENGTH,
  DATASET_NAME_MAX_LENGTH,
  DATASET_NAME_MIN_LENGTH,
  FEATURE_TYPES,
  GEOMETRY_TYPES,
  TASK_TYPES,
} from "@/features/datasets/components/create-dataset/constants";
import { useCreateDatasetFlowContext } from "@/features/datasets/contexts/create-dataset-flow-context";
import {
  createSelectOptions,
  FieldLabel,
  InputClassName,
} from "@/features/datasets/components/create-dataset/shared";
import { ToolTip } from "@/components/ui/tooltip";

export const CreateDatasetStepOne = () => {
  const navigate = useNavigate();
  const tagsInputRef = useRef<HTMLInputElement>(null);
  const flow = useCreateDatasetFlowContext();

  return (
    <div className="space-y-8">
      <button
        type="button"
        className="inline-flex items-center gap-x-2 text-body-2base text-dark"
        onClick={() => navigate(APPLICATION_ROUTES.DATASETS)}
      >
        <ArrowBackIcon className="h-7 w-7" />
        Back
      </button>

      <div className="space-y-3">
        <StepHeading
          heading="Create Training Dataset"
          description={
            MODELS_CONTENT.modelCreation.trainingDataset.pageDescription
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <h2 className="text-title-3 font-semibold text-dark">
            Create New Training Dataset
          </h2>

          <Input
            value={flow.datasetMetadataForm.name}
            handleInput={(event) =>
              flow.updateDatasetMetadataField("name", event.target.value)
            }
            showBorder
            label={
              MODELS_CONTENT.modelCreation.trainingDataset.form.datasetName
                .label
            }
            placeholder={
              MODELS_CONTENT.modelCreation.trainingDataset.form.datasetName
                .placeholder
            }
            labelWithTooltip
            toolTipContent={
              MODELS_CONTENT.modelCreation.trainingDataset.form.datasetName
                .toolTip
            }
            minLength={DATASET_NAME_MIN_LENGTH}
            maxLength={DATASET_NAME_MAX_LENGTH}
            validationStateUpdateCallback={flow.setDatasetNameValidity}
            isValid={flow.hasValidDatasetName}
            helpText={
              flow.datasetNameValidity.message ||
              MODELS_CONTENT.modelCreation.trainingDataset.form.datasetName
                .helpText
            }
          />

          <TextArea
            label="Dataset Description"
            value={flow.datasetMetadataForm.description}
            handleChange={(event) =>
              flow.updateDatasetMetadataField("description", event.target.value)
            }
            labelWithTooltip
            toolTipContent="Describe the imagery source, coverage, and what labels this dataset will provide."
            placeholder="E.g This dataset includes high-resolution imagery from Northern Kaduna and is used for rooftop extraction."
            minLength={DATASET_DESCRIPTION_MIN_LENGTH}
            maxLength={DATASET_DESCRIPTION_MAX_LENGTH}
            validationStateUpdateCallback={flow.setDatasetDescriptionValidity}
            isValid={flow.hasValidDatasetDescription}
            helpText={
              flow.datasetDescriptionValidity.message ||
              `Dataset description should be at least ${DATASET_DESCRIPTION_MIN_LENGTH} characters and at most ${DATASET_DESCRIPTION_MAX_LENGTH} characters.`
            }
          />

          <XYZTileServerInput
            isValid={flow.tileServiceTypeValidity}
            setTileServerURL={flow.setTileserverURL}
            tileServerURL={flow.tileserverURL}
            validationStateUpdateCallback={(validationState) =>
              flow.setTileServiceTypeValidity(validationState)
            }
            tileServiceType={flow.tileServiceType}
            setTileServiceType={flow.setTileServiceType}
          />

          <Select
            label="Task Type"
            defaultValue={flow.datasetMetadataForm.taskType}
            placeholder="Select task type"
            labelWithTooltip
            toolTipContent="Choose the model task this dataset supports, such as classification, segmentation, or detection."
            options={createSelectOptions(TASK_TYPES)}
            handleChange={(value) =>
              flow.updateDatasetMetadataField("taskType", String(value))
            }
          />

          <Select
            label="Geometry Type"
            defaultValue={flow.datasetMetadataForm.geometryType}
            placeholder="Select geometry type"
            options={createSelectOptions(GEOMETRY_TYPES)}
            toolTipContent="Choose the annotation geometry used in this dataset, such as polygons or rectangles."
            labelWithTooltip
            handleChange={(value) =>
              flow.updateDatasetMetadataField("geometryType", String(value))
            }
          />

          <Select
            label="Feature Type"
            defaultValue={flow.datasetMetadataForm.featureType}
            placeholder="Select feature type"
            options={createSelectOptions(FEATURE_TYPES)}
            labelWithTooltip
            toolTipContent="Select the primary feature category this dataset focuses on."
            handleChange={(value) =>
              flow.updateDatasetMetadataField("featureType", String(value))
            }
          />

          <div>
            <FieldLabel label="Key Value"
              toolTipContent="Define label key values used to fetch or organize mapped features in this dataset."
            />
            <div className="space-y-2">
              {flow.datasetMetadataForm.keyValues.map((value, index) => (
                <div key={`dataset-key-value-${index}`} className="flex gap-3">
                  <Input
                    value={value}
                    handleInput={(event) =>
                      flow.handleKeyValueUpdate(index, event.target.value)
                    }
                    showBorder
                    placeholder="Enter key value"
                    className="w-full"
                  />
                  <button
                    type="button"
                    className="h-12 w-12 rounded border border-gray-border bg-secondary text-title-3 text-grey"
                    onClick={() => flow.handleKeyValueDelete(index)}
                  >
                    -
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mt-3 text-body-3 font-medium text-primary"
              onClick={flow.addKeyValue}
            >
              + Add key value
            </button>
          </div>

          <div>
            <FieldLabel label="Tags"
              toolTipContent="Add searchable keywords to make this dataset easier to discover and filter."

            />
            <div
              className={`${InputClassName} min-h-12 py-2`}
              onClick={() => tagsInputRef.current?.focus()}
            >
              <div className="flex flex-wrap items-center gap-2">
                {flow.datasetMetadataForm.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-light-gray px-3 py-1 text-body-4 text-dark"
                  >
                    {tag}
                  </span>
                ))}
                <input
                  ref={tagsInputRef}
                  className="min-w-40 flex-1 border-none bg-transparent outline-none"
                  placeholder={
                    flow.datasetMetadataForm.tags.length === 0
                      ? "Enter Tags"
                      : ""
                  }
                  value={flow.datasetMetadataForm.tagInput}
                  onChange={(event) =>
                    flow.updateDatasetMetadataField(
                      "tagInput",
                      event.target.value,
                    )
                  }
                  onKeyDown={flow.handleTagKeyDown}
                />
              </div>
            </div>
            <p className="mt-2 text-body-4 text-grey">
              Separate tags with comma
            </p>
          </div>
        </div>

        <div className="h-fit rounded p-6 lg:sticky lg:top-24">
          <div className="relative h-[380px] overflow-hidden rounded border border-gray-border bg-off-white">
            <MapComponent
              map={flow.map}
              mapContainerRef={flow.mapContainerRef}
            />
            {flow.tilePreviewLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
                <Spinner />
              </div>
            )}
            {!flow.tileServiceTypeValidity.valid &&
              !flow.tilePreviewLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-y-3 bg-off-white text-body-4 text-grey md:text-base">
                  <MapIcon className="icon-lg" />
                  <p>Enter a valid tile service url to see a preview.</p>
                </div>
              )}
            {flow.tilePreviewError && flow.tileserverURL.length > 0 && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white px-4 text-center text-primary">
                {flow.tilePreviewError}
              </div>
            )}
          </div>
          {flow.tileServiceType !== TileServiceType.TILEJSON && (
            <p className="mt-2 text-body-4 text-grey">
              Selected {flow.tileServiceType} tile service. Consider using
              TileJSON or OpenAerialMap TMS for automatic bounds detection and
              metadata.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 items-center gap-4 border-t border-gray-border py-6">
        <div>
          <Button
            variant={ButtonVariant.DEFAULT}
            className="!w-fit min-w-32"
            uppercase={false}
            onClick={() => navigate(APPLICATION_ROUTES.DATASETS)}
          >
            <span className="inline-flex items-center gap-2">
              <ArrowBackIcon className="h-5 w-5" />
              Back
            </span>
          </Button>
        </div>
        <p className="text-center text-body-2 text-grey">Step 1 of 2</p>
        <div className="flex justify-end">
          <ToolTip
            content={
              !flow.canContinueStepOne ? (
                <div className="max-w-64 space-y-1 text-body-4">
                  <p className="font-semibold">
                    Following fields are required:
                  </p>
                  <ul className="ml-4 list-disc">
                    {flow.missingStepOneRequiredFields.map((field) => (
                      <li key={field}>{field}</li>
                    ))}
                  </ul>
                </div>
              ) : null
            }
          >
            <span className="inline-flex">
              <Button
                className="!w-fit min-w-40"
                uppercase={false}
                disabled={!flow.canContinueStepOne}
                spinner={flow.continueStepOnePending}
                onClick={flow.handleContinueToStepTwo}
              >
                Continue
              </Button>
            </span>
          </ToolTip>
        </div>
      </div>
    </div>
  );
};
