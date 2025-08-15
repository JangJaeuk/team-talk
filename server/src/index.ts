import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { config } from "./config";
import { socketAuthMiddleware } from "./middleware/socket";
import authRouter from "./routes/auth";
import { createRoomsRouter } from "./routes/createRoomsRouter";
import { setupSocketHandlers } from "./socket/handlers";
import { ClientToServerEvents, ServerToClientEvents } from "./types";

const app = express();
app.use(
  cors({
    origin: process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// 헬스체크 엔드포인트
app.get("/", (req, res) => {
  res.status(200).json({ status: "healthy", message: "Server is running" });
});

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: config.corsOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 라우터 연결
app.use("/api/auth", authRouter);
app.use("/api/rooms", createRoomsRouter(io));

// Socket.IO 연결 시 인증
io.use(socketAuthMiddleware);

// Socket.IO 이벤트 핸들러
io.on("connection", (socket) => setupSocketHandlers(io, socket));

// 서버 시작
httpServer.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
