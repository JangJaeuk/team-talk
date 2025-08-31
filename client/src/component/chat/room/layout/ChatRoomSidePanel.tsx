import type { RoomRs } from "@/rqrs/room/roomRs";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";

interface Props {
  room: RoomRs;
  isOpen: boolean;
  onClose: () => void;
  onLeaveRoom: () => void;
}

export const ChatRoomSidePanel = ({
  room,
  isOpen,
  onClose,
  onLeaveRoom,
}: Props) => {
  const { user } = useAuthStore();
  const panelRef = useRef<HTMLDivElement>(null);

  const sortedParticipants = useMemo(() => {
    return [...room.participants].sort((a, b) => {
      if (a.id === user?.id) return -1;
      if (b.id === user?.id) return 1;
      return a.nickname.localeCompare(b.nickname);
    });
  }, [room.participants, user?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div
      className={`fixed top-0 right-0 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } w-full sm:w-96 md:w-80`}
      ref={panelRef}
    >
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg sm:text-xl font-bold">방 정보</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 sm:p-1.5"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-500 mb-2">
              방 이름
            </h3>
            <p className="text-gray-900 sm:text-lg">{room.name}</p>
          </div>

          {room.description && (
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-500 mb-2">
                방 설명
              </h3>
              <p className="text-gray-900 sm:text-base">{room.description}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-500 mb-2">
              참여자 목록
            </h3>
            <div className="space-y-2">
              {sortedParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-2 p-2 sm:p-3 rounded-lg hover:bg-gray-50"
                >
                  <Image
                    src={`/avatars/${participant.avatar}.svg`}
                    alt={participant.nickname}
                    width={36}
                    height={36}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                  />
                  <span className="text-sm sm:text-base text-gray-900 flex-1">
                    {participant.nickname}
                  </span>
                  {participant.id === user?.id && (
                    <span className="text-xs sm:text-sm text-gray-500">
                      (나)
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onLeaveRoom}
            className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base text-red-500 hover:text-red-600 border border-red-500 rounded transition-colors"
          >
            방 탈퇴
          </button>
        </div>
      </div>
    </div>
  );
};
