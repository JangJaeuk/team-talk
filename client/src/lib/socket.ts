import { ClientToServerEvents, ServerToClientEvents } from "@/types";
import { io, Socket } from "socket.io-client";

class SocketClient {
  private static instance: SocketClient;
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
    null;
  private readonly SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

  private constructor() {}

  public static getInstance(): SocketClient {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient();
    }
    return SocketClient.instance;
  }

  private getToken(): string | undefined {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
  }

  public connect(): Socket<ServerToClientEvents, ClientToServerEvents> {
    if (this.socket?.connected) {
      console.log("[Socket] 이미 연결된 소켓 재사용:", this.socket.id);
      return this.socket;
    }

    // 연결 해제된 소켓이 있다면 완전히 정리
    if (this.socket) {
      console.log("[Socket] 기존 연결 정리");
      this.disconnect();
    }

    const token = this.getToken();
    if (!token) {
      console.error("[Socket] 토큰이 없음");
      throw new Error("Authentication required");
    }

    console.log("[Socket] 새 연결 시도");
    this.socket = io(this.SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      multiplex: false,
    });

    this.setupEventHandlers();

    return this.socket;
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("[Socket] 연결 성공:", this.socket?.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[Socket] 연결 끊김:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("[Socket] 연결 에러:", error.message);
      if (error.message === "Authentication error") {
        window.location.href = "/";
      }
    });
  }

  public disconnect(): void {
    if (!this.socket) {
      console.log("[Socket] 이미 연결 해제됨");
      return;
    }

    console.log("[Socket] 연결 해제:", this.socket.id);
    this.socket.disconnect();
    this.socket.removeAllListeners();
    this.socket = null;
  }

  public getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
    if (!this.socket || !this.socket.connected) {
      console.log("[Socket] 새 연결 필요");
      return this.connect();
    }
    console.log("[Socket] 기존 소켓 반환:", this.socket.id);
    return this.socket;
  }
}

export const socketClient = SocketClient.getInstance();
