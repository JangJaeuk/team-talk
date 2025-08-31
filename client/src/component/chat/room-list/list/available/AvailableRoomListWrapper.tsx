import { CustomSuspense } from "@/component/common/CustomSuspense";
import { useDebounce } from "@/hook/common/useDebounce";
import { useState } from "react";
import { RoomSearchBar } from "../../tool/RoomSearchBar";
import { AvailableRoomListContent } from "./AvailableRoomListContent";
import { AvailableRoomListSkeleton } from "./AvailableRoomListSkeleton";

export const AvailableRoomListWrapper = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  return (
    <div className="h-full flex flex-col">
      <RoomSearchBar
        searchQuery={searchQuery}
        searchPlaceholder="채팅방 검색..."
        showButton={false}
        onSearch={setSearchQuery}
      />

      <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
        <CustomSuspense fallback={<AvailableRoomListSkeleton />}>
          <AvailableRoomListContent query={debouncedSearch} />
        </CustomSuspense>
      </div>
    </div>
  );
};
