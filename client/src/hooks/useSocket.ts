"use client";

import { connectSocket, getSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { useCallback, useEffect } from "react";

export function useSocket(roomId: string) {
  const { addMessage } = useChatStore();
  const { user } = useAuthStore();

  useEffect(() => {
    try {
      // 먼저 소켓 연결 초기화
      connectSocket(roomId);

      // 그 다음 소켓 인스턴스 가져오기
      const socket = getSocket(roomId);

      // 메시지 수신 이벤트 리스너
      socket.on("message:new", (message) => {
        console.log("Received new message:", message);
        addMessage(message);
      });

      return () => {
        if (socket.connected) {
          socket.off("message:new");
        }
      };
    } catch (error) {
      console.error("Error setting up socket in useSocket:", error);
    }
  }, [roomId, addMessage]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!user) return;

      try {
        const socket = getSocket(roomId);
        socket.emit("message:send", {
          content,
          roomId,
          sender: user,
        });
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },
    [roomId, user]
  );

  return { sendMessage };
}
