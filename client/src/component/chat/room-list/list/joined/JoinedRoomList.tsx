import { AvatarGroup } from "@/component/common/AvatarGroup";
import { RoomRs } from "@/rqrs/room/roomRs";
import { useAuthStore } from "@/store/useAuthStore";
import { formatLastMessageDate } from "@/util/date";
import { useCallback } from "react";

interface Props {
  rooms: RoomRs[];
  onEnterRoom: (roomId: string) => void;
}

export const JoinedRoomList = ({ rooms, onEnterRoom }: Props) => {
  const { user } = useAuthStore();
  const getAvatarUsers = useCallback((room: RoomRs) => {
    return room.participants.slice(0, 4).map((participant) => ({
      id: participant.id,
      avatar: participant.avatar,
    }));
  }, []);

  return (
    <div className="space-y-2 sm:space-y-4 p-2 sm:p-4">
      {rooms.map((room) => (
        <div
          key={room.id}
          className="bg-white rounded-lg shadow px-4 py-3 sm:px-5 sm:py-4 hover:bg-gray-50 transition-colors cursor-pointer h-[72px] sm:h-[96px]"
          onClick={() => onEnterRoom(room.id)}
        >
          <div className="flex gap-4 h-full items-center">
            <AvatarGroup users={getAvatarUsers(room)} />
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div className="flex items-center justify-between min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold truncate">
                    {room.name}
                  </h3>
                  {room.unreadCount > 0 && (
                    <span className="shrink-0 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {room.unreadCount}
                    </span>
                  )}
                </div>
                {room.lastMessage && (
                  <span className="shrink-0 text-xs text-gray-500 ml-4">
                    {formatLastMessageDate(
                      new Date(room.lastMessage.createdAt)
                    )}
                  </span>
                )}
              </div>
              {room.lastMessage &&
                room.lastMessage.type !== "system:create" && (
                  <p className="text-sm text-gray-600 line-clamp-1">
                    {room.lastMessage.type === "system"
                      ? room.lastMessage.content
                      : `${
                          room.lastMessage.sender.id === user?.id
                            ? "나"
                            : room.lastMessage.sender.nickname
                        }: ${room.lastMessage.content}`}
                  </p>
                )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
