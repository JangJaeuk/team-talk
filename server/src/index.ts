import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { config } from "./config";
import {
  ClientToServerEvents,
  Message,
  ServerToClientEvents,
  User,
} from "./types";

const app = express();
const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: config.corsOrigin,
    methods: ["GET", "POST"],
  },
});

// 미들웨어 설정
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json());

// 임시 데이터 스토어 (실제 구현시 DB로 대체)
const users = new Map<string, User>();
const messages = new Map<string, Message[]>();

// Socket.IO 연결 처리
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // 메시지 전송
  socket.on("message:send", (messageData) => {
    console.log("Received message from client:", messageData);

    const message: Message = {
      id: Date.now().toString(),
      content: messageData.content,
      sender: messageData.sender,
      roomId: messageData.roomId,
      createdAt: new Date(),
      isEdited: false,
    };

    // 메시지 저장
    const roomMessages = messages.get(message.roomId) || [];
    messages.set(message.roomId, [...roomMessages, message]);

    console.log("Broadcasting message to room:", message.roomId);

    // 해당 방의 모든 사용자에게 메시지 브로드캐스트
    socket.join(message.roomId);
    io.to(message.roomId).emit("message:new", message);
  });

  // 메시지 수정
  socket.on("message:update", (messageId, content) => {
    console.log("Updating message:", messageId, content);
    messages.forEach((roomMessages, roomId) => {
      const messageIndex = roomMessages.findIndex((m) => m.id === messageId);
      if (messageIndex !== -1) {
        const updatedMessage = {
          ...roomMessages[messageIndex],
          content,
          updatedAt: new Date(),
          isEdited: true,
        };
        roomMessages[messageIndex] = updatedMessage;
        io.to(roomId).emit("message:update", updatedMessage);
      }
    });
  });

  // 채팅방 참여
  socket.on("room:join", (roomId) => {
    console.log(`User ${socket.id} joined room ${roomId}`);
    socket.join(roomId);

    // 기존 메시지 전송
    const roomMessages = messages.get(roomId) || [];
    socket.emit("room:messages", roomMessages);
  });

  // 채팅방 나가기
  socket.on("room:leave", (roomId) => {
    console.log(`User ${socket.id} left room ${roomId}`);
    socket.leave(roomId);
  });

  // 타이핑 상태
  socket.on("typing:start", (roomId) => {
    console.log(`User ${socket.id} started typing in room ${roomId}`);
    socket.to(roomId).emit("typing:start", { userId: socket.id, roomId });
  });

  socket.on("typing:stop", (roomId) => {
    console.log(`User ${socket.id} stopped typing in room ${roomId}`);
    socket.to(roomId).emit("typing:stop", { userId: socket.id, roomId });
  });

  // 연결 해제
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    users.delete(socket.id);
    io.emit("user:status", { id: socket.id, status: "offline" } as User);
  });
});

// 서버 시작
httpServer.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
