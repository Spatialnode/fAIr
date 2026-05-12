import { Image } from "@/components/ui/image";
import { Link } from "@/components/ui/link";
import { ChevronDownIcon } from "@/components/ui/icons";
import ContourBackground from "@/assets/svgs/contour_background.svg";

interface PromoCardProps {
  title: string;
  imageSrc: string;
  imageAlt: string;
  href: string;
  linkTitle: string;
  description?: string;
  className?: string;
  imageContainerClassName?: string;
  imageClassName?: string;
  contentContainerClassName?: string;
}

export const PromoCard = ({
  title,
  imageSrc,
  imageAlt,
  href,
  linkTitle,
  description,
  className = "",
  imageContainerClassName = "",
  imageClassName = "bg-secondary",
  contentContainerClassName = "flex justify-between items-center gap-4",
}: PromoCardProps) => {
  return (
    <article
      className={`rounded-2xl overflow-hidden min-h-[135px] bg-primary text-white flex items-center gap-4 w-full ${className}`}
      style={{
        backgroundImage: `linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.1) 100%), url(${ContourBackground})`,
        backgroundSize: "cover",
        backgroundBlendMode: "overlay",
      }}
    >
      <div
        className={`w-full p-3 h-full rounded-xl overflow-hidden ${imageContainerClassName}`}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          className={`h-full w-full object-cover ${imageClassName}`.trim()}
        />
      </div>
      <div className={`w-full px-4 py-6  ${contentContainerClassName}`.trim()}>
        <div className="space-y-1">
          <h3 className="text-[20px] font-bold leading-tight">{title}</h3>
          {description && <p className="text-body-3">{description}</p>}
        </div>
        <Link
          nativeAnchor={false}
          href={href}
          title={linkTitle}
          disableLinkStyle
          className="flex items-center justify-center h-10 w-10 shrink-0 rounded-full bg-white text-primary"
        >
          <ChevronDownIcon className="-rotate-90 text-primary h-3 w-3" />
        </Link>
      </div>
    </article>
  );
};
