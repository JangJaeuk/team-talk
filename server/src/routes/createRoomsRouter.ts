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

  // 방 코드 조회
  router.get("/:roomId/code", authMiddleware, async (req, res) => {
    try {
      const { roomId } = req.params;
      const code = await roomService.getRoomCode(roomId, req.user!.uid);
      res.json({ code });
    } catch (error) {
      console.error("Error fetching room code:", error);
      res.status(500).json({ error: "Failed to fetch room code" });
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
      const { name, description, code } = req.body;
      if (!name || !description || !code) {
        return res.status(400).json({ error: "필수 입력값이 누락되었습니다." });
      }
      const roomId = await roomService.createRoom({
        name,
        description,
        code,
        createdBy: req.user!.uid,
        participants: [req.user!.uid],
      });

      // 시스템 메시지 생성 및 저장
      const systemMessageData = {
        roomId,
        content: "채팅방이 생성되었습니다.",
        sender: {
          id: req.user!.uid,
          email: req.user!.email!,
          nickname: req.user!.nickname!,
          isOnline: true,
          avatar: req.user!.avatar!,
        },
        type: "system:create" as const,
      };

      const systemMessage = await messageService.createMessage(
        systemMessageData
      );

      // 해당 방의 모든 클라이언트에게 새 메시지 전송
      io.to(roomId).emit("message:new", {
        id: systemMessage,
        ...systemMessageData,
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
      const { code } = req.body;
      const room = await roomService.joinRoom(roomId, req.user!.uid, code);

      const systemMessageData = {
        roomId,
        content: `${
          req.user!.nickname || "알 수 없는 사용자"
        }님이 참여했습니다.`,
        sender: {
          id: req.user!.uid,
          email: req.user!.email!,
          nickname: req.user!.nickname!,
          isOnline: true,
          avatar: req.user!.avatar!,
        },
        type: "system:join" as const,
      };

      // 시스템 메시지 저장 및 전송
      const systemMessage = await messageService.createMessage(
        systemMessageData
      );

      // 해당 방의 모든 클라이언트에게 새 메시지 전송
      io.to(roomId).emit("message:new", {
        id: systemMessage,
        ...systemMessageData,
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
      const errorMessage =
        error instanceof Error ? error.message : "Failed to join room";
      if (errorMessage === "Invalid room code") {
        res.status(400).json({ error: "잘못된 방 코드입니다." });
      } else {
        res.status(500).json({ error: "Failed to join room" });
      }
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
