import { useAuthStore } from "@/store/useAuthStore";
import { Room } from "@/type/room";
import Image from "next/image";

const formatDate = (date: Date) => {
  const now = new Date();
  const messageDate = new Date(date);

  // 시간 포맷 함수
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "오후" : "오전";
    const displayHours = hours % 12 || 12;
    return `${ampm} ${displayHours}시 ${minutes}분`;
  };

  // 같은 날짜인지 확인
  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  // 같은 해인지 확인
  const isSameYear = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear();
  };

  if (isSameDay(messageDate, now)) {
    // 오늘이면 시간만
    return formatTime(messageDate);
  } else if (isSameYear(messageDate, now)) {
    // 올해면 월/일
    return `${messageDate.getMonth() + 1}월 ${messageDate.getDate()}일`;
  } else {
    // 다른 해면 연/월/일
    return `${messageDate.getFullYear()}년 ${
      messageDate.getMonth() + 1
    }월 ${messageDate.getDate()}일`;
  }
};

interface Props {
  rooms: Room[];
  onEnterRoom: (roomId: string) => void;
}

export const JoinedRoomList = ({ rooms, onEnterRoom }: Props) => {
  const { user } = useAuthStore();
  return (
    <div className="space-y-2 sm:space-y-4 p-2 sm:p-4">
      {rooms.map((room) => (
        <div
          key={room.id}
          className="bg-white rounded-lg shadow px-4 py-3 sm:px-5 sm:py-4 hover:bg-gray-50 transition-colors cursor-pointer h-[72px] sm:h-[96px]"
          onClick={() => onEnterRoom(room.id)}
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
                    {formatDate(new Date(room.lastMessage.createdAt))}
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
