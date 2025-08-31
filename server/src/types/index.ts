// Express의 Request 타입 확장
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        nickname?: string;
        avatar?: string;
      };
    }
  }
}

export interface User {
  id: string;
  email: string;
  nickname: string;
  isOnline: boolean;
  lastSeen?: Date;
  avatar: string; // avatar1 ~ avatar5
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  lastMessage?: Message | null;
  participants: { id: string; avatar: string; nickname: string }[]; // 참여자 정보 목록
}

export interface RoomParticipant {
  userId: string;
  roomId: string;
  joinedAt: Date;
}

export type MessageType =
  | "normal"
  | "system:join"
  | "system:leave"
  | "system:create";

export interface Message {
  id: string;
  content: string;
  sender: User;
  roomId: string;
  createdAt: Date;
  isEdited: boolean;
  type: MessageType;
  readBy: {
    userId: string;
    readAt: Date;
  }[];
}

export interface ServerToClientEvents {
  "message:new": (message: Message) => void;
  "message:update": (message: Message) => void;
  "message:delete": (messageId: string) => void;
  "message:read": (messageId: string, readBy: Message["readBy"]) => void;

  "room:enter": (roomId: string) => void; // 변경: join -> enter
  "room:exit": (roomId: string) => void; // 변경: leave -> exit
  "room:join:success": (room: ChatRoom) => void; // 추가: 방 가입 성공
  "room:leave:success": (roomId: string) => void; // 추가: 방 탈퇴 성공
  "room:list": (rooms: ChatRoom[]) => void;
  "room:participant:update": (
    roomId: string,
    participants: { id: string; avatar: string; nickname: string }[]
  ) => void;
  "room:messages": (messages: Message[]) => void;
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
  "room:enter": (roomId: string) => void; // 변경: join -> enter
  "room:exit": (roomId: string) => void; // 변경: leave -> exit
  "room:leave": (roomId: string) => void; // 추가: 방 탈퇴

  "typing:start": (roomId: string) => void;
  "typing:stop": (roomId: string) => void;
}
