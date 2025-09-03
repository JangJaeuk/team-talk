"use client";

import { CustomSuspense } from "@/component/common/CustomSuspense";
import { useRoom } from "@/hook/chat/room/useRoom";
import { useState } from "react";
import { ChatRoomContent } from "./ChatRoomContent";
import { ChatRoomContentForJoin } from "./ChatRoomContentForJoin";
import { ChatRoomSkeleton } from "./ChatRoomSkeleton";
import { ChatRoomHeader } from "./layout/ChatRoomHeader";
import { ChatRoomSidePanel } from "./layout/ChatRoomSidePanel";
import { RoomCodeModal } from "./modal/RoomCodeModal";

interface Props {
  roomId: string;
}

export const ChatRoom = ({ roomId }: Props) => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  // 채팅방 관련 로직
  const { room, isJoined, handleLeaveRoom, setRoom } = useRoom({
    roomId,
  });

  return (
    <div className="flex flex-col h-screen">
      <ChatRoomHeader
        room={room}
        isJoined={isJoined || false}
        onToggleSidePanel={() => setIsSidePanelOpen(true)}
      />
      {isJoined && (
        <ChatRoomSidePanel
          room={room}
          isOpen={isSidePanelOpen}
          isModalOpen={isCodeModalOpen}
          onClose={() => setIsSidePanelOpen(false)}
          onLeaveRoom={handleLeaveRoom}
          onShowCode={() => setIsCodeModalOpen(true)}
        />
      )}

      {isJoined ? (
        <ChatRoomContent
          roomId={roomId}
          isJoined={isJoined}
          participants={room.participants}
          setRoom={setRoom}
        />
      ) : (
        <ChatRoomContentForJoin roomId={roomId} />
      )}
      <RoomCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        roomId={roomId}
      />
    </div>
  );
};

export const ChatRoomWrapper = ({ roomId }: Props) => {
  return (
    <CustomSuspense fallback={<ChatRoomSkeleton />}>
      <ChatRoom roomId={roomId} />
    </CustomSuspense>
  );
};
