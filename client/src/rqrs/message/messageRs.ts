import { Avatar } from "@/type/avatar";
import { MessageType } from "@/type/message";
import { UserRs } from "../auth/userRs";

export interface MessageRs {
  id: string;
  content: string;
  roomId: string;
  sender: UserRs & { avatar: Avatar };
  createdAt: Date;
  isEdited: boolean;
  type?: MessageType;
  readBy: {
    userId: string;
    readAt: Date;
  }[];
}
