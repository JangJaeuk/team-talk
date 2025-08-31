import { Avatar } from "@/type/avatar";

export interface UserRs {
  id: string;
  email: string;
  nickname: string;
  isOnline: boolean;
  avatar: Avatar;
}
