import {useMutation} from "@/hook/common/useMutation";
import {authMutations} from "@/query/auth";
import {LoginRq} from "@/rqrs/auth/loginRq";
import {LoginRs} from "@/rqrs/auth/loginRs";
import {useAuthStore} from "@/store/useAuthStore";

export const useLoginMutation = (
  onSuccess?: () => void,
  onError?: (error: { errorStatus: number; errorMessage: string }) => void
) => {
  const { login: loginStore } = useAuthStore();

  const mutation = useMutation<LoginRs, LoginRq>(
    async ({ email, password }) => {
      return await authMutations
          .login()
          .mutationFn({email, password});
    },
    {
      onSuccess: (result) => {
        loginStore(result.user, result.accessToken);
        onSuccess?.();
      },
      onError,
    }
  );

  return {
    login: mutation.mutate,
    isPending: mutation.isPending,
  };
};
