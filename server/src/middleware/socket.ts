import { Socket } from "socket.io";
import { authService } from "../services/auth";
import { ClientToServerEvents, ServerToClientEvents } from "../types";

export const socketAuthMiddleware = async (
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  next: (err?: Error) => void
) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    const decoded = authService.verifyAccessToken(token);
    socket.data.user = {
      uid: decoded.uid,
      email: decoded.email || "",
      nickname: decoded.nickname || "",
      avatar: decoded.avatar || "avatar1",
    };
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Invalid access token") {
        next(new Error("Invalid access token"));
      } else {
        next(new Error("Authentication error"));
      }
    }
  }
};

// 이벤트 인증 미들웨어
export const createEventAuthMiddleware = (
  socket: Socket,
  skipAuthEvents: string[]
) => {
  return async ([event, ...args]: any[], next: (err?: Error) => void) => {
    if (skipAuthEvents.includes(event)) {
      next();
      return;
    }

    try {
      const token = socket.handshake.auth.token;
      authService.verifyAccessToken(token);
      next();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Invalid access token") {
          socket.emit("auth:error", { message: "Invalid access token" });
          next();
        } else {
          socket.emit("auth:error", { message: "Authentication error" });
          next();
        }
      }
    }
  };
};
