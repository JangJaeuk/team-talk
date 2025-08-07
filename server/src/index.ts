import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { config } from "./config";
import { db } from "./config/firebase";
import { authMiddleware } from "./middleware/auth";
import { authService } from "./services/auth";
import { messageService, roomService, userService } from "./services/firebase";
import { ClientToServerEvents, ServerToClientEvents } from "./types";

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: config.corsOrigin,
    methods: ["GET", "POST"],
  },
});

// 인증 API 엔드포인트
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, nickname } = req.body;
    const { user, token } = await authService.register(
      email,
      password,
      nickname
    );
    res.status(201).json({ user, token });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to register user",
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);
    res.status(200).json({ user, token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(401).json({
      error: error instanceof Error ? error.message : "Invalid credentials",
    });
  }
});

// 사용자 정보 조회
app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const userDoc = await db.collection("users").doc(req.user!.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();
    res.json({
      id: userDoc.id,
      email: userData!.email,
      nickname: userData!.nickname,
      isOnline: userData!.isOnline,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

// 채팅방 목록 조회
app.get("/api/rooms", authMiddleware, async (req, res) => {
  try {
    const rooms = await roomService.getRooms();
    res.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

// 단일 채팅방 조회
app.get("/api/rooms/:roomId", authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await roomService.getRoom(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ error: "Failed to fetch room" });
  }
});

app.post("/api/rooms", authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    const roomId = await roomService.createRoom({
      name,
      description,
      createdBy: req.user!.uid,
      participants: [req.user!.uid],
    });

    const rooms = await roomService.getRooms();
    io.emit("room:list", rooms);

    res.status(201).json({ id: roomId });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: "Failed to create room" });
  }
});

// 메시지 히스토리 조회
app.get("/api/rooms/:roomId/messages", authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = "30", lastMessageId } = req.query;

    const messages = await messageService.getMessages(
      roomId,
      parseInt(limit as string),
      lastMessageId as string | undefined
    );

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "메시지 조회 중 오류가 발생했습니다." });
  }
});

// Socket.IO 연결 시 토큰 검증
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    const decoded = authService.verifyToken(token);
    socket.data.user = {
      uid: decoded.uid,
      email: decoded.email,
      nickname: decoded.nickname,
    };
    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
});

