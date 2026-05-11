export type DashboardCard = {
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  dark?: boolean;
  Icon?: React.ElementType;
};
export type OverviewStat = {
  icon: React.ElementType;
  value: number;
  label: string;
};

export type RunningTask = {
  title: string;
  type: string;
  variant: "blue" | "yellow";
};
