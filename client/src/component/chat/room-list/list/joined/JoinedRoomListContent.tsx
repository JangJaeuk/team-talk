import { useJoinedRoomList } from "@/hook/chat/room-list/joined/useJoinedRoomList";
import { useJoinedRoomListSocket } from "@/hook/chat/room-list/joined/useJoinedRoomListSocket";
import { useRouter } from "next/navigation";
import { JoinedRoomList } from "./JoinedRoomList";
import { JoinedRoomListEmpty } from "./JoinedRoomListEmpty";

interface Props {
  query: string;
}

export const JoinedRoomListContent = ({ query }: Props) => {
  const router = useRouter();
  const { filteredRooms, fetchRooms } = useJoinedRoomList({
    query,
  });

  const { handleEnterRoom } = useJoinedRoomListSocket({
    onJoinRoom: (roomId: string) => {
      router.push(`/rooms/${roomId}`);
    },
    fetchRooms: async () => {
      await fetchRooms();
    },
  });

  return filteredRooms.length > 0 ? (
    <JoinedRoomList rooms={filteredRooms} onEnterRoom={handleEnterRoom} />
  ) : (
    <JoinedRoomListEmpty />
  );
};
