import { useMessageSettingsMenu } from "@/hook/chat/room/message/useMessageSettingsMenu";
import type { MessageRs } from "@/rqrs/message/messageRs";
import { ParticipantRs } from "@/rqrs/room/participantRs";
import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";
import { MessageReadInfo } from "./board/MessageReadInfo";

interface Props {
  message: MessageRs;
  participants: ParticipantRs[];
  activeMenuMessageId: string | null;
  setActiveMenuMessageId: (id: string | null) => void;
}

export const MessageSettingsMenu = ({
  message,
  participants,
  activeMenuMessageId,
  setActiveMenuMessageId,
}: Props) => {
  const { user } = useAuthStore();
  const [showReadBy, setShowReadBy] = useState(false);
  const showMenu = message.id === activeMenuMessageId;

  const { menuRef, handleSettingsClick, handleReadByClick } =
    useMessageSettingsMenu({
      messageId: message.id,
      showReadBy,
      showMenu,
      setShowReadBy,
      setActiveMenuMessageId,
    });

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
              /
              {
                participants.filter(
                  (participant) => participant.id !== user?.id
                ).length
              }{" "}
              읽음
            </button>
            {showReadBy && (
              <MessageReadInfo
                menuRef={menuRef}
                showReadBy={showReadBy}
                participants={participants}
                message={message}
                user={user}
                setShowReadBy={setShowReadBy}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
