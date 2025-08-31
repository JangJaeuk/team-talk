export const AvailableRoomListSkeleton = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between gap-2 sm:gap-4 items-center p-3 sm:p-4 bg-white shadow-md relative z-10">
        <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse" />
        <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse" />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-4 p-2 sm:p-4">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md px-4 py-3 sm:px-5 sm:py-4 animate-pulse h-[96px] sm:h-[110px]"
          >
            <div className="flex gap-4 h-full items-center">
              <div className="relative w-9 h-9 shrink-0 rounded-full bg-gray-200" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-6 sm:h-7 bg-gray-200 rounded w-40 sm:w-48" />
                  </div>
                  <div className="shrink-0 h-6 bg-gray-200 rounded w-14 sm:w-20" />
                </div>
                <div className="h-5 bg-gray-200 rounded w-full mt-1" />
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="shrink-0 h-4 bg-gray-200 rounded w-16" />
                  <div className="h-4 bg-gray-200 rounded-full w-1" />
                  <div className="h-4 bg-gray-200 rounded w-20" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
