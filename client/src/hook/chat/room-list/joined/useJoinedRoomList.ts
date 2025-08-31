import { roomQueries } from "@/query/room";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";

interface Params {
  query: string;
}

export const useJoinedRoomList = ({ query }: Params) => {
  const { data: rooms, refetch: fetchRooms } = useSuspenseQuery({
    ...roomQueries.joinedList(),
  });

  const filteredRooms = useMemo(() => {
    if (query.trim() === "") return rooms;

    return rooms.filter((room) =>
      room.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, rooms]);

  return {
    rooms,
    filteredRooms,
    fetchRooms,
  };
};
