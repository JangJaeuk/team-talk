import { httpClient } from "@/lib/axios";
import type { User } from "@/type";

export const authKeys = {
  me: () => ["me"] as const,
};

export const authQueries = {
  me: () => ({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const response = await httpClient.get<User>("/auth/me");

      return response.data;
    },
  }),
};
