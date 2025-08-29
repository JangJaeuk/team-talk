"use client";

import { useJoinedRoomList } from "@/hooks/chat/room-list/joined/useJoinedRoomList";
import { useJoinedRoomListSocket } from "@/hooks/chat/room-list/joined/useJoinedRoomListSocket";
import { roomKeys, roomMutations } from "@/queries/room";
import { RoomFormData } from "@/types/room";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ChatRoomListSkeleton } from "../../ChatRoomListSkeleton";
import { CreateRoomModal } from "../../modal/CreateRoomModal";
import { RoomSearchBar } from "../../tool/RoomSearchBar";
import { JoinedRoomList } from "./JoinedRoomList";
import { JoinedRoomListEmpty } from "./JoinedRoomListEmpty";

export const JoinedRoomListWrapper = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();

  const onJoinRoom = useCallback(
    (roomId: string) => {
      router.push(`/rooms/${roomId}`);
    },
    [router]
  );

  const { isLoading, fetchRooms, filterRoomsByQuery, getRooms } =
    useJoinedRoomList();

  const wrappedFetchRooms = async () => {
    await fetchRooms();
  };

  const { handleEnterRoom, handleLeaveRoom } = useJoinedRoomListSocket({
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
      queryClient.invalidateQueries({ queryKey: roomKeys.joinedLists() });
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

  const joinedRooms = getRooms();
  const filteredJoinedRooms = joinedRooms
    ? filterRoomsByQuery(joinedRooms, searchQuery)
    : [];

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
        {isLoading || !joinedRooms ? (
          <ChatRoomListSkeleton />
        ) : filteredJoinedRooms.length > 0 ? (
          <JoinedRoomList
            rooms={filteredJoinedRooms}
            onLeaveRoom={handleLeaveRoom}
            onEnterRoom={handleEnterRoom}
          />
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
