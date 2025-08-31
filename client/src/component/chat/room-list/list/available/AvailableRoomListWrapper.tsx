import { useAvailableRoomList } from "@/hook/chat/room-list/available/useAvailableRoomList";
import { useDebounce } from "@/hook/common/useDebounce";
import { useState } from "react";
import { RoomSearchBar } from "../../tool/RoomSearchBar";
import { AvailableRoomList } from "./AvailableRoomList";
import { AvailableRoomListEmpty } from "./AvailableRoomListEmpty";

export const AvailableRoomListWrapper = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { rooms, isFetchingNextPage, ref } = useAvailableRoomList({
    query: debouncedSearch,
  });

  return (
    <div className="h-full flex flex-col">
      <RoomSearchBar
        searchQuery={searchQuery}
        searchPlaceholder="채팅방 검색..."
        showButton={false}
        onSearch={setSearchQuery}
      />

      <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
        {rooms.length > 0 ? (
          <>
            <AvailableRoomList rooms={rooms} />
            <div ref={ref} className="h-4" />
            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <div className="h-8 w-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            )}
          </>
        ) : (
          <AvailableRoomListEmpty />
        )}
      </div>
    </div>
  );
};
