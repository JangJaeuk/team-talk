import { httpClient } from "@/lib/axios";
import { socketClient } from "@/lib/socket";
import { useAuthStore } from "@/store/useAuthStore";
import type { Message } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

interface UseMessagesProps {
  roomId: string;
  isJoined: boolean;
  onNewMessage?: (message: Message) => void;
}

export const useMessages = ({
  roomId,
  isJoined,
  onNewMessage,
}: UseMessagesProps) => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: "50px",
  });
  const prevInViewRef = useRef(inView);

  const isScrolledToBottom = useCallback(() => {
    const container = chatContainerRef.current;
    if (!container) return false;

    const threshold = 50;
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <=
      threshold
    );
  }, []);

  const scrollToBottom = useCallback(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  const fetchMessages = useCallback(
    async (lastMessageId?: string) => {
      if (isLoading || !hasMore) return;

      try {
        setIsLoading(true);
        const response = await httpClient.get<{
          messages: Message[];
          hasNextPage: boolean;
        }>(`/rooms/${roomId}/messages`, {
          params: {
            limit: 30,
            lastMessageId,
          },
        });

        const { messages: newMessages, hasNextPage } = response.data;

        setMessages((prev) => {
          const existingMessageIds = new Set(prev.map((msg) => msg.id));
          const uniqueNewMessages = newMessages
            .filter((msg: Message) => !existingMessageIds.has(msg.id))
            .map((msg: Message) => ({
              ...msg,
              readBy: msg.readBy || [],
            }));

          if (user && isJoined) {
            uniqueNewMessages.forEach((msg: Message) => {
              socketClient.emitSocket("message:read", msg.id);
            });
          }

          return [...prev, ...uniqueNewMessages];
        });

        setHasMore(hasNextPage);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [roomId, isLoading, hasMore, user, isJoined]
  );

  const handleNewMessage = useCallback(
    (message: Message) => {
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === message.id)) {
          return prev;
        }
        const messageWithReadBy = {
          ...message,
          readBy: message.readBy || [],
        };
        return [messageWithReadBy, ...prev];
      });

      if (message.sender.id === user?.id || isScrolledToBottom()) {
        scrollToBottom();
      }

      if (user && isJoined) {
        socketClient.emitSocket("message:read", message.id);
      }

      onNewMessage?.(message);
    },
    [user, isJoined, isScrolledToBottom, scrollToBottom, onNewMessage]
  );

  const formatTimestamp = (timestamp: Message["createdAt"]) => {
    const date = new Date(
      timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000
    );
    return date.toLocaleString();
  };

  // 초기 메시지 로드 및 무한 스크롤 처리
  useEffect(() => {
    setMessages([]); // 방이 바뀌면 메시지 초기화
    setHasMore(true); // hasMore 초기화
    fetchMessages();
  }, [roomId]);

  useEffect(() => {
    if (
      inView &&
      !prevInViewRef.current &&
      hasMore &&
      !isLoading &&
      messages.length > 0
    ) {
      const lastMessage = messages[messages.length - 1];
      fetchMessages(lastMessage?.id);
    }
    prevInViewRef.current = inView;
  }, [inView, hasMore, isLoading, messages]);

  return {
    messages,
    isLoading,
    hasMore,
    chatContainerRef,
    messageEndRef,
    loadMoreRef,
    handleNewMessage,
    formatTimestamp,
    isScrolledToBottom,
    setMessages,
  };
};
