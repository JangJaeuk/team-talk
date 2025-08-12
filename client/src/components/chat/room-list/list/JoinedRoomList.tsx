import { Room } from "@/types/room";

interface Props {
  rooms: Room[];
  onJoinRoom: (roomId: string) => void;
  onLeaveRoom: (roomId: string) => void;
  onEnterRoom: (roomId: string) => void;
}

export const JoinedRoomList = ({ rooms, onEnterRoom, onLeaveRoom }: Props) => {
  return (
    <div>
      <h2 className="text-lg font-bold mb-2">가입한 채팅방</h2>
      <div className="space-y-2">
        {rooms.map((room) => (
          <div key={room.id} className="p-4 border rounded-lg hover:bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{room.name}</h3>
                {room.unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {room.unreadCount}
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEnterRoom(room.id)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  입장
                </button>
                <button
                  onClick={() => onLeaveRoom(room.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  탈퇴
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm">{room.lastMessage?.content}</p>
            <div className="mt-2 text-xs text-gray-500">
              참여자 {room.participants.length}명
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
