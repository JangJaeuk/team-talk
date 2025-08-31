import { useMutation } from "@/hook/common/useMutation";
import { httpClient } from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";

export const useLogoutMutation = (
  onSuccess?: () => void,
  onError?: (error: { errorStatus: number; errorMessage: string }) => void
) => {
  const { logout: logoutStore } = useAuthStore();

  const mutation = useMutation<void, void>(
    async () => {
      await httpClient.post("/auth/logout");
    },
    {
      onSuccess: () => {
        logoutStore();
        onSuccess?.();
      },
      onError,
    }
  );

  return {
    logout: mutation.mutate,
    isPending: mutation.isPending,
  };
};
