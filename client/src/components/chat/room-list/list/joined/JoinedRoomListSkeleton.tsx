export const JoinedRoomListSkeleton = () => {
  return (
    <div className="space-y-2 sm:space-y-4 p-2 sm:p-4">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow p-2 sm:p-3.5 animate-pulse h-[60px] sm:h-[80px]"
        >
          <div className="flex flex-col gap-1 sm:gap-2.5">
            <div className="flex items-center justify-between min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="h-5 sm:h-6 bg-gray-200 rounded w-32 sm:w-40" />
              </div>
              <div className="shrink-0 h-4 sm:h-5 bg-gray-200 rounded w-12 sm:w-16 ml-4" />
            </div>
            <div className="h-4 sm:h-5 bg-gray-100 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
};
