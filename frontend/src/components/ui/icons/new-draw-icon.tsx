import { IconProps } from "@/types";
import React from "react";

export const NewDrawIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    {...props}
    height="12"
    fill="none"
    viewBox="0 0 12 12"
  >
    <path
      fill="currentColor"
      d="M0 2.5A2.5 2.5 0 0 1 2.5 0h7A2.5 2.5 0 0 1 12 2.5v7A2.5 2.5 0 0 1 9.5 12h-7A2.5 2.5 0 0 1 0 9.5zM2.5 1A1.5 1.5 0 0 0 1 2.5v7A1.5 1.5 0 0 0 2.5 11h7A1.5 1.5 0 0 0 11 9.5v-7A1.5 1.5 0 0 0 9.5 1z"
    ></path>
  </svg>
);
