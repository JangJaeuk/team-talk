"use client";

import { useSocket } from "@/hooks/useSocket";
import api from "@/lib/axios";
import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import type { ChatRoom as ChatRoomType, Message } from "@/types";
import { useRouter } from "next/navigation";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

interface Props {
  roomId: string;
}

const ChatRoom: FC<Props> = ({ roomId }) => {
  const { user } = useAuthStore();
  const { typingUsers } = useChatStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [room, setRoom] = useState<ChatRoomType | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: "50px",
  });
  const prevInViewRef = useRef(inView);

  // 방 가입 여부 확인
  const isJoined = room?.participants.includes(user?.id || "");

  // 방 가입
  const handleJoinRoom = () => {
    if (!user) return;
    const socket = getSocket();
    socket.emit("room:join", roomId);
  };

  // 방 탈퇴
  const handleLeaveRoom = () => {
    if (!user) return;
    const socket = getSocket();
    socket.emit("room:leave", roomId);
    router.push("/rooms"); // 방 목록으로 이동
  };

  // 채팅방 정보 가져오기
  const fetchRoomInfo = useCallback(async () => {
    try {
      const response = await api.get(`/rooms/${roomId}`);
      setRoom(response.data);
    } catch (error) {
      console.error("Error fetching room info:", error);
    }
  }, [roomId]);

  const isScrolledToBottom = useCallback(() => {
    const container = chatContainerRef.current;
    if (!container) return false;

    const threshold = 50; // 50px 정도의 여유를 둠
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
        const response = await api.get(`/rooms/${roomId}/messages`, {
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

          // 새로 로드된 메시지들 자동 읽음 처리
          if (user && isJoined) {
            const socket = getSocket();
            uniqueNewMessages.forEach((msg: Message) => {
              socket.emit("message:read", msg.id);
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
        // 이미 존재하는 메시지인지 확인
        if (prev.some((msg) => msg.id === message.id)) {
          return prev;
        }
        // readBy 필드가 없는 경우 빈 배열로 초기화
        const messageWithReadBy = {
          ...message,
          readBy: message.readBy || [],
        };
        return [messageWithReadBy, ...prev];
      });

      // 내가 보낸 메시지이거나 스크롤이 아래에 있을 때만 스크롤
      if (message.sender.id === user?.id || isScrolledToBottom()) {
        scrollToBottom();
      }

      // 메시지를 받으면 자동으로 읽음 처리
      if (user && isJoined) {
        const socket = getSocket();
        socket.emit("message:read", message.id);
      }
    },
    [user, isJoined, isScrolledToBottom, scrollToBottom]
  );

  useEffect(() => {
    fetchRoomInfo();
  }, [roomId]);

  const { sendMessage, sendTypingStatus } = useSocket(roomId, {
    onMessage: handleNewMessage,
    onRoomJoinSuccess: (updatedRoom) => setRoom(updatedRoom),
    onRoomLeaveSuccess: () => router.push("/rooms"),
    onMessageRead: (messageId, readBy) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, readBy } : msg))
      );
    },
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    // 타이핑 상태 전송
    if (value.length > 0) {
      sendTypingStatus(true);

      // 이전 타이머 취소
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // 3초 후에 타이핑 상태 해제
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStatus(false);
      }, 3000);
    } else {
      sendTypingStatus(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const formatTimestamp = (timestamp: Message["createdAt"]) => {
    const date = new Date(
      timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000
    );
    return date.toLocaleString();
  };

  // 전역 상태로 현재 열려있는 메뉴의 메시지 ID 관리
  const [activeMenuMessageId, setActiveMenuMessageId] = useState<string | null>(
    null
  );

  // 메시지 설정 메뉴 컴포넌트
  const MessageSettingsMenu: FC<{
    message: Message;
    participants: string[];
  }> = ({ message, participants }) => {
    const [showReadBy, setShowReadBy] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const showMenu = message.id === activeMenuMessageId;

    const handleSettingsClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // 이벤트 버블링 방지
      setActiveMenuMessageId(showMenu ? null : message.id);
      if (showReadBy) setShowReadBy(false);
    };

    const handleReadByClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // 이벤트 버블링 방지
      setShowReadBy(true);
    };

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          menuRef.current &&
          !menuRef.current.contains(event.target as Node)
        ) {
          setActiveMenuMessageId(null);
          if (!showReadBy) setShowReadBy(false);
        }
      };

      if (showMenu) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }
    }, [showMenu, showReadBy, message.id]);

    return (
      <div ref={menuRef} className="relative">
        <div className="relative">
          <button
            onClick={handleSettingsClick}
            className="p-1 rounded-full hover:bg-gray-100"
            title="메시지 설정"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
              />
            </svg>
          </button>
          {showMenu && (
            <div className="absolute right-full mr-1 top-0 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]">
              <button
                onClick={handleReadByClick}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              >
                읽은 사람 보기
              </button>
              {showReadBy && (
                <div
                  className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px] max-w-[300px]"
                  style={{
                    top: menuRef.current?.getBoundingClientRect().top || 0,
                    left:
                      (menuRef.current?.getBoundingClientRect().left || 0) -
                      340, // 300px width + 40px gap
                  }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold">읽은 사람</h3>
                    <button
                      onClick={() => setShowReadBy(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {participants
                      .filter((participantId) => participantId !== user?.id)
                      .sort((a, b) => {
                        const aRead = message.readBy.some(
                          (read) => read.userId === a
                        );
                        const bRead = message.readBy.some(
                          (read) => read.userId === b
                        );
                        if (aRead && !bRead) return -1;
                        if (!aRead && bRead) return 1;
                        return 0;
                      })
                      .map((participantId) => {
                        const participant = messages.find(
                          (msg) => msg.sender.id === participantId
                        )?.sender;
                        if (!participant) return null;
                        const hasRead = message.readBy.some(
                          (read) => read.userId === participantId
                        );
                        return (
                          <div
                            key={participantId}
                            className={`flex items-center justify-between p-1.5 rounded text-sm ${
                              hasRead ? "bg-blue-50" : "bg-gray-50"
                            }`}
                          >
                            <span className="font-medium">
                              {participant.nickname}
                            </span>
                            <span
                              className={
                                hasRead ? "text-blue-600" : "text-gray-500"
                              }
                            >
                              {hasRead ? "읽음" : "읽지 않음"}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 타이핑 중인 사용자의 닉네임 찾기
  const getTypingUserNickname = (userId: string) => {
    // messages 배열에서 해당 사용자의 가장 최근 메시지 찾기
    const userMessage = messages.find((msg) => msg.sender.id === userId);
    return userMessage?.sender.nickname || "누군가";
  };

  // 타이핑 중인 사용자들의 메시지 생성
  const getTypingMessage = () => {
    const typingUserIds = Object.entries(typingUsers)
      .filter(([userId, isTyping]) => isTyping && userId !== user?.id)
      .map(([userId]) => userId);

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
  };

  return (
    <div className="flex flex-col h-screen">
      {/* 채팅방 헤더 */}
      <div className="bg-white border-b p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
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
        <div className="flex items-center gap-2">
          {isJoined ? (
            <button
              onClick={handleLeaveRoom}
              className="px-4 py-2 text-red-500 hover:text-red-600 border border-red-500 rounded"
            >
              방 탈퇴
            </button>
          ) : (
            <button
              onClick={handleJoinRoom}
              className="px-4 py-2 text-blue-500 hover:text-blue-600 border border-blue-500 rounded"
            >
              방 가입
            </button>
          )}
        </div>
      </div>

      {/* 채팅 영역 */}
      {isJoined ? (
        <>
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col-reverse p-4"
          >
            {/* 타이핑 표시기 */}
            {getTypingMessage()}

            {messages.map((msg) =>
              msg.type === "system" ? (
                <div key={msg.id} className="mb-2 text-center">
                  <div className="inline-block px-4 py-1 rounded-full bg-gray-100 text-gray-600 text-sm">
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div
                  key={msg.id}
                  className={`mb-2 flex ${
                    msg.sender.id === user?.id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`relative group flex ${
                      msg.sender.id === user?.id
                        ? "flex-row-reverse"
                        : "flex-row"
                    } max-w-[70%]`}
                  >
                    {msg.sender.id === user?.id && (
                      <div
                        className={`absolute -left-8 top-1 ${
                          msg.id !== activeMenuMessageId
                            ? "opacity-0 group-hover:opacity-100 transition-opacity"
                            : ""
                        }`}
                      >
                        <MessageSettingsMenu
                          message={msg}
                          participants={room?.participants || []}
                        />
                      </div>
                    )}
                    <div
                      className={`p-2 rounded-lg w-full break-words ${
                        msg.sender.id === user?.id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      <div className="font-bold text-sm">
                        {msg.sender.nickname}
                      </div>
                      <div>{msg.content}</div>
                      <div className="text-xs opacity-75">
                        <span>{formatTimestamp(msg.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}

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
                onChange={handleInputChange}
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

export default ChatRoom;
