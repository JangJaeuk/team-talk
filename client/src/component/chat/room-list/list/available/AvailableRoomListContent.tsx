import { useAvailableRoomList } from "@/hook/chat/room-list/available/useAvailableRoomList";
import { AvailableRoomList } from "./AvailableRoomList";
import { AvailableRoomListEmpty } from "./AvailableRoomListEmpty";

interface Props {
  query: string;
}

export const AvailableRoomListContent = ({ query }: Props) => {
  const { rooms, isFetchingNextPage, ref } = useAvailableRoomList({
    query,
  });

  return rooms.length > 0 ? (
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
  );
};
