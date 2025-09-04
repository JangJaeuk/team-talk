import { socketClient } from "@/lib/socket";
import { roomKeys } from "@/query/room";
import { RoomRs } from "@/rqrs/room/roomRs";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

/**
 * 전역적으로 방 목록 소켓 이벤트를 관리하는 훅
 * 탭 전환과 상관없이 항상 실시간 업데이트를 받기 위함
 */
export const useGlobalRoomListSocket = () => {
  const [socketId, setSocketId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleSocketChange = useCallback(
    (newSocket: ReturnType<typeof socketClient.getSocket>) => {
      console.log("[Global Socket] 새로운 소켓으로 업데이트", newSocket.id);
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
  const handleRoomList = useCallback(
    (updatedRooms: RoomRs[]) => {
      console.log("Received updated room list:", updatedRooms);
      queryClient.setQueryData(roomKeys.joinedLists(), updatedRooms);
    },
    [queryClient]
  );

  const handleNewMessage = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: roomKeys.joinedLists() });
  }, [queryClient]);

  useEffect(() => {
    try {
      const socket = socketClient.getSocket();

      socket.on("room:list", handleRoomList);
      socket.on("message:new", handleNewMessage);

      return () => {
        socket.off("room:list", handleRoomList);
        socket.off("message:new", handleNewMessage);
      };
    } catch (error) {
      console.error("Socket connection error:", error);
    }
  }, [socketId, queryClient]);
};
