"use client";

import { useJoinedRoomList } from "@/hook/chat/room-list/joined/useJoinedRoomList";
import { useJoinedRoomListSocket } from "@/hook/chat/room-list/joined/useJoinedRoomListSocket";
import { useCreateRoomMutation } from "@/hook/mutation/room/useCreateRoomMutation";
import { CreateRoomRq } from "@/rqrs/room/createRoomRq";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateRoomModal } from "../../modal/CreateRoomModal";
import { RoomSearchBar } from "../../tool/RoomSearchBar";
import { JoinedRoomList } from "./JoinedRoomList";
import { JoinedRoomListEmpty } from "./JoinedRoomListEmpty";

export const JoinedRoomListWrapper = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { filteredRooms, fetchRooms } = useJoinedRoomList({
    query: searchQuery,
  });

  const { handleEnterRoom } = useJoinedRoomListSocket({
    onJoinRoom: (roomId: string) => {
      router.push(`/rooms/${roomId}`);
    },
    fetchRooms: async () => {
      await fetchRooms();
    },
  });

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
        {filteredRooms.length > 0 ? (
          <JoinedRoomList rooms={filteredRooms} onEnterRoom={handleEnterRoom} />
        ) : (
          <JoinedRoomListEmpty />
        )}
      </div>

      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateRoom}
      />
    </div>
  );
};
