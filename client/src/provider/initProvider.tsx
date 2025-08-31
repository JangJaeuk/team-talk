"use client";

import { CustomSuspense } from "@/component/common/CustomSuspense";
import { getAccessToken } from "@/util/token";
import { ReactNode, useEffect, useState } from "react";
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
    <CustomSuspense>
      <AuthProvider token={token}>{children}</AuthProvider>
    </CustomSuspense>
  );
};
