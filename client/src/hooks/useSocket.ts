"use client";

import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { ChatRoom as ChatRoomType, Message } from "@/types";
import { useCallback, useEffect, useRef } from "react";

interface UseSocketOptions {
  onMessage?: (message: Message) => void;
  onRoomJoinSuccess?: (room: ChatRoomType) => void;
  onRoomLeaveSuccess?: () => void;
  onMessageRead?: (messageId: string, readBy: Message["readBy"]) => void;
}

interface TypingEvent {
  userId: string;
  roomId: string;
}

export const useSocket = (roomId: string, options: UseSocketOptions = {}) => {
  const { user } = useAuthStore();
  const { setTypingStatus } = useChatStore();
  const joinedRoom = useRef<string | null>(null);
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  const optionsRef = useRef(options);
  const roomIdRef = useRef(roomId);

  // refs 업데이트
  useEffect(() => {
    optionsRef.current = options;
    roomIdRef.current = roomId;
  }, [options, roomId]);

  // 방 입장 함수
  const enterRoom = useCallback((socket: ReturnType<typeof getSocket>) => {
    if (!socket.connected) {
      console.log("[Room] 소켓이 연결되지 않음");
      return;
    }

    const currentRoomId = roomIdRef.current;
    if (joinedRoom.current === currentRoomId) {
      console.log("[Room] 이미 입장한 방:", currentRoomId);
      return;
    }

    console.log("[Room] 방 입장 시도:", currentRoomId);
    socket.emit("room:enter", currentRoomId);
    joinedRoom.current = currentRoomId;
  }, []); // roomId 의존성 제거

  // 방 퇴장 함수
  const exitRoom = useCallback((socket: ReturnType<typeof getSocket>) => {
    const currentRoomId = roomIdRef.current;
    if (!socket.connected || joinedRoom.current !== currentRoomId) {
      return;
    }

    console.log("[Room] 방 퇴장:", currentRoomId);
    socket.emit("room:exit", currentRoomId);
    joinedRoom.current = null;
  }, []); // roomId 의존성 제거

  // 이벤트 핸들러들을 useCallback으로 메모이제이션
  const handleConnect = useCallback(
    (socket: ReturnType<typeof getSocket>) => {
      console.log("[Socket] 연결됨, 방 입장 시도");
      if (socket.connected) {
        enterRoom(socket);
      }
    },
    [enterRoom]
  );

  const handleDisconnect = useCallback((reason: string) => {
    console.log("[Socket] 연결 끊김:", reason);
    joinedRoom.current = null;
  }, []);

  const handleRoomJoinSuccess = useCallback((room: ChatRoomType) => {
    optionsRef.current.onRoomJoinSuccess?.(room);
  }, []);

  const handleRoomLeaveSuccess = useCallback(() => {
    optionsRef.current.onRoomLeaveSuccess?.();
  }, []);

  const handleNewMessage = useCallback(
    (message: Message) => {
      console.log("[Message] 수신:", message.content, "방:", message.roomId);
      if (message.roomId === roomIdRef.current) {
        optionsRef.current.onMessage?.(message);
        // 메시지를 받으면 자동으로 읽음 처리
        if (socketRef.current && user) {
          socketRef.current.emit("message:read", message.id);
        }
      }
    },
    [user]
  );

  const handleTypingStart = useCallback(
    (data: TypingEvent) => {
      if (data.roomId === roomIdRef.current) {
        setTypingStatus(data.userId, true);
      }
    },
    [setTypingStatus]
  );

  const handleTypingStop = useCallback(
    (data: TypingEvent) => {
      if (data.roomId === roomIdRef.current) {
        setTypingStatus(data.userId, false);
      }
    },
    [setTypingStatus]
  );

  // 소켓 설정
  useEffect(() => {
    console.log("[Socket] 초기화 시작");
    const socket = getSocket();
    if (!socket) return;

    socketRef.current = socket;

    socket.on("connect", () => handleConnect(socket));
    socket.on("disconnect", handleDisconnect);
    socket.on("room:join:success", handleRoomJoinSuccess);
    socket.on("room:leave:success", handleRoomLeaveSuccess);
    socket.on("message:new", handleNewMessage);
    socket.on(
      "message:read",
      (messageId: string, readBy: Message["readBy"]) => {
        if (optionsRef.current.onMessageRead) {
          optionsRef.current.onMessageRead(messageId, readBy);
        }
      }
    );
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    // 이미 연결된 상태라면 바로 방 입장
    if (socket.connected) {
      handleConnect(socket);
    }

    return () => {
      console.log("[Socket] 정리 시작");
      if (socket) {
        exitRoom(socket);
        socket.off("connect");
        socket.off("disconnect", handleDisconnect);
        socket.off("room:join:success", handleRoomJoinSuccess);
        socket.off("room:leave:success", handleRoomLeaveSuccess);
        socket.off("message:new", handleNewMessage);
        socket.off("message:read");
        socket.off("typing:start", handleTypingStart);
        socket.off("typing:stop", handleTypingStop);
      }
      socketRef.current = null;
    };
  }, []); // 빈 의존성 배열

  const sendTypingStatus = useCallback(
    (isTyping: boolean) => {
      if (!user || !socketRef.current) return;

      const socket = socketRef.current;
      const currentRoomId = roomIdRef.current;
      if (socket.connected && joinedRoom.current === currentRoomId) {
        socket.emit(isTyping ? "typing:start" : "typing:stop", currentRoomId);
      }
    },
    [user]
  ); // roomId 의존성 제거

  const sendMessage = useCallback(
    (content: string) => {
      if (!user || !socketRef.current) return;

      const socket = socketRef.current;
      const currentRoomId = roomIdRef.current;
      if (socket.connected && joinedRoom.current === currentRoomId) {
        console.log("[Message] 전송 시도:", content, "방:", currentRoomId);
        socket.emit("message:send", {
          content,
          roomId: currentRoomId,
          sender: {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            isOnline: true,
          },
        });
      } else {
        console.log("[Message] 전송 실패: 연결 없음 또는 잘못된 방");
      }
    },
    [user]
  ); // roomId 의존성 제거

  return {
    sendMessage,
    sendTypingStatus,
  };
};
