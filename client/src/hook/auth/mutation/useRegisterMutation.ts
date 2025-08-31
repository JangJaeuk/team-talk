import { useMutation } from "@/hook/common/useMutation";
import { httpClient } from "@/lib/axios";

interface RegisterVariables {
  email: string;
  password: string;
  nickname: string;
}

export const useRegisterMutation = (
  onSuccess?: () => void,
  onError?: (error: { errorStatus: number; errorMessage: string }) => void
) => {
  const mutation = useMutation<void, RegisterVariables>(
    async ({ email, password, nickname }) => {
      await httpClient.post("/auth/register", {
        email,
        password,
        nickname,
      });
    },
    {
      onSuccess,
      onError,
    }
  );

  return {
    register: mutation.mutate,
    isPending: mutation.isPending,
  };
};
