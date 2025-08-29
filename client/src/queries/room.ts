import { httpClient } from "@/lib/axios";
import { Room, RoomFormData } from "@/types/room";

export const roomKeys = {
  all: ["rooms"] as const,
  joinedLists: () => [...roomKeys.all, "joinedList"] as const,
  joinedList: (filters: string) =>
    [...roomKeys.joinedLists(), { filters }] as const,
  detail: (roomId: string) => [...roomKeys.all, "detail", roomId] as const,
};

export const roomQueries = {
  joinedList: () => ({
    queryKey: roomKeys.joinedLists(),
    queryFn: async () => {
      const response = await httpClient.get<Room[]>("/rooms/joined");
      return response.data;
    },
  }),
  detail: (roomId: string) => ({
    queryKey: roomKeys.detail(roomId),
    queryFn: async () => {
      const response = await httpClient.get<Room>(`/rooms/${roomId}`);
      return response.data;
    },
  }),
};

export const roomMutations = {
  create: () => ({
    mutationFn: async (data: RoomFormData) => {
      const response = await httpClient.post<Room>("/rooms", data);
      return response.data;
    },
  }),
};
