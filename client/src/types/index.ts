export interface User {
  id: string;
  email: string;
  nickname: string;
  isOnline: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  createdBy: string; // 방 생성자 ID
  createdAt: Date;
  participantCount: number;
  lastMessage?: Message | null;
}

export interface Message {
  id: string;
  content: string;
  roomId: string;
  sender: User;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  isEdited: boolean;
}

// Socket.IO 이벤트 타입
export interface ServerToClientEvents {
  "message:new": (message: Message) => void;
  "message:update": (message: Message) => void;
  "message:delete": (messageId: string) => void;
  "user:status": (user: User) => void;
  "room:join": (room: ChatRoom) => void;
  "room:leave": (roomId: string) => void;
  "room:list": (rooms: ChatRoom[]) => void;
  "room:created": (room: ChatRoom) => void;
  "room:updated": (room: ChatRoom) => void;
  "room:deleted": (roomId: string) => void;
  "room:messages": (messages: Message[]) => void;
  "typing:start": (data: { userId: string; roomId: string }) => void;
  "typing:stop": (data: { userId: string; roomId: string }) => void;
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
