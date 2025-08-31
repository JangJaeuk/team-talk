import { httpClient } from "@/lib/axios";
import { CreateRoomRq } from "@/rqrs/room/createRoomRq";
import { CreateRoomRs } from "@/rqrs/room/createRoomRs";
import { RoomRs } from "@/rqrs/room/roomRs";

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
        rooms: RoomRs[];
        hasNextPage: boolean;
      }>(`/rooms/available?${searchParams.toString()}`);
      return response.data;
    },
  }),
  joinedList: () => ({
    queryKey: roomKeys.joinedLists(),
    queryFn: async () => {
      const response = await httpClient.get<RoomRs[]>("/rooms/joined");
      return response.data;
    },
  }),
  detail: (roomId: string) => ({
    queryKey: roomKeys.detail(roomId),
    queryFn: async () => {
      const response = await httpClient.get<RoomRs>(`/rooms/${roomId}`);
      return response.data;
    },
  }),
  code: (roomId: string) => ({
    queryKey: [...roomKeys.all, "code", roomId],
    queryFn: async () => {
      const response = await httpClient.get<{ code: string }>(
        `/rooms/${roomId}/code`
      );
      return response.data;
    },
  }),
};

export const roomMutations = {
  create: () => ({
    mutationFn: async (data: CreateRoomRq) => {
      const response = await httpClient.post<CreateRoomRs>("/rooms", data);
      return response.data;
    },
  }),
  join: () => ({
    mutationFn: async ({ id, code }: { id: string; code: string }) => {
      const response = await httpClient.post<RoomRs>(`/rooms/${id}/join`, {
        code,
      });
      return response.data;
    },
  }),
};
