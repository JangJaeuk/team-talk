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
  participants: string[]; // User[] -> string[]로 변경
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
  type?: "normal" | "system";
  readBy: {
    userId: string;
    readAt: {
      _seconds: number;
      _nanoseconds: number;
    };
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
  "room:participant:update": (roomId: string, participants: string[]) => void;
  "typing:start": (data: { userId: string; roomId: string }) => void;
  "typing:stop": (data: { userId: string; roomId: string }) => void;
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
