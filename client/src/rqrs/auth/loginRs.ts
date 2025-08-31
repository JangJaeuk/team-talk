import { User } from "@/type";

export interface LoginRs {
  accessToken: string;
  refreshToken: string;
  user: User;
}
