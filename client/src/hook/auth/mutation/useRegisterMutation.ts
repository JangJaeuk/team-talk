import { useMutation } from "@/hook/common/useMutation";
import { authMutations } from "@/query/auth";
import { RegisterRq } from "@/rqrs/auth/RegisterRq";

export const useRegisterMutation = (
  onSuccess?: () => void,
  onError?: (error: { errorStatus: number; errorMessage: string }) => void
) => {
  const mutation = useMutation<void, RegisterRq>(
    async ({ email, password, nickname }) => {
      await authMutations.register().mutationFn({
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
