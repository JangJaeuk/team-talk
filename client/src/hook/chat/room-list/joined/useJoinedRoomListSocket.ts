import { socketClient } from "@/lib/socket";
import { RoomRs } from "@/rqrs/room/roomRs";
import { useChatStore } from "@/store/useChatStore";
import { useCallback, useEffect, useState } from "react";

interface UseRoomSocketProps {
  onJoinRoom: (roomId: string) => void;
  fetchRooms: () => Promise<void>;
}

/**
 * 방 입장/퇴장 관련 소켓 이벤트만 처리하는 훅
 * 전역 소켓 연결은 useGlobalRoomListSocket에서 관리됨
 */
export const useJoinedRoomListSocket = ({
  onJoinRoom,
  fetchRooms,
}: UseRoomSocketProps) => {
  const { markRoomAsRead } = useChatStore();
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

  const handleRoomJoinSuccess = useCallback(
    (room: RoomRs) => {
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

      // 방 입장/퇴장 성공 이벤트만 처리 (전역 소켓에서 room:list, message:new는 이미 처리됨)
      socket.on("room:join:success", handleRoomJoinSuccess);
      socket.on("room:leave:success", handleRoomLeaveSuccess);

      return () => {
        socket.off("room:join:success", handleRoomJoinSuccess);
        socket.off("room:leave:success", handleRoomLeaveSuccess);
      };
    } catch (error) {
      console.error("Socket connection error:", error);
    }
  }, [socketId, handleRoomJoinSuccess, handleRoomLeaveSuccess]);

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
    handleLeaveRoom,
    handleEnterRoom,
  };
};
