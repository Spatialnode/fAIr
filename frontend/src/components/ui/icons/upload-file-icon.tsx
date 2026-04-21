import { IconProps } from "@/types";
import React from "react";

export const UploadFileIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    {...props}
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      fill="#687075"
      d="M6.336 12.73 12.7 6.366a3.3 3.3 0 1 1 4.667 4.667L9.73 18.67a1.5 1.5 0 1 1-2.121-2.122l6.788-6.788a.9.9 0 1 0-1.273-1.273l-6.788 6.789a3.3 3.3 0 1 0 4.667 4.667l7.637-7.637a5.1 5.1 0 0 0-7.213-7.213l-6.364 6.364a.9.9 0 0 0 1.273 1.273"
    ></path>
  </svg>
);
