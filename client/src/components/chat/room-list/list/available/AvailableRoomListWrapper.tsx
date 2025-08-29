import { roomQueries } from "@/queries/room";
import { useAuthStore } from "@/store/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { ChatRoomListSkeleton } from "../../ChatRoomListSkeleton";
import { AvailableRoomList } from "./AvailableRoomList";

export const AvailableRoomListWrapper = () => {
  const { user } = useAuthStore();

  const { data: rooms, isLoading } = useQuery({
    ...roomQueries.availableList(),
    enabled: !!user,
  });

  if (isLoading) {
    return <ChatRoomListSkeleton />;
  }

  return <AvailableRoomList rooms={rooms || []} />;
};
