import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { config } from "./config";
import {
  ChatRoom,
  ClientToServerEvents,
  Message,
  ServerToClientEvents,
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
const chatRooms = new Map<string, ChatRoom>([
  [
    "room1",
    {
      id: "room1",
      name: "일반 채팅방",
      description: "누구나 참여 가능한 채팅방입니다.",
      createdBy: "system",
      createdAt: new Date(),
      participantCount: 0,
    },
  ],
  [
    "room2",
    {
      id: "room2",
      name: "개발자 채팅방",
      description: "개발 관련 대화를 나누는 채팅방입니다.",
      createdBy: "system",
      createdAt: new Date(),
      participantCount: 0,
    },
  ],
]);
const messages = new Map<string, Message[]>();

// HTTP API 엔드포인트
app.get("/api/rooms", (req, res) => {
  const rooms = Array.from(chatRooms.values());
  res.json(rooms);
});

app.get("/api/rooms/:roomId", (req, res) => {
  const room = chatRooms.get(req.params.roomId);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }
  res.json(room);
});

app.post("/api/rooms", (req, res) => {
  const { name, description } = req.body;
  const roomId = Date.now().toString();
  const newRoom: ChatRoom = {
    id: roomId,
    name,
    description,
    createdBy: "user", // 실제로는 인증된 사용자 ID
    createdAt: new Date(),
    participantCount: 0,
  };
  chatRooms.set(roomId, newRoom);
  res.status(201).json(newRoom);
});

// Socket.IO 이벤트 핸들러
io.on("connection", (socket) => {
  console.log("New client connected");
  let currentRoomId: string | null = null;

  // 방 참여
  socket.on("room:join", (roomId) => {
    console.log(`Client ${socket.id} joining room ${roomId}`);

    // 이전 방에서 나가기
    if (currentRoomId) {
      handleLeaveRoom(currentRoomId);
    }

    socket.join(roomId);
    currentRoomId = roomId;

    // 방 참여자 수 증가
    const room = chatRooms.get(roomId);
    if (room) {
      room.participantCount = (room.participantCount || 0) + 1;
      chatRooms.set(roomId, room);
      // 모든 클라이언트에 업데이트된 방 목록 전송
      io.emit("room:list", Array.from(chatRooms.values()));
    }
  });

  // 방 나가기 처리 함수
  const handleLeaveRoom = (roomId: string) => {
    console.log(`Client ${socket.id} leaving room ${roomId}`);
    socket.leave(roomId);

    const room = chatRooms.get(roomId);
    if (room) {
      room.participantCount = Math.max(0, (room.participantCount || 0) - 1);
      chatRooms.set(roomId, room);
      // 모든 클라이언트에 업데이트된 방 목록 전송
      io.emit("room:list", Array.from(chatRooms.values()));
    }
  };

  // 방 나가기 이벤트
  socket.on("room:leave", (roomId) => {
    handleLeaveRoom(roomId);
    currentRoomId = null;
  });

  // 메시지 전송
  socket.on("message:send", (messageData) => {
    const room = chatRooms.get(messageData.roomId);
    if (!room) return;

    const message: Message = {
      id: Date.now().toString(),
      ...messageData,
      createdAt: new Date(),
      isEdited: false,
    };

    // 메시지 저장
    const roomMessages = messages.get(message.roomId) || [];
    messages.set(message.roomId, [...roomMessages, message]);

    // 해당 방의 모든 사용자에게 메시지 브로드캐스트
    io.to(message.roomId).emit("message:new", message);
  });

  // 연결 끊김 처리
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    if (currentRoomId) {
      handleLeaveRoom(currentRoomId);
    }
  });
});

// 서버 시작
httpServer.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
