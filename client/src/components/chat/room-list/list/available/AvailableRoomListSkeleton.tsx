export const AvailableRoomListSkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="h-6 bg-gray-200 rounded w-1/4" />
                <div className="h-8 bg-gray-200 rounded w-20" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="flex items-center gap-4">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-32" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
