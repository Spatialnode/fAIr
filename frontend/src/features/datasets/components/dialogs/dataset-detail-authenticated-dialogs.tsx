import { ConfirmationModal } from "@/components/shared";
import { ConfirmationIcon } from "@/components/ui/icons/confirmation-icon";
import { DatasetAOIEditDrawer } from "@/features/datasets/components/drawers/dataset-aoi-edit-drawer";
import { TTrainingDataset } from "@/types";
import { DatasetEditDialog } from "@/features/datasets/components/dialogs/dataset-edit-details-dialog";

type DialogState = {
  isOpened: boolean;
  closeDialog: () => void;
};

type ManagedConfirmationState = {
  isOpen: boolean;
  onClose: () => void;
};

type DatasetDetailAuthenticatedDialogsProps = {
  data: TTrainingDataset;
  dialogs: {
    datasetEdit: DialogState;
    datasetAoiEdit: DialogState;
    publish: ManagedConfirmationState;
    clone: ManagedConfirmationState;
  };
  onPublishDataset: () => void;
  onCloneDataset: () => void;
};

export const DatasetDetailAuthenticatedDialogs = ({
  data,
  dialogs,
  onPublishDataset,
  onCloneDataset,
}: DatasetDetailAuthenticatedDialogsProps) => {
  return (
    <>
      <DatasetEditDialog
        data={data}
        isOpened={dialogs.datasetEdit.isOpened}
        closeDialog={dialogs.datasetEdit.closeDialog}
      />
      <DatasetAOIEditDrawer
        isOpened={dialogs.datasetAoiEdit.isOpened}
        closeDialog={dialogs.datasetAoiEdit.closeDialog}
        trainingDataset={data}
      />
      <ConfirmationModal
        isOpen={dialogs.publish.isOpen}
        onClose={dialogs.publish.onClose}
        onConfirm={onPublishDataset}
        message={" Confirm you want to make this dataset public?"}
        icon={<ConfirmationIcon />}
      />
      <ConfirmationModal
        isOpen={dialogs.clone.isOpen}
        onClose={dialogs.clone.onClose}
        onConfirm={onCloneDataset}
        heading="Clone dataset?"
        message={
          "This will create a copy of this dataset and its settings as a new dataset. Changes to the clone won’t affect the original."
        }
        icon={<ConfirmationIcon />}
      />
    </>
  );
};
