import { Message } from ".";
import { Avatar } from "./avatar";

export interface Room {
  id: string;
  name: string;
  description?: string;
  participants: { id: string; avatar: Avatar; nickname: string }[];
  lastMessage?: Message | null;
  unreadCount: number;
  createdBy: string;
  createdAt: Date;
  participantCount: number;
}
export interface RoomActions {
  onJoinRoom: (roomId: string) => void;
  onLeaveRoom: (roomId: string) => void;
  onEnterRoom: (roomId: string) => void;
}
