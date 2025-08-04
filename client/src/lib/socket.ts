import { ClientToServerEvents, ServerToClientEvents } from "@/types";
import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

// 소켓 인스턴스 저장
const socketMap = new Map<
  string,
  Socket<ServerToClientEvents, ClientToServerEvents>
>();

// 소켓 연결
export const connectSocket = (roomId: string) => {
  if (socketMap.has(roomId)) {
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Authentication required");
  }

  const socket = io(SOCKET_URL, {
    auth: {
      token,
    },
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
    if (error.message === "Authentication error") {
      // 인증 에러 시 로그인 페이지로 이동
      window.location.href = "/";
    }
  });

  socketMap.set(roomId, socket);
};

// 소켓 연결 해제
export const disconnectSocket = (roomId: string) => {
  const socket = socketMap.get(roomId);
  if (socket) {
    socket.disconnect();
    socketMap.delete(roomId);
  }
};

// 모든 소켓 연결 해제
export const disconnectAllSockets = () => {
  socketMap.forEach((socket) => {
    socket.disconnect();
  });
  socketMap.clear();
};

// 소켓 가져오기
export const getSocket = (roomId: string) => {
  const socket = socketMap.get(roomId);
  if (!socket) {
    throw new Error("Socket not connected");
  }
  return socket;
};
