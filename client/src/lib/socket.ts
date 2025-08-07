import { ClientToServerEvents, ServerToClientEvents } from "@/types";
import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

// 소켓 연결
export const connectSocket = () => {
  if (socket?.connected) {
    console.log("[Socket] 이미 연결된 소켓 재사용:", socket.id);
    return socket;
  }

  // 연결 해제된 소켓이 있다면 완전히 정리
  if (socket) {
    console.log("[Socket] 기존 연결 정리");
    socket.disconnect();
    socket.removeAllListeners();
    socket = null;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    console.error("[Socket] 토큰이 없음");
    throw new Error("Authentication required");
  }

  console.log("[Socket] 새 연결 시도");
  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    // 중복 연결 방지를 위한 추가 옵션
    multiplex: false,
  });

  socket.on("connect", () => {
    console.log("[Socket] 연결 성공:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket] 연결 끊김:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("[Socket] 연결 에러:", error.message);
    if (error.message === "Authentication error") {
      window.location.href = "/";
    }
  });

  return socket;
};

// 소켓 연결 해제
export const disconnectSocket = () => {
  if (!socket) {
    console.log("[Socket] 이미 연결 해제됨");
    return;
  }

  console.log("[Socket] 연결 해제:", socket.id);
  socket.disconnect();
  socket.removeAllListeners();
  socket = null;
};

// 소켓 가져오기
export const getSocket = () => {
  if (!socket || !socket.connected) {
    console.log("[Socket] 새 연결 필요");
    return connectSocket();
  }
  console.log("[Socket] 기존 소켓 반환:", socket.id);
  return socket;
};
