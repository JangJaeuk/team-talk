"use client";

import { useSocket } from "@/hooks/useSocket";
import { connectSocket, getSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { useEffect, useState } from "react";

export function Chat() {
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const { user, login, logout } = useAuthStore();
  const { messages } = useChatStore();
  const { sendMessage } = useSocket();

  useEffect(() => {
    if (user) {
      const socket = getSocket();

      // 소켓 연결
      connectSocket();

      // 연결 상태 모니터링
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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && user) {
      const newMessage = {
        content: message.trim(),
        roomId: "test-room",
        sender: user,
      };

      console.log("Sending message:", newMessage);
      sendMessage(message.trim(), "test-room");
      setMessage("");
    }
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">팀톡 테스트</h1>

      {!user ? (
        <form onSubmit={handleLogin} className="mb-4">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임을 입력하세요"
            className="border p-2 mr-2"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            로그인
          </button>
        </form>
      ) : (
        <div>
          <div className="mb-4">
            <span className="mr-2">{user.nickname}님 환영합니다!</span>
            <span className="mr-2 text-sm">
              {isConnected ? (
                <span className="text-green-500">●</span>
              ) : (
                <span className="text-red-500">●</span>
              )}
              {isConnected ? " 연결됨" : " 연결 안됨"}
            </span>
            <button
              onClick={() => logout()}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              로그아웃
            </button>
          </div>

          <div className="border rounded p-4 mb-4 h-80 overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`mb-2 ${
                  msg.sender.id === user.id ? "text-right" : "text-left"
                }`}
              >
                <span className="text-sm text-gray-500">
                  {msg.sender.nickname}:{" "}
                </span>
                <span>{msg.content}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage}>
            <div className="flex">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="메시지를 입력하세요"
                className="flex-1 border p-2 mr-2"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded"
                disabled={!isConnected}
              >
                전송
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
