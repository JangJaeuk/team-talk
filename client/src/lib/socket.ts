import { ClientToServerEvents, ServerToClientEvents } from "@/types";
import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

// 방별 소켓 연결을 관리하는 Map
const socketConnections = new Map<
  string,
  Socket<ServerToClientEvents, ClientToServerEvents>
>();

export const getSocket = (
  roomId: string
): Socket<ServerToClientEvents, ClientToServerEvents> => {
  if (!socketConnections.has(roomId)) {
    const socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // 디버깅을 위한 이벤트 리스너
    socket.on("connect", () => {
      console.log(`Socket connected for room ${roomId} with ID:`, socket.id);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected for room ${roomId}`);
    });

    socket.on("connect_error", (error) => {
      console.error(`Socket connection error for room ${roomId}:`, error);
    });

    socketConnections.set(roomId, socket);
  }

  return socketConnections.get(roomId)!;
};

export const connectSocket = (roomId: string) => {
  const socket = getSocket(roomId);
  if (!socket.connected) {
    console.log(`Attempting to connect socket for room ${roomId}...`);
    socket.connect();
  }
};

export const disconnectSocket = (roomId: string) => {
  const socket = socketConnections.get(roomId);
  if (socket) {
    console.log(`Disconnecting socket for room ${roomId}...`);
    socket.disconnect();
    socketConnections.delete(roomId);
  }
};

export const disconnectAllSockets = () => {
  socketConnections.forEach((socket, roomId) => {
    console.log(`Disconnecting socket for room ${roomId}...`);
    socket.disconnect();
  });
  socketConnections.clear();
};
