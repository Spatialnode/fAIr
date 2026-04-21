import {
  DATASET_DESCRIPTION_MAX_LENGTH,
  DATASET_DESCRIPTION_MIN_LENGTH,
  DATASET_NAME_MAX_LENGTH,
  DATASET_NAME_MIN_LENGTH,
} from "@/features/datasets/utils/constants";
import { DatasetValidityState } from "@/features/datasets/types/types";

// ─── Text field validation ───────────────────────────────────────────

export const getTextFieldValidity = (
  value: string,
  minLength: number,
  maxLength: number,
): DatasetValidityState => {
  const valid = value.length >= minLength && value.length <= maxLength;
  return {
    valid,
    message: valid
      ? ""
      : `Must be between ${minLength} and ${maxLength} characters.`,
  };
};

// ─── Step-one field completeness ─────────────────────────────────────

type StepOneFields = {
  hasValidName: boolean;
  hasValidDescription: boolean;
  tileserverURL: string;
  tileServiceValid: boolean;
  taskType: string;
  geometryType: string;
  featureType: string;
  keyValues: string[];
};

export const getStepOneMissingFields = (fields: StepOneFields): string[] => {
  const missing: string[] = [];

  if (!fields.hasValidName) missing.push("Dataset Name");
  if (!fields.hasValidDescription) missing.push("Dataset Description");

  if (fields.tileserverURL.trim().length === 0) {
    missing.push("Tile Server URL");
  } else if (!fields.tileServiceValid) {
    missing.push("Valid Tile Server URL");
  }

  if (fields.taskType === "") missing.push("Task Type");
  if (fields.geometryType === "") missing.push("Geometry Type");
  if (fields.featureType === "") missing.push("Feature Type");

  if (!fields.keyValues.some((v) => v.trim().length > 0)) {
    missing.push("Key Value");
  }

  return missing;
};

export const isStepOneComplete = (fields: StepOneFields): boolean =>
  getStepOneMissingFields(fields).length === 0;

// ─── Dataset hydration helpers ───────────────────────────────────────

export const getNameValidity = (name: string) =>
  getTextFieldValidity(name, DATASET_NAME_MIN_LENGTH, DATASET_NAME_MAX_LENGTH);

export const getDescriptionValidity = (description: string) =>
  getTextFieldValidity(
    description,
    DATASET_DESCRIPTION_MIN_LENGTH,
    DATASET_DESCRIPTION_MAX_LENGTH,
  );
