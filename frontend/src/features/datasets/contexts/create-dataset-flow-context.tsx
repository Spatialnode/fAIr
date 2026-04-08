import { useCreateDatasetFlow } from "@/features/datasets/hooks/use-create-dataset-flow";
import React, { createContext, useContext } from "react";

type CreateDatasetFlowContextValue = ReturnType<typeof useCreateDatasetFlow>;

const CreateDatasetFlowContext =
  createContext<CreateDatasetFlowContextValue | null>(null);

export const CreateDatasetFlowProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const flow = useCreateDatasetFlow();
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
