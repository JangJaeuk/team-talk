import type { RoomRs } from "@/rqrs/room/roomRs";
import { useRouter } from "next/navigation";

interface Props {
  room: RoomRs;
  isJoined: boolean;
  onToggleSidePanel: () => void;
}

export const ChatRoomHeader = ({
  room,
  isJoined,
  onToggleSidePanel,
}: Props) => {
  const router = useRouter();

  return (
    <div className="bg-white shadow-md relative z-20">
      <div className="px-3 py-2 sm:px-4 sm:py-3 flex items-center">
        <button
          onClick={() => router.push("/rooms")}
          className="text-gray-600 hover:text-gray-800 p-0.5 sm:p-1 shrink-0"
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
        <div className="min-w-0 flex-1 mx-2 sm:mx-3">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold truncate">
              {room.name}
            </h1>
            <span className="text-xs sm:text-sm text-gray-500 shrink-0">
              {room.participants.length}
            </span>
          </div>
          <p className="text-xs text-gray-500 truncate">{room.description}</p>
        </div>
        {isJoined && (
          <button
            onClick={onToggleSidePanel}
            className="text-gray-600 hover:text-gray-800 p-1.5 shrink-0"
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
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
