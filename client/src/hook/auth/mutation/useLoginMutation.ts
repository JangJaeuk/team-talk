import { useMutation } from "@/hook/common/useMutation";
import { httpClient } from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { User } from "@/type";

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface LoginVariables {
  email: string;
  password: string;
}

export const useLoginMutation = (
  onSuccess?: () => void,
  onError?: (error: { errorStatus: number; errorMessage: string }) => void
) => {
  const { login: loginStore } = useAuthStore();

  const mutation = useMutation<TokenResponse, LoginVariables>(
    async ({ email, password }) => {
      const response = await httpClient.post<TokenResponse>("/auth/login", {
        email,
        password,
      });
      return response.data;
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
