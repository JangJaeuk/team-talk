import { Router } from "express";
import { Server } from "socket.io";
import { authMiddleware } from "../middleware/auth";
import { messageService, roomService } from "../services/firebase";
import { ClientToServerEvents, ServerToClientEvents } from "../types";

export const createRoomsRouter = (
  io: Server<ClientToServerEvents, ServerToClientEvents>
) => {
  const router = Router();

  // 참여 가능한 채팅방 목록 조회
  router.get("/available", authMiddleware, async (req, res) => {
    try {
      const { search, lastRoomId, limit } = req.query;
      const result = await roomService.getAvailableRooms(
        req.user!.uid,
        search as string | undefined,
        lastRoomId as string | undefined,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(result);
    } catch (error) {
      console.error("Error fetching available rooms:", error);
      res.status(500).json({ error: "Failed to fetch available rooms" });
    }
  });

  // 채팅방 목록 조회
  router.get("/joined", authMiddleware, async (req, res) => {
    try {
      const rooms = await roomService.getJoinedRooms(req.user!.uid);
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching joined rooms:", error);
      res.status(500).json({ error: "Failed to fetch joined rooms" });
    }
  });

  // 단일 채팅방 조회
  router.get("/:roomId", authMiddleware, async (req, res) => {
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

  // 채팅방 생성
  router.post("/", authMiddleware, async (req, res) => {
    try {
      const { name, description } = req.body;
      const roomId = await roomService.createRoom({
        name,
        description,
        createdBy: req.user!.uid,
        participants: [req.user!.uid],
      });

      const systemMessage = await messageService.createMessage({
        roomId,
        content: `채팅방이 생성되었습니다.`,
        sender: {
          id: "system",
          email: "system",
          nickname: "system",
          isOnline: true,
          avatar: "avatar1",
        },
        type: "system:create",
      });

      // 해당 방의 모든 클라이언트에게 새 메시지 전송
      io.to(roomId).emit("message:new", {
        id: systemMessage,
        roomId,
        content: `채팅방이 생성되었습니다.`,
        sender: {
          id: "system",
          email: "system",
          nickname: "system",
          isOnline: true,
          avatar: "avatar1",
        },
        type: "system:create",
        createdAt: new Date(),
        isEdited: false,
        readBy: [],
      });

      // 모든 클라이언트에게 업데이트된 방 목록 전송
      const rooms = await roomService.getJoinedRooms(req.user!.uid);
      io.emit("room:list", rooms);

      res.status(201).json({ id: roomId });
    } catch (error) {
      console.error("Error creating room:", error);
      res.status(500).json({ error: "Failed to create room" });
    }
  });

  // 채팅방 참여
  router.post("/:roomId/join", authMiddleware, async (req, res) => {
    try {
      const { roomId } = req.params;
      const room = await roomService.joinRoom(roomId, req.user!.uid);

      // 시스템 메시지 저장 및 전송
      const systemMessage = await messageService.createMessage({
        roomId,
        content: `${
          req.user!.nickname || "알 수 없는 사용자"
        }님이 참여했습니다.`,
        sender: {
          id: "system",
          email: "system",
          nickname: "system",
          isOnline: true,
          avatar: "avatar1",
        },
        type: "system",
      });

      // 해당 방의 모든 클라이언트에게 새 메시지 전송
      io.to(roomId).emit("message:new", {
        id: systemMessage,
        roomId,
        content: `${
          req.user!.nickname || "알 수 없는 사용자"
        }님이 참여했습니다.`,
        sender: {
          id: "system",
          email: "system",
          nickname: "system",
          isOnline: true,
          avatar: "avatar1",
        },
        type: "system",
        createdAt: new Date(),
        isEdited: false,
        readBy: [],
      });

      // 모든 클라이언트에게 업데이트된 방 목록 전송
      const rooms = await roomService.getJoinedRooms(req.user!.uid);
      io.emit("room:list", rooms);

      res.json(room);
    } catch (error) {
      console.error("Error joining room:", error);
      res.status(500).json({ error: "Failed to join room" });
    }
  });

  // 메시지 히스토리 조회
  router.get("/:roomId/messages", authMiddleware, async (req, res) => {
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

  return router;
};
