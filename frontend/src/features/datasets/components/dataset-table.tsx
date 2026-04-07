import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ToolTip } from "@/components/ui/tooltip";
import { NoTrainingAreaIcon } from "@/components/ui/icons";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { SortableHeader } from "@/features/models/components/table-header";
import { TableSkeleton } from "@/features/models/components/skeletons";
import { TTrainingDataset } from "@/types";
import { truncateString } from "@/utils";
import { APPLICATION_ROUTES } from "@/constants";
import { MapSwipeLogo } from "@/assets/svgs";
import {
    getDatasetDummyTags,
    hasMapSwipeBadge,
} from "@/features/datasets/utils/dataset-flow-mocks";

type DatasetListProps = {
    datasets: TTrainingDataset[];
    isPending: boolean;
    isError: boolean;
    refetch: () => void;
    showUsername?: boolean;
    selectedDatasetId?: number;
    onDatasetSelect?: (dataset: TTrainingDataset) => void;
    navigateOnClick?: boolean;
};

const columnDefinitions = (
    showUsername?: boolean,
): ColumnDef<TTrainingDataset>[] => {
    const baseColumns: ColumnDef<TTrainingDataset>[] = [
        {
            accessorKey: "id",
            header: ({ column }) => <SortableHeader title={"ID"} column={column} />,
            cell: ({ row }) => (
                <div
                    className=""
                >
                    <span className="text-body-3 uppercase">{row.original.id}</span>
                </div>
            ),
        },
        {
            header: "Dataset Name",
            accessorFn: (row) => row.name,
            cell: ({ row }) => {
                const title = row.original.name;
                const showMapSwipeIndicator = hasMapSwipeBadge(row.original.id);

                return (
                    <div className="flex items-center gap-x-2">
                        <ToolTip content={title}>
                            <span title={title ?? ""} className="block max-w-[200px] truncate font-semibold text-dark">
                                {truncateString(title ?? "", 50)}
                            </span>
                        </ToolTip>
                        {showMapSwipeIndicator && (
                            <img
                                src={MapSwipeLogo}
                                alt="MapSwipe linked"
                                className="h-5 w-5 flex-shrink-0"
                            />
                        )}
                    </div>
                );
            },
        },
        {
            header: "Used By",
            accessorFn: (row) => row.models_count,
            cell: ({ row }) => (
                <span className="text-body-3 text-dark">
                    {row.original.models_count} Model{row.original.models_count !== 1 ? "s" : ""}
                </span>
            ),
        },
        {
            header: "Tags",
            cell: ({ row }) => {
                const tags = getDatasetDummyTags(row.original.id);
                return (
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <span
                                key={`${row.original.id}-${tag}`}
                                className="rounded bg-[#ECEFF3] px-2 py-1 text-body-4 font-medium text-grey shrink-0"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                );
            },
        },
    ];

    if (showUsername) {
        baseColumns.push({
            header: "Created By",
            accessorFn: (row) => row.user.username,
            cell: ({ row }) => (
                <span className="text-body-3 text-dark truncate max-w-[150px] inline-block">
                    {row.original.user.username}
                </span>
            ),
        });
    }

    return baseColumns;
};

export const DatasetTableLayout = ({
    datasets,
    isPending,
    isError,
    refetch,
    showUsername,
    onDatasetSelect,
    navigateOnClick,
}: DatasetListProps) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const navigate = useNavigate();

    if (isPending) {
        return <TableSkeleton />;
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center w-full py-20 gap-y-4">
                <p className="text-grey text-body-2base">
                    Error loading datasets.
                </p>
                <Button className="!w-fit" onClick={() => refetch()}>
                    Retry
                </Button>
            </div>
        );
    }

    if (datasets.length === 0) {
        return (
            <div className="flex flex-col gap-y-4 items-center justify-center py-20">
                <NoTrainingAreaIcon />
                <p className="text-grey text-body-2base">
                    No training dataset found.
                </p>
            </div>
        );
    }

    const handleRowClick = (dataset: TTrainingDataset) => {
        if (navigateOnClick) {
            navigate(`${APPLICATION_ROUTES.DATASETS}/${dataset.id}`);
            return;
        }
        if (onDatasetSelect) {
            onDatasetSelect(dataset);
        }
    };

    return (
        <div className="max-w-full overflow-auto">
            <DataTable
                data={datasets}
                columns={columnDefinitions(showUsername)}
                sorting={sorting}
                setSorting={setSorting}
                onRowClick={handleRowClick}
            />
        </div>
    );
};
