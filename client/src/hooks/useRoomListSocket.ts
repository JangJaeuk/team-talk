import { getSocket } from "@/lib/socket";
import { useChatStore } from "@/store/useChatStore";
import { Room } from "@/types/room";
import { useEffect } from "react";

interface UseRoomSocketProps {
  onJoinRoom: (roomId: string) => void;
  fetchRooms: () => Promise<void>;
}

export const useRoomListSocket = ({
  onJoinRoom,
  fetchRooms,
}: UseRoomSocketProps) => {
  const { setRooms, updateRoomOrder, markRoomAsRead } = useChatStore();

  useEffect(() => {
    try {
      const socket = getSocket();

      socket.on("room:list", (updatedRooms: Room[]) => {
        console.log("Received updated room list:", updatedRooms);
        setRooms(updatedRooms);
      });

      socket.on("message:new", (message: { roomId: string }) => {
        updateRoomOrder(message.roomId);
      });

      socket.on("room:join:success", (room: Room) => {
        console.log("Successfully joined room:", room);
        onJoinRoom(room.id);
      });

      socket.on("room:leave:success", (roomId: string) => {
        console.log("Successfully left room:", roomId);
        fetchRooms();
      });

      return () => {
        socket.off("room:list");
        socket.off("message:new");
        socket.off("room:join:success");
        socket.off("room:leave:success");
      };
    } catch (error) {
      console.error("Socket connection error:", error);
    }
  }, [onJoinRoom, fetchRooms, setRooms, updateRoomOrder]);

  const handleJoinRoom = (roomId: string) => {
    const socket = getSocket();
    socket.emit("room:join", roomId);
  };

  const handleLeaveRoom = (roomId: string) => {
    const socket = getSocket();
    socket.emit("room:leave", roomId);
  };

  const handleEnterRoom = (roomId: string) => {
    const socket = getSocket();
    socket.emit("room:enter", roomId);
    markRoomAsRead(roomId);
    onJoinRoom(roomId); // 방 입장 시 바로 페이지 이동
  };

  return {
    handleJoinRoom,
    handleLeaveRoom,
    handleEnterRoom,
  };
};
