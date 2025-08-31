"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { RoomListHeader } from "./layout/RoomListHeader";
import { RoomListTabs } from "./layout/RoomListTabs";
import { AvailableRoomListWrapper } from "./list/available/AvailableRoomListWrapper";
import { JoinedRoomListWrapper } from "./list/joined/JoinedRoomListWrapper";

export const ChatRoomList = () => {
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
      </div>

      <div className="h-16 fixed bottom-0 left-0 right-0 bg-white">
        <RoomListTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  );
};
