import { socketClient } from "@/lib/socket";
import { roomKeys, roomQueries } from "@/query/room";
import { useAuthStore } from "@/store/useAuthStore";
import type { ChatRoom } from "@/type";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

interface UseRoomProps {
  roomId: string;
}

export const useRoom = ({ roomId }: UseRoomProps) => {
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: room } = useQuery({
    ...roomQueries.detail(roomId),
    enabled: !!roomId,
  });

  const isJoined = useMemo(() => {
    if (!user?.id || !room) return false;
    return room.participants.some((participant) => participant.id === user.id);
  }, [user?.id, room]);

  const handleJoinRoom = () => {
    if (!user) return;
    socketClient.emitSocket("room:join", roomId);
  };

  const handleLeaveRoom = () => {
    if (!user) return;
    if (window.confirm("정말 채팅방을 탈퇴하시겠습니까?")) {
      socketClient.emitSocket("room:leave", roomId);
      router.push("/rooms"); // 방 목록으로 이동
      // 채팅방 찾기 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: roomKeys.availableLists() });
    }
  };

  const setRoom = useCallback(
    (updatedRoom: ChatRoom) => {
      queryClient.setQueryData(roomKeys.detail(roomId), updatedRoom);
    },
    [queryClient, roomId]
  );

  return {
    room,
    isJoined,
    handleJoinRoom,
    handleLeaveRoom,
    setRoom,
  };
};
