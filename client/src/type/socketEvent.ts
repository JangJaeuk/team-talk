import { UserRs } from "@/rqrs/auth/userRs";
import { MessageRs } from "@/rqrs/message/messageRs";
import { ParticipantRs } from "@/rqrs/room/participantRs";
import { RoomRs } from "@/rqrs/room/roomRs";

// Socket.IO 이벤트 타입
export interface ServerToClientEvents {
  "message:new": (message: MessageRs) => void;
  "message:update": (message: MessageRs) => void;
  "message:delete": (messageId: string) => void;
  "message:read": (messageId: string, readBy: MessageRs["readBy"]) => void;
  "user:status": (user: UserRs) => void;
  "room:enter": (roomId: string) => void; // 변경: join -> enter
  "room:exit": (roomId: string) => void; // 변경: leave -> exit
  "room:join:success": (room: RoomRs) => void; // 추가: 방 가입 성공
  "room:leave:success": (roomId: string) => void; // 추가: 방 탈퇴 성공
  "room:list": (rooms: RoomRs[]) => void;
  "room:created": (room: RoomRs) => void;
  "room:updated": (room: RoomRs) => void;
  "room:deleted": (roomId: string) => void;
  "room:messages": (messages: MessageRs[]) => void;
  "room:participant:update": (
    roomId: string,
    participants: ParticipantRs[]
  ) => void;
  "typing:start": (data: { userId: string; roomId: string }) => void;
  "typing:stop": (data: { userId: string; roomId: string }) => void;
  "auth:error": (error: { message: string }) => void;
}

export interface ClientToServerEvents {
  "message:send": (
    message: Omit<MessageRs, "id" | "createdAt" | "isEdited" | "readBy">
  ) => void;
  "message:update": (messageId: string, content: string) => void;
  "message:delete": (messageId: string) => void;
  "message:read": (messageId: string) => void;
  "room:enter": (roomId: string) => void; // 변경: join -> enter
  "room:exit": (roomId: string) => void; // 변경: leave -> exit
  "room:leave": (roomId: string) => void; // 추가: 방 탈퇴
  "room:search": (query: string) => void;
  "typing:start": (roomId: string) => void;
  "typing:stop": (roomId: string) => void;
}
