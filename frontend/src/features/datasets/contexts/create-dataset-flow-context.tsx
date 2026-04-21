import { useCreateDatasetFlow } from "@/features/datasets/hooks/use-create-dataset-flow";
import { DatasetMetadataForm } from "@/features/datasets/types/types";
import { TTrainingDataset } from "@/types";
import React, { createContext, useContext } from "react";

type CreateDatasetFlowContextValue = ReturnType<typeof useCreateDatasetFlow>;

const CreateDatasetFlowContext =
  createContext<CreateDatasetFlowContextValue | null>(null);

export const CreateDatasetFlowProvider: React.FC<{
  children: React.ReactNode;
  mode: "create" | "edit";
  step: 1 | 2;
  existingDataset?: TTrainingDataset;
  prefilledMetadata?: DatasetMetadataForm;
  onStepChange: (step: 1 | 2) => void;
  onDatasetCreated: (datasetId: number, metadata: DatasetMetadataForm) => void;
}> = ({
  children,
  mode,
  step,
  existingDataset,
  prefilledMetadata,
  onStepChange,
  onDatasetCreated,
}) => {
  const flow = useCreateDatasetFlow({
    mode,
    step,
    existingDataset,
    prefilledMetadata,
    onStepChange,
    onDatasetCreated,
  });
  return (
    <CreateDatasetFlowContext.Provider value={flow}>
      {children}
    </CreateDatasetFlowContext.Provider>
  );
};

export const useCreateDatasetFlowContext = () => {
  const context = useContext(CreateDatasetFlowContext);
  if (!context) {
    throw new Error(
      "useCreateDatasetFlowContext must be used within a CreateDatasetFlowProvider",
    );
  }
  return context;
};
