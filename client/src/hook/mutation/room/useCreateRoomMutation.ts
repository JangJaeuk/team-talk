import { useMutation } from "@/hook/common/useMutation";
import { roomMutations } from "@/query/room";
import { CreateRoomRq } from "@/rqrs/room/createRoomRq";
import { CreateRoomRs } from "@/rqrs/room/createRoomRs";

export const useCreateRoomMutation = (
  onSuccess?: (id: string) => void,
  onError?: (error: { errorStatus: number; errorMessage: string }) => void
) => {
  const mutation = useMutation<CreateRoomRs, CreateRoomRq>(
    async ({ name, description, code }) => {
      return await roomMutations
        .create()
        .mutationFn({ name, description, code });
    },
    {
      onSuccess: (result) => {
        onSuccess?.(result.id);
      },
      onError,
    }
  );

  return {
    createRoom: mutation.mutate,
    isPending: mutation.isPending,
  };
};
