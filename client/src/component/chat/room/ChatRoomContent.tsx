"use client";

import { useMessages } from "@/hook/chat/room/message/useMessages";
import { useTyping } from "@/hook/chat/room/message/useTyping";
import { useRoomSocket } from "@/hook/chat/room/useRoomSocket";
import { ParticipantRs } from "@/rqrs/room/participantRs";
import { RoomRs } from "@/rqrs/room/roomRs";
import { useAuthStore } from "@/store/useAuthStore";
import { formatDate, isSameDay } from "@/util/date";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MessageForm } from "./form/MessageForm";
import { SystemMessage } from "./message/SystemMessage";
import { UserMessage } from "./message/UserMessage";

interface Props {
  roomId: string;
  isJoined: boolean;
  participants: ParticipantRs[];
  setRoom: (room: RoomRs) => void;
}

export const ChatRoomContent = ({
  roomId,
  isJoined,
  participants,
  setRoom,
}: Props) => {
  const { user } = useAuthStore();
  const router = useRouter();

  const [activeMenuMessageId, setActiveMenuMessageId] = useState<string | null>(
    null
  );

  // 메시지 관련 로직
  const {
    messages,
    hasMore,
    chatContainerRef,
    messageEndRef,
    showScrollDown,
    loadMoreRef,
    handleNewMessage,
    setMessages,
    scrollToBottom,
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

  return (
    <>
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col-reverse pl-2 pr-4 pt-4 pb-10 relative z-10 custom-scrollbar"
      >
        {messages.map((msg, index) => {
          const currentDate = new Date(msg.createdAt);
          const prevMessage = messages[index + 1];
          const prevDate = prevMessage ? new Date(prevMessage.createdAt) : null;

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
                    participants={participants || []}
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

      {getTypingMessage() && (
        <div className="absolute bottom-[64px] sm:bottom-[90px] left-4 z-[60]">
          <div className="inline-flex items-center gap-1 bg-white text-gray-500 text-sm px-4 py-2 rounded-lg shadow-md">
            {getTypingMessage()}
            <span className="flex gap-1">
              <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" />
              <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </span>
          </div>
        </div>
      )}
      {showScrollDown && (
        <div className="absolute bottom-[72px] sm:bottom-[98px] left-1/2 -translate-x-1/2 z-[60]">
          <button
            onClick={scrollToBottom}
            className="inline-flex items-center gap-1 bg-white text-gray-500 text-sm px-4 py-2 rounded-full shadow-md hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
            새 메시지
          </button>
        </div>
      )}
      <MessageForm
        newMessage={newMessage}
        onSubmit={handleSubmit}
        onChange={handleInputChange}
      />
    </>
  );
};
