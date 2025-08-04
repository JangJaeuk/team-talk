export interface User {
  id: string;
  nickname: string;
  status: "online" | "offline";
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  participants: User[];
  createdAt: Date;
}

export interface Message {
  id: string;
  content: string;
  sender: User;
  roomId: string;
  createdAt: Date;
  updatedAt?: Date;
  isEdited: boolean;
}

// Socket.IO 이벤트 타입 정의
export interface ServerToClientEvents {
  "message:new": (message: Message) => void;
  "message:update": (message: Message) => void;
  "message:delete": (messageId: string) => void;
  "user:status": (user: User) => void;
  "room:join": (room: ChatRoom) => void;
  "room:leave": (roomId: string) => void;
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
  "room:join": (roomId: string) => void;
  "room:leave": (roomId: string) => void;
  "typing:start": (roomId: string) => void;
  "typing:stop": (roomId: string) => void;
}
