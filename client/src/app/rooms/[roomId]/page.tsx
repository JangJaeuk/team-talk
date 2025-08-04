"use client";

import { useSocket } from "@/hooks/useSocket";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ChatRoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuthStore();
  const { messages, clearMessages } = useChatStore();
  const { sendMessage } = useSocket(roomId);

  useEffect(() => {
    // Socket.IO 연결 설정
    const setupSocket = async () => {
      try {
        // 먼저 소켓 연결 초기화
        connectSocket(roomId);

        // 그 다음 소켓 인스턴스 가져오기
        const socket = getSocket(roomId);

        // 연결 상태 모니터링
        socket.on("connect", () => {
          console.log("Socket connected in chat room:", roomId);
          setIsConnected(true);
          // 방 참여
          socket.emit("room:join", roomId);
        });

        socket.on("disconnect", () => {
          console.log("Socket disconnected in chat room:", roomId);
          setIsConnected(false);
        });

        socket.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
          setIsConnected(false);
        });
      } catch (error) {
        console.error("Error setting up socket:", error);
        setIsConnected(false);
      }
    };

    setupSocket();

    // Cleanup
    return () => {
      try {
        const socket = getSocket(roomId);
        if (socket.connected) {
          socket.emit("room:leave", roomId);
          socket.off("connect");
          socket.off("disconnect");
          socket.off("connect_error");
        }
        clearMessages();
        disconnectSocket(roomId);
      } catch (error) {
        console.error("Error cleaning up socket:", error);
      }
    };
  }, [roomId, clearMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim() && user && isConnected) {
      console.log("Attempting to send message:", message);
      sendMessage(message.trim());
      setMessage("");
    } else if (!isConnected) {
      console.warn("Cannot send message: Socket is not connected");
    }
  };

  const handleLeaveRoom = () => {
    router.push("/rooms");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b p-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">채팅방 {roomId}</h2>
            </div>
            <div className="flex items-center">
              <span className="mr-2 text-sm">
                {isConnected ? (
                  <span className="text-green-500">●</span>
                ) : (
                  <span className="text-red-500">●</span>
                )}
                {isConnected ? " 연결됨" : " 연결 안됨"}
              </span>
              <button
                onClick={handleLeaveRoom}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                나가기
              </button>
            </div>
          </div>

          <div className="h-[calc(100vh-300px)] overflow-y-auto p-4">
            {messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`mb-2 ${
                  msg.sender.id === user?.id ? "text-right" : "text-left"
                }`}
              >
                <span className="text-sm text-gray-500">
                  {msg.sender.nickname}:{" "}
                </span>
                <span>{msg.content}</span>
              </div>
            ))}
          </div>

          <div className="border-t p-4">
            <form onSubmit={handleSendMessage}>
              <div className="flex">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="메시지를 입력하세요"
                  className="flex-1 border p-2 rounded-l"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded-r hover:bg-blue-600"
                  disabled={!isConnected}
                >
                  전송
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
