import type { Message } from "@/type";
import Image from "next/image";
import { FC } from "react";

interface Props {
  message: Message;
  userId?: string;
  formatTimestamp: (timestamp: Message["createdAt"]) => string;
  activeMenuMessageId: string | null;
  setActiveMenuMessageId: (id: string | null) => void;
  MessageSettingsMenu: FC<{
    message: Message;
    participants: { id: string; avatar: string; nickname: string }[];
    messages: Message[];
    activeMenuMessageId: string | null;
    setActiveMenuMessageId: (id: string | null) => void;
  }>;
  participants: { id: string; avatar: string; nickname: string }[];
  messages: Message[];
  prevMessage?: Message; // 이전 메시지 정보 추가
}

export const UserMessage = ({
  message,
  userId,
  formatTimestamp,
  activeMenuMessageId,
  setActiveMenuMessageId,
  MessageSettingsMenu,
  participants,
  messages,
  prevMessage,
}: Props) => {
  const isCurrentUser = message.sender.id === userId;

  // 이전 메시지와 현재 메시지 사이의 시간 차이 계산 (3분 = 180000ms)
  const shouldShowProfile = () => {
    if (isCurrentUser) return false; // 내 메시지는 프로필 표시 안 함
    if (!prevMessage) return true; // 첫 메시지는 무조건 프로필 표시

    const timeDiff =
      new Date(message.createdAt).getTime() -
      new Date(prevMessage.createdAt).getTime();
    const isDifferentSender = prevMessage.sender.id !== message.sender.id;

    return timeDiff > 180000 || isDifferentSender;
  };

  return (
    <div
      className={`mb-2 flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`relative group flex ${
          isCurrentUser ? "flex-row-reverse" : "flex-row"
        } max-w-[70%]`}
      >
        {isCurrentUser && (
          <div
            className={`absolute -left-8 top-1 ${
              message.id !== activeMenuMessageId
                ? "opacity-0 group-hover:opacity-100 transition-opacity"
                : ""
            }`}
          >
            <MessageSettingsMenu
              message={message}
              participants={participants}
              messages={messages}
              activeMenuMessageId={activeMenuMessageId}
              setActiveMenuMessageId={setActiveMenuMessageId}
            />
          </div>
        )}
        <div className="flex gap-2">
          {!isCurrentUser && (
            <div className="flex-shrink-0 w-8">
              {shouldShowProfile() && (
                <Image
                  src={`/avatars/${message.sender.avatar ?? "avatar1"}.svg`}
                  alt={message.sender.nickname}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
            </div>
          )}
          <div
            className={`p-2 rounded-lg w-full break-words ${
              isCurrentUser ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {!isCurrentUser && shouldShowProfile() && (
              <div className="font-bold text-sm mb-1">
                {message.sender.nickname}
              </div>
            )}
            <div>{message.content}</div>
            <div className="text-xs opacity-75">
              <span>{formatTimestamp(message.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
