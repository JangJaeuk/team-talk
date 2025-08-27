"use client";

import { useMessages } from "@/hooks/chat/room/useMessages";
import { useRoom } from "@/hooks/chat/room/useRoom";
import { useRoomSocket } from "@/hooks/chat/room/useRoomSocket";
import { useTyping } from "@/hooks/chat/room/useTyping";
import { useAuthStore } from "@/store/useAuthStore";
import { formatDate, isSameDay } from "@/utils/date";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChatRoomSkeleton } from "./ChatRoomSkeleton";
import { MessageForm } from "./form/MessageForm";
import { ChatRoomHeader } from "./layout/ChatRoomHeader";
import { MessageSettingsMenu } from "./message/MessageSettingsMenu";
import { SystemMessage } from "./message/SystemMessage";
import { UserMessage } from "./message/UserMessage";

interface Props {
  roomId: string;
}

export const ChatRoom = ({ roomId }: Props) => {
  const { user } = useAuthStore();
  const router = useRouter();
  const [activeMenuMessageId, setActiveMenuMessageId] = useState<string | null>(
    null
  );

  // 채팅방 관련 로직
  const { room, isJoined, handleJoinRoom, handleLeaveRoom, setRoom } = useRoom({
    roomId,
  });

  // 메시지 관련 로직
  const {
    messages,
    hasMore,
    loadMoreRef,
    handleNewMessage,
    formatTimestamp,
    setMessages,
    chatContainerRef,
    messageEndRef,
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

  // 방 정보 로딩 중일 때 스켈레톤 UI 표시
  if (!room) {
    return <ChatRoomSkeleton />;
  }

  return (
    <div className="flex flex-col h-screen">
      <ChatRoomHeader
        room={room}
        isJoined={isJoined || false}
        onJoinRoom={handleJoinRoom}
        onLeaveRoom={handleLeaveRoom}
      />

      {isJoined ? (
        <>
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col-reverse p-4"
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
                        type: "system",
                        sender: msg.sender,
                        roomId: msg.roomId,
                        createdAt: msg.createdAt,
                        isEdited: false,
                        readBy: [],
                      }}
                    />
                  )}
                  {msg.type === "system" ? (
                    <SystemMessage message={msg} />
                  ) : (
                    <UserMessage
                      message={msg}
                      userId={user?.id}
                      formatTimestamp={formatTimestamp}
                      activeMenuMessageId={activeMenuMessageId}
                      MessageSettingsMenu={MessageSettingsMenu}
                      participants={room?.participants || []}
                      messages={messages}
                      setActiveMenuMessageId={setActiveMenuMessageId}
                    />
                  )}
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
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              이 채팅방에 참여하려면 먼저 가입해주세요.
            </p>
            <button
              onClick={handleJoinRoom}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              방 가입하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
