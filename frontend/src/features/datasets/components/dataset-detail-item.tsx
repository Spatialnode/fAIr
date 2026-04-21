import { ReactNode } from "react";

type DatasetDetailItemProps = {
  label: string;
  value: ReactNode;
};

export const DatasetDetailItem = ({
  label,
  value,
}: DatasetDetailItemProps) => (
  <p className="text-body-2base ">
    <span className="text-grey">{label}:</span>{" "}
    <span className="font-medium text-dark">{value}</span>
  </p>
);
