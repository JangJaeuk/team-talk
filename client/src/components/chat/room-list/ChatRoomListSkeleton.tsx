export const ChatRoomListSkeleton = () => {
  return (
    <div className="space-y-4 p-4">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow p-4 animate-pulse h-[130px]"
        >
          <div className="flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="h-6 bg-gray-200 rounded w-1/4" />
                <div className="h-8 bg-gray-200 rounded w-20" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-4 bg-gray-200 rounded w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
