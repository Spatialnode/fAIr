import { ReactNode } from "react";

type DatasetDetailItemProps = {
  label: string;
  value: ReactNode;
  children?: ReactNode;
};

export const DatasetDetailItem = ({
  label,
  value,
  children,
}: DatasetDetailItemProps) => (
  <p className="text-body-2base flex items-center gap-x-2">
    <span className="text-grey">{label}:</span>{" "}
    <span className="font-medium text-dark">{value}</span>
    {children}
  </p>
);
