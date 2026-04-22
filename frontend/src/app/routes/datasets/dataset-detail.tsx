import { useAuth } from "@/app/providers/auth-provider";
import { Head } from "@/components/seo";
import { ModelExplorer } from "@/components/shared/model-explorer";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { APPLICATION_ROUTES } from "@/constants";
import {
  DatasetDetailAuthenticatedActions,
  DatasetDetailOverview,
  DatasetDetailPublicActions,
} from "@/features/datasets/components/dataset-detail-overview";
import { DatasetDetailSkeleton } from "@/features/datasets/components/dataset-detail-skeleton";
import { DatasetDetailAuthenticatedDialogs } from "@/features/datasets/components/dialogs/dataset-detail-authenticated-dialogs";
import { DatasetDetailPublicDialogs } from "@/features/datasets/components/dialogs/dataset-detail-public-dialogs";
import { useGetTrainingDataset } from "@/features/datasets/hooks/use-datasets";
import {
  getDatasetDetailDisplay,
  getDatasetDummyFileVersions,
} from "@/features/datasets/utils/dataset-flow-mocks";
import { useDialog } from "@/hooks/use-dialog";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const TrainingDatasetsDetailPage = () => {
  const { id } = useParams();
  const datasetId = id ? parseInt(id, 10) : undefined;
  const { data, isPending, isError, refetch, error } = useGetTrainingDataset(
    datasetId as number,
    !!datasetId,
  );

  const { isAuthenticated, user } = useAuth();
  const {
    isOpened: isDatasetAreaDrawerOpened,
    openDialog: openDatasetAreaDrawer,
    closeDialog: closeDatasetAreaDrawer,
  } = useDialog();
  const navigate = useNavigate();
  const {
    isOpened: isPublishDialogOpened,
    openDialog: openPublishDialog,
    closeDialog: closePublishDialog,
  } = useDialog();

  const {
    isOpened: isCloneDatasetOpened,
    openDialog: openCloneDatasetDialog,
    closeDialog: closeCloneDatasetDialog,
  } = useDialog();
  const {
    isOpened: isDatasetEditDialogOpened,
    openDialog: openDatasetEditDialog,
    closeDialog: closeDatasetEditDialog,
  } = useDialog();
  const {
    isOpened: isDatasetFilesDialogOpened,
    openDialog: openDatasetFilesDialog,
    closeDialog: closeDatasetFilesDialog,
  } = useDialog();
  const {
    isOpened: isDatasetAoiEditDrawerOpened,
    openDialog: openDatasetAoiEditDrawer,
    closeDialog: closeDatasetAoiEditDrawer,
  } = useDialog();

  const handlePublishDataset = () => {
    // Implement publish dataset logic here, e.g., call the API to publish the dataset
  };
  const handleCloneDataset = () => {
    // Implement clone dataset logic here, e.g., call the API to clone the dataset
  };
  /**
   * Redirect to 404 page if dataset is not found.
   */
  useEffect(() => {
    if (isError) {
      const status = (error as { status?: number })?.status;
      if (status === 404) {
        navigate(APPLICATION_ROUTES.NOTFOUND, {
          state: { from: APPLICATION_ROUTES.DATASETS },
        });
      }
    }
  }, [isError, error]);

  if (isPending || !data) {
    return <DatasetDetailSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen gap-y-10">
        <p className="inline-flex gap-x-2">
          Error loading dataset <span className="font-bold">{datasetId}.</span>
        </p>
        <Button className="!w-fit" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const datasetDetail = getDatasetDetailDisplay(data);
  const datasetFileVersions = getDatasetDummyFileVersions(data);
  const publicActions: DatasetDetailPublicActions = {
    openDatasetArea: openDatasetAreaDrawer,
    openDatasetFiles: openDatasetFilesDialog,
  };
  const authenticatedActions: DatasetDetailAuthenticatedActions = {
    openDatasetEdit: openDatasetEditDialog,
    openDatasetAoiEdit: openDatasetAoiEditDrawer,
    openCloneDataset: openCloneDatasetDialog,
    openPublishDataset: openPublishDialog,
  };
  const publicDialogs = {
    datasetFiles: {
      isOpened: isDatasetFilesDialogOpened,
      closeDialog: closeDatasetFilesDialog,
    },
    datasetArea: {
      isOpened: isDatasetAreaDrawerOpened,
      closeDialog: closeDatasetAreaDrawer,
    },
  };
  const authenticatedDialogs = {
    datasetEdit: {
      isOpened: isDatasetEditDialogOpened,
      closeDialog: closeDatasetEditDialog,
    },
    datasetAoiEdit: {
      isOpened: isDatasetAoiEditDrawerOpened,
      closeDialog: closeDatasetAoiEditDrawer,
    },
    publish: {
      isOpen: isPublishDialogOpened,
      onClose: closePublishDialog,
    },
    clone: {
      isOpen: isCloneDatasetOpened,
      onClose: closeCloneDatasetDialog,
    },
  };
  const showEditOptions = isAuthenticated && user?.osm_id === data.user.osm_id;
  return (
    <>
      <Head title={`${data.name} Dataset`} />
      <DatasetDetailPublicDialogs
        data={data}
        fileVersions={datasetFileVersions}
        dialogs={publicDialogs}
      />
      {showEditOptions ? (
        <DatasetDetailAuthenticatedDialogs
          data={data}
          dialogs={authenticatedDialogs}
          onPublishDataset={handlePublishDataset}
          onCloneDataset={handleCloneDataset}
        />
      ) : null}
      <div className="flex flex-col gap-y-8">
        <DatasetDetailOverview
          data={data}
          datasetDetail={datasetDetail}
          publicActions={publicActions}
          authenticatedActions={authenticatedActions}
        />
        <Divider />
        <div>
          <ModelExplorer
            title="Models Using this Dataset"
            datasetId={data.id}
            disableStatusFilter
            status={0}
          />
        </div>
      </div>
    </>
  );
};
