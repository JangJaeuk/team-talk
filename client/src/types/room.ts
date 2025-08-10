import { Message } from ".";

export interface Room {
  id: string;
  name: string;
  description?: string;
  participants: string[];
  lastMessage?: Message | null;
  unreadCount: number;
  createdBy: string;
  createdAt: Date;
  participantCount: number;
}

export interface RoomFormData {
  name: string;
  description?: string;
}

export interface RoomActions {
  onJoinRoom: (roomId: string) => void;
  onLeaveRoom: (roomId: string) => void;
  onEnterRoom: (roomId: string) => void;
}
