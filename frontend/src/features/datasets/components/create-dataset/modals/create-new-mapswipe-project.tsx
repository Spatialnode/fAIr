import { Button } from "@/components/ui/button";
import { DeleteIcon, InfoIcon } from "@/components/ui/icons";
import { ButtonVariant } from "@/enums";
import {
  MAPSWIPE_LOCATE_PROJECT_DATASET_LINK,
  MAPSWIPE_LOCATE_PROJECT_DEFAULT_TUTORIAL,
  MAPSWIPE_LOCATE_PROJECT_DEFAULT_ZOOM_LEVEL,
  MAPSWIPE_LOCATE_PROJECT_SUB_GRID_OPTIONS,
  useMapswipeLocateProjectFormModel,
} from "@/features/datasets/hooks/use-create-mapswipe-form";
import {
  InputClassName,
  ModalShell,
} from "@/features/datasets/components/create-dataset/shared";
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

const LabelWithInfo = ({ label }: { label: string }) => (
  <label className="mb-1 inline-flex items-center gap-1 text-body-4 font-medium text-dark">
    {label}
    <InfoIcon className="h-3.5 w-3.5 text-grey" />
  </label>
);

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
  const {
    fileInputRef,
    form,
    canCreate,
    exportMetaValues,
    updateField,
    handleValueChange,
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
      <div className="max-h-[78vh] overflow-y-auto pr-1">
        <h3 className="mb-2 text-title-2 font-semibold text-dark">
          MapSwipe Locate Project(s)
        </h3>
        <p className="mb-5 text-body-4 text-grey">
          fAIr will use the following details to create one or more MapSwipe
          Locate Project(s). The number of MapSwipe Projects depends on the
          entered features, e.g. we are building a dataset to identify different
          "rooftops" like "zinc" and "wood", fAIr will create 2 MapSwipe Locate
          Projects for same AOIs so swiper can support us identify those
          features and get the dataset ready for fAIr to use to create/fine-tune
          a GeoAI model.
        </p>

        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <LabelWithInfo label="Project Topic" />
              <input
                className={InputClassName}
                value={form.projectTopic}
                onChange={handleValueChange("projectTopic")}
              />
            </div>
            <div>
              <LabelWithInfo label="Project Region" />
              <input
                className={InputClassName}
                value={form.projectRegion}
                onChange={handleValueChange("projectRegion")}
              />
            </div>
          </div>

          <div>
            <LabelWithInfo label="Project Description" />
            <textarea
              className={`${InputClassName} min-h-[90px] resize-none`}
              value={form.projectDescription}
              onChange={handleValueChange("projectDescription")}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <LabelWithInfo label="Instruction" />
              <input
                className={InputClassName}
                value={form.instruction}
                onChange={handleValueChange("instruction")}
              />
            </div>
            <div>
              <LabelWithInfo label="Look for (legacy)" />
              <input
                className={InputClassName}
                value={form.lookFor}
                onChange={handleValueChange("lookFor")}
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <LabelWithInfo label="Requesting Organisation" />
              <input className={`${InputClassName} bg-off-white`} disabled />
            </div>
            <div>
              <LabelWithInfo label="Visibility" />
              <input
                className={`${InputClassName} bg-off-white`}
                value="Public"
                disabled
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <LabelWithInfo label="Tutorial" />
              <select
                className={InputClassName}
                value={form.tutorial}
                onChange={handleValueChange("tutorial")}
              >
                <option>{MAPSWIPE_LOCATE_PROJECT_DEFAULT_TUTORIAL}</option>
              </select>
            </div>
            <div>
              <LabelWithInfo label="Additional information resource (URL)" />
              <input
                className={InputClassName}
                value={MAPSWIPE_LOCATE_PROJECT_DATASET_LINK}
                disabled
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <LabelWithInfo label="Input Geometries File (Direct Link)" />
              <input
                className={InputClassName}
                value={MAPSWIPE_LOCATE_PROJECT_DATASET_LINK}
                disabled
              />
            </div>
            <div>
              <LabelWithInfo label="Custom Imagery Server URL" />
              <input
                className={InputClassName}
                value={tileserverURL}
                disabled
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <LabelWithInfo label="Imagery Credits" />
              <input
                className={InputClassName}
                value={form.imageryCredits}
                onChange={handleValueChange("imageryCredits")}
              />
            </div>
            <div>
              <LabelWithInfo label="Min Zoom" />
              <input
                className={InputClassName}
                value={form.minZoom}
                onChange={handleValueChange("minZoom")}
              />
            </div>
          </div>

          <div>
            <LabelWithInfo label="Project Cover Image" />
            <div className="flex items-center gap-3 rounded border border-gray-border p-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverImageChange}
              />
              <button
                type="button"
                className="rounded bg-light-gray px-3 py-2 text-body-4 text-dark"
                onClick={() => fileInputRef.current?.click()}
              >
                Select an image
              </button>
              {form.coverImageName ? (
                <>
                  <span className="truncate text-body-4 text-dark">
                    {form.coverImageName}
                  </span>
                  <button
                    type="button"
                    className="text-primary"
                    onClick={handleClearCoverImage}
                    aria-label="Remove selected image"
                  >
                    <DeleteIcon className="h-4 w-4" />
                  </button>
                </>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <LabelWithInfo label="Verification Number" />
              <input
                className={InputClassName}
                value={form.verificationNumber}
                onChange={handleValueChange("verificationNumber")}
              />
            </div>
            <div>
              <LabelWithInfo label="Group Size" />
              <input
                className={InputClassName}
                value={form.groupSize}
                onChange={handleValueChange("groupSize")}
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <LabelWithInfo label="Max tasks per user" />
              <input
                className={InputClassName}
                value={form.maxTasksPerUser}
                onChange={handleValueChange("maxTasksPerUser")}
              />
            </div>
            <div>
              <LabelWithInfo label="Zoom Level" />
              <select
                className={InputClassName}
                value={form.zoomLevel}
                onChange={handleValueChange("zoomLevel")}
              >
                <option>{MAPSWIPE_LOCATE_PROJECT_DEFAULT_ZOOM_LEVEL}</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <LabelWithInfo label="Sub grid" />
              <p className="mb-1 text-body-4 text-grey">Sub grid size</p>
              <div className="flex items-center gap-5">
                {MAPSWIPE_LOCATE_PROJECT_SUB_GRID_OPTIONS.map((value) => (
                  <label
                    key={value}
                    className="inline-flex items-center gap-1 text-body-4 text-dark"
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
              <LabelWithInfo label="Export Meta" />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="mb-1 text-body-4 text-grey">Key</p>
                  <input
                    className={InputClassName}
                    value={featureType || "Rooftops"}
                    readOnly
                  />
                </div>
                <div>
                  <p className="mb-1 text-body-4 text-grey">Value</p>
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

          <div className="grid gap-3 pt-2 md:grid-cols-2">
            <Button
              variant={ButtonVariant.DARK}
              uppercase={false}
              onClick={onBack}
            >
              Cancel
            </Button>
            <Button uppercase={false} disabled={!canCreate} onClick={onCreate}>
              Create
            </Button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
};
