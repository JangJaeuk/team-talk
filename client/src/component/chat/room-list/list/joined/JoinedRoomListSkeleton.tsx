export const JoinedRoomListSkeleton = () => {
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
            className="bg-white rounded-lg shadow px-4 py-3 sm:px-5 sm:py-4 animate-pulse h-[72px] sm:h-[96px]"
          >
            <div className="flex gap-4 h-full items-center">
              <div className="relative w-9 h-9 shrink-0 rounded-full bg-gray-200" />
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div className="flex items-center justify-between min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="h-6 sm:h-7 bg-gray-200 rounded w-32 sm:w-40" />
                    <div className="shrink-0 h-5 bg-gray-200 rounded-full w-6" />
                  </div>
                  <div className="shrink-0 h-4 bg-gray-200 rounded w-12 sm:w-16 ml-4" />
                </div>
                <div className="h-5 bg-gray-200 rounded w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
