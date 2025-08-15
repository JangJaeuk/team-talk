import { httpClient } from "@/lib/axios";
import { socketClient } from "@/lib/socket";
import { useAuthStore } from "@/store/useAuthStore";
import type { ChatRoom } from "@/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface UseRoomProps {
  roomId: string;
}

export const useRoom = ({ roomId }: UseRoomProps) => {
  const { user } = useAuthStore();
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const router = useRouter();

  const isJoined = room?.participants.includes(user?.id || "") ?? false;

  const handleJoinRoom = () => {
    if (!user) return;
    socketClient.emitSocket("room:join", roomId);
  };

  const handleLeaveRoom = () => {
    if (!user) return;
    socketClient.emitSocket("room:leave", roomId);
    router.push("/rooms"); // 방 목록으로 이동
  };

  const fetchRoomInfo = useCallback(async () => {
    try {
      const response = await httpClient.get<ChatRoom>(`/rooms/${roomId}`);
      setRoom(response.data);
    } catch (error) {
      console.error("Error fetching room info:", error);
    }
  }, [roomId]);

  useEffect(() => {
    fetchRoomInfo();
  }, [roomId]);

  return {
    room,
    isJoined,
    handleJoinRoom,
    handleLeaveRoom,
    setRoom,
  };
};
