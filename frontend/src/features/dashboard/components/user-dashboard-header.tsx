import { useAuth } from "@/app/providers/auth-provider";
import { CREATE_NEW_MENU_ITEMS } from "@/app/routes/dashboard";
import { DropDown } from "@/components/ui/dropdown";
import { AddIcon, ChevronDownIcon } from "@/components/ui/icons";
import { DropdownPlacement } from "@/enums";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

interface IDashboardHeaderProps {
  showDropdown?: boolean;
}
const UserDashboardHeader = ({
  showDropdown = false,
}: IDashboardHeaderProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createMenuItems = useMemo(
    () =>
      CREATE_NEW_MENU_ITEMS.map((item) => ({
        value: item.label,
        onClick: () => {
          navigate(item.route);
        },
      })),
    [navigate],
  );
  return (
    <header className="flex my-3 flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex flex-col gap-2 justify-center">
        <div className="flex flex-col  gap-2">
          <h1 className="text-title-2 md:text-lg font-bold text-dark">
            Welcome back,{" "}
            <span className="italic font-regular">{user?.username}</span>
          </h1>
          <p className="text-[#687075] text-base">Lets get you mapping</p>
        </div>
      </div>

      {showDropdown && (
        <DropDown
          placement={DropdownPlacement.BOTTOM_END}
          menuItems={createMenuItems}
          distance={8}
          disableCheveronIcon
          triggerComponent={
            <button className="bg-primary gap-3 px-3 flex text-white items-center !w-fit !h-10 md:min-w-[10rem] !rounded-md min-w-[7.5rem]">
              <div className="bg-white w-fit rounded-full">
                <AddIcon className="text-primary size-4" />
              </div>
              Create New
              <ChevronDownIcon className="size-4" />
            </button>
          }
        />
      )}
    </header>
  );
};

export default UserDashboardHeader;
