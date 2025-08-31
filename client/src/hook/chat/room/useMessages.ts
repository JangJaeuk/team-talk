import { socketClient } from "@/lib/socket";
import { messageKeys, messageQueries } from "@/query/message";
import { useAuthStore } from "@/store/useAuthStore";
import type { Message } from "@/type";
import { formatTime } from "@/util/date";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
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
  const queryClient = useQueryClient();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "300px",
  });

  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: messageKeys.list(roomId),
    queryFn: async ({ pageParam }) => {
      const { queryFn } = messageQueries.list(roomId, pageParam);
      return queryFn();
    },
    staleTime: 0,
    enabled: !!roomId && isJoined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNextPage) return undefined;
      const lastMessage = lastPage.messages[lastPage.messages.length - 1];
      return lastMessage?.id;
    },
    initialPageParam: undefined as string | undefined,
  });

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

  const handleNewMessage = useCallback(
    (message: Message) => {
      queryClient.setQueryData(
        messageKeys.list(roomId),
        (
          oldData:
            | {
                pages: { messages: Message[]; hasNextPage: boolean }[];
                pageParams: unknown[];
              }
            | undefined
        ) => {
          if (!oldData?.pages?.length) {
            return {
              pages: [{ messages: [message], hasNextPage: false }],
              pageParams: [undefined],
            };
          }

          const messageWithReadBy = {
            ...message,
            readBy: message.readBy || [],
          };

          return {
            ...oldData,
            pages: [
              {
                messages: [messageWithReadBy, ...oldData.pages[0].messages],
                hasNextPage: oldData.pages[0].hasNextPage,
              },
              ...oldData.pages.slice(1),
            ],
          };
        }
      );

      if (message.sender.id === user?.id || isScrolledToBottom()) {
        scrollToBottom();
      }

      if (user && isJoined) {
        socketClient.emitSocket("message:read", message.id);
      }

      onNewMessage?.(message);
    },
    [
      queryClient,
      roomId,
      user,
      isJoined,
      isScrolledToBottom,
      scrollToBottom,
      onNewMessage,
    ]
  );

  const formatTimestamp = (timestamp: Message["createdAt"]) => {
    return formatTime(new Date(timestamp));
  };

  // 무한 스크롤 처리
  useEffect(() => {
    const loadNextPage = async () => {
      if (!inView || !hasNextPage || isLoadingRef.current) return;

      try {
        isLoadingRef.current = true;
        await fetchNextPage();
      } finally {
        isLoadingRef.current = false;
      }
    };

    loadNextPage();
  }, [inView, hasNextPage, fetchNextPage]);

  const messages = data?.pages.flatMap((page) => page.messages) ?? [];

  return {
    messages,
    isLoading,
    hasMore: !!hasNextPage,
    chatContainerRef,
    messageEndRef,
    loadMoreRef,
    handleNewMessage,
    formatTimestamp,
    isScrolledToBottom,
    setMessages: (updater: Message[] | ((prev: Message[]) => Message[])) => {
      const newMessages =
        typeof updater === "function" ? updater(messages) : updater;
      queryClient.setQueryData(messageKeys.list(roomId), {
        pages: [{ messages: newMessages, hasNextPage: false }],
        pageParams: [undefined],
      });
    },
  };
};
