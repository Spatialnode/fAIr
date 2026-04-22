import { Button } from "@/components/ui/button";
import { FormLabel, Input, Select, TextArea } from "@/components/ui/form";
import { ButtonVariant, INPUT_TYPES } from "@/enums";
import {
  MAPSWIPE_LOCATE_PROJECT_DATASET_LINK,
  MAPSWIPE_LOCATE_PROJECT_DEFAULT_TUTORIAL,
  MAPSWIPE_LOCATE_PROJECT_DEFAULT_ZOOM_LEVEL,
  MAPSWIPE_LOCATE_PROJECT_SUB_GRID_OPTIONS,
  useMapswipeLocateProjectFormModel,
} from "@/features/datasets/hooks/use-create-mapswipe-form";
import {
  ModalShell,
  InputClassName,
} from "@/features/datasets/components/create-dataset/shared";
import { ImageUploadField } from "@/components/shared/form/image-upload-field";
import { DATASET_CONTENT } from "@/constants/ui-contents/dataset-contents";

type MapswipeLocateProjectModalProps = {
  onClose: () => void;
  onBack: () => void;
  onCreate: () => void;
  datasetName: string;
  datasetDescription: string;
  featureType: string;
  keyValues: string[];
  tileserverURL: string;
};
const disabledFieldClassName =
  "disabled:!bg-light-gray disabled:!border-gray-border disabled:!border disabled:!text-dark";
const selectFieldClassName = "mapswipe-select-field";
const selectOptions = (options: string[]) =>
  options.map((option) => ({ name: option, value: option }));

const MapswipeFieldLabel = ({
  label,
  tooltipContent,
}: {
  label: string;
  tooltipContent: string;
}) => <FormLabel label={label} withTooltip toolTipContent={tooltipContent} />;

