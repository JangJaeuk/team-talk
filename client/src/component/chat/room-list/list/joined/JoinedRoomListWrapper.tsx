"use client";

import { useJoinedRoomList } from "@/hook/chat/room-list/joined/useJoinedRoomList";
import { useJoinedRoomListSocket } from "@/hook/chat/room-list/joined/useJoinedRoomListSocket";
import { roomMutations } from "@/query/room";
import { RoomFormData } from "@/type/room";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { CreateRoomModal } from "../../modal/CreateRoomModal";
import { RoomSearchBar } from "../../tool/RoomSearchBar";
import { JoinedRoomList } from "./JoinedRoomList";
import { JoinedRoomListEmpty } from "./JoinedRoomListEmpty";
import { JoinedRoomListSkeleton } from "./JoinedRoomListSkeleton";

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

  const { isLoading, rooms, fetchRooms, filterRoomsByQuery } =
    useJoinedRoomList();

  const wrappedFetchRooms = async () => {
    await fetchRooms();
  };

  const { handleEnterRoom } = useJoinedRoomListSocket({
    onJoinRoom,
    fetchRooms: wrappedFetchRooms,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const { mutateAsync: createRoom } = useMutation({
    ...roomMutations.create(),
    onSuccess: (data) => {
      setShowCreateModal(false);
      router.push(`/rooms/${data.id}`);
    },
  });

  const handleCreateRoom = async (data: RoomFormData) => {
    try {
      await createRoom(data);
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  const filteredJoinedRooms = rooms
    ? filterRoomsByQuery(rooms, searchQuery)
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
        {isLoading || !rooms ? (
          <JoinedRoomListSkeleton />
        ) : filteredJoinedRooms.length > 0 ? (
          <JoinedRoomList
            rooms={filteredJoinedRooms}
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
