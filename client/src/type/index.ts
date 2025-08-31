import { Avatar } from "./avatar";

export interface User {
  id: string;
  email: string;
  nickname: string;
  isOnline: boolean;
  avatar: Avatar;
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  createdBy: string; // 방 생성자 ID
  createdAt: Date;
  participantCount: number;
  lastMessage?: Message | null;
  participants: { id: string; avatar: Avatar; nickname: string }[]; // 참여자 정보 목록
  unreadCount: number; // 읽지 않은 메시지 수
}

export interface Message {
  id: string;
  content: string;
  roomId: string;
  sender: User & { avatar: Avatar };
  createdAt: Date;
  isEdited: boolean;
  type?: "normal" | "system" | "system:create";
  readBy: {
    userId: string;
    readAt: Date;
  }[];
}

// Socket.IO 이벤트 타입
export interface ServerToClientEvents {
  "message:new": (message: Message) => void;
  "message:update": (message: Message) => void;
  "message:delete": (messageId: string) => void;
  "message:read": (messageId: string, readBy: Message["readBy"]) => void;
  "user:status": (user: User) => void;
  "room:enter": (roomId: string) => void; // 변경: join -> enter
  "room:exit": (roomId: string) => void; // 변경: leave -> exit
  "room:join:success": (room: ChatRoom) => void; // 추가: 방 가입 성공
  "room:leave:success": (roomId: string) => void; // 추가: 방 탈퇴 성공
  "room:list": (rooms: ChatRoom[]) => void;
  "room:created": (room: ChatRoom) => void;
  "room:updated": (room: ChatRoom) => void;
  "room:deleted": (roomId: string) => void;
  "room:messages": (messages: Message[]) => void;
  "room:participant:update": (
    roomId: string,
    participants: { id: string; avatar: string }[]
  ) => void;
  "typing:start": (data: { userId: string; roomId: string }) => void;
  "typing:stop": (data: { userId: string; roomId: string }) => void;
  "auth:error": (error: { message: string }) => void;
}

export interface ClientToServerEvents {
  "message:send": (
    message: Omit<Message, "id" | "createdAt" | "isEdited" | "readBy">
  ) => void;
  "message:update": (messageId: string, content: string) => void;
  "message:delete": (messageId: string) => void;
  "message:read": (messageId: string) => void;
  "room:create": (room: { name: string; description?: string }) => void;
  "room:enter": (roomId: string) => void; // 변경: join -> enter
  "room:exit": (roomId: string) => void; // 변경: leave -> exit
  "room:join": (roomId: string) => void; // 추가: 방 가입
  "room:leave": (roomId: string) => void; // 추가: 방 탈퇴
  "room:search": (query: string) => void;
  "typing:start": (roomId: string) => void;
  "typing:stop": (roomId: string) => void;
}
