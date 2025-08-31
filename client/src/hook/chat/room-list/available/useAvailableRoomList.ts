import { roomQueries } from "@/query/room";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";

const ROOMS_PER_PAGE = 30;

interface Params {
  query: string;
}

export const useAvailableRoomList = ({ query }: Params) => {
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      ...roomQueries.availableList({
        search: query,
        limit: ROOMS_PER_PAGE,
      }),
      initialPageParam: undefined,
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

  const rooms = useMemo(
    () => data?.pages.flatMap((page) => page.rooms) || [],
    [data]
  );

  return {
    isFetchingNextPage,
    rooms,
    ref,
  };
};
