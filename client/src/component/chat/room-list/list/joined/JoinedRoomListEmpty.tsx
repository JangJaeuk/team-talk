export const JoinedRoomListEmpty = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <svg
        className="w-16 h-16 text-gray-300 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        참여 중인 채팅방이 없습니다
      </h3>
      <p className="text-sm text-gray-500">
        우측 하단의 + 버튼을 눌러 새로운 채팅방을 만들어보세요
      </p>
    </div>
  );
};
