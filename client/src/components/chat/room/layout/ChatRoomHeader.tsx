import type { ChatRoom } from "@/types";
import { useRouter } from "next/navigation";

interface Props {
  room: ChatRoom | null;
  isJoined: boolean;
  onJoinRoom: () => void;
  onLeaveRoom: () => void;
}

export const ChatRoomHeader = ({
  room,
  isJoined,
  onJoinRoom,
  onLeaveRoom,
}: Props) => {
  const router = useRouter();

  return (
    <div className="bg-white border-b p-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/rooms")}
          className="text-gray-600 hover:text-gray-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-semibold">
            {room?.name || "로딩 중..."}
          </h1>
          {room?.description && (
            <p className="text-sm text-gray-500">{room.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isJoined ? (
          <button
            onClick={onLeaveRoom}
            className="px-4 py-2 text-red-500 hover:text-red-600 border border-red-500 rounded"
          >
            방 탈퇴
          </button>
        ) : (
          <button
            onClick={onJoinRoom}
            className="px-4 py-2 text-blue-500 hover:text-blue-600 border border-blue-500 rounded"
          >
            방 가입
          </button>
        )}
      </div>
    </div>
  );
};
