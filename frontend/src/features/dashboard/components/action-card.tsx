import { ChevronDownIcon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import ContourBackground from "@/assets/svgs/contour_background.svg";
import { DashboardCard } from "@/features/dashboard/utils/types";

export const ActionCard = ({
  card,
  className = "",
  firstTime = false,
  smallHeight = false,
  Icon,
  IconPostion = "top-left",
}: {
  card: DashboardCard;
  className?: string;
  firstTime?: boolean;
  Icon?: React.ElementType;
  smallHeight?: boolean;
  IconPostion?: "top-left" | "top";
}) => (
  <article
    className={`rounded-2xl p-6 flex flex-col justify-between ${firstTime ? "min-h-[360px] max-w-[330px] " : smallHeight ? "min-h-[135px] max-w-[445px]" : "min-h-[260px] max-w-[445px]"} ${card.dark ? "text-white" : "text-dark bg-frosted-blue"} ${className}`}
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
      {Icon && IconPostion === "top" && <Icon />}
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