export const MapswipeLocateProjectModal = ({
  onClose,
  onBack,
  onCreate,
  datasetName,
  datasetDescription,
  featureType,
  keyValues,
  tileserverURL,
}: MapswipeLocateProjectModalProps) => {
  const content = DATASET_CONTENT.createDataset.mapswipeProject;
  const formContent = content.form;

  const {
    form,
    canCreate,
    exportMetaValues,
    updateField,
    handleCoverImageChange,
    handleClearCoverImage,
  } = useMapswipeLocateProjectFormModel({
    datasetName,
    datasetDescription,
    featureType,
    keyValues,
  });

  return (
    <ModalShell onClose={onClose}>
      <div className="hide-scrollbar  max-h-[80vh] overflow-y-auto pr-1">
        <h3 className="mb-4 text-2xl font-semibold text-dark">
          {content.title}
        </h3>
        <p className="mb-10 text-base leading-8 text-grey">
          {content.description}
        </p>

        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Input
                label={formContent.projectTopic.label}
                labelWithTooltip
                toolTipContent={formContent.projectTopic.toolTip}
                showBorder
                value={form.projectTopic}
                handleInput={(event) =>
                  updateField("projectTopic", event.target.value)
                }
              />
            </div>
            <div>
              <Input
                label={formContent.projectRegion.label}
                labelWithTooltip
                toolTipContent={formContent.projectRegion.toolTip}
                showBorder
                value={form.projectRegion}
                handleInput={(event) =>
                  updateField("projectRegion", event.target.value)
                }
              />
            </div>
          </div>

          <div>
            <TextArea
              label={formContent.projectDescription.label}
              labelWithTooltip
              toolTipContent={formContent.projectDescription.toolTip}
              value={form.projectDescription}
              handleChange={(event) =>
                updateField("projectDescription", event.target.value)
              }
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Input
                label={formContent.instruction.label}
                labelWithTooltip
                toolTipContent={formContent.instruction.toolTip}
                showBorder
                value={form.instruction}
                handleInput={(event) =>
                  updateField("instruction", event.target.value)
                }
              />
            </div>
            <div>
              <Input
                label={formContent.lookFor.label}
                labelWithTooltip
                toolTipContent={formContent.lookFor.toolTip}
                showBorder
                value={form.lookFor}
                handleInput={(event) =>
                  updateField("lookFor", event.target.value)
                }
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Input
                label={formContent.requestingOrganisation.label}
                labelWithTooltip
                toolTipContent={formContent.requestingOrganisation.toolTip}
                className={disabledFieldClassName}
                value={content.staticValues.requestingOrganisation}
                handleInput={() => undefined}
                disabled
              />
            </div>
            <div>
              <Input
                label={formContent.visibility.label}
                labelWithTooltip
                toolTipContent={formContent.visibility.toolTip}
                className={disabledFieldClassName}
                value={content.staticValues.visibility}
                handleInput={() => undefined}
                disabled
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Select
                label={formContent.tutorial.label}
                labelWithTooltip
                toolTipContent={formContent.tutorial.toolTip}
                className={selectFieldClassName}
                defaultValue={form.tutorial}
                handleChange={(value) => updateField("tutorial", String(value))}
                options={selectOptions([
                  MAPSWIPE_LOCATE_PROJECT_DEFAULT_TUTORIAL,
                ])}
              />
            </div>
            <div>
              <Input
                label={formContent.additionalInformationResource.label}
                labelWithTooltip
                toolTipContent={
                  formContent.additionalInformationResource.toolTip
                }
                showBorder
                value={MAPSWIPE_LOCATE_PROJECT_DATASET_LINK}
                handleInput={() => undefined}
                disabled
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Input
                label={formContent.inputGeometriesFile.label}
                labelWithTooltip
                toolTipContent={formContent.inputGeometriesFile.toolTip}
                className={disabledFieldClassName}
                value={MAPSWIPE_LOCATE_PROJECT_DATASET_LINK}
                handleInput={() => undefined}
                disabled
              />
            </div>
            <div>
              <Input
                label={formContent.customImageryServerUrl.label}
                labelWithTooltip
                toolTipContent={formContent.customImageryServerUrl.toolTip}
                className={disabledFieldClassName}
                value={tileserverURL}
                handleInput={() => undefined}
                disabled
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Input
                label={formContent.imageryCredits.label}
                labelWithTooltip
                toolTipContent={formContent.imageryCredits.toolTip}
                showBorder
                type={INPUT_TYPES.NUMBER}
                value={form.imageryCredits}
                handleInput={(event) =>
                  updateField("imageryCredits", event.target.value)
                }
              />
            </div>
            <div>
              <Input
                label={formContent.minZoom.label}
                labelWithTooltip
                toolTipContent={formContent.minZoom.toolTip}
                showBorder
                type={INPUT_TYPES.NUMBER}
                value={form.minZoom}
                handleInput={(event) =>
                  updateField("minZoom", event.target.value)
                }
              />
            </div>
          </div>

          <ImageUploadField
            label={formContent.projectCoverImage.label}
            tooltipContent={formContent.projectCoverImage.toolTip}
            fileName={form.coverImageName}
            onFileSelect={handleCoverImageChange}
            onClear={handleClearCoverImage}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Input
                label={formContent.verificationNumber.label}
                labelWithTooltip
                toolTipContent={formContent.verificationNumber.toolTip}
                showBorder
                type={INPUT_TYPES.NUMBER}
                value={form.verificationNumber}
                handleInput={(event) =>
                  updateField("verificationNumber", event.target.value)
                }
              />
            </div>
            <div>
              <Input
                label={formContent.groupSize.label}
                labelWithTooltip
                toolTipContent={formContent.groupSize.toolTip}
                showBorder
                type={INPUT_TYPES.NUMBER}
                value={form.groupSize}
                handleInput={(event) =>
                  updateField("groupSize", event.target.value)
                }
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Input
                label={formContent.maxTasksPerUser.label}
                labelWithTooltip
                toolTipContent={formContent.maxTasksPerUser.toolTip}
                showBorder
                type={INPUT_TYPES.NUMBER}
                value={form.maxTasksPerUser}
                handleInput={(event) =>
                  updateField("maxTasksPerUser", event.target.value)
                }
              />
            </div>
            <div>
              <Select
                label={formContent.zoomLevel.label}
                labelWithTooltip
                toolTipContent={formContent.zoomLevel.toolTip}
                className={selectFieldClassName}
                defaultValue={form.zoomLevel}
                handleChange={(value) =>
                  updateField("zoomLevel", String(value))
                }
                options={selectOptions([
                  MAPSWIPE_LOCATE_PROJECT_DEFAULT_ZOOM_LEVEL,
                ])}
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <MapswipeFieldLabel
                label={formContent.subGrid.label}
                tooltipContent={formContent.subGrid.toolTip}
              />
              <p className="mb-3 text-body-4 text-grey">
                {formContent.subGrid.description}
              </p>
              <div className="flex items-center gap-6">
                {MAPSWIPE_LOCATE_PROJECT_SUB_GRID_OPTIONS.map((value) => (
                  <label
                    key={value}
                    className="inline-flex items-center gap-2 text-body-4 text-dark"
                  >
                    <input
                      type="radio"
                      name="sub-grid"
                      checked={form.subGridSize === value}
                      onChange={() => updateField("subGridSize", value)}
                    />
                    {value}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <MapswipeFieldLabel
                label={formContent.exportMeta.label}
                tooltipContent={formContent.exportMeta.toolTip}
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <MapswipeFieldLabel
                    label={formContent.exportMetaKey.label}
                    tooltipContent={formContent.exportMetaKey.toolTip}
                  />
                  <input
                    className={InputClassName}
                    value={featureType || "Rooftops"}
                    readOnly
                  />
                </div>
                <div>
                  <MapswipeFieldLabel
                    label={formContent.exportMetaValue.label}
                    tooltipContent={formContent.exportMetaValue.toolTip}
                  />
                  <div className="space-y-2">
                    {exportMetaValues.map((value, index) => (
                      <input
                        key={`export-meta-value-${index}`}
                        className={InputClassName}
                        value={value}
                        readOnly
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 pt-6 md:grid-cols-2">
            <Button
              variant={ButtonVariant.DARK}
              onClick={onBack}
              className="!h-12"
            >
              {content.buttons.cancel}
            </Button>
            <Button disabled={!canCreate} onClick={onCreate} className="!h-12">
              {content.buttons.create}
            </Button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
};
