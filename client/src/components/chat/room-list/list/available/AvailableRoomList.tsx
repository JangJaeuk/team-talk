import { roomKeys, roomMutations } from "@/queries/room";
import { Room } from "@/types/room";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
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
          className="bg-white rounded-lg shadow px-4 py-3 sm:px-5 sm:py-4 hover:bg-gray-50 transition-colors h-[96px] sm:h-[110px]"
        >
          <div className="flex gap-4 h-full items-center">
            <div className="relative w-9 h-9 shrink-0">
              {room.participants.length === 1 ? (
                // 1명일 때
                <Image
                  key={room.participants[0].id}
                  src={`/avatars/${room.participants[0].avatar}.svg`}
                  alt="프로필"
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full"
                />
              ) : room.participants.length === 2 ? (
                // 2명일 때
                <div className="flex w-full h-full">
                  {room.participants.slice(0, 2).map((participant) => (
                    <Image
                      key={participant.id}
                      src={`/avatars/${participant.avatar}.svg`}
                      alt="프로필"
                      width={18}
                      height={36}
                      className="w-[18px] h-9"
                    />
                  ))}
                </div>
              ) : room.participants.length === 3 ? (
                // 3명일 때
                <div className="flex flex-col w-full h-full">
                  <div className="flex justify-center">
                    <Image
                      key={room.participants[0].id}
                      src={`/avatars/${room.participants[0].avatar}.svg`}
                      alt="프로필"
                      width={18}
                      height={18}
                      className="w-[18px] h-[18px]"
                    />
                  </div>
                  <div className="flex">
                    {room.participants.slice(1, 3).map((participant) => (
                      <Image
                        key={participant.id}
                        src={`/avatars/${participant.avatar}.svg`}
                        alt="프로필"
                        width={18}
                        height={18}
                        className="w-[18px] h-[18px]"
                      />
                    ))}
                  </div>
                </div>
              ) : (
                // 4명 이상일 때
                <div className="flex flex-wrap w-full h-full">
                  {room.participants.slice(0, 4).map((participant) => (
                    <Image
                      key={participant.id}
                      src={`/avatars/${participant.avatar}.svg`}
                      alt="프로필"
                      width={18}
                      height={18}
                      className="w-[18px] h-[18px]"
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold truncate">
                    {room.name}
                  </h3>
                </div>
                <button
                  className="shrink-0 px-2.5 py-1 sm:px-3.5 sm:py-1.5 bg-blue-500 text-white text-xs sm:text-sm font-medium rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    joinRoom(room.id);
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
                      {formatDate(new Date(room.lastMessage.createdAt))}
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
