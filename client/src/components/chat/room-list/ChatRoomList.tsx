"use client";

import { useRoomList } from "@/hooks/chat/room-list/useRoomList";
import { useRoomListSocket } from "@/hooks/chat/room-list/useRoomListSocket";
import { roomKeys, roomMutations } from "@/queries/room";
import { RoomFormData } from "@/types/room";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ChatRoomListSkeleton } from "./ChatRoomListSkeleton";
import { RoomListHeader } from "./layout/RoomListHeader";
import { AvailableRoomList } from "./list/AvailableRoomList";
import { JoinedRoomList } from "./list/JoinedRoomList";
import { CreateRoomModal } from "./modal/CreateRoomModal";
import { RoomSearchBar } from "./tool/RoomSearchBar";

export const ChatRoomList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();

  const onJoinRoom = useCallback(
    (roomId: string) => {
      router.push(`/rooms/${roomId}`);
    },
    [router]
  );

  const {
    isLoading,
    fetchRooms,
    filterRoomsByQuery,
    getJoinedRooms,
    getAvailableRooms,
  } = useRoomList();

  const wrappedFetchRooms = async () => {
    await fetchRooms();
  };

  const { handleJoinRoom, handleLeaveRoom, handleEnterRoom } =
    useRoomListSocket({
      onJoinRoom,
      fetchRooms: wrappedFetchRooms,
    });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const queryClient = useQueryClient();
  const { mutateAsync: createRoom } = useMutation({
    ...roomMutations.create(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
      setShowCreateModal(false);
    },
  });

  const handleCreateRoom = async (data: RoomFormData) => {
    try {
      await createRoom(data);
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        <RoomListHeader />
        <RoomSearchBar
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onCreateRoom={() => setShowCreateModal(true)}
        />

        {isLoading ? (
          <ChatRoomListSkeleton />
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
    </div>
  );
};
