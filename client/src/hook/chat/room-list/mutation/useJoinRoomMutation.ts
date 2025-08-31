import {useMutation} from "@/hook/common/useMutation";
import {roomKeys, roomMutations} from "@/query/room";
import {JoinRoomRq} from "@/rqrs/room/joinRoomRq";
import {Room} from "@/type/room";
import {useQueryClient} from "@tanstack/react-query";

export const useJoinRoomMutation = (
  onSuccess?: (id: string) => void,
  onError?: (error: { errorStatus: number; errorMessage: string }) => void
) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<Room, JoinRoomRq>(
    async ({ id }) => {
      return await roomMutations.join().mutationFn(id);
    },
    {
      onSuccess: (result) => {
        queryClient.invalidateQueries({ queryKey: roomKeys.joinedLists() });
        queryClient.invalidateQueries({ queryKey: roomKeys.availableLists() });

        onSuccess?.(result.id);
      },
      onError,
    }
  );

  return {
    joinRoom: mutation.mutate,
    isPending: mutation.isPending,
  };
};
