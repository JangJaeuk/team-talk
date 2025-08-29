"use client";

import { roomKeys, roomMutations } from "@/queries/room";
import { RoomFormData } from "@/types/room";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { RoomListHeader } from "./layout/RoomListHeader";
import { RoomListTabs } from "./layout/RoomListTabs";
import { AvailableRoomListWrapper } from "./list/available/AvailableRoomListWrapper";
import { JoinedRoomListWrapper } from "./list/joined/JoinedRoomListWrapper";
import { CreateRoomModal } from "./modal/CreateRoomModal";

export const ChatRoomList = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"joined" | "available">(() => {
    const tabType = searchParams.get("tabType");
    return tabType === "available" ? "available" : "joined";
  });
  const router = useRouter();

  const handleTabChange = (tab: "joined" | "available") => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams);
    if (tab === "joined") {
      params.delete("tabType");
    } else {
      params.set("tabType", tab);
    }
    router.replace(`/rooms?${params.toString()}`);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        <RoomListHeader />

        {activeTab === "joined" ? (
          <JoinedRoomListWrapper />
        ) : (
          <AvailableRoomListWrapper />
        )}

        <CreateRoomModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateRoom}
        />

        <RoomListTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  );
};
