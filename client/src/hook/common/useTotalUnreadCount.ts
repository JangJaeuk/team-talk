import { roomQueries } from "@/query/room";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";

/**
 * 참여중인 모든 채팅방의 총 읽지 않은 메시지 수를 계산하는 훅
 * 독립적인 쿼리를 사용하여 다른 컴포넌트와 분리됨
 */
export const useTotalUnreadCount = () => {
  const { data: rooms } = useSuspenseQuery({
    ...roomQueries.joinedList(),
  });

  const totalUnreadCount = useMemo(() => {
    return rooms.reduce((total, room) => total + (room.unreadCount || 0), 0);
  }, [rooms]);

  return {
    totalUnreadCount,
    hasUnread: totalUnreadCount > 0,
  };
};
