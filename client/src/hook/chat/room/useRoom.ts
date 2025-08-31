import { socketClient } from "@/lib/socket";
import { roomKeys, roomQueries } from "@/query/room";
import type { RoomRs } from "@/rqrs/room/roomRs";
import { useAuthStore } from "@/store/useAuthStore";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

interface UseRoomProps {
  roomId: string;
}

export const useRoom = ({ roomId }: UseRoomProps) => {
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: room } = useSuspenseQuery({
    ...roomQueries.detail(roomId),
    staleTime: 0,
  });

  const isJoined = useMemo(() => {
    if (!user?.id) return false;
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
      router.push("/rooms");
      // 채팅방 찾기 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: roomKeys.availableLists() });
    }
  };

  const setRoom = useCallback(
    (updatedRoom: RoomRs) => {
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
