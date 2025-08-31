import { useMutation as useBaseMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface ErrorCallback {
  errorStatus: number;
  errorMessage: string;
}

interface MutationCallbacks<TData> {
  onSuccess?: (data: TData) => void;
  onError?: (error: ErrorCallback) => void;
}

export const useMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  { onSuccess, onError }: MutationCallbacks<TData> = {}
) => {
  return useBaseMutation({
    mutationFn,
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error: AxiosError<{ error: string }>) => {
      onError?.({
        errorStatus: error.response?.status || 500,
        errorMessage: error.response?.data?.error || "오류가 발생했습니다.",
      });
    },
  });
};
