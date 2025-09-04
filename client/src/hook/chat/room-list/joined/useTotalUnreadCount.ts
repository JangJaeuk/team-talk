import { useMemo } from "react";
import { useJoinedRoomList } from "./useJoinedRoomList";

/**
 * 참여중인 모든 채팅방의 총 읽지 않은 메시지 수를 계산하는 훅
 */
export const useTotalUnreadCount = () => {
  const { rooms } = useJoinedRoomList({ query: "" });

  const totalUnreadCount = useMemo(() => {
    return rooms.reduce((total, room) => total + (room.unreadCount || 0), 0);
  }, [rooms]);

  return {
    totalUnreadCount,
    hasUnread: totalUnreadCount > 0,
  };
};
