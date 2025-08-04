"use client";

import { useSocket } from "@/hooks/useSocket";
import { connectSocket, getSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { ChatRoom } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RoomList } from "./RoomList";

export function Chat() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const { user, logout } = useAuthStore();
  const { messages, clearMessages } = useChatStore();
  const { sendMessage } = useSocket(currentRoom?.id || "lobby");
  const router = useRouter();

  useEffect(() => {
    const socket = getSocket("lobby");
    connectSocket("lobby");

    socket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  const handleJoinRoom = (roomId: string) => {
    router.push(`/rooms/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">채팅방 목록</h1>
          <div className="flex items-center">
            <span className="mr-4">{user?.nickname}님 환영합니다!</span>
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              로그아웃
            </button>
          </div>
        </div>
        <RoomList onJoinRoom={handleJoinRoom} />
      </div>
    </div>
  );
}
