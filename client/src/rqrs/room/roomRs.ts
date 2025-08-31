import { MessageRs } from "../message/messageRs";
import { ParticipantRs } from "./participantRs";

export interface RoomRs {
  id: string;
  name: string;
  description?: string;
  createdBy: string; // 방 생성자 ID
  createdAt: Date;
  participantCount: number;
  lastMessage?: MessageRs | null;
  participants: ParticipantRs[]; // 참여자 정보 목록
  unreadCount: number; // 읽지 않은 메시지 수
}
