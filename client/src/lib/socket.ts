import { ClientToServerEvents, ServerToClientEvents } from "@/types";
import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

// 싱글톤 소켓 인스턴스
let socket: Socket<ServerToClientEvents, ClientToServerEvents>;

export const getSocket = (): Socket<
  ServerToClientEvents,
  ClientToServerEvents
> => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

// 소켓 연결 관리
export const connectSocket = () => {
  const socket = getSocket();
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  const socket = getSocket();
  if (socket.connected) {
    socket.disconnect();
  }
};
