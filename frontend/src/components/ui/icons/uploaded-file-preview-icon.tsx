import { IconProps } from "@/types";
import React from "react";

export const UploadedFilePreviewIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="30"
    fill="none"
    {...props}
    viewBox="0 0 28 30"
  >
    <rect width="28" height="30" fill="#fff" rx="6"></rect>
    <path
      fill="#687075"
      d="M14 7v4.5a1.5 1.5 0 0 0 1.5 1.5H20v8.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 8 21.5v-13A1.5 1.5 0 0 1 9.5 7zm1 .25v4.25a.5.5 0 0 0 .5.5h4.25z"
    ></path>
  </svg>
);
