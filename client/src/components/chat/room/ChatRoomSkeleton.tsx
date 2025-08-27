export const ChatRoomSkeleton = () => {
  return (
    <div className="flex flex-col h-screen animate-pulse">
      {/* 헤더 스켈레톤 */}
      <div className="h-16 border-b flex items-center px-4 bg-gray-50">
        <div className="w-48 h-6 bg-gray-200 rounded"></div>
      </div>

      {/* 메시지 영역 스켈레톤 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col-reverse p-4">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`flex ${
                i % 2 === 0 ? "justify-end" : "justify-start"
              }`}
            >
              <div className="flex items-end gap-2">
                {i % 2 !== 0 && (
                  <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                )}
                <div
                  className={`flex flex-col ${
                    i % 2 === 0 ? "items-end" : "items-start"
                  }`}
                >
                  {i % 2 !== 0 && (
                    <div className="w-24 h-4 bg-gray-200 rounded mb-1"></div>
                  )}
                  <div
                    className={`w-48 h-10 rounded-2xl ${
                      i % 2 === 0 ? "bg-gray-200" : "bg-gray-100"
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 메시지 입력 스켈레톤 */}
      <div className="border-t p-4">
        <div className="w-full h-12 bg-gray-100 rounded-full"></div>
      </div>
    </div>
  );
};
