import type { MessageRs } from "@/rqrs/message/messageRs";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";
import { useMemo } from "react";
import { MessageSettingsMenu } from "./menu/MessageSettingsMenu";

interface Props {
  message: MessageRs;
  activeMenuMessageId: string | null;
  participants: { id: string; avatar: string; nickname: string }[];
  prevMessage?: MessageRs;
  formatTimestamp: (timestamp: MessageRs["createdAt"]) => string;
  setActiveMenuMessageId: (id: string | null) => void;
}

export const UserMessage = ({
  message,
  activeMenuMessageId,
  participants,
  prevMessage,
  formatTimestamp,
  setActiveMenuMessageId,
}: Props) => {
  const { user } = useAuthStore();

  const isCurrentUser = message.sender.id === user?.id;

  // 이전 메시지와 현재 메시지 사이의 시간 차이 계산 (3분 = 180000ms)
  const shouldShowProfile = useMemo(() => {
    if (isCurrentUser) return false;
    if (!prevMessage) return true;

    const timeDiff =
      new Date(message.createdAt).getTime() -
      new Date(prevMessage.createdAt).getTime();
    const isDifferentSender =
      prevMessage.sender.id !== message.sender.id ||
      prevMessage.type?.startsWith("system");

    return timeDiff > 180000 || isDifferentSender;
  }, [isCurrentUser, prevMessage, message.sender.id, message.createdAt]);

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
              activeMenuMessageId={activeMenuMessageId}
              setActiveMenuMessageId={setActiveMenuMessageId}
            />
          </div>
        )}
        <div className="flex gap-2">
          {!isCurrentUser && (
            <div className="flex-shrink-0 w-8">
              {shouldShowProfile && (
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
            {!isCurrentUser && shouldShowProfile && (
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
