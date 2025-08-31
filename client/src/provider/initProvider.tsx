"use client";

import { getAccessToken } from "@/util/token";
import { ReactNode, Suspense, useEffect, useState } from "react";
import { AuthProvider } from "./authProvider";

export const InitProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    setToken(getAccessToken());
    setIsLoading(false);
  }, []);

  if (isLoading) return null;

  if (!token) return <>{children}</>;

  return (
    <Suspense>
      <AuthProvider token={token}>{children}</AuthProvider>
    </Suspense>
  );
};