// Socket.IO 이벤트 핸들러
io.on("connection", (socket) => {
  console.log("New client connected");
  let currentRoomId: string | null = null;

  // 사용자 온라인 상태 업데이트
  userService.updateUserStatus(socket.data.user.uid, true);

  // 방 입장
  socket.on("room:enter", async (roomId) => {
    console.log(`Client ${socket.id} entering room ${roomId}`);

    // 이전 방에서 나가기
    if (currentRoomId) {
      await handleExitRoom(currentRoomId);
    }

    socket.join(roomId);
    currentRoomId = roomId;

    try {
      // 방 메시지 목록 전송
      const messages = await messageService.getMessagesByRoom(roomId);
      socket.emit("room:messages", messages);

      // 업데이트된 방 목록 브로드캐스트
      const rooms = await roomService.getRooms();
      io.emit("room:list", rooms);
    } catch (error) {
      console.error("Error handling room enter:", error);
    }
  });

  // 방 퇴장 처리 함수
  const handleExitRoom = async (roomId: string) => {
    console.log(`Client ${socket.id} exiting room ${roomId}`);
    socket.leave(roomId);

    try {
      // 업데이트된 방 목록 브로드캐스트
      const rooms = await roomService.getRooms();
      io.emit("room:list", rooms);
    } catch (error) {
      console.error("Error handling room exit:", error);
    }
  };

  // 방 퇴장 이벤트
  socket.on("room:exit", async (roomId) => {
    await handleExitRoom(roomId);
    currentRoomId = null;
  });

  // 방 가입 이벤트
  socket.on("room:join", async (roomId) => {
    if (!socket.data.user) {
      console.error("Unauthorized user tried to join room");
      return;
    }

    try {
      const room = await roomService.joinRoom(roomId, socket.data.user.uid);

      // 가입 성공 이벤트 전송
      socket.emit("room:join:success", room);

      // 참여자 목록 업데이트 브로드캐스트
      io.to(roomId).emit("room:participant:update", roomId, room.participants);

      // 업데이트된 방 목록 브로드캐스트
      const rooms = await roomService.getRooms();
      io.emit("room:list", rooms);
    } catch (error) {
      console.error("Error handling room join:", error);
    }
  });

  // 방 탈퇴 이벤트
  socket.on("room:leave", async (roomId) => {
    if (!socket.data.user) {
      console.error("Unauthorized user tried to leave room");
      return;
    }

    try {
      const room = await roomService.leaveRoom(roomId, socket.data.user.uid);

      // 탈퇴 성공 이벤트 전송
      socket.emit("room:leave:success", roomId);

      // 현재 해당 방에 있다면 방에서 나가기
      if (currentRoomId === roomId) {
        await handleExitRoom(roomId);
        currentRoomId = null;
      }

      // 참여자 목록 업데이트 브로드캐스트
      io.to(roomId).emit("room:participant:update", roomId, room.participants);

      // 업데이트된 방 목록 브로드캐스트
      const rooms = await roomService.getRooms();
      io.emit("room:list", rooms);
    } catch (error) {
      console.error("Error handling room leave:", error);
    }
  });

  // 메시지 전송
  socket.on("message:send", async (messageData) => {
    try {
      const messageId = await messageService.createMessage({
        ...messageData,
        sender: {
          id: socket.data.user.uid,
          email: socket.data.user.email!,
          nickname: messageData.sender.nickname,
          isOnline: true,
        },
      });

      const message = {
        id: messageId,
        ...messageData,
        sender: {
          id: socket.data.user.uid,
          email: socket.data.user.email!,
          nickname: messageData.sender.nickname,
          isOnline: true,
        },
        createdAt: new Date(),
        isEdited: false,
      };

      // 해당 방에 새 메시지 전송
      io.to(message.roomId).emit("message:new", message);

      // 해당 방에 타이핑 종료
      io.to(message.roomId).emit("typing:stop", {
        userId: socket.data.user.uid,
        roomId: message.roomId,
      });

      // 방 목록 갱신을 위해 최신 방 목록을 모든 클라이언트에게 전송
      const updatedRooms = await roomService.getRooms();
      io.emit("room:list", updatedRooms);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // 메시지 수정
  socket.on("message:update", async (messageId, content) => {
    try {
      await messageService.updateMessage(messageId, content);
      // 업데이트된 메시지를 방의 모든 사용자에게 브로드캐스트
      if (currentRoomId) {
        const messages = await messageService.getMessagesByRoom(currentRoomId);
        io.to(currentRoomId).emit("room:messages", messages);
      }
    } catch (error) {
      console.error("Error updating message:", error);
    }
  });

  // 메시지 삭제
  socket.on("message:delete", async (messageId) => {
    try {
      await messageService.deleteMessage(messageId);
      // 삭제 후 메시지 목록을 방의 모든 사용자에게 브로드캐스트
      if (currentRoomId) {
        const messages = await messageService.getMessagesByRoom(currentRoomId);
        io.to(currentRoomId).emit("room:messages", messages);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  });

  // 타이핑 시작
  socket.on("typing:start", (roomId) => {
    io.to(roomId).emit("typing:start", {
      userId: socket.data.user.uid,
      roomId,
    });
  });

  // 타이핑 종료
  socket.on("typing:stop", (roomId) => {
    io.to(roomId).emit("typing:stop", {
      userId: socket.data.user.uid,
      roomId,
    });
  });

  // 연결 끊김 처리
  socket.on("disconnect", async () => {
    console.log("Client disconnected");
    if (currentRoomId) {
      await handleExitRoom(currentRoomId);
    }
    // 사용자 오프라인 상태 업데이트
    await userService.updateUserStatus(socket.data.user.uid, false);
  });
});

// 서버 시작
httpServer.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
