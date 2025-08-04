"use client";

import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { useEffect } from "react";

export const useSocket = () => {
  const { addMessage, updateMessage, deleteMessage, setTypingStatus } =
    useChatStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    const socket = getSocket();

    // 새 메시지 수신
    socket.on("message:new", (message) => {
      console.log("Received new message:", message);
      addMessage(message);
    });

    // 메시지 업데이트
    socket.on("message:update", (message) => {
      updateMessage(message.id, message.content);
    });

    // 메시지 삭제
    socket.on("message:delete", (messageId) => {
      deleteMessage(messageId);
    });

    // 타이핑 상태
    socket.on("typing:start", ({ userId, roomId }) => {
      setTypingStatus(userId, true);
    });

    socket.on("typing:stop", ({ userId, roomId }) => {
      setTypingStatus(userId, false);
    });

    return () => {
      socket.off("message:new");
      socket.off("message:update");
      socket.off("message:delete");
      socket.off("typing:start");
      socket.off("typing:stop");
    };
  }, [user, addMessage, updateMessage, deleteMessage, setTypingStatus]);

  // 메시지 전송 함수
  const sendMessage = (content: string, roomId: string) => {
    if (!user) return;

    const socket = getSocket();
    const messageData = {
      content,
      roomId,
      sender: user,
    };

    console.log("Sending message data:", messageData);
    socket.emit("message:send", messageData);
  };

  // 타이핑 상태 전송
  const sendTypingStatus = (roomId: string, isTyping: boolean) => {
    if (!user) return;

    const socket = getSocket();
    socket.emit(isTyping ? "typing:start" : "typing:stop", roomId);
  };

  return {
    sendMessage,
    sendTypingStatus,
  };
};
