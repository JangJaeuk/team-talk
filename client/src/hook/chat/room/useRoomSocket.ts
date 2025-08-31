"use client";

import { socketClient } from "@/lib/socket";
import { MessageRs } from "@/rqrs/message/messageRs";
import { RoomRs } from "@/rqrs/room/roomRs";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseRoomSocketOptions {
  onMessage?: (message: MessageRs) => void;
  onRoomJoinSuccess?: (room: RoomRs) => void;
  onRoomLeaveSuccess?: () => void;
  onMessageRead?: (messageId: string, readBy: MessageRs["readBy"]) => void;
}

interface TypingEvent {
  userId: string;
  roomId: string;
}

export const useRoomSocket = (
  roomId: string,
  options: UseRoomSocketOptions = {}
) => {
  const { user } = useAuthStore();
  const { setTypingStatus } = useChatStore();
  const joinedRoom = useRef<string | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const optionsRef = useRef(options);
  const roomIdRef = useRef(roomId);

  // refs 업데이트
  useEffect(() => {
    optionsRef.current = options;
    roomIdRef.current = roomId;
  }, [options, roomId]);

  // 방 입장 함수
  const enterRoom = useCallback(() => {
    if (!socketClient.isConnected()) {
      console.log("[Room] 소켓이 연결되지 않음");
      return;
    }

    const currentRoomId = roomIdRef.current;
    if (joinedRoom.current === currentRoomId) {
      console.log("[Room] 이미 입장한 방:", currentRoomId);
      return;
    }

    console.log("[Room] 방 입장 시도:", currentRoomId);
    socketClient.emitSocket("room:enter", currentRoomId);
    joinedRoom.current = currentRoomId;
  }, []);

  // 방 퇴장 함수
  const exitRoom = useCallback(() => {
    const currentRoomId = roomIdRef.current;
    if (!socketClient.isConnected() || joinedRoom.current !== currentRoomId) {
      return;
    }

    console.log("[Room] 방 퇴장:", currentRoomId);
    socketClient.emitSocket("room:exit", currentRoomId);
    joinedRoom.current = null;
  }, []);

  // 이벤트 핸들러들을 useCallback으로 메모이제이션
  const handleConnect = useCallback(() => {
    console.log("[Socket] 연결됨, 방 입장 시도");
    if (socketClient.isConnected()) {
      enterRoom();
    }
  }, []);

  const handleDisconnect = useCallback((reason: string) => {
    console.log("[Socket] 연결 끊김:", reason);
    joinedRoom.current = null;
    setSocketId(null);
  }, []);

  const handleRoomJoinSuccess = useCallback((room: RoomRs) => {
    optionsRef.current.onRoomJoinSuccess?.(room);
  }, []);

  const handleRoomLeaveSuccess = useCallback(() => {
    optionsRef.current.onRoomLeaveSuccess?.();
  }, []);

  const handleNewMessage = useCallback((message: MessageRs) => {
    console.log("[Message] 수신:", message.content, "방:", message.roomId);
    if (message.roomId === roomIdRef.current) {
      optionsRef.current.onMessage?.(message);
      // 메시지를 받으면 자동으로 읽음 처리
      if (socketClient.isConnected()) {
        socketClient.emitSocket("message:read", message.id);
      }
    }
  }, []);

  const handleTypingStart = useCallback((data: TypingEvent) => {
    if (data.roomId === roomIdRef.current) {
      setTypingStatus(data.userId, true);
    }
  }, []);

  const handleTypingStop = useCallback((data: TypingEvent) => {
    if (data.roomId === roomIdRef.current) {
      setTypingStatus(data.userId, false);
    }
  }, []);

  useEffect(() => {
    // 소켓 인스턴스 변경 감지
    const handleSocketChange = (
      newSocket: ReturnType<typeof socketClient.getSocket>
    ) => {
      console.log("[Socket] 새로운 소켓으로 업데이트", newSocket.id);
      setSocketId(newSocket.id ?? null);
    };

    socketClient.on("socket:connected", handleSocketChange);

    return () => {
      socketClient.off("socket:connected", handleSocketChange);
    };
  }, []);

  // 소켓 설정
  useEffect(() => {
    console.log("[Socket] 초기화 시작");

    const socket = socketClient.getSocket();
    if (!socket) return;

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("room:join:success", handleRoomJoinSuccess);
    socket.on("room:leave:success", handleRoomLeaveSuccess);
    socket.on("message:new", handleNewMessage);
    socket.on(
      "message:read",
      (messageId: string, readBy: MessageRs["readBy"]) => {
        if (optionsRef.current.onMessageRead) {
          optionsRef.current.onMessageRead(messageId, readBy);
        }
      }
    );
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    // 이미 연결된 상태라면 바로 방 입장
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      console.log("[Socket] 정리 시작");
      if (socket) {
        exitRoom();
        socket.off("connect");
        socket.off("disconnect", handleDisconnect);
        socket.off("room:join:success", handleRoomJoinSuccess);
        socket.off("room:leave:success", handleRoomLeaveSuccess);
        socket.off("message:new", handleNewMessage);
        socket.off("message:read");
        socket.off("typing:start", handleTypingStart);
        socket.off("typing:stop", handleTypingStop);
      }
    };
  }, [socketId]); // 빈 의존성 배열

  const sendTypingStatus = useCallback(
    (isTyping: boolean) => {
      if (!user || !socketClient.isConnected()) {
        console.log("[Typing] 상태 전송 실패: 연결 없음 또는 사용자 정보 없음");
        return;
      }

      const currentRoomId = roomIdRef.current;
      if (joinedRoom.current !== currentRoomId) {
        console.log("[Typing] 상태 전송 실패: 잘못된 방");
        return;
      }

      socketClient.emitSocket(
        isTyping ? "typing:start" : "typing:stop",
        currentRoomId
      );
    },
    [user]
  ); // roomId 의존성 제거

  const sendMessage = useCallback(
    (content: string) => {
      if (!user || !socketClient.isConnected()) {
        console.log("[Message] 전송 실패: 연결 없음 또는 사용자 정보 없음");
        return;
      }

      const currentRoomId = roomIdRef.current;
      if (joinedRoom.current !== currentRoomId) {
        console.log("[Message] 전송 실패: 잘못된 방");
        return;
      }

      console.log("[Message] 전송 시도:", content, "방:", currentRoomId);
      socketClient.emitSocket("message:send", {
        content,
        roomId: currentRoomId,
        sender: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          isOnline: true,
          avatar: user.avatar,
        },
      });
    },
    [user]
  ); // roomId 의존성 제거

  return {
    sendMessage,
    sendTypingStatus,
  };
};
