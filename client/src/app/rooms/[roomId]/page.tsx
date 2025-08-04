"use client";

import { useSocket } from "@/hooks/useSocket";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { ChatRoom, Message } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const router = useRouter();
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: "50px",
  });
  const prevInViewRef = useRef(inView);

  // 채팅방 정보 가져오기
  const fetchRoomInfo = async () => {
    try {
      const response = await api.get(`/rooms/${roomId}`);
      setRoom(response.data);
    } catch (error) {
      console.error("Error fetching room info:", error);
    }
  };

  useEffect(() => {
    fetchRoomInfo();
  }, [roomId]);

  const isScrolledToBottom = () => {
    const container = chatContainerRef.current;
    if (!container) return false;

    const threshold = 50; // 50px 정도의 여유를 둠
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <=
      threshold
    );
  };

  const scrollToBottom = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const fetchMessages = async (lastMessageId?: string) => {
    if (isLoading || !hasMore) return;

    try {
      setIsLoading(true);
      const response = await api.get(`/rooms/${roomId}/messages`, {
        params: {
          limit: 30,
          lastMessageId,
        },
      });

      const { messages: newMessages, hasNextPage } = response.data;

      setMessages((prev) => {
        const existingMessageIds = new Set(prev.map((msg) => msg.id));
        const uniqueNewMessages = newMessages.filter(
          (msg: Message) => !existingMessageIds.has(msg.id)
        );
        return [...prev, ...uniqueNewMessages];
      });

      setHasMore(hasNextPage);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewMessage = useCallback(
    (message: Message) => {
      setMessages((prev) => {
        // 이미 존재하는 메시지인지 확인
        if (prev.some((msg) => msg.id === message.id)) {
          return prev;
        }
        return [message, ...prev];
      });

      // 내가 보낸 메시지이거나 스크롤이 아래에 있을 때만 스크롤
      if (message.sender.id === user?.id || isScrolledToBottom()) {
        scrollToBottom();
      }
    },
    [user?.id]
  );

  const { sendMessage } = useSocket(roomId as string, {
    onMessage: handleNewMessage,
  });

  // 초기 메시지 로드
  useEffect(() => {
    setMessages([]); // 방이 바뀌면 메시지 초기화
    setHasMore(true); // hasMore 초기화
    fetchMessages();
  }, [roomId]);

  // 무한 스크롤
  useEffect(() => {
    // inView가 false -> true로 변경될 때만 API 호출
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    sendMessage(newMessage.trim());
    setNewMessage("");
  };

  const formatTimestamp = (timestamp: Message["createdAt"]) => {
    const date = new Date(
      timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000
    );
    return date.toLocaleString();
  };

  return (
    <div className="flex flex-col h-screen">
      {/* 채팅방 헤더 */}
      <div className="bg-white border-b p-4 flex items-center gap-4 shadow-sm">
        <button
          onClick={() => router.push("/rooms")}
          className="text-gray-600 hover:text-gray-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-semibold">
            {room?.name || "로딩 중..."}
          </h1>
          {room?.description && (
            <p className="text-sm text-gray-500">{room.description}</p>
          )}
        </div>
      </div>

      {/* 채팅 영역 */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto flex flex-col-reverse p-4"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 ${
              msg.sender.id === user?.id ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block p-2 rounded-lg ${
                msg.sender.id === user?.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              <div className="font-bold text-sm">{msg.sender.nickname}</div>
              <div>{msg.content}</div>
              <div className="text-xs opacity-75">
                {formatTimestamp(msg.createdAt)}
              </div>
            </div>
          </div>
        ))}

        {hasMore && (
          <div ref={loadMoreRef} className="text-center py-4">
            {isLoading ? "메시지 불러오는 중..." : "이전 메시지 불러오기"}
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            전송
          </button>
        </div>
      </form>
    </div>
  );
}
