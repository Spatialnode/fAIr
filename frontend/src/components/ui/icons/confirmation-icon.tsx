import { IconProps } from "@/types";
import React from "react";

export const ConfirmationIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    fill="none"
    viewBox="0 0 48 48"
    {...props}
  >
    <rect width="48" height="48" fill="#FFFDDB" rx="24"></rect>
    <path
      fill="#FC0"
      d="M24 13.998C29.523 13.998 34 18.476 34 24 34.001 29.523 29.523 34 24 34c-5.524 0-10.002-4.478-10.002-10.001 0-5.524 4.478-10.002 10.002-10.002m-.004 8.25a1 1 0 0 0-.993.885l-.007.116.004 5.502.007.116a1 1 0 0 0 1.986 0L25 28.75l-.004-5.502-.006-.117a1 1 0 0 0-.994-.882M24 18.5a1.252 1.252 0 1 0 0 2.503 1.252 1.252 0 0 0 0-2.503"
    ></path>
  </svg>
);


