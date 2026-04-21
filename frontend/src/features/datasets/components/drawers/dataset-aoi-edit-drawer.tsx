import { Drawer } from "vaul";
import { CloseIcon } from "@/components/ui/icons";
import { CreateDatasetFlowDialog } from "@/features/datasets/components/create-dataset";
import { CreateDatasetStepTwo } from "@/features/datasets/components/create-dataset/create-dataset-step-two";
import { CreateDatasetFlowProvider } from "@/features/datasets/contexts/create-dataset-flow-context";
import { getDatasetFlowInitialState } from "@/features/datasets/utils/dataset-flow-mocks";
import { DialogProps, TTrainingDataset } from "@/types";

type TrainingAreaDrawerProps = DialogProps & {
  trainingDataset: TTrainingDataset;
};

export const DatasetAOIEditDrawer: React.FC<TrainingAreaDrawerProps> = ({
  isOpened,
  closeDialog,
  trainingDataset,
}) => {
  return (
    <Drawer.Root
      dismissible
      fixed
      open={isOpened}
      onOpenChange={(open) => !open && closeDialog()}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[1000000200] bg-black/80" />
        <Drawer.Content className="fixed inset-0 z-[1000000200] pt-20 outline-none">
          <Drawer.Title className="hidden">Edit Training Area</Drawer.Title>
          <Drawer.Description className="hidden">
            Edit the training area for this dataset.
          </Drawer.Description>

          <button
            type="button"
            onClick={closeDialog}
            className="absolute right-4 top-4 z-10 rounded-full bg-white p-3 text-dark shadow-lg transition-opacity hover:opacity-85"
            aria-label="Close training area editor"
          >
            <CloseIcon className="h-5 w-5" />
          </button>

          <div className="mx-auto h-full w-full overflow-hidden rounded-t-[32px] bg-white shadow-2xl">
            <div className="h-full overflow-y-auto px-4 py-4 md:px-6 md:py-5">
              <CreateDatasetFlowProvider
                mode="edit"
                step={2}
                existingDataset={trainingDataset}
                prefilledMetadata={
                  getDatasetFlowInitialState(trainingDataset).metadataForm
                }
                onStepChange={() => undefined}
                onDatasetCreated={() => undefined}
              >
                <>
                  <CreateDatasetStepTwo variant="overlay" />
                  <CreateDatasetFlowDialog />
                </>
              </CreateDatasetFlowProvider>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
