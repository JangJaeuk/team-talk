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
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="w-full flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
        <RoomListHeader />

        <div className="flex-1 overflow-hidden">
          {activeTab === "joined" ? (
            <JoinedRoomListWrapper />
          ) : (
            <AvailableRoomListWrapper />
          )}
        </div>

        <CreateRoomModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateRoom}
        />
      </div>

      <div className="h-16 fixed bottom-0 left-0 right-0 bg-white">
        <RoomListTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  );
};
