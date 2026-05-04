import { TCSSWithVars } from "@/types";
import { SlAvatar } from "@shoelace-style/shoelace/dist/react";

export const Avatar = ({
  imageUrl,
  label,
  size,
  className,
}: {
  imageUrl: string;
  label: string;
  size: string;
  className?: string;
}) => {
  const safeLabel = label?.trim() || "User";

  return (
    <SlAvatar
      image={imageUrl}
      label={safeLabel}
      loading="lazy"
      initials={safeLabel.charAt(0).toUpperCase()}
      className={className}
      style={{ "--size": size } as TCSSWithVars}
    />
  );
};
