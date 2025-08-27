import { httpClient } from "@/lib/axios";
import type { Message } from "@/types";

export const messageKeys = {
  all: ["messages"] as const,
  room: (roomId: string) => [...messageKeys.all, roomId] as const,
  list: (roomId: string, lastMessageId?: string) =>
    [...messageKeys.room(roomId), "list", { lastMessageId }] as const,
};

export const messageQueries = {
  list: (roomId: string, lastMessageId?: string) => ({
    queryKey: messageKeys.list(roomId, lastMessageId),
    queryFn: async () => {
      const response = await httpClient.get<{
        messages: Message[];
        hasNextPage: boolean;
      }>(`/rooms/${roomId}/messages`, {
        params: {
          limit: 50,
          lastMessageId,
        },
      });
      return response.data;
    },
  }),
};
