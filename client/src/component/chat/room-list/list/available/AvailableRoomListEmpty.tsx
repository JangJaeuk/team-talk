export const AvailableRoomListEmpty = () => {
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
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        참여할 수 있는 채팅방이 없습니다
      </h3>
      <p className="text-sm text-gray-500">
        다른 사용자들이 채팅방을 만들 때까지 기다려주세요
      </p>
    </div>
  );
};
