import { UserRs } from "@/rqrs/auth/userRs";

export interface LoginRs {
  accessToken: string;
  refreshToken: string;
  user: UserRs;
}
