import { IconProps } from "@/types";
import React from "react";

export const CommunityMapperIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="36"
    height="36"
    fill="none"
    {...props}
    viewBox="0 0 36 36"
  >
    <circle cx="18" cy="18" r="15" fill="currentColor" opacity="0.4"></circle>
    <circle
      cx="18"
      cy="18"
      r="15"
      stroke="currentColor"
      strokeWidth="2.25"
    ></circle>
    <path
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="2.25"
      d="M12 18c0 9 6 15 6 15s6-6 6-15-6-15-6-15-6 6-6 15Z"
    ></path>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.25"
      d="M31.5 13.5h-27M31.5 22.5h-27"
    ></path>
  </svg>
);
