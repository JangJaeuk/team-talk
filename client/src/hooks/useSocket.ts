"use client";

import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/useAuthStore";
import { Message } from "@/types";
import { useEffect } from "react";

interface UseSocketOptions {
  onMessage?: (message: Message) => void;
}

export const useSocket = (roomId: string, options: UseSocketOptions = {}) => {
  const { user } = useAuthStore();

  useEffect(() => {
    connectSocket(roomId);
    const socket = getSocket(roomId);

    socket.on("message:new", (message: Message) => {
      options.onMessage?.(message);
    });

    socket.emit("room:join", roomId);

    return () => {
      socket.emit("room:leave", roomId);
      socket.off("message:new");
      disconnectSocket(roomId);
    };
  }, [roomId, options.onMessage]);

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
  };
};
