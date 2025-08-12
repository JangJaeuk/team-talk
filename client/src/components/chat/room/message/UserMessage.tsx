import type { Message } from "@/types";
import { FC } from "react";

interface Props {
  message: Message;
  userId?: string;
  formatTimestamp: (timestamp: Message["createdAt"]) => string;
  activeMenuMessageId: string | null;
  setActiveMenuMessageId: (id: string | null) => void;
  MessageSettingsMenu: FC<{
    message: Message;
    participants: string[];
    messages: Message[];
    activeMenuMessageId: string | null;
    setActiveMenuMessageId: (id: string | null) => void;
  }>;
  participants: string[];
  messages: Message[];
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
}: Props) => {
  const isCurrentUser = message.sender.id === userId;

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
        <div
          className={`p-2 rounded-lg w-full break-words ${
            isCurrentUser ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          <div className="font-bold text-sm">{message.sender.nickname}</div>
          <div>{message.content}</div>
          <div className="text-xs opacity-75">
            <span>{formatTimestamp(message.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
