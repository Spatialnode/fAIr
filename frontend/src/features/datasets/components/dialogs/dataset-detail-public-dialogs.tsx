import { DatasetFilesDialog } from "@/features/datasets/components/dialogs/dataset-files-dialog";
import { DatasetAreaDrawer } from "@/features/datasets/components/drawers/dataset-area-drawer";
import { TDatasetDummyFileVersion } from "@/features/datasets/utils/dataset-flow-mocks";
import { TTrainingDataset } from "@/types";

type DialogState = {
  isOpened: boolean;
  closeDialog: () => void;
};

type DatasetDetailPublicDialogsProps = {
  data: TTrainingDataset;
  fileVersions: TDatasetDummyFileVersion[];
  dialogs: {
    datasetFiles: DialogState;
    datasetArea: DialogState;
  };
};

export const DatasetDetailPublicDialogs = ({
  data,
  fileVersions,
  dialogs,
}: DatasetDetailPublicDialogsProps) => {
  return (
    <>
      <DatasetFilesDialog
        isOpened={dialogs.datasetFiles.isOpened}
        closeDialog={dialogs.datasetFiles.closeDialog}
        fileVersions={fileVersions}
      />
      <DatasetAreaDrawer
        isOpened={dialogs.datasetArea.isOpened}
        closeDialog={dialogs.datasetArea.closeDialog}
        trainingDataset={data}
      />
    </>
  );
};
