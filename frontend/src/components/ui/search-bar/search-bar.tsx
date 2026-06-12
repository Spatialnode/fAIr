import React from "react";
import { SearchIcon } from "@/components/ui/icons";
import { cn } from "@/utils";

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  className,
  placeholder = "Search projects, locations, or models...",
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-3 bg-[#F7F9FB] rounded-[10px] px-4 py-2.5 w-full md:w-[480px] border border-transparent focus-within:border-gray-200 transition-all duration-200",
        className,
      )}
    >
      <SearchIcon className="text-[#687075] size-5 flex-shrink-0" />
      <input
        type="text"
        placeholder={placeholder}
        className="bg-transparent border-none outline-none text-dark w-full placeholder:text-[#8A9094] text-sm font-medium"
        {...props}
      />
    </div>
  );
};
