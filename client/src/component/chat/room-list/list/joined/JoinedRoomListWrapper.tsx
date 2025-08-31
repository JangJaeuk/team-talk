"use client";

import { CustomSuspense } from "@/component/common/CustomSuspense";
import { useCreateRoomMutation } from "@/hook/mutation/room/useCreateRoomMutation";
import { CreateRoomRq } from "@/rqrs/room/createRoomRq";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateRoomModal } from "../../modal/CreateRoomModal";
import { RoomSearchBar } from "../../tool/RoomSearchBar";
import { JoinedRoomListContent } from "./JoinedRoomListContent";
import { JoinedRoomListSkeleton } from "./JoinedRoomListSkeleton";

export const JoinedRoomListWrapper = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { createRoom } = useCreateRoomMutation(
    (id: string) => {
      setShowCreateModal(false);
      router.push(`/rooms/${id}`);
    },
    (error) => {
      console.error("Failed to create room:", error);
      alert("방 생성에 실패했습니다.");
    }
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCreateRoom = async (data: CreateRoomRq) => {
    createRoom(data);
  };

  return (
    <div className="h-full flex flex-col">
      <RoomSearchBar
        searchQuery={searchQuery}
        searchPlaceholder="채팅방 검색..."
        buttonText="방 만들기"
        onSearch={handleSearch}
        onClickButton={() => setShowCreateModal(true)}
      />

      <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
        <CustomSuspense fallback={<JoinedRoomListSkeleton />}>
          <JoinedRoomListContent query={searchQuery} />
        </CustomSuspense>
      </div>

      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateRoom}
      />
    </div>
  );
};
