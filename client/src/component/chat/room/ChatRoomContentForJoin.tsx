import { useJoinRoomMutation } from "@/hook/mutation/room/useJoinRoomMutation";
import { roomKeys } from "@/query/room";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { JoinRoomModal } from "./modal/JoinRoomModal";

interface Props {
  roomId: string;
}

export const ChatRoomContentForJoin = ({ roomId }: Props) => {
  const queryClient = useQueryClient();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const { joinRoom, isPending: isJoinPending } = useJoinRoomMutation(
    (id: string) => {
      setIsJoinModalOpen(false);
      alert("채팅방에 참여했습니다.");
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(id) });
    },
    (error) => {
      console.error("Failed to join room:", error);
      if (error.errorMessage === "Invalid room code") {
        alert("잘못된 방 코드입니다.");
      } else {
        alert("채팅방 참여에 실패했습니다.");
      }
    }
  );

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 mb-4">
          이 채팅방에 참여하려면 먼저 가입해주세요.
        </p>
        <button
          onClick={() => setIsJoinModalOpen(true)}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          방 가입하기
        </button>
        <JoinRoomModal
          isOpen={isJoinModalOpen}
          isPending={isJoinPending}
          onClose={() => setIsJoinModalOpen(false)}
          onSubmit={(code) => {
            joinRoom({ id: roomId, code });
          }}
        />
      </div>
    </div>
  );
};
