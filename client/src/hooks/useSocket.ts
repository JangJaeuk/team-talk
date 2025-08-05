"use client";

import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { Message } from "@/types";
import { useCallback, useEffect } from "react";

interface UseSocketOptions {
  onMessage?: (message: Message) => void;
}

interface TypingEvent {
  userId: string;
  roomId: string;
}

export const useSocket = (roomId: string, options: UseSocketOptions = {}) => {
  const { user } = useAuthStore();
  const { setTypingStatus } = useChatStore();

  useEffect(() => {
    connectSocket(roomId);
    const socket = getSocket(roomId);

    socket.on("message:new", (message: Message) => {
      options.onMessage?.(message);
    });

    socket.on("typing:start", (data: TypingEvent) => {
      setTypingStatus(data.userId, true);
    });

    socket.on("typing:stop", (data: TypingEvent) => {
      setTypingStatus(data.userId, false);
    });

    socket.emit("room:join", roomId);

    return () => {
      socket.emit("room:leave", roomId);
      socket.off("message:new");
      socket.off("typing:start");
      socket.off("typing:stop");
      disconnectSocket(roomId);
    };
  }, [roomId, options.onMessage, setTypingStatus]);

  const sendTypingStatus = useCallback(
    (isTyping: boolean) => {
      if (!user) return;
      const socket = getSocket(roomId);
      socket.emit(isTyping ? "typing:start" : "typing:stop", roomId);
    },
    [roomId, user]
  );

  return {
    sendMessage: (content: string) => {
      if (!user) return;
      const socket = getSocket(roomId);
      socket.emit("message:send", {
        content,
        roomId,
        sender: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          isOnline: true,
        },
      });
    },
    sendTypingStatus,
  };
};
