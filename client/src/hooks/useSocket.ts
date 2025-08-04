"use client";

import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { useCallback, useEffect } from "react";

export const useSocket = (roomId: string) => {
  const { addMessage, updateMessage, deleteMessage, setTypingStatus } =
    useChatStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user || !roomId) return;

    const socket = getSocket(roomId);

    // 새 메시지 수신
    socket.on("message:new", (message) => {
      console.log("Received new message:", message);
      addMessage(message);
    });

    // 메시지 업데이트
    socket.on("message:update", (message) => {
      console.log("Message updated:", message);
      updateMessage(message.id, message.content);
    });

    // 메시지 삭제
    socket.on("message:delete", (messageId) => {
      console.log("Message deleted:", messageId);
      deleteMessage(messageId);
    });

    // 타이핑 상태
    socket.on("typing:start", ({ userId, roomId }) => {
      console.log("User started typing:", userId, "in room:", roomId);
      setTypingStatus(userId, true);
    });

    socket.on("typing:stop", ({ userId, roomId }) => {
      console.log("User stopped typing:", userId, "in room:", roomId);
      setTypingStatus(userId, false);
    });

    return () => {
      socket.off("message:new");
      socket.off("message:update");
      socket.off("message:delete");
      socket.off("typing:start");
      socket.off("typing:stop");
    };
  }, [user, roomId, addMessage, updateMessage, deleteMessage, setTypingStatus]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!user || !roomId) return;

      const socket = getSocket(roomId);
      if (!socket.connected) {
        console.warn("Socket is not connected. Attempting to reconnect...");
        socket.connect();
        return;
      }

      const messageData = {
        content,
        roomId,
        sender: user,
      };

      console.log("Sending message:", messageData);
      socket.emit("message:send", messageData);
    },
    [user, roomId]
  );

  const sendTypingStatus = useCallback(
    (isTyping: boolean) => {
      if (!user || !roomId) return;

      const socket = getSocket(roomId);
      if (!socket.connected) return;

      socket.emit(isTyping ? "typing:start" : "typing:stop", roomId);
    },
    [user, roomId]
  );

  return {
    sendMessage,
    sendTypingStatus,
  };
};
