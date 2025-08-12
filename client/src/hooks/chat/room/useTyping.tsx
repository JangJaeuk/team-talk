import { useChatStore } from "@/store/useChatStore";
import { Message } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseTypingProps {
  messages: Message[];
  userId?: string;
  onTypingChange: (isTyping: boolean) => void;
}

export const useTyping = ({
  messages,
  userId,
  onTypingChange,
}: UseTypingProps) => {
  const { typingUsers } = useChatStore();
  const [newMessage, setNewMessage] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getTypingUserNickname = useCallback(
    (typingUserId: string) => {
      const userMessage = messages.find(
        (msg) => msg.sender.id === typingUserId
      );
      return userMessage?.sender.nickname || "누군가";
    },
    [messages]
  );

  const getTypingMessage = useCallback(() => {
    const typingUserIds = Object.entries(typingUsers)
      .filter(([id, isTyping]) => isTyping && id !== userId)
      .map(([id]) => id);

    if (typingUserIds.length === 0) return null;

    const nicknames = typingUserIds.map(getTypingUserNickname);

    if (nicknames.length === 1) {
      return (
        <div key="typing-indicator" className="text-gray-500 text-sm mb-2">
          {nicknames[0]}님이 입력하고 있습니다...
        </div>
      );
    }

    return (
      <div key="typing-indicator" className="text-gray-500 text-sm mb-2">
        {nicknames[0]}님 외 {nicknames.length - 1}명이 입력하고 있습니다...
      </div>
    );
  }, [typingUsers, userId, getTypingUserNickname]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setNewMessage(value);

      if (value.length > 0) {
        onTypingChange(true);

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          onTypingChange(false);
        }, 3000);
      } else {
        onTypingChange(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    },
    [onTypingChange]
  );

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    newMessage,
    setNewMessage,
    handleInputChange,
    getTypingMessage,
  };
};
