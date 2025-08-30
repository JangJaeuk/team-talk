export const ChatRoomListSkeleton = () => {
  return (
    <div className="space-y-2 sm:space-y-4 p-2 sm:p-4">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow p-3 sm:p-4 animate-pulse h-[120px] sm:h-[130px]"
        >
          <div className="flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1 sm:mb-2">
                <div className="h-5 sm:h-6 bg-gray-200 rounded w-1/2" />
                <div className="shrink-0 h-6 sm:h-7 bg-gray-200 rounded w-16 sm:w-20" />
              </div>
              <div className="h-8 sm:h-10 bg-gray-200 rounded w-full" />
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="shrink-0 h-4 bg-gray-200 rounded w-16 sm:w-20" />
              <div className="hidden sm:block h-4 bg-gray-200 rounded w-1 mx-2" />
              <div className="h-4 bg-gray-200 rounded w-24 sm:w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
