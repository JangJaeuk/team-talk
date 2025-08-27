export const ChatRoomListSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 참여한 채팅방 섹션 */}
      <div>
        <div className="w-32 h-7 bg-gray-200 rounded mb-2"></div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={`joined-${i}`} className="p-4 border rounded-lg bg-white">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-24 h-7 bg-gray-200 rounded"></div>
                  <div className="w-6 h-6 bg-blue-200 rounded-full"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="w-12 h-6 bg-gray-200 rounded"></div>
                  <div className="w-12 h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="w-48 h-5 bg-gray-100 rounded mb-2"></div>
              <div className="w-24 h-4 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* 참여 가능한 채팅방 섹션 */}
      <div>
        <div className="w-40 h-7 bg-gray-200 rounded mb-2"></div>
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={`available-${i}`}
              className="p-4 border rounded-lg bg-white"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="w-32 h-7 bg-gray-200 rounded"></div>
                <div className="w-12 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="w-56 h-5 bg-gray-100 rounded mb-2"></div>
              <div className="w-24 h-4 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
