const SkeletonBlock = ({
  className = "",
}: {
  className?: string;
}) => (
  <div className={`bg-light-gray rounded animate-pulse ${className}`} />
);

const SidebarSectionSkeleton = () => (
  <div className="border-b border-gray-border pb-4 mb-4 last:border-b-0">
    {/* Section header */}
    <div className="flex items-center justify-between w-full mb-4">
      <SkeletonBlock className="h-4 w-32" />
      <SkeletonBlock className="h-4 w-4" />
    </div>
    {/* Info rows */}
    <div className="flex flex-col gap-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-y-1 py-1">
          <SkeletonBlock className="h-3 w-20" />
          <SkeletonBlock className="h-3 w-full" />
        </div>
      ))}
    </div>
  </div>
);

export const BaseModelDetailSkeleton = () => {
  return (
    <>
      {/* Back button */}
      <SkeletonBlock className="h-8 w-24 mt-6" />

      <div className="my-8 flex flex-col gap-y-8 animate-pulse">
        {/* Title + Start Mapping button row */}
        <div className="flex border-b pb-8 flex-col md:flex-row items-start md:items-center justify-between gap-y-4">
          <div className="flex flex-col gap-y-2">
            <SkeletonBlock className="h-7 w-72" />
            <SkeletonBlock className="h-3 w-40" />
          </div>
          <SkeletonBlock className="h-10 w-36 self-start md:self-auto" />
        </div>

        {/* Metadata 3-col grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, col) => (
            <div key={col} className="flex flex-col gap-y-3">
              {Array.from({ length: 3 }).map((_, row) => (
                <div key={row} className="flex items-center gap-x-1">
                  <SkeletonBlock className="h-3 w-24" />
                  <SkeletonBlock className="h-3 w-20" />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Download metadata link */}
        <SkeletonBlock className="h-4 w-36" />

        {/* Main two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-x-12 gap-y-10">
          {/* Left: markdown content */}
          <div className="flex flex-col gap-y-4">
            <SkeletonBlock className="h-5 w-3/4" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-5/6" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-4/5" />
            <SkeletonBlock className="h-5 w-1/2 mt-4" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-3/4" />
            <SkeletonBlock className="h-4 w-full" />
          </div>

          {/* Right: sidebar */}
          <div className="bg-frosted-blue border rounded-lg border-gray-border p-6 h-fit">
            <SidebarSectionSkeleton />
            <SidebarSectionSkeleton />
            <SidebarSectionSkeleton />
          </div>
        </div>
      </div>
    </>
  );
};
