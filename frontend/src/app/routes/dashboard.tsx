import { Head } from "@/components/seo";
import { APPLICATION_ROUTES, DASHBOARD_QUERY_PARAMS } from "@/constants";
import NewUserStageOne from "@/features/dashboard/components/new-user-stage-one";
import NewUserStageTwo from "@/features/dashboard/components/new-user-stage-two";
import UserDashboardContainer from "@/features/dashboard/components/user-dashboard-container";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useState } from "react";
export const CREATE_NEW_MENU_ITEMS = [
  {
    label: "AI Model",
    route: APPLICATION_ROUTES.CREATE_NEW_MODEL,
  },
  {
    label: "Dataset",
    route: APPLICATION_ROUTES.PROFILE_DATASETS,
  },
  {
    label: "Add Base Model",
    route: APPLICATION_ROUTES.MODELS,
  },
] as const;

export const UserDashboard = () => {
  const [isFirstTime, setIsFirstTime] = useQueryState(
    DASHBOARD_QUERY_PARAMS.FIRST_TIME,
    parseAsBoolean.withDefault(false),
  );
  const [stage, setStage] = useState(1);

  return (
    <>
      <Head title="Dashboard" />
      {isFirstTime ? (
        stage === 1 ? (
          <NewUserStageOne onContinue={() => setStage(2)} />
        ) : (
          <NewUserStageTwo onFinish={() => setIsFirstTime(null)} />
        )
      ) : (
        <UserDashboardContainer />
      )}
    </>
  );
};
