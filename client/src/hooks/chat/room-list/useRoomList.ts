import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { Room } from "@/types/room";
import { useCallback, useEffect, useState } from "react";

export const useRoomList = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  const { rooms, setRooms } = useChatStore();

  const fetchRooms = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/rooms");
      setRooms(response.data);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setIsLoading(false);
    }
  }, [setRooms]);

  const filterRoomsByQuery = useCallback((rooms: Room[], query: string) => {
    return rooms.filter((room) =>
      room.name.toLowerCase().includes(query.toLowerCase())
    );
  }, []);

  const getJoinedRooms = useCallback(() => {
    return rooms.filter((room) => room.participants.includes(user?.id || ""));
  }, [rooms, user?.id]);

  const getAvailableRooms = useCallback(() => {
    return rooms.filter((room) => !room.participants.includes(user?.id || ""));
  }, [rooms, user?.id]);

  useEffect(() => {
    fetchRooms();
  }, []); // fetchRooms가 메모이제이션되어 있으므로 안전

  return {
    rooms,
    isLoading,
    fetchRooms,
    filterRoomsByQuery,
    getJoinedRooms,
    getAvailableRooms,
  };
};
