import { APPLICATION_ROUTES } from "@/constants";
import { ActionCard, DashboardCard } from "./action-card";
import { MapIcon } from "@/components/ui/icons";
import { CommunityMapperIcon } from "@/components/ui/icons/community-mapper-icon";
import { LearnIcon } from "@/components/ui/icons/learn-icon";
import UserDashboardHeader from "./user-dashboard-header";

export const FIRST_TIME_CARDS: DashboardCard[] = [
  {
    title: "Try fAIr",
    description: "Start your first mapping project",
    ctaLabel: "Try it now",
    href: APPLICATION_ROUTES.TRY_FAIR,
    dark: true,
    Icon: MapIcon,
    IconPosition: "top",
  },
  {
    title: "Community Projects",
    description:
      "Explore project and AI results from the community that are produced with fAIr.",
    ctaLabel: "Explore",
    href: APPLICATION_ROUTES.PROFILE_OFFLINE_PREDICTIONS,
    Icon: CommunityMapperIcon,
    IconPosition: "top",
  },
  {
    title: "Learn about fAIr",
    description:
      "Read quick guides and walkthroughs to confidently use the platform.",
    ctaLabel: "Start Learning",
    href: APPLICATION_ROUTES.LEARN_BASE,
    Icon: LearnIcon,
    IconPosition: "top",
  },
];

interface INewUserStageTwoProps {
  onFinish?: () => void;
}

const NewUserStageTwo = ({ onFinish }: INewUserStageTwoProps) => {
  return (
    <section className="space-y-8 md:px-9 p-4 md:py-11">
      <UserDashboardHeader showDropdown />
      <h2 className="text-center italic text-title-2 font-regular text-dark">
        What would you like to do?
      </h2>
      <div className="grid max-w-5xl mx-auto gap-4 lg:grid-cols-3">
        {FIRST_TIME_CARDS.map((card) => (
          <ActionCard
            firstTime
            Icon={card.Icon}
            IconPostion={card.IconPosition}
            key={card.title}
            card={card}
            onFinish={onFinish}
          />
        ))}
      </div>
    </section>
  );
};

export default NewUserStageTwo;
