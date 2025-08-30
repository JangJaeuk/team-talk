import { Server, Socket } from "socket.io";
import { createEventAuthMiddleware } from "../middleware/socket";
import { messageService, roomService, userService } from "../services/firebase";
import { ClientToServerEvents, ServerToClientEvents } from "../types";

export const setupSocketHandlers = (
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents>
) => {
  console.log("New client connected");
  let currentRoomId: string | null = null;

  // 이벤트 인증 미들웨어 설정
  socket.use(
    createEventAuthMiddleware(socket, ["typing:start", "typing:stop"])
  );

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
      // 방의 모든 메시지를 가져와서 읽음 처리
      const messages = await messageService.getMessagesByRoom(roomId);

      // 읽지 않은 메시지만 읽음 처리
      for (const message of messages) {
        if (
          !message.readBy?.some((read) => read.userId === socket.data.user.uid)
        ) {
          const readBy = await messageService.markMessageAsRead(
            message.id,
            socket.data.user.uid
          );
          // 읽음 상태 업데이트를 방의 모든 사용자에게 브로드캐스트
          io.to(roomId).emit("message:read", message.id, readBy);
        }
      }

      // 업데이트된 메시지 목록 전송
      const updatedMessages = await messageService.getMessagesByRoom(roomId);
      socket.emit("room:messages", updatedMessages);

      // 각 클라이언트에게 개별적으로 방 목록 전송
      const sockets = await io.fetchSockets();
      for (const s of sockets) {
        const rooms = await roomService.getJoinedRooms(s.data.user.uid);
        s.emit("room:list", rooms);
      }
    } catch (error) {
      console.error("Error handling room enter:", error);
    }
  });

  // 방 퇴장 처리 함수
  const handleExitRoom = async (roomId: string) => {
    console.log(`Client ${socket.id} exiting room ${roomId}`);
    socket.leave(roomId);

    try {
      // 각 클라이언트에게 개별적으로 방 목록 전송
      const sockets = await io.fetchSockets();
      for (const s of sockets) {
        const rooms = await roomService.getJoinedRooms(s.data.user.uid);
        s.emit("room:list", rooms);
      }
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

      // 시스템 메시지 생성 및 저장
      const systemMessageData = {
        content: `${socket.data.user.nickname}님이 채팅방에 참여하셨습니다.`,
        sender: {
          id: socket.data.user.uid,
          email: socket.data.user.email!,
          nickname: socket.data.user.nickname,
          isOnline: true,
          avatar: socket.data.user.avatar || "avatar1",
        },
        roomId,
        type: "system" as const,
      };

      const systemMessageId = await messageService.createMessage(
        systemMessageData
      );
      const systemMessage = {
        id: systemMessageId,
        ...systemMessageData,
        createdAt: new Date(),
        isEdited: false,
        readBy: [],
      };

      io.to(roomId).emit("message:new", systemMessage);

      // 참여자 목록 업데이트 브로드캐스트
      io.to(roomId).emit("room:participant:update", roomId, room.participants);

      // 업데이트된 방 목록 브로드캐스트
      const rooms = await roomService.getJoinedRooms();
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

      // 시스템 메시지 생성 및 저장
      const systemMessageData = {
        content: `${socket.data.user.nickname}님이 채팅방을 나가셨습니다.`,
        sender: {
          id: socket.data.user.uid,
          email: socket.data.user.email!,
          nickname: socket.data.user.nickname,
          isOnline: true,
          avatar: socket.data.user.avatar || "avatar1",
        },
        roomId,
        type: "system" as const,
      };

      const systemMessageId = await messageService.createMessage(
        systemMessageData
      );
      const systemMessage = {
        id: systemMessageId,
        ...systemMessageData,
        createdAt: new Date(),
        isEdited: false,
        readBy: [],
      };

      io.to(roomId).emit("message:new", systemMessage);

      // 현재 해당 방에 있다면 방에서 나가기
      if (currentRoomId === roomId) {
        await handleExitRoom(roomId);
        currentRoomId = null;
      }

      // 참여자 목록 업데이트 브로드캐스트
      io.to(roomId).emit("room:participant:update", roomId, room.participants);

      // 업데이트된 방 목록 브로드캐스트
      const rooms = await roomService.getJoinedRooms();
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
        type: "normal" as const,
        sender: {
          ...messageData.sender,
          id: socket.data.user.uid,
          email: socket.data.user.email!,
          isOnline: true,
        },
      });

      const message = {
        id: messageId,
        ...messageData,
        type: "normal" as const,
        sender: {
          ...messageData.sender,
          id: socket.data.user.uid,
          email: socket.data.user.email!,
          isOnline: true,
        },
        createdAt: new Date(),
        isEdited: false,
        readBy: [], // 초기에는 아무도 읽지 않음
      };

      // 해당 방에 새 메시지 전송
      io.to(message.roomId).emit("message:new", message);

      // 해당 방에 타이핑 종료
      io.to(message.roomId).emit("typing:stop", {
        userId: socket.data.user.uid,
        roomId: message.roomId,
      });

      // 방 참여자들의 읽지 않은 메시지 수 업데이트
      const room = await roomService.getRoom(message.roomId);
      if (room) {
        const sockets = await io.fetchSockets();
        for (const s of sockets) {
          // 메시지 발신자는 자동으로 읽음 처리
          if (s.data.user.uid === socket.data.user.uid) {
            await messageService.markMessageAsRead(messageId, s.data.user.uid);
          }
          // 각 클라이언트에게 개별적으로 방 목록 전송
          const rooms = await roomService.getJoinedRooms(s.data.user.uid);
          s.emit("room:list", rooms);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // 메시지 읽음 처리
  socket.on("message:read", async (messageId) => {
    try {
      const readBy = await messageService.markMessageAsRead(
        messageId,
        socket.data.user.uid
      );
      // 해당 방의 모든 사용자에게 읽음 상태 업데이트를 브로드캐스트
      const message = await messageService.getMessage(messageId);
      if (message) {
        io.to(message.roomId).emit("message:read", messageId, readBy);
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
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
};
