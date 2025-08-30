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
    <div className="space-y-2 sm:space-y-4 p-2 sm:p-4">
      {rooms.map((room) => (
        <div
          key={room.id}
          className="bg-white rounded-lg shadow p-2.5 sm:p-4 hover:bg-gray-50 transition-colors h-[80px] sm:h-[110px]"
        >
          <div className="flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between gap-2 mb-0.5 sm:mb-1">
                <h3 className="text-sm sm:text-lg font-bold truncate">
                  {room.name}
                </h3>
                <button
                  className="shrink-0 px-2 py-1 sm:py-1.5 bg-blue-500 text-white text-xs sm:text-sm font-medium rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
                  onClick={() => {
                    joinRoom(room.id);
                  }}
                  disabled={isPending}
                >
                  {isPending ? "참여중..." : "참여하기"}
                </button>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">
                {room.description}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500">
              <span className="shrink-0">참여자 {room.participantCount}명</span>
              {room.lastMessage && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="truncate">
                    {formatDate(new Date(room.lastMessage.createdAt))}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
