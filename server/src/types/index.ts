// Express의 Request 타입 확장
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        nickname?: string;
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
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  participantCount: number;
  lastMessage?: Message | null;
}

export interface Message {
  id: string;
  content: string;
  sender: User;
  roomId: string;
  createdAt: Date;
  isEdited: boolean;
}

export interface ServerToClientEvents {
  "message:new": (message: Message) => void;
  "message:update": (message: Message) => void;
  "message:delete": (messageId: string) => void;
  "user:status": (userId: string, isOnline: boolean) => void;
  "room:join": (roomId: string) => void;
  "room:leave": (roomId: string) => void;
  "room:list": (rooms: ChatRoom[]) => void;
  "room:messages": (messages: Message[]) => void;
  "typing:start": (userId: string) => void;
  "typing:stop": (userId: string) => void;
}

export interface ClientToServerEvents {
  "message:send": (
    message: Omit<Message, "id" | "createdAt" | "isEdited">
  ) => void;
  "message:update": (messageId: string, content: string) => void;
  "message:delete": (messageId: string) => void;
  "room:create": (room: { name: string; description?: string }) => void;
  "room:join": (roomId: string) => void;
  "room:leave": (roomId: string) => void;
  "room:search": (query: string) => void;
  "typing:start": (roomId: string) => void;
  "typing:stop": (roomId: string) => void;
}
