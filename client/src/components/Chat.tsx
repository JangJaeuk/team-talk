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
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const { user, login, logout } = useAuthStore();
  const { messages, clearMessages } = useChatStore();
  const { sendMessage } = useSocket(currentRoom?.id || "lobby");
  const router = useRouter();

  useEffect(() => {
    if (user) {
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
    }
  }, [user]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      login(nickname.trim());
    }
  };

  const handleJoinRoom = (roomId: string) => {
    router.push(`/rooms/${roomId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">팀톡 로그인</h1>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              className="w-full border p-2 rounded mb-4"
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              시작하기
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">채팅방 목록</h1>
          <div className="flex items-center">
            <span className="mr-4">{user.nickname}님 환영합니다!</span>
            <button
              onClick={() => logout()}
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
