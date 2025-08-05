"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { FC } from "react";
import ChatRoomList from "./ChatRoomList";

const ChatRoomListMain: FC = () => {
  const { user, logout } = useAuthStore();
  const router = useRouter();

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
        <ChatRoomList onJoinRoom={handleJoinRoom} />
      </div>
    </div>
  );
};

export default ChatRoomListMain;
