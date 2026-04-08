import { Head } from "@/components/seo";
import { CreateDatasetFlowDialog } from "@/features/datasets/components/create-dataset";
import { CreateDatasetStepOne } from "@/features/datasets/components/create-dataset/step-one";
import { CreateDatasetStepTwo } from "@/features/datasets/components/create-dataset/step-two";
import {
  CreateDatasetFlowProvider,
  useCreateDatasetFlowContext,
} from "@/features/datasets/contexts/create-dataset-flow-context";

const CreateDatasetPageContent = () => {
  const flow = useCreateDatasetFlowContext();

  return (
    <>
      <Head title="Create Training Dataset" />
      <section className="my-10 min-h-screen">
        <CreateDatasetStepOne />
      </section>

      {flow.step === 2 ? (
        <div className="fixed inset-0 z-[120] bg-black/45">
          <div className="h-full w-full overflow-y-auto bg-white p-4 md:p-8">
            <CreateDatasetStepTwo />
          </div>
        </div>
      ) : null}
      <CreateDatasetFlowDialog />
    </>
  );
};

export const CreateDatasetPage = () => {
  return (
    <CreateDatasetFlowProvider>
      <CreateDatasetPageContent />
    </CreateDatasetFlowProvider>
  );
};
