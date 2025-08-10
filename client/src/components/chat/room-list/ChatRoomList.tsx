"use client";

import { useRoomList } from "@/hooks/chat/room-list/useRoomList";
import { useRoomListSocket } from "@/hooks/chat/room-list/useRoomListSocket";
import { httpClient } from "@/lib/axios";
import { RoomFormData } from "@/types/room";
import { useState } from "react";
import { AvailableRoomList } from "./list/AvailableRoomList";
import { JoinedRoomList } from "./list/JoinedRoomList";
import { CreateRoomModal } from "./modal/CreateRoomModal";
import { RoomSearchBar } from "./tool/RoomSearchBar";

interface Props {
  onJoinRoom: (roomId: string) => void;
}

const ChatRoomList = ({ onJoinRoom }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    isLoading,
    fetchRooms,
    filterRoomsByQuery,
    getJoinedRooms,
    getAvailableRooms,
  } = useRoomList();

  const { handleJoinRoom, handleLeaveRoom, handleEnterRoom } =
    useRoomListSocket({
      onJoinRoom,
      fetchRooms,
    });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCreateRoom = async (data: RoomFormData) => {
    try {
      await httpClient.post("/rooms", data);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  const filteredJoinedRooms = filterRoomsByQuery(getJoinedRooms(), searchQuery);
  const filteredAvailableRooms = filterRoomsByQuery(
    getAvailableRooms(),
    searchQuery
  );

  return (
    <div className="p-4">
      <RoomSearchBar
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onCreateRoom={() => setShowCreateModal(true)}
      />

      {isLoading ? (
        <div className="text-center py-4">로딩 중...</div>
      ) : (
        <div className="space-y-4">
          <JoinedRoomList
            rooms={filteredJoinedRooms}
            onJoinRoom={handleJoinRoom}
            onLeaveRoom={handleLeaveRoom}
            onEnterRoom={handleEnterRoom}
          />
          <AvailableRoomList
            rooms={filteredAvailableRooms}
            onJoinRoom={handleJoinRoom}
          />
        </div>
      )}

      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateRoom}
      />
    </div>
  );
};

export default ChatRoomList;
