"use client";

import { ChatRoomWrapper } from "@/component/chat/room/ChatRoom";
import { useParams } from "next/navigation";

export default function ChatRoomPage() {
  const { roomId } = useParams();

  return <ChatRoomWrapper roomId={roomId as string} />;
}
