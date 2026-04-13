import { ChangeEvent, useCallback, useMemo, useRef, useState } from "react";

export type MapswipeLocateProjectForm = {
  projectTopic: string;
  projectRegion: string;
  projectDescription: string;
  instruction: string;
  lookFor: string;
  tutorial: string;
  imageryCredits: string;
  minZoom: string;
  verificationNumber: string;
  groupSize: string;
  maxTasksPerUser: string;
  zoomLevel: string;
  subGridSize: string;
  coverImageName: string;
};

type UseMapswipeLocateProjectFormModelArgs = {
  datasetName: string;
  datasetDescription: string;
  featureType: string;
  keyValues: string[];
};

export const MAPSWIPE_LOCATE_PROJECT_DATASET_LINK =
  "https://fair.hotosm.org/profile/datasets";
export const MAPSWIPE_LOCATE_PROJECT_DEFAULT_TUTORIAL =
  "Conflation Project Tutorial";
export const MAPSWIPE_LOCATE_PROJECT_DEFAULT_ZOOM_LEVEL =
  "18 - Pedestrian View -- Sidewalks, individual";
export const MAPSWIPE_LOCATE_PROJECT_SUB_GRID_OPTIONS = ["2x2", "4x4", "8x8"];

const DEFAULT_INSTRUCTION = "Here is the instruction";
const FALLBACK_EXPORT_META_VALUES = ["Zinc", "Aluminium"];
const DEFAULT_FEATURE_TYPE = "Rooftops";

const getInitialFormState = (
  datasetName: string,
  datasetDescription: string,
  featureType: string,
): MapswipeLocateProjectForm => ({
  projectTopic: datasetName,
  projectRegion: "",
  projectDescription: datasetDescription,
  instruction: DEFAULT_INSTRUCTION,
  lookFor: featureType || DEFAULT_FEATURE_TYPE,
  tutorial: MAPSWIPE_LOCATE_PROJECT_DEFAULT_TUTORIAL,
  imageryCredits: "3",
  minZoom: "18",
  verificationNumber: "3",
  groupSize: "400",
  maxTasksPerUser: "400",
  zoomLevel: MAPSWIPE_LOCATE_PROJECT_DEFAULT_ZOOM_LEVEL,
  subGridSize: "2x2",
  coverImageName: "",
});

const hasRequiredValue = (value: string) => value.trim().length > 0;

export const useMapswipeLocateProjectFormModel = ({
  datasetName,
  datasetDescription,
  featureType,
  keyValues,
}: UseMapswipeLocateProjectFormModelArgs) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<MapswipeLocateProjectForm>(() =>
    getInitialFormState(datasetName, datasetDescription, featureType),
  );

  const updateField = useCallback(
    (field: keyof MapswipeLocateProjectForm, value: string) => {
      setForm((prevForm) => ({ ...prevForm, [field]: value }));
    },
    [],
  );

  const handleValueChange = useCallback(
    (field: keyof MapswipeLocateProjectForm) =>
      (
        event: ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
      ) => {
        updateField(field, event.target.value);
      },
    [updateField],
  );

  const handleCoverImageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      updateField("coverImageName", file?.name || "");
    },
    [updateField],
  );

  const handleClearCoverImage = useCallback(() => {
    updateField("coverImageName", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [updateField]);

  const exportMetaValues = useMemo(() => {
    const values = keyValues
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    return values.length > 0 ? values : FALLBACK_EXPORT_META_VALUES;
  }, [keyValues]);

  const canCreate = useMemo(
    () =>
      [
        form.projectTopic,
        form.projectRegion,
        form.projectDescription,
        form.instruction,
      ].every(hasRequiredValue),
    [
      form.projectTopic,
      form.projectRegion,
      form.projectDescription,
      form.instruction,
    ],
  );

  return {
    fileInputRef,
    form,
    canCreate,
    exportMetaValues,
    updateField,
    handleValueChange,
    handleCoverImageChange,
    handleClearCoverImage,
  };
};
