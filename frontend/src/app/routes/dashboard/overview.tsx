import { Head } from "@/components/seo";
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";

export const DashboardOverviewPage = () => {
  return (
    <>
      <Head title="Dashboard" />
      <DashboardOverview />
    </>
  );
};
