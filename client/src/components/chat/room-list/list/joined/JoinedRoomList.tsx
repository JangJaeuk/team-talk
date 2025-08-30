import { Room } from "@/types/room";

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
  onLeaveRoom: (roomId: string) => void;
  onEnterRoom: (roomId: string) => void;
}

export const JoinedRoomList = ({ rooms, onEnterRoom, onLeaveRoom }: Props) => {
  return (
    <div className="space-y-4 p-4">
      {rooms.map((room) => (
        <div
          key={room.id}
          className="bg-white rounded-lg shadow p-4 hover:bg-gray-50 transition-colors cursor-pointer h-[130px]"
          onClick={() => onEnterRoom(room.id)}
        >
          <div className="flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold truncate">{room.name}</h3>
                  {room.unreadCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      {room.unreadCount}
                    </span>
                  )}
                </div>
              </div>
              {room.lastMessage && (
                <p className="text-gray-600 line-clamp-2">
                  {room.lastMessage.content}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>참여자 {room.participants.length}명</span>
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
