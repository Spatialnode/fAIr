import { Head } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { APPLICATION_ROUTES } from "@/constants";
import { CreateDatasetFlowDialog } from "@/features/datasets/components/create-dataset";
import { CreateDatasetStepOne } from "@/features/datasets/components/create-dataset/step-one";
import { CreateDatasetStepTwo } from "@/features/datasets/components/create-dataset/step-two";
import { DatasetMetadataForm } from "@/features/datasets/components/create-dataset/types";
import {
  CreateDatasetFlowProvider,
} from "@/features/datasets/contexts/create-dataset-flow-context";
import { useGetTrainingDataset } from "@/features/datasets/hooks/use-datasets";
import { getDatasetEditRoute } from "@/features/datasets/utils/dataset-routing";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

const CreateDatasetPageContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const routeState = (location.state ?? {}) as {
    datasetMetadata?: DatasetMetadataForm;
  };
  const datasetId = id ? parseInt(id, 10) : undefined;
  const isEditMode = typeof datasetId === "number" && !Number.isNaN(datasetId);
  const step = searchParams.get("step") === "2" ? 2 : 1;
  const prefilledMetadata = routeState.datasetMetadata;
  const {
    data: existingDataset,
    isPending,
    isError,
    refetch,
  } = useGetTrainingDataset(datasetId ?? 0, isEditMode);

  const handleStepChange = (nextStep: 1 | 2) => {
    if (!isEditMode) return;

    const nextSearchParams = new URLSearchParams(searchParams);
    if (nextStep === 2) {
      nextSearchParams.set("step", "2");
    } else {
      nextSearchParams.delete("step");
    }

    setSearchParams(nextSearchParams, { replace: true });
  };

  const handleDatasetCreated = (
    createdDatasetId: number,
    metadata: DatasetMetadataForm,
  ) => {
    navigate(getDatasetEditRoute(createdDatasetId, 2), {
      replace: true,
      state: {
        from: APPLICATION_ROUTES.DATASETS,
        datasetMetadata: metadata,
      },
    });
  };

  if (isEditMode && isPending) {
    return (
      <section className="my-10 flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </section>
    );
  }

  if (isEditMode && (isError || !existingDataset)) {
    return (
      <section className="my-10 flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-body-2base text-dark">
          Unable to load this dataset for editing.
        </p>
        <Button className="!w-fit" onClick={() => refetch()}>
          Retry
        </Button>
      </section>
    );
  }

  return (
    <CreateDatasetFlowProvider
      mode={isEditMode ? "edit" : "create"}
      step={step}
      existingDataset={existingDataset}
      prefilledMetadata={prefilledMetadata}
      onStepChange={handleStepChange}
      onDatasetCreated={handleDatasetCreated}
    >
      <>
        <Head
          title={isEditMode ? "Edit Training Dataset" : "Create Training Dataset"}
        />
        <section className="my-10 min-h-screen">
          {step === 2 ? <CreateDatasetStepTwo /> : <CreateDatasetStepOne />}
        </section>
        <CreateDatasetFlowDialog />
      </>
    </CreateDatasetFlowProvider>
  );
};

export const CreateDatasetPage = () => {
  return <CreateDatasetPageContent />;
};
