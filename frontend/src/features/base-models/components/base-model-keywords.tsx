import { formatKeyword } from "@/utils";

type BaseModelKeywordsProps = {
  keywords: string[];
  visibleLimit?: number;
};

export const BaseModelKeywords = ({
  keywords,
  visibleLimit = 3,
}: BaseModelKeywordsProps) => {
  const visible = keywords.slice(0, visibleLimit);

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((keyword) => (
        <span
          key={keyword}
          className="rounded-lg w-fit h-fit bg-off-white px-2 py-1 text-body-4 text-dark capitalize"
        >
          {formatKeyword(keyword)}
        </span>
      ))}
    </div>
  );
};
