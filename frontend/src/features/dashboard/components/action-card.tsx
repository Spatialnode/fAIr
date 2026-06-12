import { ChevronDownIcon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import ContourBackground from "@/assets/svgs/contour_background.svg";
export type DashboardCard = {
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  dark?: boolean;
  Icon?: React.ElementType;
  IconPosition?: "top-left" | "top";
};
export const ActionCard = ({
  card,
  className = "",
  firstTime = false,
  smallHeight = false,
  Icon,
  IconPostion = "top-left",
  onFinish,
}: {
  card: DashboardCard;
  className?: string;
  firstTime?: boolean;
  Icon?: React.ElementType;
  smallHeight?: boolean;
  IconPostion?: "top-left" | "top";
  onFinish?: () => void;
}) => (
  <article
    className={`rounded-2xl p-6 flex flex-col justify-between w-full ${firstTime ? "min-h-[360px] sm:max-w-[330px] " : smallHeight ? "min-h-[135px] sm:max-w-[445px]" : "min-h-[260px] sm:max-w-[445px]"} ${card.dark ? "text-white" : "text-dark bg-frosted-blue"} ${className}`}
    style={
      card.dark
        ? {
            backgroundImage: `linear-gradient(160deg, #232832 0%, #2f3440 100%), url(${ContourBackground})`,
            backgroundSize: "cover",
            backgroundBlendMode: "overlay",
          }
        : undefined
    }
  >
    <div className="space-y-2">
      {Icon && IconPostion === "top" && (
        <Icon className="size-[45px] text-primary" />
      )}
      <div className="flex justify-between items-center">
        <h2 className="text-[20px] font-bold">{card.title}</h2>
        {Icon && IconPostion === "top-left" && <Icon />}
      </div>
      <p
        className={`text-sm max-w-md ${card.dark ? "text-[#d6dbe3]" : "text-grey"}`}
      >
        {card.description}
      </p>
    </div>
    <div className="pt-1 flex justify-end w-full items-end">
      <Link
        nativeAnchor={false}
        href={card.href}
        title={card.ctaLabel}
        disableLinkStyle
        onClick={onFinish}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-body-2base font-semibold ${
          card.dark
            ? "bg-primary text-white hover:opacity-90"
            : "text-dark hover:text-primary"
        }`}
      >
        {card.ctaLabel}
        <ChevronDownIcon className="-rotate-90 h-3 w-3" />
      </Link>
    </div>
  </article>
);
