import { roomKeys, roomMutations } from "@/queries/room";
import { Room } from "@/types/room";
import { useMutation, useQueryClient } from "@tanstack/react-query";
const formatDate = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}일 전`;
  if (hours > 0) return `${hours}시간 전`;
  if (minutes > 0) return `${minutes}분 전`;
  return "방금 전";
};

interface Props {
  rooms: Room[];
}

export const AvailableRoomList = ({ rooms }: Props) => {
  const queryClient = useQueryClient();

  const { mutate: joinRoom, isPending } = useMutation({
    ...roomMutations.join(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.joinedLists() });
      queryClient.invalidateQueries({ queryKey: roomKeys.availableLists() });
      alert("채팅방에 참여했습니다.");
    },
    onError: () => {
      alert("채팅방 참여에 실패했습니다.");
    },
  });

  return (
    <div className="space-y-4">
      {rooms.map((room) => (
        <div
          key={room.id}
          className="bg-white rounded-lg shadow p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold truncate">{room.name}</h3>
                <button
                  className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 disabled:opacity-50"
                  onClick={() => joinRoom(room.id)}
                  disabled={isPending}
                >
                  {isPending ? "참여중..." : "참여하기"}
                </button>
              </div>
              <p className="text-gray-600 mb-3 line-clamp-2">
                {room.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>참여자 {room.participantCount}명</span>
                {room.lastMessage && (
                  <span>
                    마지막 메시지:{" "}
                    {formatDate(new Date(room.lastMessage.createdAt))}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
