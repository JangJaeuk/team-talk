import { Room } from "@/types/room";

interface Props {
  rooms: Room[];
  onJoinRoom: (roomId: string) => void;
}

export const AvailableRoomList = ({ rooms, onJoinRoom }: Props) => {
  return (
    <div>
      <h2 className="text-lg font-bold mb-2">참여 가능한 채팅방</h2>
      <div className="space-y-2">
        {rooms.map((room) => (
          <div key={room.id} className="p-4 border rounded-lg hover:bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">{room.name}</h3>
              <button
                onClick={() => onJoinRoom(room.id)}
                className="text-blue-500 hover:text-blue-600"
              >
                가입
              </button>
            </div>
            <p className="text-gray-600 text-sm">{room.description}</p>
            <div className="mt-2 text-xs text-gray-500">
              참여자 {room.participantCount}명
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
