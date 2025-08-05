"use client";

import ChatRoom from "@/components/chat/room/ChatRoom";
import { useParams } from "next/navigation";

export default function ChatRoomPage() {
  const { roomId } = useParams();

  return <ChatRoom roomId={roomId as string} />;
}
