import { httpClient } from "@/lib/axios";
import { Room, RoomFormData } from "@/types/room";

export const roomKeys = {
  all: ["rooms"] as const,
  joinedLists: () => [...roomKeys.all, "joinedList"] as const,
  joinedList: (filters: string) =>
    [...roomKeys.joinedLists(), { filters }] as const,
  availableLists: () => [...roomKeys.all, "availableList"] as const,
  availableList: (filters: string) =>
    [...roomKeys.availableLists(), { filters }] as const,
  detail: (roomId: string) => [...roomKeys.all, "detail", roomId] as const,
};

export const roomQueries = {
  availableList: (params?: { search?: string; limit?: number }) => ({
    queryKey: [...roomKeys.availableLists(), params],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set("search", params.search);
      if (pageParam) searchParams.set("lastRoomId", pageParam);
      if (params?.limit) searchParams.set("limit", params.limit.toString());

      const response = await httpClient.get<{
        rooms: Room[];
        hasNextPage: boolean;
      }>(`/rooms/available?${searchParams.toString()}`);
      return response.data;
    },
  }),
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
  join: () => ({
    mutationFn: async (roomId: string) => {
      const response = await httpClient.post<Room>(`/rooms/${roomId}/join`);
      return response.data;
    },
  }),
};
