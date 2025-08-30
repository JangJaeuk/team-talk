import { useAuthStore } from "@/store/useAuthStore";
import type { Message } from "@/types";
import { useEffect, useRef, useState } from "react";

interface Props {
  message: Message;
  participants: string[];
  messages: Message[];
  activeMenuMessageId: string | null;
  setActiveMenuMessageId: (id: string | null) => void;
}

export const MessageSettingsMenu = ({
  message,
  participants,
  messages,
  activeMenuMessageId,
  setActiveMenuMessageId,
}: Props) => {
  const { user } = useAuthStore();
  const [showReadBy, setShowReadBy] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const showMenu = message.id === activeMenuMessageId;

  useEffect(() => {
    if (showReadBy) {
      // 모달이 마운트된 직후 애니메이션 시작
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
    }
  }, [showReadBy]);

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuMessageId(showMenu ? null : message.id);
    if (showReadBy) setShowReadBy(false);
  };

  const handleReadByClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReadBy(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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
  }, [showMenu, showReadBy, message.id, setActiveMenuMessageId]);

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
              {message.readBy.filter((read) => read.userId !== user?.id).length}
              /{participants.filter((id) => id !== user?.id).length} 읽음
            </button>
            {showReadBy && (
              <>
                {/* 데스크톱 팝오버 */}
                <div
                  className="hidden sm:block fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px] max-w-[300px]"
                  style={{
                    top: menuRef.current?.getBoundingClientRect().top || 0,
                    left:
                      (menuRef.current?.getBoundingClientRect().left || 0) -
                      340,
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
                {/* 모바일 전체 화면 모달 */}
                <div
                  className="sm:hidden fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
                  style={{ opacity: isAnimating ? 1 : 0 }}
                >
                  <div
                    className="flex flex-col h-[80vh] bg-white absolute inset-x-0 bottom-0 transition-all duration-300 ease-out"
                    style={{
                      transform: isAnimating
                        ? "translateY(0)"
                        : "translateY(100%)",
                    }}
                  >
                    <div className="sticky top-0 bg-white border-b border-gray-100">
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold">읽은 사람</h3>
                        </div>
                        <button
                          onClick={() => setShowReadBy(false)}
                          className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                      <div className="space-y-2">
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
                                className={`flex items-center justify-between p-3 rounded-lg text-sm ${
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
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
