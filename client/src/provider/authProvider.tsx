"use client";

import { authQueries } from "@/query/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ReactNode, useEffect } from "react";

interface Props {
  token: string;
  children: ReactNode;
}

export const AuthProvider = ({ token, children }: Props) => {
  const { data: user } = useSuspenseQuery(authQueries.me());
  const { isAuthReady, initialize } = useAuthStore();

  useEffect(() => {
    initialize(user, token);
  }, []);

  if (!isAuthReady) return null;

  return <>{children}</>;
};
