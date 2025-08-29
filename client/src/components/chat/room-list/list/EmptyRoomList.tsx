interface Props {
  type: "joined" | "available";
}

export const EmptyRoomList = ({ type }: Props) => {
  const messages = {
    joined: {
      title: "참여 중인 채팅방이 없습니다",
      description: "새로운 채팅방을 만들거나 참여해보세요",
    },
    available: {
      title: "참여 가능한 채팅방이 없습니다",
      description: "새로운 채팅방을 만들어보세요",
    },
  };

  const { title, description } = messages[type];

  return (
    <div className="flex flex-col items-center justify-center h-60 bg-white rounded-lg shadow">
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
          d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
        />
      </svg>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
};
