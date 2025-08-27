import { httpClient } from "@/lib/axios";
import { Room, RoomFormData } from "@/types/room";

export const roomKeys = {
  all: ["rooms"] as const,
  lists: () => [...roomKeys.all, "list"] as const,
  list: (filters: string) => [...roomKeys.lists(), { filters }] as const,
};

export const roomQueries = {
  list: () => ({
    queryKey: roomKeys.lists(),
    queryFn: async () => {
      const response = await httpClient.get<Room[]>("/rooms");
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
