import { roomKeys, roomMutations } from "@/queries/room";
import { Room } from "@/types/room";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const { mutate: joinRoom, isPending } = useMutation({
    ...roomMutations.join(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.joinedLists() });
      queryClient.invalidateQueries({ queryKey: roomKeys.availableLists() });
      alert("채팅방에 참여했습니다.");
      router.push(`/rooms/${data.id}`);
    },
    onError: () => {
      alert("채팅방 참여에 실패했습니다.");
    },
  });

  return (
    <div className="space-y-4 p-4">
      {rooms.map((room) => (
        <div
          key={room.id}
          className="bg-white rounded-lg shadow p-4 hover:bg-gray-50 transition-colors cursor-pointer h-[130px]"
        >
          <div className="flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold truncate">{room.name}</h3>
                <button
                  className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 disabled:opacity-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    joinRoom(room.id);
                  }}
                  disabled={isPending}
                >
                  {isPending ? "참여중..." : "참여하기"}
                </button>
              </div>
              <p className="text-gray-600 line-clamp-2">{room.description}</p>
            </div>
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
      ))}
    </div>
  );
};
