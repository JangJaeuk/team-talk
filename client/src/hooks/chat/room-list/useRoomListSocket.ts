import { socketClient } from "@/lib/socket";
import { useChatStore } from "@/store/useChatStore";
import { Room } from "@/types/room";
import { useCallback, useEffect, useState } from "react";

interface UseRoomSocketProps {
  onJoinRoom: (roomId: string) => void;
  fetchRooms: () => Promise<void>;
}

export const useRoomListSocket = ({
  onJoinRoom,
  fetchRooms,
}: UseRoomSocketProps) => {
  const { setRooms, updateRoomOrder, markRoomAsRead } = useChatStore();
  const [socketId, setSocketId] = useState<string | null>(null);

  const handleSocketChange = useCallback(
    (newSocket: ReturnType<typeof socketClient.getSocket>) => {
      console.log("[Socket] 새로운 소켓으로 업데이트", newSocket.id);
      setSocketId(newSocket.id ?? null);
    },
    []
  );

  useEffect(() => {
    // 소켓 인스턴스 변경 감지
    socketClient.on("socket:connected", handleSocketChange);

    return () => {
      socketClient.off("socket:connected", handleSocketChange);
    };
  }, []);

  // 이벤트 핸들러들을 useCallback으로 메모이제이션
  const handleRoomList = useCallback((updatedRooms: Room[]) => {
    console.log("Received updated room list:", updatedRooms);
    setRooms(updatedRooms);
  }, []);

  const handleNewMessage = useCallback((message: { roomId: string }) => {
    updateRoomOrder(message.roomId);
  }, []);

  const handleRoomJoinSuccess = useCallback(
    (room: Room) => {
      console.log("Successfully joined room:", room);
      onJoinRoom(room.id);
    },
    [onJoinRoom]
  );

  const handleRoomLeaveSuccess = useCallback(
    (roomId: string) => {
      console.log("Successfully left room:", roomId);
      fetchRooms();
    },
    [fetchRooms]
  );

  useEffect(() => {
    try {
      const socket = socketClient.getSocket();

      socket.on("room:list", handleRoomList);
      socket.on("message:new", handleNewMessage);
      socket.on("room:join:success", handleRoomJoinSuccess);
      socket.on("room:leave:success", handleRoomLeaveSuccess);

      return () => {
        socket.off("room:list", handleRoomList);
        socket.off("message:new", handleNewMessage);
        socket.off("room:join:success", handleRoomJoinSuccess);
        socket.off("room:leave:success", handleRoomLeaveSuccess);
      };
    } catch (error) {
      console.error("Socket connection error:", error);
    }
  }, [socketId, handleRoomJoinSuccess, handleRoomLeaveSuccess]);

  const handleJoinRoom = useCallback((roomId: string) => {
    socketClient.emitSocket("room:join", roomId);
  }, []);

  const handleLeaveRoom = useCallback((roomId: string) => {
    socketClient.emitSocket("room:leave", roomId);
  }, []);

  const handleEnterRoom = useCallback(
    (roomId: string) => {
      socketClient.emitSocket("room:enter", roomId);
      markRoomAsRead(roomId);
      onJoinRoom(roomId); // 방 입장 시 바로 페이지 이동
    },
    [onJoinRoom] // markRoomAsRead는 store의 안정적인 함수이므로 제외
  );

  return {
    handleJoinRoom,
    handleLeaveRoom,
    handleEnterRoom,
  };
};
