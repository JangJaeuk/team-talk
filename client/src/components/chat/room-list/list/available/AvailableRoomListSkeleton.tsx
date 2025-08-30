export const AvailableRoomListSkeleton = () => {
  return (
    <div className="space-y-2 sm:space-y-4 p-2 sm:p-4">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow p-2.5 sm:p-4 animate-pulse h-[80px] sm:h-[110px]"
        >
          <div className="flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1 sm:mb-2">
                <div className="h-5 sm:h-7 bg-gray-200 rounded w-40 sm:w-48" />
                <div className="shrink-0 h-6 bg-gray-200 rounded w-14 sm:w-16" />
              </div>
              <div className="h-4 sm:h-6 bg-gray-200 rounded w-full mb-1 sm:mb-2" />
            </div>
            <div className="flex items-center gap-2">
              <div className="shrink-0 h-4 bg-gray-200 rounded w-16" />
              <div className="h-4 bg-gray-200 rounded-full w-1" />
              <div className="h-4 bg-gray-200 rounded w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
