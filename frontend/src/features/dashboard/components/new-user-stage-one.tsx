import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "@/components/ui/icons";
import { CommunityMapperIcon } from "@/components/ui/icons/community-mapper-icon";
import { GeodeveloperIcon } from "@/components/ui/icons/geo-developer-icon";
import { ProjectManagerIcon } from "@/components/ui/icons/project-manager-icon";
import { cn } from "@/utils";
import { useState } from "react";
import UserDashboardHeader from "./user-dashboard-header";
export const ROLE_ITEMS = [
  {
    id: 1,
    role: "Community Mapper",
    description: "Mapping for good",
    Icon: CommunityMapperIcon,
  },
  {
    id: 2,
    role: "Project Manager",
    description: "Mapping for good",
    Icon: ProjectManagerIcon,
  },
  {
    id: 3,
    role: "Geo Developer",
    description: "Mapping for good",
    Icon: GeodeveloperIcon,
  },
];
interface INewUserStageOneProps {
  onContinue: () => void;
}
const NewUserStageOne = ({ onContinue }: INewUserStageOneProps) => {
  const [selectedRole, setSelectedRole] = useState(1);

  return (
    <section className="md:px-9 p-4 md:py-11 flex flex-col min-h-[56vh]">
      <UserDashboardHeader />
      <section className="flex-grow mt-8 md:mt-0 flex flex-col items-center justify-center space-y-8">
        <h2 className="text-center italic text-title-3 lg:text-[24px]  text-dark">
          How would you describe yourself?
        </h2>
        <div className="grid w-full md:max-w-5xl  mx-auto gap-8 lg:grid-cols-3">
          {ROLE_ITEMS.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={cn(
                "flex gap-4 px-5 py-4 items-center rounded-[61px]",
                selectedRole === role.id ? "bg-[#FFEDED]" : "bg-[#F7F9FB]",
              )}
            >
              <role.Icon
                className={cn(
                  selectedRole === role.id
                    ? "text-[#D63F40]"
                    : "text-[#2C3038]",
                )}
              />
              <div className="flex flex-col items-start">
                <h3 className="text-dark font-bold">{role.role}</h3>
                <p className="text-grey text-sm">{role.description}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="w-full  max-w-[171px]">
          <Button rounded onClick={onContinue}>
            Continue
            <ChevronDownIcon className="-rotate-90 h-3 w-3" />
          </Button>
        </div>
      </section>
    </section>
  );
};

export default NewUserStageOne;
