import { IconProps } from "@/types";
import React from "react";

export const ProjectManagerIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="36"
    height="36"
    {...props}
    fill="none"
    viewBox="0 0 36 36"
  >
    <path
      fill="currentColor"
      d="M15.15 32.25h5.7c5.374 0 8.061 0 9.73-1.702 1.67-1.703 1.67-4.443 1.67-9.923 0-.955 0-1.827-.009-2.625H3.76c-.009.798-.009 1.67-.009 2.625 0 5.48 0 8.22 1.67 9.923s4.356 1.702 9.73 1.702"
      opacity="0.4"
    ></path>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.25"
      d="M10.5 18v13.5m15-13.5v13.5M4.5 18h27"
    ></path>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2.25"
      d="M3.75 20.625c0-5.48 0-8.22 1.67-9.923S9.775 9 15.15 9h5.7c5.374 0 8.061 0 9.73 1.702 1.67 1.703 1.67 4.443 1.67 9.923s0 8.22-1.67 9.923-4.356 1.702-9.73 1.702h-5.7c-5.374 0-8.061 0-9.73-1.702-1.67-1.703-1.67-4.443-1.67-9.923Z"
    ></path>
    <path
      stroke="currentColor"
      strokeWidth="2.25"
      d="m24.75 9-.149-.464c-.742-2.31-1.114-3.465-1.998-4.125s-2.058-.661-4.406-.661h-.394c-2.348 0-3.523 0-4.406.66-.884.661-1.255 1.816-1.998 4.126L11.25 9"
    ></path>
  </svg>
);
