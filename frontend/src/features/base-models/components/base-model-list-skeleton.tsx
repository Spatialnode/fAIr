const BaseModelCardSkeleton = () => (
  <div className="w-full flex flex-col border border-gray-border p-6 gap-y-4 animate-pulse">
    {/* Model Name */}
    <div className="h-5 bg-light-gray rounded w-3/4" />

    {/* Description */}
    <div className="flex flex-col gap-y-2 min-h-[60px]">
      <div className="h-3 bg-light-gray rounded w-full" />
      <div className="h-3 bg-light-gray rounded w-full" />
      <div className="h-3 bg-light-gray rounded w-2/3" />
    </div>

    {/* Accuracy */}
    <div className="flex flex-col gap-y-1">
      <div className="h-3 bg-light-gray rounded w-16" />
      <div className="h-5 bg-light-gray rounded w-12" />
    </div>

    {/* Author & Date */}
    <div className="flex flex-col gap-y-1 mt-auto">
      <div className="h-3 bg-light-gray rounded w-1/3" />
      <div className="h-3 bg-light-gray rounded w-1/2" />
    </div>
  </div>
);

export const BaseModelListSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, index) => (
        <BaseModelCardSkeleton key={index} />
      ))}
    </div>
  );
};
