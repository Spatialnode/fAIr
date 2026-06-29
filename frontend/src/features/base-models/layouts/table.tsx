import { APPLICATION_ROUTES } from "@/constants";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import DataTable from "@/components/ui/data-table/data-table";
import { SortableHeader } from "@/features/models/components/table-header";
import { formatKeyword, truncateString } from "@/utils";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { TBaseModel } from "@/types";

const columnDefinitions: ColumnDef<TBaseModel>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <SortableHeader title={"ID"} column={column} />,
  },
  {
    accessorKey: "name",
    header: "Model Name",
    cell: ({ row }) => (
      <span title={row.getValue("name")}>
        {truncateString(row.getValue("name"), 50)}
      </span>
    ),
  },
  {
    accessorKey: "task",
    header: "Task",
    cell: ({ row }) => <span>{formatKeyword(row.getValue("task") ?? "")}</span>,
  },
  {
    accessorKey: "author",
    header: "Created by",
  },
  {
    accessorKey: "version",
    header: "Version",
  },
  {
    accessorKey: "keywords",
    header: "Keywords",
    cell: ({ row }) => {
      const keywords: string[] = row.getValue("keywords") ?? [];
      return (
        <div className="flex flex-nowrap gap-1 overflow-x-auto">
          {keywords.map((kw) => (
            <span
              key={kw}
              className="rounded-lg w-fit h-fit bg-off-white px-2 py-1 text-body-4 text-dark"
            >
              {formatKeyword(kw)}
            </span>
          ))}
        </div>
      );
    },
  },
  // {
  //   accessorKey: "accuracy",
  //   header: ({ column }) => (
  //     <SortableHeader title={"Accuracy (%)"} column={column} />
  //   ),
  //   cell: ({ row }) => {
  //     return <span>{roundNumber(row.getValue("accuracy") ?? 0)}</span>;
  //   },
  // },
  {
    accessorKey: "lastModified",
    header: ({ column }) => (
      <SortableHeader title={"Last Modified"} column={column} />
    ),
  },
];

type BaseModelTableLayoutProps = {
  models: TBaseModel[];
};

const BaseModelTableLayout: React.FC<BaseModelTableLayoutProps> = ({
  models,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const navigate = useNavigate();

  const handleClick = (rowData: TBaseModel) => {
    navigate(`${APPLICATION_ROUTES.BASE_MODELS_HOME}/${rowData.id}`);
  };

  return (
    <DataTable
      data={models}
      columns={columnDefinitions}
      sorting={sorting}
      setSorting={setSorting}
      onRowClick={handleClick}
    />
  );
};

export default BaseModelTableLayout;
