import { socketClient } from "@/lib/socket";
import { messageKeys, messageQueries } from "@/query/message";
import type { MessageRs } from "@/rqrs/message/messageRs";
import { useAuthStore } from "@/store/useAuthStore";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

interface UseMessagesProps {
  roomId: string;
  isJoined: boolean;
  onNewMessage?: (message: MessageRs) => void;
}

export const useMessages = ({
  roomId,
  isJoined,
  onNewMessage,
}: UseMessagesProps) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showScrollDown, setShowScrollDown] = useState(false);
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

    const threshold = 100;
    // flex-col-reverse에서는 scrollTop이 0에 가까울수록 맨 아래(최신 메시지)에 있는 것
    return Math.abs(container.scrollTop) <= threshold;
  }, []);

  const scrollToBottom = useCallback(() => {
    chatContainerRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const handleNewMessage = useCallback(
    (message: MessageRs) => {
      queryClient.setQueryData(
        messageKeys.list(roomId),
        (
          oldData:
            | {
                pages: { messages: MessageRs[]; hasNextPage: boolean }[];
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

      // 메시지가 DOM에 렌더링된 후 처리
      setTimeout(() => {
        if (message.sender.id === user?.id) {
          scrollToBottom();
        } else if (!isScrolledToBottom()) {
          setShowScrollDown(true);
        }
      }, 0);

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

  useEffect(() => {
    const handleScroll = () => {
      const isBottom = isScrolledToBottom();
      if (isBottom) {
        setShowScrollDown(false);
      }
    };

    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [isScrolledToBottom]);

  const messages = data?.pages.flatMap((page) => page.messages) ?? [];

  const setMessages = (
    updater: MessageRs[] | ((prev: MessageRs[]) => MessageRs[])
  ) => {
    const newMessages =
      typeof updater === "function" ? updater(messages) : updater;
    queryClient.setQueryData(messageKeys.list(roomId), {
      pages: [{ messages: newMessages, hasNextPage: false }],
      pageParams: [undefined],
    });
  };

  return {
    messages,
    isLoading,
    hasMore: hasNextPage,
    chatContainerRef,
    messageEndRef,
    showScrollDown,
    loadMoreRef,
    handleNewMessage,
    isScrolledToBottom,
    scrollToBottom,
    setMessages,
  };
};
