import {
  BotIcon,
  ProductionCheckmarkIcon,
  DatabaseIcon,
  FeedbackIcon,
  TimerIcon,
} from "@/components/ui/icons";
import type { OverviewStat } from "@/features/dashboard/utils/types";
import { useAuth } from "@/app/providers/auth-provider";

export const OverviewStats = () => {
  const { user } = useAuth();

  const items: OverviewStat[] = [
    {
      icon: BotIcon,
      value: user?.models_count ?? 0,
      label: "Models Created",
    },
    {
      icon: ProductionCheckmarkIcon,
      value: user?.approved_predictions_count ?? 0,
      label: "Accepted Features",
    },
    {
      icon: DatabaseIcon,
      value: user?.datasets_count ?? 0,
      label: "Datasets",
    },
    {
      icon: FeedbackIcon,
      value: user?.feedbacks_count ?? 0,
      label: "Feedbacks",
    },
    {
      icon: TimerIcon,
      value: Math.max(
        (user?.models_count ?? 0) + (user?.datasets_count ?? 0),
        1,
      ),
      label: "Mapping Hours",
    },
  ];

  return (
    <article className="rounded-2xl bg-frosted-blue p-5 space-y-5 h-full">
      <h3 className="text-sm font-semibold text-dark">Overview</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-5">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <item.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-body-1 font-bold leading-none text-dark">
                {item.value < 10
                  ? `0${item.value}`
                  : item.value.toLocaleString()}
              </p>
              <p className="text-sm text-grey">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
};
