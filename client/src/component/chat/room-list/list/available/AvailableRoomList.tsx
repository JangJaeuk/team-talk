import { AvatarGroup } from "@/component/common/AvatarGroup";
import { useJoinRoomMutation } from "@/hook/chat/room-list/mutation/useJoinRoomMutation";
import { Room } from "@/type/room";
import { formatTimeAgo } from "@/util/date";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface Props {
  rooms: Room[];
}

export const AvailableRoomList = ({ rooms }: Props) => {
  const router = useRouter();

  const { joinRoom, isPending } = useJoinRoomMutation(
    (id: string) => {
      alert("채팅방에 참여했습니다.");
      router.push(`/rooms/${id}`);
    },
    (error) => {
      console.error("Failed to join room:", error);
      alert("채팅방 참여에 실패했습니다.");
    }
  );

  const getAvatarUsers = useCallback((room: Room) => {
    return room.participants.slice(0, 4).map((participant) => ({
      id: participant.id,
      avatar: participant.avatar,
    }));
  }, []);

  const handleJoinRoom = (roomId: string) => {
    joinRoom({ id: roomId });
  };

  return (
    <div className="space-y-2 sm:space-y-4 p-2 sm:p-4">
      {rooms.map((room) => (
        <div
          key={room.id}
          className="bg-white rounded-lg shadow px-4 py-3 sm:px-5 sm:py-4 hover:bg-gray-50 transition-colors h-[96px] sm:h-[110px]"
        >
          <div className="flex gap-4 h-full items-center">
            <AvatarGroup users={getAvatarUsers(room)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold truncate">
                    {room.name}
                  </h3>
                </div>
                <button
                  className="shrink-0 px-2.5 py-1 sm:px-3.5 sm:py-1.5 bg-blue-500 text-white text-xs sm:text-sm font-medium rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
                  onClick={() => {
                    handleJoinRoom(room.id);
                  }}
                  disabled={isPending}
                >
                  {isPending ? "참여중..." : "참여하기"}
                </button>
              </div>
              <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                {room.description}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
                <span className="shrink-0">
                  참여자 {room.participantCount}명
                </span>
                {room.lastMessage && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="truncate">
                      {formatTimeAgo(new Date(room.lastMessage.createdAt))}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
