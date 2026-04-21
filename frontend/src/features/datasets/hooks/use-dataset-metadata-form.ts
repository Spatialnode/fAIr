import { useCallback, useState } from "react";
import { INITIAL_DATASET_METADATA_FORM } from "@/features/datasets/components/create-dataset/constants";
import {
  DatasetMetadataForm,
  DatasetValidityState,
} from "@/features/datasets/components/create-dataset/types";

export const useDatasetMetadataForm = (
  initialValue: DatasetMetadataForm = INITIAL_DATASET_METADATA_FORM,
) => {
  const [datasetMetadataForm, setDatasetMetadataForm] =
    useState<DatasetMetadataForm>(initialValue);
  const [datasetNameValidity, setDatasetNameValidity] =
    useState<DatasetValidityState>({
      valid: false,
      message: "",
    });
  const [datasetDescriptionValidity, setDatasetDescriptionValidity] =
    useState<DatasetValidityState>({
      valid: false,
      message: "",
    });

  const updateDatasetMetadataField = useCallback(
    <K extends keyof DatasetMetadataForm>(
      field: K,
      value: DatasetMetadataForm[K],
    ) => {
      setDatasetMetadataForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [],
  );

  const handleKeyValueUpdate = useCallback((index: number, value: string) => {
    setDatasetMetadataForm((prev) => ({
      ...prev,
      keyValues: prev.keyValues.map((currentValue, itemIndex) =>
        itemIndex === index ? value : currentValue,
      ),
    }));
  }, []);

  const handleKeyValueDelete = useCallback((index: number) => {
    setDatasetMetadataForm((prev) => {
      if (prev.keyValues.length === 1) return prev;
      return {
        ...prev,
        keyValues: prev.keyValues.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  }, []);

  const addKeyValue = useCallback(() => {
    setDatasetMetadataForm((prev) => ({
      ...prev,
      keyValues: [...prev.keyValues, ""],
    }));
  }, []);

  const resetDatasetMetadataForm = useCallback(
    (nextValue: DatasetMetadataForm) => {
      setDatasetMetadataForm(nextValue);
    },
    [],
  );

  const handleTagKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter" && event.key !== ",") return;
      event.preventDefault();

      setDatasetMetadataForm((prev) => {
        const value = prev.tagInput.trim();
        if (!value) return prev;
        if (prev.tags.includes(value)) {
          return {
            ...prev,
            tagInput: "",
          };
        }
        return {
          ...prev,
          tags: [...prev.tags, value],
          tagInput: "",
        };
      });
    },
    [],
  );

  const hasValidDatasetName =
    datasetMetadataForm.name.length > 0 && datasetNameValidity.valid;
  const hasValidDatasetDescription =
    datasetMetadataForm.description.length > 0 &&
    datasetDescriptionValidity.valid;

  return {
    datasetMetadataForm,
    updateDatasetMetadataField,
    handleKeyValueUpdate,
    handleKeyValueDelete,
    addKeyValue,
    resetDatasetMetadataForm,
    handleTagKeyDown,
    datasetNameValidity,
    setDatasetNameValidity,
    datasetDescriptionValidity,
    setDatasetDescriptionValidity,
    hasValidDatasetName,
    hasValidDatasetDescription,
  };
};
