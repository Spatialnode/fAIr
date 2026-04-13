import { useEffect, useRef } from "react";

type TabGroupVariant = "pill" | "boxed";
const containerStyles = {
  pill: "flex gap-x-4 border border-gray-border bg-gray-100 overflow-x-auto font-medium w-fit rounded-[4px] p-0.5",
  boxed:
    "flex gap-x-2 border border-gray-border bg-gray-100 overflow-x-auto font-medium w-fit rounded-[4px] p-0.5",
};

const tabStyles = {
  pill: {
    base: "md:px-4 px-4 py-2 text-nowrap text-body-3 md:text-base transition-colors duration-150 rounded-[61px]",
    active: "bg-secondary text-primary shadow-sm text-black",
    inactive: "text-grey",
  },
  boxed: {
    base: "md:px-4 px-2 py-1 text-nowrap text-body-3 md:text-base transition-colors duration-150 rounded-[4px]",
    active: "bg-white shadow-sm text-black",
    inactive: "text-grey",
  },
};
export const TabGroup = ({
  tabs,
  activeTab,
  setActiveTab,
  className,
  variant = "boxed",
}: {
  tabs: string[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  className?: string;
  variant?: TabGroupVariant;
}) => {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLButtonElement &&
        tabRefs.current.includes(event.target)
      ) {
        const currentIndex = tabs.indexOf(activeTab);

        if (event.key === "ArrowRight") {
          event.preventDefault();
          const nextIndex = (currentIndex + 1) % tabs.length;
          setActiveTab(tabs[nextIndex]);
          tabRefs.current[nextIndex]?.focus();
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
          setActiveTab(tabs[prevIndex]);
          tabRefs.current[prevIndex]?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, setActiveTab, tabs]);

  const containerClass = containerStyles[variant];
  const styles = tabStyles[variant];

  return (
    <div className={`${containerClass} ${className}`} role="tablist">
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab;

        return (
          <button
            key={tab}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            className={`${styles.base} ${
              isActive ? styles.active : styles.inactive
            }`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab}`}
            id={`tab-${tab}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
};
