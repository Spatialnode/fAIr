import { PredictionsIcon } from "@/components/ui/icons";
import { AIMapModelIcon } from "@/components/ui/icons/ai-model-icon";
import { DatasetIcon } from "@/components/ui/icons/datsaset-icon";
import { APPLICATION_ROUTES } from "@/constants/routes";
import { DashboardCard, RunningTask } from "@/features/dashboard/utils/types";

export const FIRST_TIME_CARDS: DashboardCard[] = [
  {
    title: "Simple Mapping",
    description:
      "Start your first mapping workflow with guided model and dataset setup.",
    ctaLabel: "Start Mapping",
    href: APPLICATION_ROUTES.MODELS,
    dark: true,
  },
  {
    title: "Public AI Predictions",
    description:
      "Browse community predictions and learn from already published outputs.",
    ctaLabel: "Explore",
    href: APPLICATION_ROUTES.PROFILE_OFFLINE_PREDICTIONS,
  },
  {
    title: "Learn about fAIr",
    description:
      "Read quick guides and walkthroughs to confidently use the platform.",
    ctaLabel: "Start Learning",
    href: APPLICATION_ROUTES.LEARN_BASE,
  },
];

export const RETURNING_CARDS: DashboardCard[] = [
  {
    title: "Your AI Mapping Partner",
    description:
      "AI-powered assistant that helps you map smarter and finish mapping projects faster.",
    ctaLabel: "Start Mapping",
    href: APPLICATION_ROUTES.MODELS,
    dark: true,
  },
  {
    title: "AI Models",
    description:
      "Each model is trained from your datasets and can be reused for new mappable features.",
    ctaLabel: "Explore Models",
    href: APPLICATION_ROUTES.PROFILE_MODELS,
    Icon: AIMapModelIcon,
  },
  {
    title: "Datasets",
    description:
      "A combination of high-resolution imagery used to train and fine-tune your AI models.",
    ctaLabel: "Explore",
    href: APPLICATION_ROUTES.PROFILE_DATASETS,
    Icon: DatasetIcon,
  },
  {
    title: "Public AI Predictions",
    description:
      "Published predictions produced by the community and available for everyone.",
    ctaLabel: "Explore",
    href: APPLICATION_ROUTES.PROFILE_OFFLINE_PREDICTIONS,
    Icon: PredictionsIcon,
  },
];

export const RUNNING_TASKS: RunningTask[] = [
  {
    title: "Banepa Nepal Offline",
    type: "Prediction Request",
    variant: "blue",
  },
  {
    title: "San Jose Buildings - Rooftop",
    type: "MapSwipe Project",
    variant: "yellow",
  },
];

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
