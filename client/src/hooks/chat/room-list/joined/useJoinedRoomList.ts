import { roomQueries } from "@/queries/room";
import { useAuthStore } from "@/store/useAuthStore";
import { Room } from "@/types/room";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

export const useJoinedRoomList = () => {
  const { user } = useAuthStore();

  const {
    data: rooms = [],
    isLoading,
    refetch: fetchRooms,
  } = useQuery({
    ...roomQueries.joinedList(),
    enabled: !!user,
  });

  const filterRoomsByQuery = useCallback((rooms: Room[], query: string) => {
    return rooms.filter((room) =>
      room.name.toLowerCase().includes(query.toLowerCase())
    );
  }, []);

  const getRooms = useCallback(() => {
    return rooms.filter((room) => room.participants.includes(user?.id || ""));
  }, [rooms, user?.id]);

  return {
    rooms,
    isLoading,
    fetchRooms,
    filterRoomsByQuery,
    getRooms,
  };
};
