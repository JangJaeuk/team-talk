"use client";

import { useMessages } from "@/hook/chat/room/message/useMessages";
import { useTyping } from "@/hook/chat/room/message/useTyping";
import { useRoom } from "@/hook/chat/room/useRoom";
import { useRoomSocket } from "@/hook/chat/room/useRoomSocket";
import { useAuthStore } from "@/store/useAuthStore";
import { formatDate, isSameDay } from "@/util/date";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChatRoomContentForJoin } from "./ChatRoomContentForJoin";
import { ChatRoomSkeleton } from "./ChatRoomSkeleton";
import { MessageForm } from "./form/MessageForm";
import { ChatRoomHeader } from "./layout/ChatRoomHeader";
import { ChatRoomSidePanel } from "./layout/ChatRoomSidePanel";
import { SystemMessage } from "./message/SystemMessage";
import { UserMessage } from "./message/UserMessage";
import { RoomCodeModal } from "./modal/RoomCodeModal";

interface Props {
  roomId: string;
}

export const ChatRoom = ({ roomId }: Props) => {
  const { user } = useAuthStore();
  const router = useRouter();
  const [activeMenuMessageId, setActiveMenuMessageId] = useState<string | null>(
    null
  );
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  // 채팅방 관련 로직
  const { room, isJoined, handleLeaveRoom, setRoom } = useRoom({
    roomId,
  });

  // 메시지 관련 로직
  const {
    messages,
    hasMore,
    chatContainerRef,
    messageEndRef,
    isLoading: isMessagesLoading,
    loadMoreRef,
    handleNewMessage,
    formatTimestamp,
    setMessages,
  } = useMessages({
    roomId,
    isJoined: isJoined || false,
  });

  // 타이핑 관련 로직
  const { sendMessage, sendTypingStatus } = useRoomSocket(roomId, {
    onMessage: handleNewMessage,
    onRoomJoinSuccess: (updatedRoom) => setRoom(updatedRoom),
    onRoomLeaveSuccess: () => router.push("/rooms"),
    onMessageRead: (messageId, readBy) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, readBy } : msg))
      );
    },
  });

  const { newMessage, setNewMessage, handleInputChange, getTypingMessage } =
    useTyping({
      messages,
      userId: user?.id,
      onTypingChange: sendTypingStatus,
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    sendMessage(newMessage.trim());
    setNewMessage("");
  };

  // 방 정보나 메시지 로딩 중일 때 스켈레톤 UI 표시
  if (!room || isMessagesLoading) {
    return <ChatRoomSkeleton />;
  }

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
          onClose={() => setIsSidePanelOpen(false)}
          onLeaveRoom={handleLeaveRoom}
          onShowCode={() => setIsCodeModalOpen(true)}
        />
      )}

      {isJoined ? (
        <>
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col-reverse pl-2 pr-4 pt-4 pb-0 sm:pb-4 relative z-10"
          >
            <div key="typing-indicator" className="text-gray-500 text-sm mb-2">
              {getTypingMessage()}
            </div>

            {messages.map((msg, index) => {
              const currentDate = new Date(msg.createdAt);
              const prevMessage = messages[index + 1];
              const prevDate = prevMessage
                ? new Date(prevMessage.createdAt)
                : null;

              // 날짜가 바뀌는 지점이거나 첫 메시지인 경우 날짜 구분선 추가
              const showDateDivider =
                !prevDate || !isSameDay(currentDate, prevDate);

              return (
                <div key={msg.id}>
                  {showDateDivider && (
                    <SystemMessage
                      message={{
                        id: `date-${msg.id}`,
                        content: formatDate(currentDate),
                        type: msg.type,
                        sender: msg.sender,
                        roomId: msg.roomId,
                        createdAt: msg.createdAt,
                        isEdited: false,
                        readBy: [],
                      }}
                    />
                  )}
                  {(() => {
                    // 시스템 생성 메시지는 보여주지 않음
                    if (msg.type === "system:create") return null;

                    // 시스템 메시지 (참여/퇴장)
                    if (msg.type?.startsWith("system")) {
                      return <SystemMessage message={msg} />;
                    }

                    // 일반 메시지
                    return (
                      <UserMessage
                        message={msg}
                        prevMessage={messages[index + 1]}
                        activeMenuMessageId={activeMenuMessageId}
                        participants={room?.participants || []}
                        formatTimestamp={formatTimestamp}
                        setActiveMenuMessageId={setActiveMenuMessageId}
                      />
                    );
                  })()}
                </div>
              );
            })}

            {hasMore && (
              <div
                ref={loadMoreRef}
                className="sticky bottom-0 left-0 right-0 flex justify-center py-4 bg-white/80 backdrop-blur-sm"
              >
                <div className="h-8 w-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            )}

            <div ref={messageEndRef} />
          </div>

          <MessageForm
            newMessage={newMessage}
            onSubmit={handleSubmit}
            onChange={handleInputChange}
          />
        </>
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
