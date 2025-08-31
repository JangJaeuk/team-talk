import type { RoomRs } from "@/rqrs/room/roomRs";
import { useRouter } from "next/navigation";

interface Props {
  room: RoomRs | null;
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
    <div className="bg-white shadow-md relative z-10">
      <div className="px-3 py-2 sm:px-4 sm:py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => router.push("/rooms")}
            className="text-gray-600 hover:text-gray-800 p-0.5 sm:p-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 sm:w-6 sm:h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
          </button>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold truncate">
              {room?.name || "로딩 중..."}
            </h1>
            {room?.description && (
              <p className="text-xs text-gray-500 truncate">
                {room.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center">
          {isJoined ? (
            <button
              onClick={onLeaveRoom}
              className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs sm:text-sm text-red-500 hover:text-red-600 border border-red-500 rounded transition-colors whitespace-nowrap"
            >
              방 탈퇴
            </button>
          ) : (
            <button
              onClick={onJoinRoom}
              className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs sm:text-sm text-blue-500 hover:text-blue-600 border border-blue-500 rounded transition-colors whitespace-nowrap"
            >
              방 가입
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
