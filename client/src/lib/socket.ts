import { ClientToServerEvents, ServerToClientEvents } from "@/type/socketEvent";
import {
  getAccessToken,
  removeAccessToken,
  setAccessToken,
} from "@/util/token";
import { EventEmitter } from "events";
import { io, Socket } from "socket.io-client";

class SocketClient extends EventEmitter {
  private static instance: SocketClient;
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
    null;
  private lastFailedEmit: {
    event: keyof ClientToServerEvents;
    args: Parameters<ClientToServerEvents[keyof ClientToServerEvents]>;
  } | null = null;
  private refreshAttempts: number = 0;
  private refreshing: boolean = false;
  private readonly MAX_REFRESH_ATTEMPTS: number = 3;
  private readonly SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

  private constructor() {
    super();
  }

  public static getInstance(): SocketClient {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient();
    }
    return SocketClient.instance;
  }

  private async refreshToken(): Promise<string | null> {
    try {
      const response = await fetch(`${this.SOCKET_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        if (response.status === 401) {
          // Refresh Token이 유효하지 않은 경우
          this.disconnect();
          removeAccessToken();
          window.location.href = "/login";
        }
        return null;
      }
      const data = await response.json();
      setAccessToken(data.accessToken);
      return data.accessToken;
    } catch (error) {
      console.error("[Socket] Token refresh failed:", error);
      return null;
    }
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

    const token = getAccessToken();
    if (!token) {
      console.error("[Socket] 토큰이 없음");
      throw new Error("Authentication required");
    }

    console.log("[Socket] 새 연결 시도");
    (this as EventEmitter).emit("socket:beforeConnect");
    this.socket = io(this.SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      multiplex: false,
      withCredentials: true,
    });

    this.setupEventHandlers();

    return this.socket;
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("[Socket] 연결 성공:", this.socket?.id);
      this.refreshAttempts = 0; // 연결 성공 시 리프레시 시도 횟수 리셋
      (this as EventEmitter).emit("socket:connected", this.socket);
      this.retryLastFailedEmit();
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[Socket] 연결 끊김:", reason);
    });

    this.socket.on("connect_error", async (error) => {
      console.error("[Socket] 연결 에러:", error.message);
      if (error.message === "Invalid access token") {
        if (this.refreshAttempts >= this.MAX_REFRESH_ATTEMPTS) {
          console.error("[Socket] 최대 리프레시 시도 횟수 초과");
          this.disconnect();
          removeAccessToken();
          window.location.href = "/login";
          return;
        }

        if (this.refreshing) {
          console.log("[Socket] 토큰 갱신 진행 중...");
          return;
        }

        this.refreshing = true;
        this.refreshAttempts++;
        console.log(
          `[Socket] 토큰 리프레시 시도 ${this.refreshAttempts}/${this.MAX_REFRESH_ATTEMPTS}`
        );

        // 토큰 갱신 시도
        const newToken = await this.refreshToken();
        if (newToken) {
          // 새 토큰으로 재연결 시도
          this.disconnect();
          this.connect();
        }
        this.refreshing = false;
        // refreshToken에서 401 에러 시 자동으로 로그인 페이지로 리다이렉트됨
      } else if (error.message === "Authentication error") {
        this.disconnect();
        removeAccessToken();
        window.location.href = "/login";
      }
    });

    // 이벤트 에러 처리
    this.socket.on("auth:error", async (error) => {
      console.error("[Socket] 이벤트 에러:", error.message);
      if (error.message === "Invalid access token") {
        if (this.refreshAttempts >= this.MAX_REFRESH_ATTEMPTS) {
          console.error("[Socket] 최대 리프레시 시도 횟수 초과");
          this.disconnect();
          removeAccessToken();
          window.location.href = "/login";
          return;
        }

        if (this.refreshing) {
          console.log("[Socket] 토큰 갱신 진행 중...");
          return;
        }

        this.refreshing = true;
        this.refreshAttempts++;
        console.log(
          `[Socket] 토큰 리프레시 시도 ${this.refreshAttempts}/${this.MAX_REFRESH_ATTEMPTS}`
        );

        const newToken = await this.refreshToken();
        if (newToken) {
          this.disconnect();
          this.connect();
        }
        this.refreshing = false;
        // refreshToken에서 401 에러 시 자동으로 로그인 페이지로 리다이렉트됨
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

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
    if (!this.socket) {
      console.log("[Socket] 소켓 연결이 없음");
      throw new Error("Socket connection required");
    }
    console.log("[Socket] 소켓 반환:", this.socket.id);
    return this.socket;
  }

  public emitSocket<T extends keyof ClientToServerEvents>(
    event: T,
    ...args: Parameters<ClientToServerEvents[T]>
  ): void {
    if (!this.socket) {
      console.error("[Socket] 소켓 연결이 없음");
      throw new Error("Socket connection required");
    }

    if (!this.socket.connected) {
      console.log("[Socket] 연결되지 않은 상태에서 emit 시도");
      this.lastFailedEmit = { event, args };
      return;
    }

    this.socket.emit(event, ...args);
  }

  private retryLastFailedEmit(): void {
    if (this.lastFailedEmit && this.socket?.connected) {
      console.log(
        "[Socket] 마지막 실패한 요청 재시도:",
        this.lastFailedEmit.event
      );
      this.socket.emit(this.lastFailedEmit.event, ...this.lastFailedEmit.args);
      this.lastFailedEmit = null;
    }
  }
}

export const socketClient = SocketClient.getInstance();
