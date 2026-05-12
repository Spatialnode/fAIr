import { useAuth } from "@/app/providers/auth-provider";
import { HOTTeamTwo, fAIrSwipeIllustration } from "@/assets/images";
import { DropDown } from "@/components/ui/dropdown";
import { AddIcon, ChevronDownIcon } from "@/components/ui/icons";
import {
  CREATE_NEW_MENU_ITEMS,
  FIRST_TIME_CARDS,
  RETURNING_CARDS,
} from "@/features/dashboard/utils/dashboard-data";
import {
  APPLICATION_ROUTES,
  DASHBOARD_QUERY_PARAMS,
  SHARED_CONTENT,
} from "@/constants";
import { DropdownPlacement } from "@/enums";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ActionCard } from "@/features/dashboard/components/action-card";
import { OverviewStats } from "@/features/dashboard/components/overview-stats";
import { RunningTasksCard } from "@/features/dashboard/components/running-tasks-card";
import { PromoCard } from "@/features/dashboard/components/promo-card";
import { AIMapModelIcon } from "@/components/ui/icons/ai-model-icon";
import { DatasetIcon } from "@/components/ui/icons/datsaset-icon";
import { PredictionsIcon } from "@/components/ui/icons/predictions-icons";
import Link from "@/components/ui/link/link";

export const DashboardOverview = () => {
  const { user } = useAuth();
  const [isFirstTime] = useQueryState(
    DASHBOARD_QUERY_PARAMS.FIRST_TIME,
    parseAsBoolean.withDefault(false),
  );
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

  const displayName = user?.username || "Mapper";

  return (
    <section className="space-y-8 pb-8">
      <header className="flex my-3 flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-2 justify-center">
          <div className="flex items-center gap-4">
            <h1 className="text-title-1 md:text-lg font-bold text-dark">
              Welcome,{" "}
              <span className="italic font-regular">{displayName}</span>
            </h1>
            {(user?.profile_completion_percentage ?? 0) < 100 && (
              <Link
                nativeAnchor={false}
                href={APPLICATION_ROUTES.PROFILE_SETTINGS}
                title="Complete your profile"
                disableLinkStyle
                className="inline-flex items-center gap-2 font-semibold text-primary text-body-2base"
              >
                Complete your profile
                <ChevronDownIcon className="-rotate-90 h-3 w-3" />
              </Link>
            )}
          </div>
        </div>

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
      </header>

      {isFirstTime ? (
        <section className="space-y-8">
          <h2 className="text-center italic text-title-1 font-regular text-dark">
            What would you like to do?
          </h2>
          <div className="grid max-w-5xl mx-auto gap-4 lg:grid-cols-3">
            {FIRST_TIME_CARDS.map((card) => (
              <ActionCard firstTime key={card.title} card={card} />
            ))}
          </div>
        </section>
      ) : (
        <section className="grid gap-4 lg:grid-cols-3">
          <ActionCard card={RETURNING_CARDS[0]} />
          <ActionCard
            IconPostion="top"
            Icon={AIMapModelIcon}
            card={RETURNING_CARDS[1]}
          />
          <OverviewStats  />

          <ActionCard
            IconPostion="top-left"
            Icon={DatasetIcon}
            smallHeight
            card={RETURNING_CARDS[2]}
          />
          <PromoCard
            title="Join the Community"
            imageSrc={HOTTeamTwo}
            imageAlt={SHARED_CONTENT.homepage.callToAction.ctaButton}
            href={APPLICATION_ROUTES.LEARN_BASE}
            linkTitle="Join the community"
          />
          <RunningTasksCard />

          <ActionCard
            IconPostion="top-left"
            Icon={PredictionsIcon}
            smallHeight
            card={RETURNING_CARDS[3]}
          />
          <PromoCard
            title="Contribute Base Model to fAIr"
            imageSrc={fAIrSwipeIllustration}
            imageAlt="Contribute base model"
            href={APPLICATION_ROUTES.MODELS}
            linkTitle="Contribute your base model"
          />
        </section>
      )}
    </section>
  );
};
