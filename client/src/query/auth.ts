import { httpClient } from "@/lib/axios";
import { LoginRq } from "@/rqrs/auth/loginRq";
import { LoginRs } from "@/rqrs/auth/loginRs";
import { RegisterRq } from "@/rqrs/auth/RegisterRq";
import type { UserRs } from "@/rqrs/auth/userRs";

export const authKeys = {
  me: () => ["me"] as const,
};

export const authQueries = {
  me: () => ({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const response = await httpClient.get<UserRs>("/auth/me");

      return response.data;
    },
  }),
};

export const authMutations = {
  login: () => ({
    mutationFn: async (data: LoginRq) => {
      const response = await httpClient.post<LoginRs>("/auth/login", data);
      return response.data;
    },
  }),
  register: () => ({
    mutationFn: async (data: RegisterRq) => {
      const response = await httpClient.post<void>("/auth/register", data);
      return response.data;
    },
  }),
  logout: () => ({
    mutationFn: async () => {
      const response = await httpClient.post<void>("/auth/logout");
      return response.data;
    },
  }),
};
