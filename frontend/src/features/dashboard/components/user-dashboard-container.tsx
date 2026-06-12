import UserDashboardHeader from "@/features/dashboard/components/user-dashboard-header";
import UserSidebar from "@/features/dashboard/components/user-sidebar";
import { ProfileStatistics } from "@/features/user-profile/components";
import { RunningTasksCard } from "@/features/dashboard/components/running-tasks";
import { CurrentMappingCard } from "./current-mapping-card";

const UserDashboardContainer = () => {
  return (
    <section className="flex gap-8 h-[850px] overflow-hidden p-4">
      <div className="">
        <UserSidebar />
      </div>
      <div className="w-full space-y-8 flex flex-col">
        <UserDashboardHeader showDropdown />
        <ProfileStatistics />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-stretch flex-grow min-h-0">
          <CurrentMappingCard />
          <RunningTasksCard />
        </div>
      </div>
    </section>
  );
};

export default UserDashboardContainer;
