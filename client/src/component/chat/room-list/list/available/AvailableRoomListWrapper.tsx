import { useDebounce } from "@/hook/common/useDebounce";
import { roomQueries } from "@/query/room";
import { useAuthStore } from "@/store/useAuthStore";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { RoomSearchBar } from "../../tool/RoomSearchBar";
import { AvailableRoomList } from "./AvailableRoomList";
import { AvailableRoomListEmpty } from "./AvailableRoomListEmpty";
import { AvailableRoomListSkeleton } from "./AvailableRoomListSkeleton";

const ROOMS_PER_PAGE = 30;

export const AvailableRoomListWrapper = () => {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { ref, inView } = useInView();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      ...roomQueries.availableList({
        search: debouncedSearch,
        limit: ROOMS_PER_PAGE,
      }),
      initialPageParam: undefined,
      enabled: !!user,
      getNextPageParam: (lastPage) => {
        if (!lastPage.hasNextPage) return undefined;
        const lastRoom = lastPage.rooms[lastPage.rooms.length - 1];
        return lastRoom?.id;
      },
      select: (data) => ({
        pages: data.pages,
        pageParams: data.pageParams,
      }),
    });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allRooms = data?.pages.flatMap((page) => page.rooms) || [];

  return (
    <div className="h-full flex flex-col">
      <RoomSearchBar
        searchQuery={searchQuery}
        searchPlaceholder="채팅방 검색..."
        showButton={false}
        onSearch={setSearchQuery}
      />

      <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
        {isLoading || !data ? (
          <AvailableRoomListSkeleton />
        ) : allRooms.length > 0 ? (
          <>
            <AvailableRoomList rooms={allRooms} />
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
