import { ToolTip } from "@/components/ui/tooltip";
import { splitArray } from "@/utils";

type DatasetTagsProps = {
    datasetId: number;
    tags: string[];
    visibleLimit?: number;
};

export const DatasetTags = ({
    datasetId,
    tags,
    visibleLimit = 2,
}: DatasetTagsProps) => {
    const sanitizedTags = tags.filter(
        (tag): tag is string =>
            Boolean(tag?.trim()) && tag.trim().toLowerCase() !== "ero"
    );

    if (sanitizedTags.length === 0) return null;

    const {
        visible: visibleTags,
        hidden: hiddenTags,
        hasHidden,
    } = splitArray(sanitizedTags, visibleLimit);

    return (
        <div className="flex flex-wrap gap-2">
            {visibleTags.map((tag) => (
                <span
                    key={`${datasetId}-${tag}`}
                    className="rounded-xl bg-off-white px-2 py-1 text-body-4  text-dark"
                >
                    {tag}
                </span>
            ))}

            {hasHidden && (
                <ToolTip
                    content={
                        <div className="flex max-w-52 flex-col gap-1">
                            {hiddenTags.map((tag) => (
                                <span key={`${datasetId}-hidden-${tag}`}>{tag}</span>
                            ))}
                        </div>
                    }
                >
                    <span
                        className="rounded-xl bg-off-white px-2 py-1 text-body-4  text-dark"

                    >
                        +{hiddenTags.length}
                    </span>
                </ToolTip>
            )}
        </div>
    );
};